/**
 * state.ts — THE booking state machine. One table, used everywhere.
 *
 * Every write that changes `bookings.status` goes through `transitionBooking`
 * (src/lib/journey/ops.ts), which splices `status in (sourcesOf(to))` into the
 * UPDATE's WHERE clause. So the check and the write are one statement: a forged
 * POST can't land between them, and two racing clicks can't both win.
 *
 * Pure and isomorphic (admin UI reads the labels too).
 */

export const STATUSES = [
  "requested",
  "approved",
  "confirmed",
  "paid_in_full",
  "completed",
  "declined",
  "expired",
  "cancelled",
  "refunded",
  "payment_review",
] as const;
export type Status = (typeof STATUSES)[number];

/**
 * from → allowed next states. Read it as "what can happen next":
 *  - requested: the owner approves or declines, the hold lapses, or the owner cancels.
 *  - approved: signed + deposit → confirmed; hold lapses; owner declines/cancels;
 *    money that can't be matched cleanly → payment_review.
 *  - confirmed: balance paid → paid_in_full; owner cancels or marks completed.
 *  - expired: the owner may re-approve (if the date is still free); a late
 *    payment lands in payment_review for the owner to decide.
 *  - declined / cancelled: only a late payment can move them (→ payment_review).
 *  - payment_review: the owner resolves it.
 */
export const TRANSITIONS: Readonly<Record<Status, readonly Status[]>> = Object.freeze({
  requested: ["approved", "declined", "expired", "cancelled"],
  approved: ["confirmed", "declined", "expired", "cancelled", "payment_review"],
  confirmed: ["paid_in_full", "completed", "cancelled", "payment_review"],
  paid_in_full: ["completed", "cancelled"],
  completed: [],
  declined: ["payment_review"],
  expired: ["approved", "payment_review"],
  cancelled: ["payment_review"],
  refunded: [],
  payment_review: ["confirmed", "paid_in_full", "cancelled"],
});

export function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Every state that may move to `to` — the WHERE predicate of a guarded update. */
export function sourcesOf(to: Status): Status[] {
  return STATUSES.filter((from) => canTransition(from, to));
}

/** Statuses that hold the event date (mirrors bookings_active_event_date_idx). */
export const HOLDS_DATE: readonly Status[] = ["requested", "approved", "confirmed", "paid_in_full", "completed"];
/** A real, deposit-paid booking. */
export const BOOKED: readonly Status[] = ["confirmed", "paid_in_full", "completed"];
/** Waiting on someone (owner or family) before the date is secured. */
export const OPEN: readonly Status[] = ["requested", "approved"];

/** For code that holds status as a plain string (dashboards, analytics). */
export const BOOKED_STATUSES: ReadonlySet<string> = new Set<string>(BOOKED);

export const holdsDate = (s: Status) => HOLDS_DATE.includes(s);
export const isBooked = (s: Status) => BOOKED.includes(s);

/** Owner-facing labels (admin). */
export const STATUS_LABEL: Record<Status, string> = {
  requested: "New request",
  approved: "Approved — waiting on family",
  confirmed: "Booked",
  paid_in_full: "Paid in full",
  completed: "Completed",
  declined: "Declined",
  expired: "Expired",
  cancelled: "Cancelled",
  refunded: "Refunded",
  payment_review: "Payment needs review",
};
