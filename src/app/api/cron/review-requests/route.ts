import { NextResponse, type NextRequest } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { sendReviewRequestEmail } from "@/lib/resend";
import type { BookingRecord } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase-not-configured" }, { status: 503 });
  }
  const reviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!reviewUrl) return NextResponse.json({ ok: true, sent: 0, skipped: 0, inert: "review-url-not-set" });

  const supabase = getServiceSupabase();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("bookings")
    .select("id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency")
    .eq("status", "paid")
    .is("review_request_sent_at", null)
    .lte("event_date", thirtyDaysAgo)
    .gte("event_date", sixtyDaysAgo)
    .order("event_date", { ascending: true })
    .limit(500);
  if (error) {
    console.error("[review-requests] query error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const booking of (data ?? []) as BookingRecord[]) {
    if (sent >= 50) break;
    const result = await sendReviewRequestEmail(booking, reviewUrl);
    if (!result.ok) {
      console.error("[review-requests] send failed for", booking.id, result.error);
      continue;
    }
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ review_request_sent_at: new Date().toISOString() })
      .eq("id", booking.id);
    if (updateError) {
      console.error("[review-requests] update failed for", booking.id, updateError.message);
      continue;
    }
    sent++;
  }
  return NextResponse.json({ ok: true, sent });
}
