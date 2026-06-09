/**
 * /api/admin/bookings/deposit-link — operator one-click "send deposit link".
 *
 * Step-two of the request-first flow: after confirming a date, the operator
 * fires this. It creates a Stripe Checkout session for the booking's deposit,
 * emails the secure link to the family, and moves the booking into
 * 'pending_payment' (so the existing webhook confirms payment, and the
 * recovery cron nudges if they don't pay within the 24h window).
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { createStripeCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { sendDepositLinkEmail } from "@/lib/resend";
import { collectionLabel } from "@/content/packages";
import { formatEventDate, packageLabel, type BookingRecord } from "@/lib/booking";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const supabase = getServiceSupabase();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency",
    )
    .eq("id", parsed.data.id)
    .single();
  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  const b = booking as BookingRecord;

  // Only send a deposit link for an UNCONFIRMED request. Never re-open a booking
  // that's already paid / refunded / cancelled / under review — doing so would
  // reset the hold, re-arm the recovery email, and risk charging a family twice.
  const RESENDABLE = new Set(["requested", "pending_payment", "expired"]);
  if (!RESENDABLE.has(b.status)) {
    return NextResponse.json(
      {
        error: `This booking is "${b.status}" — a deposit link can only be sent for an unconfirmed request.`,
        status: b.status,
      },
      { status: 409 },
    );
  }

  const siteUrl = getSiteUrl();
  const prettyDate = formatEventDate(b.event_date);
  const tier = collectionLabel(b.collection);
  // Stripe Checkout sessions expire within 24h; hold the date for that window.
  const expiresAt = new Date(Date.now() + 23 * 3600 * 1000);

  let url: string | null = null;
  let sessionId: string | null = null;
  try {
    const session = await createStripeCheckoutSession({
      amountCents: b.deposit_amount_cents,
      currency: b.currency || "usd",
      productName: `${site.brand} — ${tier} Deposit`,
      productDescription: `Deposit to reserve ${prettyDate} · ${tier} (${packageLabel(b.package)})`,
      clientReferenceId: b.id,
      customerEmail: b.email,
      successUrl: `${siteUrl}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/reserve?canceled=1`,
      expiresAt,
      metadata: {
        source: "txquince-admin",
        booking_id: b.id,
        event_date: b.event_date,
        collection: b.collection ?? "",
        package: b.package,
      },
    });
    url = session.url;
    sessionId = session.id;
  } catch (err) {
    console.error("[deposit-link] stripe error:", err);
    return NextResponse.json({ error: "Could not create the deposit link." }, { status: 502 });
  }
  if (!url) return NextResponse.json({ error: "Stripe returned no link." }, { status: 502 });

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "pending_payment",
      stripe_checkout_session_id: sessionId,
      expires_at: expiresAt.toISOString(),
      recovery_sent_at: null,
    })
    .eq("id", b.id);
  if (updateError) {
    console.error("[deposit-link] update error:", updateError.message);
  }

  const mail = await sendDepositLinkEmail(b, url);
  revalidatePath("/admin/bookings");

  return NextResponse.json({ ok: true, url, emailed: mail.ok });
}
