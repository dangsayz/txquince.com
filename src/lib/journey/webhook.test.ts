import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as webhookPOST } from "@/app/api/stripe/webhook/route";
import { makeHarness, OWNER, SITE, signedWebhook, stripeEvent, WEBHOOK_SECRET, type Harness } from "./testing/harness";
import { adminAction, completeCheckout, makeRequest, pay, sign } from "./testing/flow";
import { signStripePayload, verifyStripeSignature } from "./webhook";

async function approvedSignedWithSession(h: Harness) {
  const r = await makeRequest(h);
  await adminAction(h, r.id, "approve");
  await sign(r.token);
  const p = await pay(r.token, "deposit");
  return { ...r, sessionId: String(p.json.url).split("/").pop()! };
}

describe("Stripe webhook", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("rejects a bad signature and a stale timestamp", async () => {
    const body = JSON.stringify(stripeEvent("checkout.session.completed", { id: "cs_x" }));
    const bad = await webhookPOST(new NextRequest(new Request(`${SITE}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": "t=1,v1=00" }, body })));
    expect(bad.status).toBe(400);
    const old = new Date(h.now().getTime() - 10 * 60_000);
    const stale = await webhookPOST(new NextRequest(signedWebhook(JSON.parse(body), old)));
    expect(stale.status).toBe(400);
    const wrongSecret = await webhookPOST(new NextRequest(signedWebhook(JSON.parse(body), h.now(), "whsec_other")));
    expect(wrongSecret.status).toBe(400);
  });

  it("verifyStripeSignature: tolerance both ways, constant-time v1 match", () => {
    const now = Date.parse("2026-10-14T15:00:00Z");
    const raw = "{}";
    const t = Math.floor(now / 1000);
    expect(verifyStripeSignature(raw, signStripePayload(raw, WEBHOOK_SECRET, t), WEBHOOK_SECRET, now)).toBe(true);
    expect(verifyStripeSignature(raw, signStripePayload(raw, WEBHOOK_SECRET, t - 301), WEBHOOK_SECRET, now)).toBe(false);
    expect(verifyStripeSignature(raw, signStripePayload(raw, WEBHOOK_SECRET, t + 301), WEBHOOK_SECRET, now)).toBe(false);
    expect(verifyStripeSignature(raw, signStripePayload("{ }", WEBHOOK_SECRET, t), WEBHOOK_SECRET, now)).toBe(false);
    expect(verifyStripeSignature(raw, signStripePayload(raw, WEBHOOK_SECRET, t), null, now)).toBe(false);
  });

  it("the same event twice records ONE payment and sends ONE email", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    const first = await completeCheckout(h, sessionId, { eventId: "evt_same" });
    const second = await completeCheckout(h, sessionId, { eventId: "evt_same" });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.json.outcome).toBe("duplicate");
    expect(h.db.payments.filter((p) => p.booking_id === id)).toHaveLength(1);
    expect(h.mailTo("rosa@example.com", "payment-received-deposit")).toHaveLength(1);
    expect(h.db.bookings.get(id)!.status).toBe("confirmed");
  });

  it("a replayed (different event id, same session) delivery is a no-op too", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    await completeCheckout(h, sessionId, { eventId: "evt_a" });
    const replay = await completeCheckout(h, sessionId, { eventId: "evt_b" });
    expect(replay.json.outcome).toBe("duplicate");
    expect(h.db.payments.filter((p) => p.booking_id === id)).toHaveLength(1);
  });

  it("a database error returns 500 so Stripe retries (H1), and the retry records it once", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    h.db.failNext("insertPayment");
    const failed = await completeCheckout(h, sessionId, { eventId: "evt_retry" });
    expect(failed.status).toBe(500);
    expect(h.db.payments).toHaveLength(0);
    const retry = await completeCheckout(h, sessionId, { eventId: "evt_retry" });
    expect(retry.status).toBe(200);
    expect(h.db.payments).toHaveLength(1);
    expect(h.db.bookings.get(id)!.status).toBe("confirmed");
  });

  it("a crash between recording and confirming heals on the retry", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    h.db.failNext("updateBooking"); // payment row lands, status change fails
    const failed = await completeCheckout(h, sessionId, { eventId: "evt_heal" });
    expect(failed.status).toBe(500);
    expect(h.db.bookings.get(id)!.status).toBe("approved");
    await completeCheckout(h, sessionId, { eventId: "evt_heal" });
    expect(h.db.bookings.get(id)!.status).toBe("confirmed");
  });

  it("a payment on an OLDER, superseded session is still matched by booking + session id (H2)", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    // A newer session replaced it in our table (family came back later)
    h.db.sessions.get(sessionId)!.status = "expired";
    const res = await completeCheckout(h, sessionId);
    expect(res.json.outcome).toBe("recorded");
    expect(h.db.bookings.get(id)!.status).toBe("confirmed");
  });

  it("money that arrives late for a declined/expired booking goes to payment_review — never auto-refunded (M5)", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    h.db.bookings.get(id)!.status = "expired";
    const res = await completeCheckout(h, sessionId);
    expect(res.json.outcome).toBe("review");
    expect(h.db.bookings.get(id)!.status).toBe("payment_review");
    expect(h.stripe.refundCalls).toBe(0);
    expect(h.mailTo(OWNER, "owner-payment-review")).toHaveLength(1);
  });

  it("an amount that doesn't match the session goes to payment_review", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    const res = await completeCheckout(h, sessionId, { amount: 100 });
    expect(res.json.outcome).toBe("review");
    expect(h.db.bookings.get(id)!.status).toBe("payment_review");
  });

  it("ignores checkouts that belong to the other site on the shared Stripe account", async () => {
    const event = stripeEvent("checkout.session.completed", { id: "cs_other", payment_status: "paid", amount_total: 5000, metadata: { source: "someone-else" } });
    const res = await webhookPOST(new NextRequest(signedWebhook(event, h.now())));
    expect((await res.json()).outcome).toBe("ignored");
  });

  it("records a refund made in the Stripe dashboard once, by refund id", async () => {
    const { id, sessionId } = await approvedSignedWithSession(h);
    await completeCheckout(h, sessionId, { paymentIntent: "pi_dash" });
    const ev = stripeEvent("refund.created", { id: "re_dash", amount: 5000, payment_intent: "pi_dash", status: "succeeded", currency: "usd" });
    await webhookPOST(new NextRequest(signedWebhook(ev, h.now())));
    await webhookPOST(new NextRequest(signedWebhook(ev, h.now())));
    expect(h.db.payments.filter((p) => p.booking_id === id && p.kind === "refund")).toHaveLength(1);
  });
});
