/**
 * /api/cron/booking-recovery — bring back abandoned date holds.
 *
 * A family that started checkout and didn't finish was ONE click from paying.
 * When their hold expires unpaid (release_expired_booking_holds → status
 * 'expired') and the date is not full, this sends exactly one note in their
 * language: nothing was charged, the date was open when sent, reply for a fresh
 * deposit link. Then it stamps recovery_sent_at so it never emails twice.
 *
 * SAFETY: inert until activated. 401s unless CRON_SECRET is set AND the request
 * carries `Authorization: Bearer <CRON_SECRET>` — identical to /api/cron/followups.
 * Pinged by the standalone cron-worker. Until the secret + 0006 migration exist,
 * it can never email anyone.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { getTakenEventDates } from "@/lib/clients-db";
import { sendBookingRecoveryEmail } from "@/lib/resend";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-capacity";
import type { BookingRecord } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PER_RUN = 100;
const LOOKBACK_DAYS = 7; // don't chase holds older than a week
const DAY_MS = 86_400_000;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // not configured → stays inert
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "db-not-configured" },
      { status: 503 },
    );
  }

  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - LOOKBACK_DAYS * DAY_MS).toISOString();

  // Recently-expired holds we haven't recovered yet, for still-future dates.
  const { data, error } = await db
    .from("bookings")
    .select(
      "id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency, metadata",
    )
    .eq("status", "expired")
    .is("recovery_sent_at", null)
    .gte("created_at", since)
    .gte("event_date", today)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    // Most likely: migration 0006 not applied yet. Fail loud but harmless.
    console.error("[booking-recovery] query error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Exclude any date that's since been re-claimed (by them or anyone) — never
  // tell a family to come back for a date that's no longer available.
  const takenDates = new Set(await getTakenEventDates());

  // A family that has since reserved again (any date) gets no recovery note.
  const { data: live, error: liveError } = await db
    .from("bookings")
    .select("email")
    .in("status", [...ACTIVE_BOOKING_STATUSES]);
  if (liveError) {
    console.error("[booking-recovery] live-booking query error:", liveError.message);
    return NextResponse.json({ ok: false, error: liveError.message }, { status: 500 });
  }
  const bookedEmails = new Set(((live ?? []) as { email: string }[]).map((r) => r.email.trim().toLowerCase()));

  let sent = 0;
  let skipped = 0;

  for (const row of (data ?? []) as BookingRecord[]) {
    if (sent >= MAX_PER_RUN) break;

    if (takenDates.has(row.event_date) || bookedEmails.has(row.email.trim().toLowerCase())) {
      skipped++;
      continue;
    }

    const res = await sendBookingRecoveryEmail(row);
    if (!res.ok) {
      console.error("[booking-recovery] send failed for", row.id, res.error);
      continue;
    }

    const { error: updateError } = await db
      .from("bookings")
      .update({ recovery_sent_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updateError) {
      console.error("[booking-recovery] update failed for", row.id, updateError.message);
      continue;
    }
    sent++;
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
