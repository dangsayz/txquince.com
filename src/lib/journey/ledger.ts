/**
 * ledger.ts — money math over a booking's payments. Pure; one definition of
 * "paid", "left to pay" and "refundable" that the family page, the admin
 * record, checkout, refunds and reminders all share.
 *
 * Every number comes from the booking's own SNAPSHOT (total_cents,
 * deposit_amount_cents) plus booking_payments. Never from the live price book.
 */
import type { BookingRow, PaymentRow } from "./types";

export type Ledger = {
  totalCents: number;
  depositCents: number;
  /** Money received (charges + offline), before refunds. */
  paidCents: number;
  refundedCents: number;
  /** paid − refunded. */
  netPaidCents: number;
  /** What's still owed against the total (never below zero). */
  remainingCents: number;
  /** Has the family paid at least the deposit? */
  depositPaid: boolean;
  /** Deposit still owed (0 once paid). */
  depositDueCents: number;
};

type BookingMoney = Pick<BookingRow, "total_cents" | "deposit_amount_cents" | "balance_cents">;

export function ledgerFor(b: BookingMoney, payments: readonly PaymentRow[]): Ledger {
  const depositCents = b.deposit_amount_cents;
  const totalCents = b.total_cents ?? depositCents + (b.balance_cents ?? 0);
  const paidCents = payments.filter((p) => p.kind !== "refund").reduce((s, p) => s + p.amount_cents, 0);
  const refundedCents = payments.filter((p) => p.kind === "refund").reduce((s, p) => s + p.amount_cents, 0);
  const netPaidCents = paidCents - refundedCents;
  return {
    totalCents,
    depositCents,
    paidCents,
    refundedCents,
    netPaidCents,
    remainingCents: Math.max(0, totalCents - paidCents),
    depositPaid: paidCents >= depositCents,
    depositDueCents: Math.max(0, depositCents - paidCents),
  };
}

/** How much of one Stripe charge can still be refunded (server-side cap). */
export function refundableCents(payment: PaymentRow, payments: readonly PaymentRow[]): number {
  if (payment.kind === "refund" || payment.method !== "stripe" || !payment.stripe_payment_intent_id) return 0;
  const already = payments
    .filter((p) => p.kind === "refund" && p.refund_of === payment.id)
    .reduce((s, p) => s + p.amount_cents, 0);
  return Math.max(0, payment.amount_cents - already);
}

/**
 * THE confirmation rule, used by signing, the webhook and offline payments:
 * a booking is confirmed only when it is signed AND the deposit is paid.
 */
export function readyToConfirm(b: Pick<BookingRow, "signed_at">, l: Ledger): boolean {
  return Boolean(b.signed_at) && l.depositPaid;
}

export function paidInFull(l: Ledger): boolean {
  return l.totalCents > 0 && l.remainingCents === 0;
}
