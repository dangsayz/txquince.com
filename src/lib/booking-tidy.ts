/**
 * booking-tidy.ts — the rules for tidying the Bookings list (Studio).
 *
 *   Archive  hides a finished or closed booking from the list. Nothing is lost;
 *            it can be restored. Stored as metadata.archived_at.
 *   Remove   deletes a booking for good. Only when no money was ever paid on
 *            it, so a payment record can never disappear.
 * A booking that still holds a date, or a paid one that is still coming up,
 * can do neither: decline / release it first.
 */
type Tidy = { status: string; event_date: string; paid_at: string | null; metadata?: Record<string, unknown> | null };

export const isArchived = (b: Pick<Tidy, "metadata">) => typeof b.metadata?.archived_at === "string";

/** Closed for good, or paid and already past. */
export function canArchive(b: Tidy, today: string): boolean {
  if (["expired", "cancelled", "refunded"].includes(b.status)) return true;
  return b.status === "paid" && b.event_date < today;
}

/** Never paid, and closed. */
export function canRemove(b: Tidy): boolean {
  return !b.paid_at && ["expired", "cancelled"].includes(b.status);
}
