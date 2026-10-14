import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET as dailyGET } from "@/app/api/cron/daily/route";
import { CRON_SECRET, makeHarness, OWNER, SITE, type Harness } from "./testing/harness";
import { adminAction, bookThrough, makeRequest, pay, sign } from "./testing/flow";
import { balanceReminderKind } from "./cron";

const cron = (auth?: string) => dailyGET(new Request(`${SITE}/api/cron/daily`, { headers: auth ? { authorization: auth } : {} }));

describe("/api/cron/daily", () => {
  let h: Harness;
  beforeEach(() => (h = makeHarness()));
  afterEach(() => h.cleanup());

  it("requires the secret", async () => {
    expect((await cron()).status).toBe(401);
    expect((await cron("Bearer wrong")).status).toBe(401);
    expect((await cron(`Bearer ${CRON_SECRET}x`)).status).toBe(401);
    expect((await cron(CRON_SECRET)).status).toBe(401); // no Bearer prefix
    expect((await cron(`Bearer ${CRON_SECRET}`)).status).toBe(200);
  });

  it("is inert with no CRON_SECRET configured", async () => {
    h.deps.cronSecret = () => null;
    expect((await cron("Bearer ")).status).toBe(401);
  });

  it("balance reminders are never sent twice — bucket by bucket", async () => {
    await bookThrough(h); // event 2027-04-17, balance due 2027-04-03
    const run = async (day: string) => {
      h.setNow(`${day}T14:00:00Z`);
      await cron(`Bearer ${CRON_SECRET}`);
      await cron(`Bearer ${CRON_SECRET}`); // same day, again
    };
    await run("2027-02-20"); // 42 days out → nothing
    await run("2027-03-05"); // 29 → balance_30
    await run("2027-03-06"); // 28 → still the 30 bucket → nothing new
    await run("2027-03-21"); // 13 → balance_14
    await run("2027-03-28"); // 6 → balance_7
    await run("2027-04-02"); // 1 → balance_1
    await run("2027-04-05"); // overdue
    await run("2027-04-06"); // overdue again → nothing
    const tags = h.mailTo("rosa@example.com").map((m) => m.tag).filter((t) => t.startsWith("reminder-"));
    expect(tags).toEqual(["reminder-balance_30", "reminder-balance_14", "reminder-balance_7", "reminder-balance_1", "reminder-balance_overdue"]);
  });

  it("a failed send is retried the next day (claim released), not lost", async () => {
    await bookThrough(h);
    let fail = true;
    const realMail = h.deps.mail!;
    h.deps.mail = async (m) => (fail && m.tag.startsWith("reminder-") ? { ok: false, error: "down" } : realMail(m));
    h.setNow("2027-03-21T14:00:00Z");
    await cron(`Bearer ${CRON_SECRET}`);
    fail = false;
    h.setNow("2027-03-22T14:00:00Z");
    await cron(`Bearer ${CRON_SECRET}`);
    expect(h.mailTo("rosa@example.com").filter((m) => m.tag === "reminder-balance_14")).toHaveLength(1);
  });

  it("no reminders once paid in full", async () => {
    const { token } = await bookThrough(h);
    const p = await pay(token, "balance");
    expect(p.status).toBe(200);
    h.db.payments.push({ ...h.db.payments[0]!, id: crypto.randomUUID(), kind: "balance", amount_cents: 420_000, stripe_checkout_session_id: "cs_manual" });
    h.setNow("2027-03-21T14:00:00Z");
    await cron(`Bearer ${CRON_SECRET}`);
    expect(h.mailTo("rosa@example.com").filter((m) => m.tag.startsWith("reminder-"))).toHaveLength(0);
  });

  it("expires lapsed holds AND their open Stripe sessions; frees the date; tells the owner once", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const p = await pay(r.token, "deposit");
    const sid = String(p.json.url).split("/").pop()!;
    h.setNow("2026-10-25T14:00:00Z"); // > 7 days after approval
    await cron(`Bearer ${CRON_SECRET}`);
    await cron(`Bearer ${CRON_SECRET}`);
    expect(h.db.bookings.get(r.id)!.status).toBe("expired");
    expect(h.stripe.expired).toContain(sid);
    expect(h.mailTo("rosa@example.com", "hold-expired")).toHaveLength(1);
    expect(h.mailTo(OWNER, "owner-nudge").length).toBeGreaterThanOrEqual(1);
  });

  it("never expires a hold whose payment is already in flight", async () => {
    const r = await makeRequest(h);
    await adminAction(h, r.id, "approve");
    await sign(r.token);
    const p = await pay(r.token, "deposit");
    h.stripe.complete(String(p.json.url).split("/").pop()!);
    h.setNow("2026-10-25T14:00:00Z");
    await cron(`Bearer ${CRON_SECRET}`);
    expect(h.db.bookings.get(r.id)!.status).toBe("approved");
  });

  it("nudges the owner once about a request unapproved for 24h, and the family once about an unsigned approval", async () => {
    const a = await makeRequest(h, { email: "a@example.com", event_date: "2027-05-01" });
    const b = await makeRequest(h, { email: "b@example.com", event_date: "2027-05-08" });
    await adminAction(h, b.id, "approve");
    h.setNow("2026-10-17T14:00:00Z");
    await cron(`Bearer ${CRON_SECRET}`);
    await cron(`Bearer ${CRON_SECRET}`);
    const digests = h.mailTo(OWNER, "owner-nudge");
    expect(digests).toHaveLength(1);
    expect(digests[0]!.text).toContain(a.id.slice(0, 6).toUpperCase());
    expect(h.mailTo("b@example.com", "unsigned-nudge")).toHaveLength(1);
    expect(h.mailTo("a@example.com", "unsigned-nudge")).toHaveLength(0);
  });

  it("buckets", () => {
    expect(balanceReminderKind(45)).toBeNull();
    expect(balanceReminderKind(30)).toBe("balance_30");
    expect(balanceReminderKind(14)).toBe("balance_14");
    expect(balanceReminderKind(7)).toBe("balance_7");
    expect(balanceReminderKind(1)).toBe("balance_1");
    expect(balanceReminderKind(0)).toBe("balance_1");
    expect(balanceReminderKind(-1)).toBe("balance_overdue");
  });
});
