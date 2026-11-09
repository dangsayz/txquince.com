/**
 * booking-capacity.ts — how many active bookings one date can hold.
 *
 * TX Quince is a team: the studio assigns photographers and videographers by
 * date and can cover more than one quinceañera on the same day. The database
 * enforces the same number (migrations/0003_core.sql triggers,
 * bookings_per_date()); booking-capacity.test.ts fails if the two disagree.
 * The database is the real gate; this copy only decides what the site SHOWS
 * as full, so a family isn't sent to pay for a date that will be refused.
 */
export const BOOKINGS_PER_DATE = 3;

/** Statuses that occupy a spot on their date (requested, held for payment, paid). */
export const ACTIVE_BOOKING_STATUSES = ["requested", "pending_payment", "paid"] as const;

/** Dates whose active bookings have reached capacity, from one event_date per active booking. */
export function fullDates(eventDates: readonly string[], capacity = BOOKINGS_PER_DATE): string[] {
  const counts = new Map<string, number>();
  for (const d of eventDates) counts.set(d, (counts.get(d) ?? 0) + 1);
  return [...counts].filter(([, n]) => n >= capacity).map(([d]) => d);
}
