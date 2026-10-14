import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RATE_LIMITS, rateLimiter, resetMemoryRateLimits, type RateLimitBinding } from "./rate-limit";

const noEnv = async () => null;

beforeEach(() => {
  resetMemoryRateLimits();
  vi.unstubAllEnvs();
});

describe("in-memory fallback (dev / no binding)", () => {
  it("allows the limit, then refuses", async () => {
    let t = 1_000_000;
    const limited = rateLimiter("inquiry", { loadEnv: noEnv, now: () => t });
    for (let i = 0; i < RATE_LIMITS.inquiry.limit; i++) expect(await limited("198.51.100.1")).toBe(false);
    expect(await limited("198.51.100.1")).toBe(true);
    // another client is unaffected
    expect(await limited("198.51.100.2")).toBe(false);
    // the window slides
    t += RATE_LIMITS.inquiry.windowMs + 1;
    expect(await limited("198.51.100.1")).toBe(false);
  });

  it("keeps separate counters per policy", async () => {
    const inquiry = rateLimiter("inquiry", { loadEnv: noEnv });
    const commission = rateLimiter("commission", { loadEnv: noEnv });
    for (let i = 0; i < 5; i++) await inquiry("198.51.100.3");
    expect(await inquiry("198.51.100.3")).toBe(true);
    expect(await commission("198.51.100.3")).toBe(false);
  });
});

describe("Workers Rate Limiting binding (production)", () => {
  function fakeBinding(allow: (key: string) => boolean) {
    const calls: string[] = [];
    const binding: RateLimitBinding = {
      limit: vi.fn(async ({ key }: { key: string }) => {
        calls.push(key);
        return { success: allow(key) };
      }),
    };
    return { binding, calls };
  }

  it("uses the binding named by the policy, with a policy-scoped key", async () => {
    const forms = fakeBinding(() => true);
    const track = fakeBinding(() => true);
    const env = { RATE_LIMIT_FORMS: forms.binding, RATE_LIMIT_TRACK: track.binding };
    await rateLimiter("commission", { loadEnv: async () => env })("203.0.113.5");
    await rateLimiter("track", { loadEnv: async () => env })("203.0.113.5");
    expect(forms.calls).toEqual(["commission:203.0.113.5"]);
    expect(track.calls).toEqual(["track:203.0.113.5"]);
  });

  it("refuses when the binding says no — counters live outside the isolate", async () => {
    const { binding } = fakeBinding(() => false);
    const limited = rateLimiter("commission", { loadEnv: async () => ({ RATE_LIMIT_FORMS: binding }) });
    expect(await limited("203.0.113.6")).toBe(true);
  });

  it("falls back to memory (not to 'unlimited') if the binding throws", async () => {
    const binding: RateLimitBinding = { limit: async () => { throw new Error("outage"); } };
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const limited = rateLimiter("inquiry", { loadEnv: async () => ({ RATE_LIMIT_FORMS: binding }) });
    for (let i = 0; i < 5; i++) expect(await limited("203.0.113.8")).toBe(false);
    expect(await limited("203.0.113.8")).toBe(true);
    warn.mockRestore();
  });

  it("warns once and uses memory when the binding is missing in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const limited = rateLimiter("track", { loadEnv: async () => ({}) });
    for (let i = 0; i < 60; i++) expect(await limited("203.0.113.9")).toBe(false);
    expect(await limited("203.0.113.9")).toBe(true);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("RATE_LIMIT_TRACK binding is missing"))).toHaveLength(1);
    warn.mockRestore();
  });
});

describe("wrangler.jsonc stays in step with RATE_LIMITS", () => {
  it("declares every binding with the same limit and period", () => {
    const raw = readFileSync(new URL("../../wrangler.jsonc", import.meta.url), "utf8");
    const json = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, "")) as {
      ratelimits: { name: string; namespace_id: string; simple: { limit: number; period: number } }[];
    };
    const byName = new Map(json.ratelimits.map((r) => [r.name, r]));
    for (const [name, policy] of Object.entries(RATE_LIMITS)) {
      const binding = byName.get(policy.binding);
      expect(binding, `${name} → ${policy.binding}`).toBeDefined();
      expect(binding!.simple.limit).toBe(policy.limit);
      expect(binding!.simple.period * 1000).toBe(policy.windowMs);
      expect([10, 60]).toContain(binding!.simple.period);
      expect(binding!.namespace_id).toMatch(/^\d+$/);
    }
    expect(new Set(json.ratelimits.map((r) => r.namespace_id)).size).toBe(json.ratelimits.length);
  });
});
