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

  // Already emailed (webhook retry) — stop here.
  if (booking.confirmation_sent_at) return;

  const record = booking as BookingRecord;
  const review = record.status !== "paid"; // 'payment_review' → don't confirm to client

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
