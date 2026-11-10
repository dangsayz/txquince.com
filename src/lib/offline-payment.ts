/**
 * offline-payment.ts — money the owner took outside Stripe (cash, Zelle, check).
 * Pure rules, shared by the Studio form and the API that enforces them.
 */
export const OFFLINE_METHODS = ["cash", "zelle", "check", "other"] as const;
export type OfflineMethod = (typeof OFFLINE_METHODS)[number];
export const METHOD_LABEL: Record<string, string> = { stripe: "Card (Stripe)", cash: "Cash", zelle: "Zelle", check: "Check", other: "Other" };
export const isOffline = (method: unknown): method is OfflineMethod => OFFLINE_METHODS.includes(method as OfflineMethod);

/** The balance after the deposit, in cents, from the booking's signed total. Null when the booking has no total. */
export function balanceOf(b: { deposit_amount_cents: number; metadata?: Record<string, unknown> | null }): number | null {
  const agreement = b.metadata?.agreement as { balanceUsd?: unknown } | undefined;
  const fromAgreement = typeof agreement?.balanceUsd === "number" && agreement.balanceUsd > 0 ? Math.round(agreement.balanceUsd * 100) : null;
  if (fromAgreement !== null) return fromAgreement;
  const total = b.metadata?.total_usd;
  return typeof total === "number" && total > 0 ? Math.max(0, Math.round(total * 100) - b.deposit_amount_cents) : null;
}

export type OfflineCheck = { ok: true } | { ok: false; error: string };

/** May the owner record this amount? `left` is the balance still due (null = this booking has no total on file). */
export function checkOffline(amountCents: number, paidOn: string, left: number | null, today: string): OfflineCheck {
  if (!Number.isSafeInteger(amountCents) || amountCents < 100) return { ok: false, error: "Enter an amount of $1 or more." };
  if (amountCents > 10_000_000) return { ok: false, error: "That amount is too large." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn) || Number.isNaN(Date.parse(`${paidOn}T12:00:00Z`))) return { ok: false, error: "Pick the day you got the money." };
  if (paidOn > today) return { ok: false, error: "The day cannot be in the future." };
  if (left !== null && amountCents > left) return { ok: false, error: `That is more than the balance still due ($${(left / 100).toFixed(2)}).` };
  return { ok: true };
}
