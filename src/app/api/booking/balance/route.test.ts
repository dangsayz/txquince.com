import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/* ---------- a tiny in-memory Supabase with the real unique-index rule ---------- */
type Row = Record<string, unknown>;
const db: { bookings: Row[]; booking_payments: Row[] } = { bookings: [], booking_payments: [] };
const LIVE = ["opening", "open", "processing"];

function query(table: keyof typeof db) {
  const filters: ((r: Row) => boolean)[] = [];
  let op: { kind: "select" } | { kind: "update"; patch: Row } | { kind: "insert"; row: Row } = { kind: "select" };
  const run = () => {
    if (op.kind === "insert") {
      const row: Row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...op.row };
      if (table === "booking_payments" && db.booking_payments.some((r) => r.booking_id === row.booking_id && LIVE.includes(r.status as string))) {
        return { data: null, error: { code: "23505", message: "duplicate" } };
      }
      db[table].push(row);
      return { data: [row], error: null };
    }
    const hits = db[table].filter((r) => filters.every((f) => f(r)));
    if (op.kind === "update") for (const r of hits) Object.assign(r, op.patch);
    return { data: hits, error: null };
  };
  const q = {
    select: () => q,
    eq: (k: string, v: unknown) => (filters.push((r) => r[k] === v), q),
    in: (k: string, vs: unknown[]) => (filters.push((r) => vs.includes(r[k])), q),
    update: (patch: Row) => ((op = { kind: "update", patch }), q),
    insert: (row: Row) => ((op = { kind: "insert", row }), q),
    maybeSingle: async () => {
      const { data, error } = run();
      return { data: data?.[0] ?? null, error };
    },
    single: async () => {
      const { data, error } = run();
      return { data: data?.[0] ?? null, error };
    },
    then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(run()).then(res, rej),
  };
  return q;
}

/* ---------- fake Stripe ---------- */
const stripe = {
  created: [] as Row[],
  expireResult: "expired" as "expired" | "complete" | "open",
  expired: [] as string[],
};

vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimiter: () => async () => false }));
vi.mock("@/lib/db", () => ({
  isDbConfigured: () => true,
  getDb: () => ({ from: (t: keyof typeof db) => query(t) }),
}));
vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: () => true,
  createStripeCheckoutSession: async (input: Row) => {
    stripe.created.push(input);
    const id = `cs_test_${stripe.created.length}`;
    return { id, url: `https://checkout.stripe.com/c/pay/${id}` };
  },
  expireStripeCheckoutSession: async (id: string) => {
    stripe.expired.push(id);
    return stripe.expireResult;
  },
}));

import { POST } from "./route";

const BOOKING = "11111111-2222-4333-8444-555555555555";
const TOKEN = "abcdefghijklmnopqrstuvwx";

function seed(status = "paid") {
  db.bookings = [
    {
      id: BOOKING,
      email: "mom@example.com",
      event_date: "2027-05-15",
      status,
      currency: "usd",
      metadata: {
        tier: "trio",
        total_usd: 3000,
        agreement: {
          lang: "en",
          title: "x",
          intro: "x",
          sections: [],
          totalUsd: 3000,
          depositUsd: 750,
          balanceUsd: 2250,
          signedName: "Mom",
          signature: "data:image/png;base64,",
          signedAt: new Date().toISOString(),
          ip: "1.1.1.1",
          userAgent: "x",
          version: "x",
          payToken: TOKEN,
        },
      },
    },
  ];
  db.booking_payments = [];
}

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest("https://txquince.com/api/booking/balance", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://txquince.com", ...headers },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  seed();
  stripe.created = [];
  stripe.expired = [];
  stripe.expireResult = "expired";
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://txquince.com");
});

