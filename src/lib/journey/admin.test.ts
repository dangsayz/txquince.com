import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST as refundPOST } from "@/app/api/admin/bookings/[id]/refund/route";
import { POST as actionPOST } from "@/app/api/admin/bookings/[id]/route";
import { POST as paymentPOST } from "@/app/api/admin/bookings/[id]/payment/route";
import { POST as deliveryPOST } from "@/app/api/admin/bookings/[id]/delivery/route";
import { POST as messagePOST } from "@/app/api/admin/bookings/[id]/message/route";
import { POST as notePOST } from "@/app/api/admin/bookings/[id]/note/route";
import { POST as templatePOST } from "@/app/api/admin/contract-template/route";
import { GET as contractGET } from "@/app/api/admin/bookings/[id]/contract/route";
import { jsonRequest, makeHarness, OWNER, type Harness } from "./testing/harness";
import { adminAction, bookThrough, makeRequest, params, pay, sign } from "./testing/flow";
import { loadFamilyView } from "./family";
import type { JourneyDeps } from "./deps";

describe("admin guards (each route called directly, admin missing → 401)", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("every admin route refuses a non-admin", async () => {
    const { id } = await makeRequest(h);
    h.setAdmin(null);
    const p = params({ id });
    const calls = [
      actionPOST(jsonRequest(`/x`, { action: "approve" }), p),
      refundPOST(jsonRequest(`/x`, { paymentId: crypto.randomUUID(), amountCents: 1, requestId: "abcdefgh" }), p),
      paymentPOST(jsonRequest(`/x`, { amountCents: 100, method: "cash" }), p),
      deliveryPOST(jsonRequest(`/x`, { gallery_url: "https://g.example.com" }), p),
      messagePOST(jsonRequest(`/x`, { body: "hi" }), p),
      notePOST(jsonRequest(`/x`, { body: "hi" }), p),
      templatePOST(jsonRequest(`/x`, { en: {}, es: {} })),
      contractGET(new Request("http://x"), p),
    ];
    for (const res of await Promise.all(calls)) expect(res.status).toBe(401);
    expect(h.db.bookings.get(id)!.status).toBe("requested");
    expect(h.db.templates).toHaveLength(0);
  });
});

describe("refunds — owner only, capped, idempotent, recorded, emailed", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  const refund = (id: string, body: Record<string, unknown>) => refundPOST(jsonRequest(`/api/admin/bookings/${id}/refund`, body), params({ id }));

  it("caps at the refundable amount of that charge, server-side", async () => {
    const { id } = await bookThrough(h);
    const charge = h.db.payments.find((p) => p.booking_id === id)!;
    h.setAdmin(OWNER);
    const over = await refund(id, { paymentId: charge.id, amountCents: charge.amount_cents + 1, requestId: "req-over-1" });
    expect(over.status).toBe(422);
    expect(h.stripe.refundCalls).toBe(0);
    const part = await refund(id, { paymentId: charge.id, amountCents: 40_000, requestId: "req-part-1" });
    expect(part.status).toBe(200);
    const rest = await refund(id, { paymentId: charge.id, amountCents: 100_001, requestId: "req-rest-1" });
    expect(rest.status).toBe(422); // only 100,000 left
    expect((await refund(id, { paymentId: charge.id, amountCents: 100_000, requestId: "req-rest-2" })).status).toBe(200);
    expect((await refund(id, { paymentId: charge.id, amountCents: 1, requestId: "req-none" })).status).toBe(422);
  });

  it("uses an idempotency key: a double submit makes one refund and one ledger row", async () => {
    const { id } = await bookThrough(h);
    const charge = h.db.payments.find((p) => p.booking_id === id)!;
    h.setAdmin(OWNER);
    const body = { paymentId: charge.id, amountCents: 20_000, requestId: "same-dialog-123" };
    await Promise.all([refund(id, body), refund(id, body)]);
    expect(h.stripe.refunds).toHaveLength(1);
    expect(h.stripe.refunds[0]!.key).toBe(`txq-refund-${charge.id}-same-dialog-123`);
    expect(h.db.payments.filter((p) => p.kind === "refund")).toHaveLength(1);
    expect(h.mailTo("rosa@example.com", "refund-issued")).toHaveLength(1);
  });

  it("refuses a payment from another booking", async () => {
    const a = await bookThrough(h);
    const b = await bookThrough(h, { email: "b@example.com", event_date: "2027-05-22" });
    const chargeB = h.db.payments.find((p) => p.booking_id === b.id)!;
    h.setAdmin(OWNER);
    const res = await refund(a.id, { paymentId: chargeB.id, amountCents: 100, requestId: "cross-booking" });
    expect(res.status).toBe(404);
    expect(h.stripe.refundCalls).toBe(0);
  });

  it("offline payments: owner-only, can't exceed what's left, move the booking forward", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    h.setAdmin(OWNER);
    const pay1 = (amountCents: number) => paymentPOST(jsonRequest(`/x`, { amountCents, method: "zelle" }), params({ id: r.id }));
    expect((await pay1(10_000_000)).status).toBe(422);
    expect((await pay1(140_000)).status).toBe(200);
    expect(h.db.bookings.get(r.id)!.status).toBe("confirmed");
    expect((await pay1(420_000)).status).toBe(200);
    expect(h.db.bookings.get(r.id)!.status).toBe("paid_in_full");
  });
});

