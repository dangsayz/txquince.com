/**
 * harness.ts — TEST ONLY. Wires the real route handlers to an in-memory db,
 * a recording fake Stripe and a captured mailbox, via setJourneyDepsForTests.
 * Tests then call the exported route handlers DIRECTLY with real Request
 * objects — the same code paths production runs.
 */
import { DEFAULT_PRICE_BOOK, type PriceBook } from "@/lib/commission";
import type { OutgoingEmail } from "@/lib/emails/transport";
import { setJourneyDepsForTests, type JourneyDeps } from "../deps";
import { signStripePayload } from "../webhook";
import { memoryDb, type MemoryDb } from "./memory-db";

export const SITE = "http://localhost:3210";
export const OWNER = "owner@example.com";
export const WEBHOOK_SECRET = "whsec_test_local";
export const CRON_SECRET = "cron-secret-for-tests-0123456789";
/** A valid 1×1 PNG (what the signature pad produces, just tiny). */
export const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export type FakeStripe = {
  sessions: Map<string, { id: string; url: string; amount: number; status: "open" | "complete" | "expired"; metadata: Record<string, unknown>; key?: string }>;
  expired: string[];
  refunds: { id: string; amount: number; payment_intent: string; key: string }[];
  createCalls: number;
  refundCalls: number;
  /** Simulate the family finishing checkout at Stripe (before any webhook). */
  complete(id: string): void;
};

export type Harness = {
  db: MemoryDb;
  stripe: FakeStripe;
  mail: OutgoingEmail[];
  deps: Partial<JourneyDeps>;
  setNow(d: Date | string): void;
  now(): Date;
  setAdmin(email: string | null): void;
  setBook(b: PriceBook): void;
  setTurnstile(ok: boolean): void;
  mailTo(to: string, tag?: string): OutgoingEmail[];
  cleanup(): void;
};

export function makeHarness(start = "2026-10-14T15:00:00Z"): Harness {
  let now = new Date(start);
  let admin: string | null = null;
  let book: PriceBook = DEFAULT_PRICE_BOOK;
  let turnstileOk = true;
  const db = memoryDb(() => now);
  const mail: OutgoingEmail[] = [];
  let n = 0;
  const stripe: FakeStripe = {
    sessions: new Map(),
    expired: [],
    refunds: [],
    createCalls: 0,
    refundCalls: 0,
    complete(id) {
      const s = this.sessions.get(id);
      if (s) s.status = "complete";
    },
  };
  const byKey = new Map<string, unknown>();

  process.env.SUPABASE_URL ||= "http://supabase.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role";

  const deps: Partial<JourneyDeps> = {
    db,
    stripe: {
      configured: () => true,
      async createCheckoutSession(input) {
        stripe.createCalls++;
        if (input.idempotencyKey && byKey.has(input.idempotencyKey)) return byKey.get(input.idempotencyKey) as never;
        const id = `cs_test_${++n}`;
        const s = { id, url: `https://checkout.stripe.test/${id}`, amount: input.amountCents, status: "open" as const, metadata: input.metadata ?? {}, key: input.idempotencyKey };
        stripe.sessions.set(id, s);
        const out = {
          id,
          url: s.url,
          payment_status: "unpaid",
          payment_intent: null,
          client_reference_id: input.clientReferenceId,
          amount_total: input.amountCents,
          currency: input.currency,
          metadata: Object.fromEntries(Object.entries(input.metadata ?? {}).map(([k, v]) => [k, String(v)])),
          customer_details: null,
        };
        if (input.idempotencyKey) byKey.set(input.idempotencyKey, out);
        return out;
      },
      async expireCheckoutSession(id) {
        const s = stripe.sessions.get(id);
        if (!s) throw new Error("no such session");
        if (s.status === "complete") return { id, status: "complete", payment_status: "paid" };
        s.status = "expired";
        stripe.expired.push(id);
        return { id, status: "expired", payment_status: "unpaid" };
      },
      async createRefund(input) {
        stripe.refundCalls++;
        const hit = stripe.refunds.find((r) => r.key === input.idempotencyKey);
        if (hit) return { id: hit.id, amount: hit.amount, currency: "usd", status: "succeeded", payment_intent: hit.payment_intent };
        const r = { id: `re_test_${++n}`, amount: input.amountCents, payment_intent: input.paymentIntentId, key: input.idempotencyKey };
        stripe.refunds.push(r);
        return { id: r.id, amount: r.amount, currency: "usd", status: "succeeded", payment_intent: r.payment_intent };
      },
    },
    mail: async (m) => {
      mail.push(m);
      return { ok: true, sink: "memory" };
    },
    contracts: (() => {
      const store = new Map<string, Uint8Array>();
      return { put: async (k: string, b: Uint8Array) => (store.set(k, b), true), get: async (k: string) => store.get(k) ?? null };
    })(),
    priceBook: async () => book,
    adminEmail: async () => admin,
    turnstile: async () => ({ ok: turnstileOk }),
    rateLimit: async () => false,
    now: () => now,
    siteUrl: () => SITE,
    ownerEmail: () => OWNER,
    webhookSecret: () => WEBHOOK_SECRET,
    cronSecret: () => CRON_SECRET,
    defer: (fn) => void fn(),
  };
  setJourneyDepsForTests(deps);

  return {
    db,
    stripe,
    mail,
    deps,
    setNow: (d) => void (now = new Date(d)),
    now: () => now,
    setAdmin: (e) => void (admin = e),
    setBook: (b) => void (book = b),
    setTurnstile: (ok) => void (turnstileOk = ok),
    mailTo: (to, tag) => mail.filter((m) => m.to === to && (!tag || m.tag === tag)),
    cleanup: () => setJourneyDepsForTests(null),
  };
}

/* ---------------- request helpers ---------------- */

export const jsonRequest = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`${SITE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7", "user-agent": "vitest", ...headers },
    body: JSON.stringify(body),
  });

export function requestBody(over: Record<string, unknown> = {}) {
  return {
    event_date: "2027-04-17",
    city: "dfw",
    venue: "Hacienda Las Flores",
    start_time: "6:00 PM",
    scope: "both",
    tier: "production",
    add_ons: ["sameday"],
    hours: 7,
    name: "Rosa Fictional",
    honoree: "Valentina",
    email: "rosa@example.com",
    phone: "214-555-0100",
    language: "en",
    note: "Test family — fictional.",
    share_permission: true,
    "cf-turnstile-response": "ok",
    ...over,
  };
}

/** Pull the private-link token out of a link URL. */
export const tokenFrom = (url: string) => url.split("/").pop()!;

export function stripeEvent(type: string, object: Record<string, unknown>, id = `evt_${Math.random().toString(36).slice(2)}`) {
  return { id, type, data: { object } };
}

export function signedWebhook(event: unknown, at: Date, secret = WEBHOOK_SECRET) {
  const raw = JSON.stringify(event);
  return new Request(`${SITE}/api/stripe/webhook`, {
    method: "POST",
    headers: { "stripe-signature": signStripePayload(raw, secret, Math.floor(at.getTime() / 1000)) },
    body: raw,
  });
}