describe("who can pay", () => {
  it("wrong token → 404, nothing opened", async () => {
    const r = await POST(req({ id: BOOKING, t: "zzzzzzzzzzzzzzzzzzzzzzzz" }));
    expect(r.status).toBe(404);
    expect(stripe.created).toHaveLength(0);
  });
  it("unknown booking → same 404 (no existence leak)", async () => {
    const r = await POST(req({ id: "99999999-2222-4333-8444-555555555555", t: TOKEN }));
    expect(r.status).toBe(404);
  });
  it("deposit not paid yet → refused", async () => {
    seed("pending_payment");
    expect((await POST(req({ id: BOOKING, t: TOKEN }))).status).toBe(409);
  });
  it("other site's Origin → 403", async () => {
    expect((await POST(req({ id: BOOKING, t: TOKEN }, { origin: "https://evil.example" }))).status).toBe(403);
  });
  it("extra fields (e.g. a price) → 400", async () => {
    expect((await POST(req({ id: BOOKING, t: TOKEN, price: 1 }))).status).toBe(400);
  });
  it("form-encoded body → 415", async () => {
    expect((await POST(req({ id: BOOKING, t: TOKEN }, { "content-type": "text/plain" }))).status).toBe(415);
  });
});

describe("amounts", () => {
  it("no amount → charges exactly what's left, from the signed agreement", async () => {
    const r = await POST(req({ id: BOOKING, t: TOKEN }));
    expect(r.status).toBe(200);
    expect(stripe.created[0].amountCents).toBe(225000);
    expect((stripe.created[0].metadata as Row).flow).toBe("balance");
    expect(stripe.created[0].idempotencyKey).toMatch(/^txq-balance-/);
  });
  it("subtracts what's already paid", async () => {
    db.booking_payments.push({ id: "p1", booking_id: BOOKING, kind: "balance", amount_cents: 100000, currency: "usd", status: "paid", created_at: "" });
    await POST(req({ id: BOOKING, t: TOKEN }));
    expect(stripe.created[0].amountCents).toBe(125000);
  });
  it("can't overpay or pay tiny amounts", async () => {
    expect((await POST(req({ id: BOOKING, t: TOKEN, amountCents: 225001 }))).status).toBe(400);
    expect((await POST(req({ id: BOOKING, t: TOKEN, amountCents: 100 }))).status).toBe(400);
    expect(stripe.created).toHaveLength(0);
  });
  it("paid in full → refused", async () => {
    db.booking_payments.push({ id: "p1", booking_id: BOOKING, kind: "balance", amount_cents: 225000, currency: "usd", status: "paid", created_at: "" });
    const r = await POST(req({ id: BOOKING, t: TOKEN }));
    expect(r.status).toBe(409);
    expect(await r.json()).toMatchObject({ paidInFull: true });
  });
});

describe("double pay protection", () => {
  it("a second tap reuses the open checkout", async () => {
    const a = await (await POST(req({ id: BOOKING, t: TOKEN }))).json();
    const b = await (await POST(req({ id: BOOKING, t: TOKEN }))).json();
    expect(b.url).toBe(a.url);
    expect(stripe.created).toHaveLength(1);
  });
  it("a new amount expires the old session first; only one live row ever", async () => {
    await POST(req({ id: BOOKING, t: TOKEN }));
    const r = await POST(req({ id: BOOKING, t: TOKEN, amountCents: 50000 }));
    expect(r.status).toBe(200);
    expect(stripe.expired).toEqual(["cs_test_1"]);
    expect(db.booking_payments.filter((p) => LIVE.includes(p.status as string))).toHaveLength(1);
  });
  it("if the old session was already paid, refuse a new one", async () => {
    await POST(req({ id: BOOKING, t: TOKEN }));
    stripe.expireResult = "complete";
    const r = await POST(req({ id: BOOKING, t: TOKEN, amountCents: 50000 }));
    expect(r.status).toBe(409);
    expect(stripe.created).toHaveLength(1);
  });
  it("concurrent requests: only one checkout opens", async () => {
    const rs = await Promise.all(Array.from({ length: 5 }, () => POST(req({ id: BOOKING, t: TOKEN }))));
    const ok = rs.filter((r) => r.status === 200);
    expect(stripe.created.length).toBeLessThanOrEqual(1);
    expect(ok.length).toBeGreaterThanOrEqual(1);
    expect(db.booking_payments.filter((p) => LIVE.includes(p.status as string))).toHaveLength(1);
  });
  it("a processing payment blocks new checkouts", async () => {
    db.booking_payments.push({ id: "p1", booking_id: BOOKING, kind: "balance", amount_cents: 50000, currency: "usd", status: "processing", created_at: "" });
    expect((await POST(req({ id: BOOKING, t: TOKEN }))).status).toBe(409);
  });
});
