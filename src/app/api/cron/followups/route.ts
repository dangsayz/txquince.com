/**
 * /api/cron/followups — daily lead nurture. (Vercel Cron, see vercel.json)
 *
 * Sends the next follow-up touch to inquiries that haven't booked. The instant
 * acknowledgment on submit is "touch 0"; this advances 1 → 2 → 3 on a spaced
 * schedule with a value-add at each step. Stops on booking (operator sets
 * status='won'/'lost'), on unsubscribe, or after touch 3.
 *
 * SAFETY: inert until activated. Returns 401 unless CRON_SECRET is set AND the
 * request carries `Authorization: Bearer <CRON_SECRET>` (Vercel Cron injects this
 * automatically when CRON_SECRET exists). So it can never email anyone until the
 * operator deliberately sets the secret and applies 0003_inquiry_followups.sql.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { sendFollowupEmail } from "@/lib/resend";

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
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, name, email, created_at, last_touch_at, followup_step, event_date")
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

  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  let skipped = 0;

  for (const row of (data ?? []) as InquiryRow[]) {
    if (sent >= MAX_PER_RUN) break;

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
    );
    if (!res.ok) {
      console.error("[followups] send failed for", row.id, res.error);
      continue;
    }

    const { error: updateError } = await supabase
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
