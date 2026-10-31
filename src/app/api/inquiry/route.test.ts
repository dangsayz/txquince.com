import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PRICE_BOOK } from "@/lib/commission";

// The route's outside world: Turnstile passes, the database records the row,
// email is a no-op. What's under test is the route's own validation.
const inserted: Record<string, unknown>[] = [];
vi.mock("server-only", () => ({}));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async () => ({ ok: true }) }));
vi.mock("@/lib/rate-limit", () => ({ rateLimiter: () => async () => false }));
vi.mock("@/lib/pricing", () => ({ getPriceBook: async () => DEFAULT_PRICE_BOOK }));
vi.mock("@/lib/resend", () => ({
  sendOperatorEmail: async () => ({ ok: true }),
  sendInquirerEmail: async () => ({ ok: true }),
}));
vi.mock("@/lib/supabase-server", () => ({
  isSupabaseConfigured: () => true,
  getServiceSupabase: () => ({
    from: () => ({
      insert: async (row: Record<string, unknown>) => {
        inserted.push(row);
        return { error: null };
      },
    }),
  }),
}));

import { POST } from "./route";

const nextYear = `${new Date().getFullYear() + 1}-05-15`;

/** What the homepage package picker sends (Intake.tsx), with a stale budget key. */
const pickerBody = (overrides: Record<string, unknown> = {}) => ({
  name: "Ana Prueba",
  email: "ana@example.com",
  phone: "214-555-0100",
  event_date: nextYear,
  venue: "Salón Ejemplo",
  services: "both",
  budget_range: "full",
  message: "TEST",
  package: {
    city: "dfw",
    venue: "Salón Ejemplo",
    start_time: "4:00 PM",
    scope: "both",
    tier: "trio",
    add_ons: [],
    hours: 7,
    honoree: "Lucía",
    language: "en",
    share_permission: true,
  },
  "cf-turnstile-response": "token",
  ...overrides,
});

const post = (body: unknown) =>
  POST(new Request("https://txquince.com/api/inquiry", { method: "POST", body: JSON.stringify(body) }) as never);

describe("POST /api/inquiry, called directly", () => {
  beforeEach(() => inserted.splice(0));

  it("accepts a package-picker request even when the browser's budget key is one the server no longer lists", async () => {
    const res = await post(pickerBody());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(inserted).toHaveLength(1);
    expect(inserted[0].budget_range).toContain("The Trio"); // derived from the package, priced by the server
    expect(inserted[0].services).toBe("both");
  });

  it("derives the Solo's budget and services from the package, not the browser", async () => {
    const res = await post(pickerBody({ services: "photo", package: { ...pickerBody().package, tier: "solo", hours: 5 } }));
    expect(res.status).toBe(200);
    expect(inserted[0].budget_range).toContain("The Solo");
    expect(inserted[0].services).toBe("both");
  });

  it("still refuses a stale budget key on the plain inquiry form, which has no package to derive it from", async () => {
    const { package: _omit, ...plain } = pickerBody();
    void _omit;
    const res = await post(plain);
    expect(res.status).toBe(422);
    expect(inserted).toHaveLength(0);
  });

  it("still refuses a package the picker doesn't offer", async () => {
    const res = await post(pickerBody({ package: { ...pickerBody().package, tier: "archive" } }));
    expect(res.status).toBe(422);
    expect(inserted).toHaveLength(0);
  });
});
