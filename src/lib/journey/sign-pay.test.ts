import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PRICE_BOOK, type PriceBook } from "@/lib/commission";
import { makeHarness, OWNER, type Harness } from "./testing/harness";
import { adminAction, bookThrough, completeCheckout, makeRequest, pay, sign } from "./testing/flow";
import { loadFamilyView } from "./family";
import type { JourneyDeps } from "./deps";

describe("step 3 — sign, then deposit; confirmed only when both are done", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("can't sign before approval, can't pay before signing", async () => {
    const r = await makeRequest(h);
    expect((await sign(r.token)).json.code).toBe("not_ready");
    await adminAction(h, r.id, "approve");
    const p = await pay(r.token, "deposit");
    expect(p.status).toBe(409);
    expect(p.json.code).toBe("sign_first");
  });

  it("signing records the audit trail, stores the PDF and emails it to both sides", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    const s = await sign(r.token);
    expect(s.status).toBe(200);
    const b = h.db.bookings.get(r.id)!;
    expect(b.signed_at).toBeTruthy();
    expect(b.agreement!.consentVersion).toBeTruthy();
    expect(b.agreement!.ip).toBe("203.0.113.7");
    expect(b.agreement!.userAgent).toBe("vitest");
    expect(b.contract_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(b.contract_pdf_key).toBe(`contracts/${r.id}/${b.contract_sha256}.pdf`);
    const signed = h.db.events.find((e) => e.booking_id === r.id && e.event === "signed")!;
    expect(signed.detail).toContain(b.contract_sha256!);
    expect(signed.detail).toContain("esign");
    expect(signed.user_agent).toBe("vitest");
    const fam = h.mailTo("rosa@example.com", "contract-signed")[0]!;
    expect(fam.attachments?.[0]?.filename).toMatch(/\.pdf$/);
    expect(h.mailTo(OWNER, "owner-contract-signed")[0]!.attachments).toHaveLength(1);
    expect(b.status).toBe("approved"); // signed, but not paid → not confirmed yet
  });

  it("a signed agreement is immutable — re-signing is impossible", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const first = JSON.stringify(h.db.bookings.get(r.id)!.agreement);
    const again = await sign(r.token, { signedName: "Someone Else" });
    expect(again.status).toBe(409);
    expect(again.json.code).toBe("already_signed");
    expect(JSON.stringify(h.db.bookings.get(r.id)!.agreement)).toBe(first);
    // even a direct db write is refused (trigger)
    await expect(h.db.updateBooking(r.id, { agreement: null })).rejects.toThrow("immutable");
  });

  it("rejects a stale consent version and a missing consent", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    expect((await sign(r.token, { consentVersion: "old" })).json.code).toBe("consent_changed");
    expect((await sign(r.token, { consent: false })).status).toBe(422);
  });

  it("deposit paid → confirmed; the amount is the snapshot, not the request body", async () => {
    const { id, token } = await bookThrough(h);
    const b = h.db.bookings.get(id)!;
    expect(b.status).toBe("confirmed");
    expect(h.db.payments.filter((p) => p.booking_id === id)).toHaveLength(1);
    expect(h.db.payments[0]!.amount_cents).toBe(140_000);
    const v = await loadFamilyView(h.deps as JourneyDeps, token);
    expect(v?.stage).toBe("booked");
    expect(v?.canPayBalance).toBe(true);
    expect(h.mailTo("rosa@example.com", "payment-received-deposit")).toHaveLength(1);
  });

  it("the balance uses the booking's snapshot after a price change", async () => {
    const r = await makeRequest(h);
    // Owner doubles every price after the request.
    const pricier: PriceBook = JSON.parse(JSON.stringify(DEFAULT_PRICE_BOOK));
    for (const k of Object.keys(pricier.packages) as (keyof PriceBook["packages"])[]) pricier.packages[k].price *= 2;
    pricier.depositPercent = 50;
    pricier.balanceDueDays = 30;
    h.setBook(pricier);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const agreement = h.db.bookings.get(r.id)!.agreement!;
    expect(agreement.totalUsd).toBe(5600);
    expect(agreement.depositUsd).toBe(1400);
    expect(agreement.sections.flatMap((s) => s.lines).join(" ")).toContain("$4,900");
    const p = await pay(r.token, "deposit");
    const sid = String(p.json.url).split("/").pop()!;
    expect(h.stripe.sessions.get(sid)!.amount).toBe(140_000);
    await completeCheckout(h, sid);
    const bal = await pay(r.token, "balance");
    const bid = String(bal.json.url).split("/").pop()!;
    expect(h.stripe.sessions.get(bid)!.amount).toBe(420_000);
    expect(h.db.bookings.get(r.id)!.balance_due_date).toBe("2027-04-03"); // 14 days, not 30
    await completeCheckout(h, bid);
    expect(h.db.bookings.get(r.id)!.status).toBe("paid_in_full");
  });

  it("a second click reuses the open session; a superseded session is expired at Stripe (H2)", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const a = await pay(r.token, "deposit");
    const b = await pay(r.token, "deposit");
    expect(b.json.url).toBe(a.json.url);
    // make the first one nearly expired → a new one replaces it and the old is expired
    const firstId = String(a.json.url).split("/").pop()!;
    h.db.sessions.get(firstId)!.expires_at = new Date(h.now().getTime() + 60_000).toISOString();
    const c = await pay(r.token, "deposit");
    expect(c.json.url).not.toBe(a.json.url);
    expect(h.stripe.expired).toContain(firstId);
  });

  it("pay is refused once the approval hold has lapsed", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    h.setNow("2026-12-01T00:00:00Z");
    expect((await pay(r.token, "deposit")).json.code).toBe("hold_expired");
  });
});
