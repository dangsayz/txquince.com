/**
 * booking-fulfillment.ts — turns a PAID Stripe checkout into a confirmed booking.
 *
 * Called from the Stripe webhook on `checkout.session.completed`. Idempotent:
 *   - confirm_booking_payment() is safe to call twice (no-ops once 'paid').
 *   - we only send confirmation emails once (guarded by confirmation_sent_at).
 *
 * If the RPC lands the booking in 'payment_review' (the date was claimed by
 * someone else during checkout), we alert the operator and DON'T tell the client
 * their date is reserved — the operator resolves/refunds.
 */
import "server-only";
import { getServiceSupabase } from "@/lib/supabase-server";
import type { StripeCheckoutSession } from "@/lib/stripe";
import type { BookingRecord } from "@/lib/booking";
import { sendBookingOperatorEmail, sendBookingClientEmail } from "@/lib/resend";

export async function fulfillCheckoutSession(
  session: StripeCheckoutSession,
): Promise<void> {
  // Only act on actually-paid sessions.
  if (session.payment_status !== "paid") return;

  const supabase = getServiceSupabase();

  const { data: bookingId, error: rpcError } = await supabase.rpc(
    "confirm_booking_payment",
    {
      p_checkout_session_id: session.id,
      p_payment_intent_id: session.payment_intent,
      p_customer_email: session.customer_details?.email ?? null,
    },
  );

  if (rpcError) {
    console.error("[booking] confirm_booking_payment failed:", rpcError.message);
    return;
  }

  const { data: booking, error: readError } = await supabase
    .from("bookings")
    .select(
      "id, name, email, phone, event_date, package, collection, notes, status, deposit_amount_cents, currency, confirmation_sent_at",
    )
    .eq("id", bookingId as string)
    .single();

  if (readError || !booking) {
    console.error("[booking] could not read confirmed booking:", readError?.message);
    return;
  }

  const record = booking as BookingRecord;

  // Amount integrity (defense-in-depth): the deposit is priced server-side at
  // session-create, but re-verify what Stripe ACTUALLY collected matches what we
  // expect before telling the family their date is reserved. On a server-priced
  // session this can't drift — if it ever does (a mutated/partial/BNPL edge case),
  // hold it for manual review instead of auto-confirming a wrong amount as paid.
  const amountMismatch =
    typeof session.amount_total === "number" &&
    (session.amount_total !== record.deposit_amount_cents ||
      (session.currency ?? "").toLowerCase() !== (record.currency ?? "usd").toLowerCase());

  if (amountMismatch) {
    console.error(
      `[booking] AMOUNT MISMATCH on ${record.id}: Stripe collected ${session.amount_total} ${session.currency ?? "?"}, expected ${record.deposit_amount_cents} ${record.currency}. Routing to payment_review.`,
    );
    if (record.status === "paid") {
      await supabase
        .from("bookings")
        .update({ status: "payment_review" })
        .eq("id", record.id);
      record.status = "payment_review";
    }
  }

  // Already emailed (webhook retry) — stop here.
  if (booking.confirmation_sent_at) return;

  // 'payment_review' (lost the date race OR amount mismatch) → don't confirm to client.
  const review = record.status !== "paid";

  const [op, cl] = await Promise.all([
    sendBookingOperatorEmail(record, { review }),
    review
      ? Promise.resolve({ ok: true as const })
      : sendBookingClientEmail(record),
  ]);

  if (!op.ok) console.error("[booking] operator email failed:", op.error);
  if (!cl.ok) console.error("[booking] client email failed:", cl.error);

  await supabase
    .from("bookings")
    .update({
      confirmation_owner_status: op.ok ? "sent" : "failed",
      confirmation_client_status: review ? "skipped_review" : cl.ok ? "sent" : "failed",
      confirmation_sent_at: new Date().toISOString(),
    })
    .eq("id", record.id);
}
