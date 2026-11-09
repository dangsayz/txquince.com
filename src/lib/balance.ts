/**
 * balance.ts — pure money rules for paying the rest of a booking online.
 *
 * Everything is whole cents. The balance comes from the SIGNED agreement
 * (never the current price book); what's paid comes from booking_payments.
 * The server is the only place these run for real; the page uses the same
 * functions so what it shows always matches what the API will accept.
 */

/**
 * Smallest part-payment a family can choose (whole cents). A floor keeps the
 * pay-in-parts option useful and stops anyone using the page to test stolen
 * cards with tiny charges. The last payment can be smaller (whatever is left).
 */
export const MIN_PART_CENTS = 50_00;

/** Statuses that mean a checkout is still in flight for this booking. */
export const LIVE_STATUSES = ["opening", "open", "processing"] as const;

export type BalancePaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  checkout_url: string | null;
  checkout_expires_at: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
};

/** Balance in cents from the agreement's dollars; null if it isn't a sane amount. */
export function balanceCentsFrom(balanceUsd: unknown): number | null {
  if (typeof balanceUsd !== "number" || !Number.isFinite(balanceUsd) || balanceUsd <= 0) return null;
  const cents = Math.round(balanceUsd * 100);
  return cents > 0 && cents <= 10_000_000 ? cents : null;
}

export function paidCents(rows: Pick<BalancePaymentRow, "status" | "amount_cents">[]): number {
  return rows.filter((r) => r.status === "paid").reduce((sum, r) => sum + r.amount_cents, 0);
}

export function remainingCents(balanceCents: number, rows: Pick<BalancePaymentRow, "status" | "amount_cents">[]): number {
  return Math.max(0, balanceCents - paidCents(rows));
}

export type AmountCheck = { ok: true; cents: number } | { ok: false; error: "tooSmall" | "tooBig" | "invalid" | "nothingDue" };

/**
 * The amount this checkout may charge. No amount = everything that's left.
 * A chosen amount must be whole cents, at least MIN_PART_CENTS (or everything
 * left, when less than that is left), and never more than what's left.
 */
export function checkAmount(requested: number | undefined, remaining: number): AmountCheck {
  if (!Number.isSafeInteger(remaining) || remaining <= 0) return { ok: false, error: "nothingDue" };
  if (requested === undefined) return { ok: true, cents: remaining };
  if (!Number.isSafeInteger(requested) || requested <= 0) return { ok: false, error: "invalid" };
  if (requested > remaining) return { ok: false, error: "tooBig" };
  if (requested < Math.min(MIN_PART_CENTS, remaining)) return { ok: false, error: "tooSmall" };
  return { ok: true, cents: requested };
}

/** Dollars text a family typed ("250", "250.5", "$1,200.00") → cents, or null. */
export function parseDollarsToCents(text: string): number | null {
  const t = text.replace(/[$,\s]/g, "");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(t)) return null;
  const [whole, frac = ""] = t.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}
