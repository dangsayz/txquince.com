/**
 * account.ts — what a signed-in family sees on /account.
 *
 * A booking belongs to an account when the booking's email is one of the
 * account's VERIFIED emails (Clerk verified it: Google, or the emailed code).
 * Nothing else links them, so nobody can see another family's booking.
 *
 * The view model is built from the SIGNED agreement and the stored deposit,
 * never the current price book, the same as /booking/[id].
 */
import { isSignedAgreement } from "@/lib/agreement";
import { balanceCentsFrom, paidCents } from "@/lib/balance";

export type AccountBookingState = "review" | "approved" | "booked" | "closed";

export type AccountBooking = {
  id: string;
  state: AccountBookingState;
  eventDate: string;
  tier: string | null;
  lang: "en" | "es";
  totalUsd: number;
  depositCents: number;
  /** Deposit + balance payments received (0 until the deposit is in). */
  paidCents: number;
  /** Balance still to pay after the deposit (0 until booked). */
  leftCents: number;
  processing: boolean;
  /** Key for the pay buttons and the private booking page; null until approved. */
  payToken: string | null;
  /** Money received, oldest first (deposit, then balance payments). */
  payments: AccountPayment[];
};

export type AccountPayment = {
  kind: "deposit" | "balance";
  amountCents: number;
  paidAt: string | null;
  /** Stripe payment id, kept server-side to look up the receipt. Never rendered. */
  paymentIntent: string | null;
  /** Stripe's receipt page, filled in by account-db when available. */
  receiptUrl?: string | null;
};

type Row = Record<string, unknown>;
type PaymentRow = { booking_id: string; status: string; amount_cents: number; paid_at?: string | null; stripe_payment_intent_id?: string | null };

export function toAccountBooking(row: Row, payments: PaymentRow[], now = Date.now()): AccountBooking | null {
  const meta = (row.metadata ?? {}) as Row;
  const agreement = meta.agreement;
  if (!isSignedAgreement(agreement)) return null;
  const status = String(row.status);
  const live = status === "pending_payment" && new Date(String(row.expires_at)).getTime() > now;
  const state: AccountBookingState =
    status === "paid" ? "booked" : live ? "approved" : status === "requested" ? "review" : "closed";

  const mine = payments.filter((p) => p.booking_id === row.id);
  const deposit = Number(row.deposit_amount_cents) || 0;
  const balance = balanceCentsFrom(agreement.balanceUsd) ?? 0;
  const balancePaid = paidCents(mine);
  return {
    id: String(row.id),
    state,
    eventDate: String(row.event_date),
    tier: typeof meta.tier === "string" ? meta.tier : null,
    lang: agreement.lang === "es" ? "es" : "en",
    totalUsd: agreement.totalUsd,
    depositCents: deposit,
    paidCents: state === "booked" ? deposit + balancePaid : 0,
    leftCents: state === "booked" ? Math.max(0, balance - balancePaid) : 0,
    processing: mine.some((p) => p.status === "processing"),
    payToken: state === "approved" || state === "booked" ? agreement.payToken ?? null : null,
    payments:
      state === "booked"
        ? [
            { kind: "deposit" as const, amountCents: deposit, paidAt: row.paid_at ? String(row.paid_at) : null, paymentIntent: row.stripe_payment_intent_id ? String(row.stripe_payment_intent_id) : null },
            ...mine
              .filter((p) => p.status === "paid")
              .map((p) => ({ kind: "balance" as const, amountCents: p.amount_cents, paidAt: p.paid_at ?? null, paymentIntent: p.stripe_payment_intent_id ?? null }))
              .sort((a, b) => String(a.paidAt).localeCompare(String(b.paidAt))),
          ]
        : [],
  };
}

/** Newest event first among open ones; closed ones last. */
export function sortAccountBookings(list: AccountBooking[]): AccountBooking[] {
  const rank = (b: AccountBooking) => (b.state === "closed" ? 1 : 0);
  return [...list].sort((a, b) => rank(a) - rank(b) || a.eventDate.localeCompare(b.eventDate));
}
