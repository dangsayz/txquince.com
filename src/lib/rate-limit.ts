/**
 * rate-limit.ts — per-client rate limits for the public POST endpoints.
 *
 * Production (Cloudflare Workers): the Workers Rate Limiting binding. Its
 * counters live in Cloudflare, not in the isolate, so they survive isolate
 * recycling and are shared by every isolate in a Cloudflare location. The
 * bindings are declared in wrangler.jsonc (`ratelimits`); their limit/period
 * there MUST match RATE_LIMITS below (a test checks it).
 *
 * Fallback (local dev, `next start`, or a binding outage): the old per-isolate
 * sliding window in memory. It's best-effort only. Turnstile stays the real
 * gate on the forms.
 *
 * Usage keeps the old call-site shape, just awaited:
 *   const rateLimited = rateLimiter("inquiry");
 *   if (await rateLimited(clientIp(req))) return 429;
 */

export type RateLimitName = "commission" | "inquiry" | "plan" | "track" | "csp-report";

export type RateLimitPolicy = {
  /** Requests allowed per window. */
  limit: number;
  /** Window length; the Workers binding only supports 10s or 60s. */
  windowMs: 10_000 | 60_000;
  /** wrangler.jsonc `ratelimits[].name` that enforces this policy. */
  binding: "RATE_LIMIT_FORMS" | "RATE_LIMIT_TRACK";
};

/**
 * Policies sharing a binding share its limit, but not its counters: each key
 * is prefixed with the policy name, so 5 inquiries don't use up the commission
 * allowance.
 */
export const RATE_LIMITS: Record<RateLimitName, RateLimitPolicy> = {
  commission: { limit: 5, windowMs: 60_000, binding: "RATE_LIMIT_FORMS" },
  inquiry: { limit: 5, windowMs: 60_000, binding: "RATE_LIMIT_FORMS" },
  // /api/plan (new plan) and /api/plan/[slug]/hold (open checkout).
  plan: { limit: 5, windowMs: 60_000, binding: "RATE_LIMIT_FORMS" },
  track: { limit: 60, windowMs: 60_000, binding: "RATE_LIMIT_TRACK" },
  "csp-report": { limit: 60, windowMs: 60_000, binding: "RATE_LIMIT_TRACK" },
};

/** Structural type of a Workers Rate Limiting binding (no generated env types). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

type Env = Record<string, unknown> | null;

export type RateLimiterDeps = {
  /** Cloudflare env bindings, or null off-Workers. Injected in tests. */
  loadEnv?: () => Promise<Env>;
  now?: () => number;
};

async function cloudflareEnv(): Promise<Env> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    return mod.getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return null; // plain `next dev` / `next start` / tests
  }
}

function isBinding(v: unknown): v is RateLimitBinding {
  return !!v && typeof (v as RateLimitBinding).limit === "function";
}

/* ----------------------- in-memory fallback ----------------------- */

const HITS = new Map<string, number[]>();
const MAX_KEYS = 5000;

function memoryLimited(key: string, policy: RateLimitPolicy, now: number): boolean {
  const arr = (HITS.get(key) ?? []).filter((t) => now - t < policy.windowMs);
  arr.push(now);
  HITS.set(key, arr);
  // Light cleanup so a warm isolate can't grow without bound.
  if (HITS.size > MAX_KEYS) HITS.clear();
  return arr.length > policy.limit;
}

/** Test helper: forget every in-memory counter. */
export function resetMemoryRateLimits(): void {
  HITS.clear();
}

/* ----------------------------- public ----------------------------- */

const warned = new Set<string>();
function warnOnce(id: string, message: string) {
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(message);
}

/**
 * Returns `(key) => Promise<boolean>`: true when this key is over its limit
 * and the request should be refused (429) or dropped.
 */
export function rateLimiter(name: RateLimitName, deps: RateLimiterDeps = {}) {
  const policy = RATE_LIMITS[name];
  const loadEnv = deps.loadEnv ?? cloudflareEnv;
  const now = deps.now ?? Date.now;

  return async function rateLimited(key: string): Promise<boolean> {
    const scoped = `${name}:${key || "unknown"}`;
    const env = await loadEnv();
    const binding = env?.[policy.binding];

    if (isBinding(binding)) {
      try {
        const { success } = await binding.limit({ key: scoped });
        return !success;
      } catch (err) {
        // A limiter outage must not take the booking form down with it.
        warnOnce(`err:${policy.binding}`, `[rate-limit] ${policy.binding} failed; using in-memory fallback: ${String(err)}`);
        return memoryLimited(scoped, policy, now());
      }
    }

    if (env && process.env.NODE_ENV === "production") {
      warnOnce(
        `missing:${policy.binding}`,
        `[rate-limit] ${policy.binding} binding is missing; using the per-isolate in-memory limit. Add it to wrangler.jsonc (ratelimits).`,
      );
    }
    return memoryLimited(scoped, policy, now());
  };
}
