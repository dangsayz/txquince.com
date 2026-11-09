/** account-db.ts — SERVER-ONLY: the bookings that belong to an account's verified emails. */
import "server-only";
import { getD1 } from "@/lib/d1";
import { fromDb } from "@/lib/db/d1-query";
import { sortAccountBookings, toAccountBooking, type AccountBooking } from "@/lib/account";

export async function getAccountBookings(verifiedEmails: string[]): Promise<AccountBooking[]> {
  const emails = [...new Set(verifiedEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
  const db = await getD1();
  if (!db || emails.length === 0) return [];
  const marks = emails.map(() => "?").join(", ");
  const rows = await db
    .prepare(
      `SELECT id, event_date, status, deposit_amount_cents, expires_at, metadata
         FROM bookings WHERE lower(email) IN (${marks}) ORDER BY event_date ASC LIMIT 20`,
    )
    .bind(...emails)
    .all<Record<string, unknown>>();
  const bookings = rows.results.map((r) => fromDb("bookings", r));
  if (bookings.length === 0) return [];
  const ids = bookings.map((b) => String(b.id));
  const pays = await db
    .prepare(
      `SELECT booking_id, status, amount_cents FROM booking_payments
        WHERE kind = 'balance' AND booking_id IN (${ids.map(() => "?").join(", ")})`,
    )
    .bind(...ids)
    .all<{ booking_id: string; status: string; amount_cents: number }>();
  return sortAccountBookings(
    bookings.map((b) => toAccountBooking(b, pays.results)).filter((b): b is AccountBooking => b !== null),
  );
}

/** True when this booking id belongs to one of these verified emails. */
export async function ownsBooking(verifiedEmails: string[], bookingId: string): Promise<boolean> {
  return (await getAccountBookings(verifiedEmails)).some((b) => b.id === bookingId);
}
