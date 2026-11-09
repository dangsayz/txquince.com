/** account-db.ts — SERVER-ONLY: the bookings that belong to an account's verified emails. */
import "server-only";
import { getD1 } from "@/lib/d1";
import { fromDb } from "@/lib/db/d1-query";
import { isStripeConfigured, retrieveReceiptUrl } from "@/lib/stripe";
import { sortAccountBookings, toAccountBooking, type AccountBooking } from "@/lib/account";

export async function getAccountBookings(verifiedEmails: string[]): Promise<AccountBooking[]> {
  const emails = [...new Set(verifiedEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  const db = await getD1();
  if (!db || emails.length === 0) return [];
  const marks = emails.map(() => "?").join(", ");
  const rows = await db
    .prepare(
      `SELECT id, event_date, status, deposit_amount_cents, expires_at, metadata, paid_at, stripe_payment_intent_id
         FROM bookings WHERE lower(email) IN (${marks}) ORDER BY event_date ASC LIMIT 20`,
    )
    .bind(...emails)
    .all<Record<string, unknown>>();
  const bookings = rows.results.map((r) => fromDb("bookings", r));
  if (bookings.length === 0) return [];
  const ids = bookings.map((b) => String(b.id));
  const pays = await db
    .prepare(
      `SELECT booking_id, status, amount_cents, paid_at, stripe_payment_intent_id FROM booking_payments
        WHERE kind = 'balance' AND booking_id IN (${ids.map(() => "?").join(", ")})`,
    )
    .bind(...ids)
    .all<{ booking_id: string; status: string; amount_cents: number; paid_at: string | null; stripe_payment_intent_id: string | null }>();
  return sortAccountBookings(
    bookings.map((b) => toAccountBooking(b, pays.results)).filter((b): b is AccountBooking => b !== null),
  );
}

/**
 * Adds Stripe's receipt link to each payment (a few read-only calls, in
 * parallel). A failed lookup just leaves that payment without a link.
 */
export async function withReceipts(bookings: AccountBooking[]): Promise<AccountBooking[]> {
  if (!isStripeConfigured()) return bookings;
  return Promise.all(
    bookings.map(async (b) => ({
      ...b,
      payments: await Promise.all(
        b.payments.slice(0, 12).map(async (p) => ({ ...p, receiptUrl: p.paymentIntent ? await retrieveReceiptUrl(p.paymentIntent) : null })),
      ),
    })),
  );
}

/** True when this booking id belongs to one of these verified emails. */
export async function ownsBooking(verifiedEmails: string[], bookingId: string): Promise<boolean> {
  return (await getAccountBookings(verifiedEmails)).some((b) => b.id === bookingId);
}
