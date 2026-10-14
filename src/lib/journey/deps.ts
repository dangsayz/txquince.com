/**
 * deps.ts — everything the journey touches outside itself, in one object.
 *
 * Route handlers call `journeyDeps()`; production gets PostgREST, Stripe REST,
 * Resend (or the mail sink), R2 and the live price book. Tests swap pieces in
 * with `setJourneyDepsForTests()` and then call the real route handlers
 * directly — the guards under test are the production code paths.
 */
import "server-only";
import { getServiceSupabase } from "@/lib/supabase-server";
import {
  createStripeCheckoutSession,
  createStripeRefund,
  expireStripeCheckoutSession,
  isStripeConfigured,
  type StripeCheckoutSession,
  type StripeRefund,
} from "@/lib/stripe";
import { sendEmail, type MailResult, type OutgoingEmail } from "@/lib/emails/transport";
import { getPriceBook } from "@/lib/pricing";
import { getAdminEmail } from "@/lib/require-admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { getSiteUrl } from "@/lib/site-url";
import type { PriceBook } from "@/lib/commission";
import { supabaseJourneyDb, type JourneyDb } from "./db";

export type StripeApi = {
  configured(): boolean;
  createCheckoutSession: typeof createStripeCheckoutSession;
  expireCheckoutSession(id: string): Promise<{ id: string; status: string | null; payment_status: string | null }>;
  createRefund(input: Parameters<typeof createStripeRefund>[0]): Promise<StripeRefund>;
};

export type ContractStore = {
  put(key: string, bytes: Uint8Array): Promise<boolean>;
  get(key: string): Promise<Uint8Array | null>;
};

export type JourneyDeps = {
  db: JourneyDb;
  stripe: StripeApi;
  mail: (msg: OutgoingEmail) => Promise<MailResult>;
  contracts: ContractStore;
  priceBook: () => Promise<PriceBook>;
  /** The signed-in, allowlisted admin's email, or null. */
  adminEmail: () => Promise<string | null>;
  turnstile: (token: string | undefined, ip: string) => Promise<{ ok: boolean }>;
  /** true = over the limit. */
  rateLimit: (bucket: string, key: string, max: number, windowMs: number) => Promise<boolean>;
  now: () => Date;
  siteUrl: () => string;
  ownerEmail: () => string | null;
  webhookSecret: () => string | null;
  cronSecret: () => string | null;
  /** Run work after the response is sent (Next `after`); tests run it inline. */
  defer: (fn: () => Promise<void>) => void;
};

/* ---------------- defaults ---------------- */

const HITS = new Map<string, number[]>();
/**
 * Per-isolate sliding window, same shape as the limiter in /api/commission.
 * The security work is replacing it with a durable limiter; this is the seam.
 */
async function memoryRateLimit(bucket: string, key: string, max: number, windowMs: number): Promise<boolean> {
  const k = `${bucket}:${key}`;
  const now = Date.now();
  const arr = (HITS.get(k) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  HITS.set(k, arr);
  if (HITS.size > 10_000) HITS.clear();
  return arr.length > max;
}

interface R2Like {
  put(key: string, value: Uint8Array, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
}

/** Signed contracts: R2 `CONTRACTS` binding on Workers; a gitignored folder in dev. */
function defaultContractStore(): ContractStore {
  const bucket = async (): Promise<R2Like | null> => {
    try {
      const mod = await import("@opennextjs/cloudflare");
      const env = mod.getCloudflareContext().env as unknown as Record<string, unknown>;
      return (env?.CONTRACTS as R2Like | undefined) ?? null;
    } catch {
      return null;
    }
  };
  const localDir = () =>
    process.env.CONTRACTS_LOCAL_DIR || (process.env.NODE_ENV !== "production" ? `${process.cwd()}/.contracts-local` : null);
  const safe = (key: string) => {
    if (!/^contracts\/[0-9a-f-]{36}\/[0-9a-f]{64}\.pdf$/.test(key)) throw new Error("bad contract key");
    return key;
  };
  return {
    async put(key, bytes) {
      safe(key);
      const b = await bucket();
      if (b) {
        await b.put(key, bytes, { httpMetadata: { contentType: "application/pdf" } });
        return true;
      }
      const dir = localDir();
      if (!dir) return false;
      const fs = await import("node:fs/promises");
      const path = `${dir}/${key}`;
      await fs.mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
      await fs.writeFile(path, bytes);
      return true;
    },
    async get(key) {
      safe(key);
      const b = await bucket();
      if (b) {
        const obj = await b.get(key);
        return obj ? new Uint8Array(await obj.arrayBuffer()) : null;
      }
      const dir = localDir();
      if (!dir) return null;
      const fs = await import("node:fs/promises");
      return fs.readFile(`${dir}/${key}`).then((buf) => new Uint8Array(buf)).catch(() => null);
    },
  };
}

async function defaultDefer(fn: () => Promise<void>) {
  try {
    const { after } = await import("next/server");
    after(fn);
  } catch {
    await fn();
  }
}

/** The PostgREST db, created on first use (so a test that injects its own never touches Supabase). */
function lazyDb(): JourneyDb {
  let real: JourneyDb | null = null;
  return new Proxy({} as JourneyDb, {
    get(_t, prop) {
      real ??= supabaseJourneyDb(getServiceSupabase());
      return real[prop as keyof JourneyDb];
    },
  });
}

function defaults(): JourneyDeps {
  return {
    db: lazyDb(),
    stripe: {
      configured: isStripeConfigured,
      createCheckoutSession: createStripeCheckoutSession,
      expireCheckoutSession: expireStripeCheckoutSession,
      createRefund: createStripeRefund,
    },
    mail: sendEmail,
    contracts: defaultContractStore(),
    priceBook: getPriceBook,
    adminEmail: getAdminEmail,
    turnstile: (token, ip) => verifyTurnstile(token, ip),
    rateLimit: memoryRateLimit,
    now: () => new Date(),
    siteUrl: getSiteUrl,
    ownerEmail: () => process.env.OPERATOR_NOTIFY_EMAIL || null,
    webhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET || null,
    cronSecret: () => process.env.CRON_SECRET || null,
    defer: (fn) => void defaultDefer(fn),
  };
}

let override: Partial<JourneyDeps> | null = null;

export function journeyDeps(): JourneyDeps {
  if (override && process.env.NODE_ENV !== "production") return { ...defaults(), ...override };
  return defaults();
}

/** Tests only. Throws in production so it can never be wired by accident. */
export function setJourneyDepsForTests(d: Partial<JourneyDeps> | null) {
  if (process.env.NODE_ENV === "production") throw new Error("setJourneyDepsForTests is test-only");
  override = d;
}

export type { StripeCheckoutSession };
