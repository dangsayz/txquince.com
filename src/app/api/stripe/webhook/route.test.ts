/**
 * Stripe webhook contract for a shared account.
 * Payment Link expiries are not bookings. A bad signature never enters the handler.
 */
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const SECRET = "whsec_test_secret";

const db = vi.hoisted(() => ({
  throwOnUse: false,
  rows: [{ id: "booking-1" }] as { id: string }[],
  writes: [] as { values: unknown; filters: [string, unknown][] }[],
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/booking-fulfillment", () => ({
  fulfillCheckoutSession: vi.fn(async () => {}),
}));
vi.mock("@/lib/supabase-server", () => ({
  getServiceSupabase: () => {
    if (db.throwOnUse) {
      throw new Error(
        "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    return {
      from: () => ({
        update(values: unknown) {
          const filters: [string, unknown][] = [];
          const chain = {
            eq(col: string, value: unknown) {
              filters.push([col, value]);
              return chain;
            },
            in(col: string, value: unknown) {
              filters.push([col, value]);
              return chain;
            },
            select() {
              return chain;
            },
            then(
              resolve: (value: { data: { id: string }[]; error: null }) => unknown,
              reject?: (reason: unknown) => unknown,
            ) {
              db.writes.push({ values, filters: [...filters] });
              return Promise.resolve({ data: db.rows, error: null }).then(resolve, reject);
            },
          };
          return chain;
        },
      }),
    };
  },
}));

const { POST } = await import("./route");

function sign(body: string, secret = SECRET): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const v1 = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

function post(body: string, signature: string) {
  return POST(
    new NextRequest("https://txquince.com/api/stripe/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": signature,
      },
      body,
    }),
  );
}

function expiredSession(session: Record<string, unknown>) {
  return JSON.stringify({
    id: "evt_test_expired",
    type: "checkout.session.expired",
    data: { object: { object: "checkout.session", payment_status: "unpaid", ...session } },
  });
}

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  db.throwOnUse = false;
  db.rows = [{ id: "booking-1" }];
  db.writes.length = 0;
});

afterEach(() => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  vi.restoreAllMocks();
});

it("an expired Payment Link session returns 200 and writes nothing", async () => {
  db.throwOnUse = true;
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  const body = expiredSession({
    id: "cs_live_a1ffp7dAf7t8RmtkQXmzHchcbCx5FXkpvHHE2NGNOsArQKThOVEnPT14XL",
    metadata: {},
    success_url: "https://stripe.com",
    payment_link: "plink_1UQGPwKZUOvqkDDMhqAGr5ml",
    payment_intent: null,
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ received: true });
  expect(db.writes).toEqual([]);
  expect(info.mock.calls.flat().join(" ")).toContain(
    "cs_live_a1ffp7dAf7t8RmtkQXmzHchcbCx5FXkpvHHE2NGNOsArQKThOVEnPT14XL",
  );
});

it("a txquince checkout.session.expired still releases the pending booking", async () => {
  const body = expiredSession({
    id: "cs_live_txquince",
    metadata: {
      source: "commission",
      booking_id: "45b2022f-8495-4a32-9bc4-924ffd099c54",
    },
    success_url: "https://txquince.com/?commission=confirmed&session_id={CHECKOUT_SESSION_ID}#intake",
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(db.writes).toEqual([
    {
      values: { status: "expired" },
      filters: [
        ["stripe_checkout_session_id", "cs_live_txquince"],
        ["status", "pending_payment"],
      ],
    },
  ]);
});

it("a bad signature returns 400 and writes nothing", async () => {
  db.throwOnUse = true;
  const body = expiredSession({
    id: "cs_live_txquince",
    metadata: { source: "commission", booking_id: "45b2022f-8495-4a32-9bc4-924ffd099c54" },
  });

  const response = await post(body, sign(body, "whsec_wrong_secret"));

  expect(response.status).toBe(400);
  expect(db.writes).toEqual([]);
});

it("a txquince session with no booking row returns 200 and does not throw", async () => {
  db.rows = [];
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  const body = expiredSession({
    id: "cs_live_missing",
    metadata: { source: "commission", booking_id: "missing-booking" },
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(info.mock.calls.flat().join(" ")).toContain("cs_live_missing");
});

it("charge.refunded with no txquince metadata returns 200 when the database client throws", async () => {
  db.throwOnUse = true;
  const body = JSON.stringify({
    id: "evt_test_refund",
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_foreign",
        object: "charge",
        refunded: true,
        payment_intent: "pi_foreign",
        metadata: {},
      },
    },
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(db.writes).toEqual([]);
});

it("charge.refunded with empty metadata still matches a booking by payment intent", async () => {
  const body = JSON.stringify({
    id: "evt_test_refund_empty",
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_empty",
        object: "charge",
        refunded: true,
        payment_intent: "pi_deposit",
        metadata: {},
      },
    },
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(db.writes).toEqual([
    {
      values: { status: "refunded" },
      filters: [
        ["stripe_payment_intent_id", "pi_deposit"],
        ["status", ["paid", "payment_review"]],
      ],
    },
  ]);
});

it("an agreement checkout expiry does not release the date", async () => {
  const body = expiredSession({
    id: "cs_live_agreement",
    metadata: { source: "commission", booking_id: "booking-1", flow: "agreement" },
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(db.writes).toEqual([]);
});

it("charge.refunded for a txquince charge still marks the booking refunded", async () => {
  const body = JSON.stringify({
    id: "evt_test_refund_ours",
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_ours",
        object: "charge",
        refunded: true,
        payment_intent: "pi_ours",
        metadata: { source: "commission", booking_id: "45b2022f-8495-4a32-9bc4-924ffd099c54" },
      },
    },
  });

  const response = await post(body, sign(body));

  expect(response.status).toBe(200);
  expect(db.writes).toEqual([
    {
      values: { status: "refunded" },
      filters: [
        ["stripe_payment_intent_id", "pi_ours"],
        ["status", ["paid", "payment_review"]],
      ],
    },
  ]);
});
