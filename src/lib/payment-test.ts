/**
 * payment-test.ts — the owner's $1 end-to-end payment test.
 *
 * It proves the whole money path with a real card: Stripe Checkout takes $1,
 * Stripe's webhook reaches this site with a valid signature, and the site
 * records it. Each run is one row in site_settings ("payment_test:<id>"); it
 * never touches bookings.
 */
import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import type { StripeCheckoutSession } from "@/lib/stripe";

export const TEST_AMOUNT_CENTS = 100;
const PREFIX = "payment_test:";

export type PaymentTest = {
  id: string;
  createdAt: string;
  by: string;
  sessionId: string | null;
  /** Set by the webhook: Stripe's message arrived and its signature checked out. */
  receivedAt: string | null;
  paymentIntent: string | null;
  amountOk: boolean | null;
  refundedAt: string | null;
};

export const isTestSession = (s: StripeCheckoutSession) => s.metadata?.source === "txquince-admin" && s.metadata?.flow === "test";

export async function savePaymentTest(t: PaymentTest): Promise<void> {
  const { error } = await getDb().from("site_settings").upsert({ key: PREFIX + t.id, value: t, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function getPaymentTest(id: string): Promise<PaymentTest | null> {
  if (!isDbConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await getDb().from("site_settings").select("value").eq("key", PREFIX + id).maybeSingle();
  return (data?.value as PaymentTest | undefined) ?? null;
}

export async function latestPaymentTests(limit = 5): Promise<PaymentTest[]> {
  if (!isDbConfigured()) return [];
  const { data } = await getDb().from("site_settings").select("value").like("key", PREFIX + "%").order("updated_at", { ascending: false }).limit(limit);
  return ((data ?? []) as { value: PaymentTest }[]).map((r) => r.value).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Webhook: a paid test checkout arrived. Safe to call twice. */
export async function recordTestWebhook(session: StripeCheckoutSession): Promise<void> {
  const id = session.metadata?.test_id ?? "";
  const t = await getPaymentTest(id);
  if (!t || t.sessionId !== session.id || session.payment_status !== "paid") return;
  if (t.receivedAt) return;
  await savePaymentTest({
    ...t,
    receivedAt: new Date().toISOString(),
    paymentIntent: session.payment_intent,
    amountOk: session.amount_total === TEST_AMOUNT_CENTS && (session.currency ?? "").toLowerCase() === "usd",
  });
}

/** Milliseconds since the test was started (kept here so pages stay pure). */
export const testAgeMs = (t: PaymentTest) => Date.now() - new Date(t.createdAt).getTime();
