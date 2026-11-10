/**
 * /api/cron/followups — daily lead nurture. (Vercel Cron, see vercel.json)
 *
 * Sends the next follow-up touch to inquiries that haven't booked. The instant
 * acknowledgment on submit is "touch 0"; this advances 1 → 2 → 3 on a spaced
 * schedule with a value-add at each step. Stops on booking (operator sets
 * status='won'/'lost'), on unsubscribe, or after touch 3.
 *
 * Also skips a lead the owner has already contacted (a 'contact' row in
 * inquiry_activity) or whose email has a live booking (requested, awaiting
 * payment, or paid), so nobody gets a "still thinking?" note after he wrote
 * back or they reserved. Each email goes out in the language the family chose
 * on the form, or in English and Spanish when we don't know.
 *
 * SAFETY: inert until activated. Returns 401 unless CRON_SECRET is set AND the
 * request carries `Authorization: Bearer <CRON_SECRET>` (Vercel Cron injects this
 * automatically when CRON_SECRET exists). So it can never email anyone until the
 * operator deliberately sets the secret and applies 0003_inquiry_followups.sql.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { sendFollowupEmail } from "@/lib/resend";
import { leadLangFrom } from "@/lib/lead-email-copy";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/booking-capacity";
import { parsePickedRequest } from "@/lib/inquiry-message";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Days to wait before sending touch 1, 2, 3 (indexed by current followup_step).
const DELAY_DAYS = [2, 3, 7];
const MAX_PER_RUN = 100;
const DAY_MS = 86_400_000;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // not configured → stays inert
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_touch_at: string | null;
  followup_step: number | null;
  event_date: string | null;
  message: string | null;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, error: "db-not-configured" }, { status: 503 });
  }

  const db = getDb();
  const { data, error } = await db
    .from("inquiries")
    .select("id, name, email, created_at, last_touch_at, followup_step, event_date, message")
    .eq("status", "new")
    .is("unsubscribed_at", null)
    .lt("followup_step", 3)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    // Most likely: migration 0003 not applied yet. Fail loud but harmless.
    console.error("[followups] query error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as InquiryRow[];
  const ids = rows.map((r) => r.id);

  // Leads the owner already wrote to, and emails that already have a live
  // booking. If either lookup fails, send nothing this run rather than risk
  // nudging a family he already answered.
  const [contacted, booked] = ids.length
    ? await Promise.all([
        db.from("inquiry_activity").select("inquiry_id").eq("kind", "contact").in("inquiry_id", ids),
        db.from("bookings").select("email").in("status", [...ACTIVE_BOOKING_STATUSES]),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  if (contacted.error || booked.error) {
    const msg = contacted.error?.message ?? booked.error?.message;
    console.error("[followups] guard query error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
  const contactedIds = new Set(((contacted.data ?? []) as { inquiry_id: string }[]).map((r) => r.inquiry_id));
  const bookedEmails = new Set(((booked.data ?? []) as { email: string }[]).map((r) => r.email.trim().toLowerCase()));

  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  let skipped = 0;

  for (const row of rows) {
    if (sent >= MAX_PER_RUN) break;

    // He already wrote back, or they already reserved: stop the sequence.
    if (contactedIds.has(row.id) || bookedEmails.has(row.email.trim().toLowerCase())) continue;

    // Don't nurture leads whose event has already passed.
    if (row.event_date && row.event_date < today) continue;

    const step = row.followup_step ?? 0;
    const delay = DELAY_DAYS[step];
    if (delay === undefined) continue;

    const basis = new Date(row.last_touch_at ?? row.created_at).getTime();
    if (now - basis < delay * DAY_MS) {
      skipped++;
      continue;
    }

    const nextStep = step + 1;
    const res = await sendFollowupEmail(
      { id: row.id, name: row.name, email: row.email },
      nextStep,
      leadLangFrom(parsePickedRequest(row.message ?? "")?.language),
    );
    if (!res.ok) {
      console.error("[followups] send failed for", row.id, res.error);
      continue;
    }

    const { error: updateError } = await db
      .from("inquiries")
      .update({ followup_step: nextStep, last_touch_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updateError) {
      console.error("[followups] update failed for", row.id, updateError.message);
      continue;
    }
    sent++;
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
