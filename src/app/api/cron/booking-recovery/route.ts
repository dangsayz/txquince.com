/**
 * /api/cron/booking-recovery — bring back abandoned date holds.
 *
 * A family that started checkout and didn't finish was ONE click from paying.
 * When their hold expires unpaid (release_expired_booking_holds → status
 * 'expired') and the date is still open, this sends exactly one "your date is
 * still open — finish reserving" email, then stamps recovery_sent_at so it never
 * emails twice.
 *
 * SAFETY: inert until activated. 401s unless CRON_SECRET is set AND the request
 * carries `Authorization: Bearer <CRON_SECRET>` — identical to /api/cron/followups.
 * Pinged by the standalone cron-worker. Until the secret + 0006 migration exist,
 * it can never email anyone.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getTakenEventDates } from "@/lib/clients-db";
import { sendBookingRecoveryEmail } from "@/lib/resend";
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
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "supabase-not-configured" },
      { status: 503 },
    );
  }

  const supabase = getServiceSupabase();
  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - LOOKBACK_DAYS * DAY_MS).toISOString();

  // Recently-expired holds we haven't recovered yet, for still-future dates.
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency",
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

  let sent = 0;
  let skipped = 0;

  for (const row of (data ?? []) as BookingRecord[]) {
    if (sent >= MAX_PER_RUN) break;

    if (takenDates.has(row.event_date)) {
      skipped++;
      continue;
    }

    const res = await sendBookingRecoveryEmail(row);
    if (!res.ok) {
      console.error("[booking-recovery] send failed for", row.id, res.error);
      continue;
    }

    const { error: updateError } = await supabase
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
