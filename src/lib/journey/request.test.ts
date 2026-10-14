import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PRICE_BOOK } from "@/lib/commission";
import { makeHarness, OWNER, PNG, type Harness } from "./testing/harness";
import { makeRequest, postRequest } from "./testing/flow";

describe("step 1 — request", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("needs no signature; accepts and ignores old signing fields", async () => {
    const { res, json } = await postRequest({ signed_name: "Old Tab", signature: PNG, agree: true, something_else: 1 });
    expect(res.status).toBe(200);
    expect(json.ref).toMatch(/^TXQ-[0-9A-F]{6}$/);
    const b = [...h.db.bookings.values()][0]!;
    expect(b.status).toBe("requested");
    expect(b.signed_at).toBeNull();
    expect(JSON.stringify(b)).not.toContain("Old Tab");
  });

  it("holds the date for the book's holdDays, snapshots money, emails family + owner with the private link", async () => {
    const { id, token } = await makeRequest(h);
    const b = h.db.bookings.get(id)!;
    expect(Date.parse(b.expires_at) - h.now().getTime()).toBe(DEFAULT_PRICE_BOOK.holdDays * 86_400_000);
    // production $4,900 + 1 extra hour $400 + same-day $300 = $5,600; 25% = $1,400
    expect(b.total_cents).toBe(560_000);
    expect(b.deposit_amount_cents).toBe(140_000);
    expect(b.balance_cents).toBe(420_000);
    expect(b.deposit_percent).toBe(25);
    expect(b.balance_due_days).toBe(14);
    expect(b.balance_due_date).toBe("2027-04-03");
    const fam = h.mailTo("rosa@example.com", "request-received");
    expect(fam).toHaveLength(1);
    expect(fam[0]!.text).toContain("/my/booking/");
    expect(h.mailTo(OWNER, "owner-new-request")).toHaveLength(1);
    expect(token).toHaveLength(43);
  });

  it("Spanish requests get Spanish email and the /es/mi-reserva link", async () => {
    await makeRequest(h, { language: "es" });
    const m = h.mailTo("rosa@example.com", "request-received")[0]!;
    expect(m.subject).toMatch(/Recibimos tu solicitud/);
    expect(m.text).toContain("/es/mi-reserva/");
  });

  it("requires Turnstile (M1)", async () => {
    h.setTurnstile(false);
    expect((await postRequest()).res.status).toBe(403);
    expect(h.db.bookings.size).toBe(0);
  });

  it("enforces the lead time (M1)", async () => {
    const r = await postRequest({ event_date: "2026-10-18" });
    expect(r.res.status).toBe(422);
    expect(r.json.code).toBe("too_soon");
  });

  it("a second request for the same email+date never expires the first hold", async () => {
    const first = await makeRequest(h);
    const again = await postRequest({ hours: 8 });
    expect(again.res.status).toBe(409);
    expect(again.json.code).toBe("already_requested");
    expect(h.db.bookings.get(first.id)!.status).toBe("requested");
  });

  it("someone typing another family's email can't touch that family's hold (re-sign/re-request bug)", async () => {
    const victim = await makeRequest(h, { email: "victim@example.com" });
    const attack = await postRequest({ email: "victim@example.com", name: "Mallory" });
    expect(attack.res.status).toBe(409);
    expect(h.db.bookings.get(victim.id)!.status).toBe("requested");
    expect(h.db.bookings.size).toBe(1);
  });

  it("caps open requests per email", async () => {
    await makeRequest(h, { event_date: "2027-06-05" });
    await makeRequest(h, { event_date: "2027-06-12" });
    const third = await postRequest({ event_date: "2027-06-19" });
    expect(third.res.status).toBe(429);
  });

  it("refuses a stale tab's price with prices_changed", async () => {
    const r = await postRequest({ quoted_total_usd: 1 });
    expect(r.res.status).toBe(409);
    expect(r.json.code).toBe("prices_changed");
  });

  it("a date already held by another family is 409 date_taken", async () => {
    await makeRequest(h);
    const r = await postRequest({ email: "other@example.com" });
    expect(r.res.status).toBe(409);
    expect(["date_taken", "already_requested"]).toContain(r.json.code);
  });
});