describe("decline / cancel", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("decline expires the open Stripe session, frees the date and emails the family (M5)", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const p = await pay(r.token, "deposit");
    const sid = String(p.json.url).split("/").pop()!;
    const d = await adminAction(h, r.id, "decline");
    expect(d.status).toBe(200);
    expect(h.stripe.expired).toContain(sid);
    expect(h.db.sessions.get(sid)!.status).toBe("expired");
    expect(h.db.bookings.get(r.id)!.status).toBe("declined");
    expect(h.mailTo("rosa@example.com", "declined")).toHaveLength(1);
    // the date is free again
    await makeRequest(h, { email: "next@example.com" });
  });

  it("decline refuses when the family already paid at Stripe (refund instead)", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const p = await pay(r.token, "deposit");
    h.stripe.complete(String(p.json.url).split("/").pop()!);
    const d = await adminAction(h, r.id, "decline");
    expect(d.status).toBe(409);
    expect(d.json.code).toBe("payment_in_flight");
    expect(h.db.bookings.get(r.id)!.status).toBe("approved");
  });

  it("cancel never refunds by itself", async () => {
    const { id } = await bookThrough(h);
    expect((await adminAction(h, id, "cancel")).status).toBe(200);
    expect(h.stripe.refundCalls).toBe(0);
    expect(h.db.bookings.get(id)!.status).toBe("cancelled");
  });
});

describe("messages, notes, delivery", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("delivery fields need https and a booked status; the family page becomes the delivery page after the event", async () => {
    const { id, token } = await bookThrough(h);
    h.setAdmin(OWNER);
    const bad = await deliveryPOST(jsonRequest(`/x`, { gallery_url: "javascript:alert(1)" }), params({ id }));
    expect(bad.status).toBe(422);
    const ok = await deliveryPOST(
      jsonRequest(`/x`, { gallery_url: "https://gallery.example.com/v", video_url: "https://video.example.com/v", album_status: "printing", review_url: "https://g.page/r/example", notify: true }),
      params({ id }),
    );
    expect(ok.status).toBe(200);
    h.setNow("2027-04-20T15:00:00Z");
    const v = await loadFamilyView(h.deps as JourneyDeps, token);
    expect(v?.stage).toBe("delivery");
    expect(v?.delivery?.albumStatus).toBe("printing");
    expect(h.mailTo("rosa@example.com", "delivery-update")).toHaveLength(1);
  });

  it("owner replies are emailed; private notes never reach the family view", async () => {
    const { id, token } = await makeRequest(h);
    h.setAdmin(OWNER);
    await messagePOST(jsonRequest(`/x`, { body: "Yes, we can do 5pm." }), params({ id }));
    await notePOST(jsonRequest(`/x`, { body: "Mom prefers WhatsApp" }), params({ id }));
    expect(h.mailTo("rosa@example.com", "owner-reply")).toHaveLength(1);
    const v = await loadFamilyView(h.deps as JourneyDeps, token);
    expect(v?.messages.map((m) => m.body)).toEqual(["Yes, we can do 5pm."]);
    expect(JSON.stringify(v)).not.toContain("WhatsApp");
  });
});
