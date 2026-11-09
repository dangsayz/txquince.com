/**
 * GET /api/cron/review-requests — the post-event review request.
 *
 * For each paid booking whose event was 30–60 days ago and hasn't been asked
 * yet: make that family's own one-time link on our review page (D1, the same
 * link the owner makes by hand at /admin/reviews) and email it. Google is not
 * involved. If the email fails, the link is deleted so nothing dangles, and
 * the booking is retried on the next run.
 *
 * Authenticated by CRON_SECRET. Called hourly by the cron Worker
 * (cron-worker/src/index.ts); turned on by the owner on 2026-11-09.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { sendReviewRequestEmail } from "@/lib/resend";
import { createInvite, deleteInvite } from "@/lib/reviews-db";
import { getD1 } from "@/lib/d1";
import { reviewPath } from "@/lib/review";
import { getSiteUrl } from "@/lib/site-url";
import type { BookingRecord } from "@/lib/booking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, error: "db-not-configured" }, { status: 503 });
  }
  if (!(await getD1())) {
    return NextResponse.json({ ok: false, error: "reviews-db-not-available" }, { status: 503 });
  }

  const db = getDb();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await db
    .from("bookings")
    .select("id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency, metadata")
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

  const base = getSiteUrl();
  let sent = 0;
  for (const booking of (data ?? []) as BookingRecord[]) {
    if (sent >= 50) break;
    if (!booking.email) continue;

    let invite;
    try {
      invite = await createInvite({ invite_name: booking.name, daughter_name: null, event_date: booking.event_date ?? null });
    } catch (err) {
      console.error("[review-requests] could not make a link for", booking.id, err);
      continue;
    }

    const result = await sendReviewRequestEmail(booking, `${base}${reviewPath(invite.slug)}`);
    if (!result.ok) {
      console.error("[review-requests] send failed for", booking.id, result.error);
      await deleteInvite(invite.id).catch(() => undefined);
      continue;
    }
    const { error: updateError } = await db
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
