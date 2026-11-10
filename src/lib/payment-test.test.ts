import { beforeEach, describe, expect, it, vi } from "vitest";
import { createD1Client } from "./db/d1-query";
import { sqliteD1 } from "./db/sqlite-d1.test-helper";

vi.mock("server-only", () => ({}));
let client: ReturnType<typeof createD1Client>;
vi.mock("@/lib/db", () => ({ getDb: () => client, isDbConfigured: () => true }));

import { getPaymentTest, isTestSession, latestPaymentTests, recordTestWebhook, savePaymentTest, type PaymentTest } from "./payment-test";
import type { StripeCheckoutSession } from "./stripe";

const ID = "11111111-2222-4333-8444-555555555555";
const base: PaymentTest = { id: ID, createdAt: "2026-11-10T10:00:00.000Z", by: "owner@example.com", sessionId: "cs_1", receivedAt: null, paymentIntent: null, amountOk: null, refundedAt: null };
const session = (over: Record<string, unknown> = {}) =>
  ({ id: "cs_1", payment_status: "paid", payment_intent: "pi_1", amount_total: 100, currency: "usd", metadata: { source: "txquince-admin", flow: "test", test_id: ID }, ...over }) as unknown as StripeCheckoutSession;

beforeEach(async () => {
  const db = sqliteD1();
  client = createD1Client(async () => db);
  await savePaymentTest(base);
});

describe("$1 payment test", () => {
  it("only sessions tagged as the owner test count", () => {
    expect(isTestSession(session())).toBe(true);
    expect(isTestSession(session({ metadata: { source: "txquince", flow: "test" } }))).toBe(false);
    expect(isTestSession(session({ metadata: { source: "txquince-admin" } }))).toBe(false);
  });

  it("a paid webhook marks the test received, once", async () => {
    await recordTestWebhook(session());
    const t = await getPaymentTest(ID);
    expect(t).toMatchObject({ paymentIntent: "pi_1", amountOk: true });
    expect(t?.receivedAt).toBeTruthy();
    await recordTestWebhook(session({ payment_intent: "pi_other" }));
    expect((await getPaymentTest(ID))?.paymentIntent).toBe("pi_1");
  });

  it("ignores an unpaid session, a wrong session id and an unknown test", async () => {
    await recordTestWebhook(session({ payment_status: "unpaid" }));
    await recordTestWebhook(session({ id: "cs_forged" }));
    await recordTestWebhook(session({ metadata: { source: "txquince-admin", flow: "test", test_id: "nope" } }));
    expect((await getPaymentTest(ID))?.receivedAt).toBeNull();
  });

  it("flags a wrong amount", async () => {
    await recordTestWebhook(session({ amount_total: 5000 }));
    expect((await getPaymentTest(ID))?.amountOk).toBe(false);
  });

  it("lists tests and never touches bookings", async () => {
    expect((await latestPaymentTests()).map((t) => t.id)).toEqual([ID]);
    expect((await client.from("bookings").select("id")).data).toEqual([]);
  });
});
