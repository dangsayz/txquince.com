import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createD1Client } from "@/lib/db/d1-query";
import { sqliteD1 } from "@/lib/db/sqlite-d1.test-helper";
import { DEFAULT_PRICE_BOOK, quoteCommission } from "@/lib/commission";

let raw: ReturnType<typeof sqliteD1>;
const state = vi.hoisted(() => ({ user: null as null | { id: string; verifiedEmails: string[]; displayName: string }, mail: [] as string[] }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimiter: () => async () => false }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async () => ({ ok: true }) }));
vi.mock("@/lib/clerk-user", () => ({ getSignedInUser: async () => state.user }));
vi.mock("@/lib/pricing", () => ({ getPriceBook: async () => DEFAULT_PRICE_BOOK }));
vi.mock("@/lib/db", () => ({
  isDbConfigured: () => true,
  getDb: () => createD1Client(async () => raw),
  releaseExpiredHolds: async () => void (await createD1Client(async () => raw).rpc("release_expired_booking_holds")),
}));
vi.mock("@/lib/agreement-email", () => ({
  sendAgreementSignedOperator: async () => (state.mail.push("owner"), { ok: true }),
  sendAgreementSignedClient: async () => (state.mail.push("family"), { ok: true }),
}));

import { POST } from "./route";

const q = quoteCommission(DEFAULT_PRICE_BOOK, "trio", [], undefined);
const year = new Date().getFullYear() + 1;
const body = (over: Record<string, unknown> = {}) => ({
  event_date: `${year}-05-15`,
  city: "dfw",
  scope: "both",
  tier: "trio",
  add_ons: [],
  quoted_total_usd: q.totalUsd,
  quoted_deposit_usd: q.retainerUsd,
  name: "Ana Prueba",
  email: "someone-else@example.com",
  phone: "214-555-0100",
  language: "es",
  signed_name: "Ana Prueba",
  signature: "data:image/png;base64,iVBORw0KGgo=",
  agree: true,
  ...over,
});
const post = (b: unknown, origin = "https://txquince.com") =>
  POST(new NextRequest("https://txquince.com/api/account/book", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(b) }));
const rows = () => raw.raw.prepare("SELECT * FROM bookings").all() as Record<string, unknown>[];

beforeEach(() => {
  raw = sqliteD1();
  state.user = { id: "user_1", verifiedEmails: ["mom@example.com"], displayName: "Ana P." };
  state.mail = [];
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://txquince.com");
});

describe("book from the dashboard", () => {
  it("signed out → 401, nothing saved", async () => {
    state.user = null;
    expect((await post(body())).status).toBe(401);
    expect(rows()).toHaveLength(0);
  });

  it("saves a signed, 'requested' booking under the ACCOUNT's email at the server's price", async () => {
    const r = await post(body());
    expect(r.status).toBe(200);
    const [b] = rows();
    expect(b).toMatchObject({ email: "mom@example.com", status: "requested", deposit_amount_cents: q.retainerUsd * 100 });
    const meta = JSON.parse(String(b.metadata));
    expect(meta).toMatchObject({ flow: "agreement", via: "account", tier: "trio", total_usd: q.totalUsd });
    expect(meta.agreement).toMatchObject({ signedName: "Ana Prueba", lang: "es", totalUsd: q.totalUsd });
    expect(meta.agreement.payToken).toBeUndefined(); // can't pay until the owner approves
    expect(state.mail.sort()).toEqual(["family", "owner"]);
  });

  it("refuses without a signature or consent", async () => {
    expect((await post(body({ signature: undefined }))).status).toBe(422);
    expect((await post(body({ agree: undefined }))).status).toBe(422);
    expect(rows()).toHaveLength(0);
  });

  it("refuses a total the server didn't quote (tampered or stale price)", async () => {
    const r = await post(body({ quoted_total_usd: 1 }));
    expect(r.status).toBe(409);
    expect((await r.json()).code).toBe("prices_changed");
    expect(rows()).toHaveLength(0);
  });

  it("refuses a retired package and other sites", async () => {
    const old = quoteCommission(DEFAULT_PRICE_BOOK, "archive", [], undefined);
    expect((await post(body({ tier: "archive", quoted_total_usd: old.totalUsd, quoted_deposit_usd: old.retainerUsd }))).status).toBe(422);
    expect((await post(body(), "https://evil.example")).status).toBe(403);
  });

  it("a hold that ran out no longer blocks the date", async () => {
    const c = createD1Client(async () => raw);
    for (let i = 0; i < 3; i++) {
      await c.from("bookings").insert({ name: "Stale", email: `s${i}@x.com`, event_date: `${year}-05-15`, package: "both", status: "requested", deposit_amount_cents: 100, expires_at: "2020-01-01T00:00:00.000Z" });
    }
    expect((await post(body())).status).toBe(200);
    expect(rows().filter((b) => b.status === "expired")).toHaveLength(3);
  });

  it("a full date is refused; signing again for the same date replaces her own request", async () => {
    const c = createD1Client(async () => raw);
    for (let i = 0; i < 3; i++) {
      await c.from("bookings").insert({ name: "Other", email: `o${i}@x.com`, event_date: `${year}-06-20`, package: "both", status: "paid", deposit_amount_cents: 100, expires_at: "2099-01-01T00:00:00Z" });
    }
    const full = await post(body({ event_date: `${year}-06-20` }));
    expect(full.status).toBe(409);
    expect((await full.json()).code).toBe("date_taken");

    await post(body());
    await post(body());
    const mine = rows().filter((b) => b.email === "mom@example.com");
    expect(mine.map((b) => b.status).sort()).toEqual(["expired", "requested"]);
  });
});
