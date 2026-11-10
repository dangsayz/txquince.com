import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createD1Client } from "@/lib/db/d1-query";
import { sqliteD1 } from "@/lib/db/sqlite-d1.test-helper";

let raw: ReturnType<typeof sqliteD1>;
const state = vi.hoisted(() => ({ user: null as null | { id: string; verifiedEmails: string[]; displayName: string }, mail: [] as Record<string, unknown>[] }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/rate-limit", () => ({ rateLimiter: () => async () => false }));
vi.mock("@/lib/clerk-user", () => ({ getSignedInUser: async () => state.user }));
vi.mock("@/lib/d1", () => ({ getD1: async () => raw }));
vi.mock("@/lib/db", () => ({ isDbConfigured: () => true, getDb: () => createD1Client(async () => raw), releaseExpiredHolds: async () => {} }));
vi.mock("resend", () => ({ Resend: class { emails = { send: async (e: Record<string, unknown>) => (state.mail.push(e), { error: null }) }; } }));

import { POST } from "./route";
const post = (body: unknown, origin = "https://txquince.com") =>
  POST(new NextRequest("https://txquince.com/api/account/support", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) }));
const tickets = () => raw.raw.prepare("SELECT * FROM support_tickets").all() as Record<string, unknown>[];

beforeEach(() => {
  raw = sqliteD1();
  state.user = { id: "user_1", verifiedEmails: ["mom@example.com"], displayName: "Maria G." };
  state.mail = [];
  vi.stubEnv("OPERATOR_NOTIFY_EMAIL", "owner@example.com");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://txquince.com");
});

describe("support ticket", () => {
  it("signed out → 401, nothing saved", async () => {
    state.user = null;
    expect((await post({ topic: "other", message: "hello there" })).status).toBe(401);
    expect(tickets()).toHaveLength(0);
  });
  it("saves the ticket under the SESSION's email and emails the owner", async () => {
    const r = await post({ topic: "payment", message: "Can I pay in two parts?", phone: "214-555-0100", lang: "es" });
    expect(r.status).toBe(200);
    expect(tickets()[0]).toMatchObject({ email: "mom@example.com", clerk_user: "user_1", topic: "payment", language: "es", status: "open" });
    expect(state.mail[0]).toMatchObject({ to: "owner@example.com", replyTo: "mom@example.com" });
  });
  it("ignores extra fields like a spoofed email (strict) and other sites", async () => {
    expect((await post({ topic: "other", message: "hello there", email: "victim@example.com" })).status).toBe(400);
    expect((await post({ topic: "other", message: "hello there" }, "https://evil.example")).status).toBe(403);
    expect(tickets()).toHaveLength(0);
  });
  it("a booking id that isn't theirs is dropped, not trusted", async () => {
    const r = await post({ topic: "booking", message: "About my date", bookingId: "11111111-2222-4333-8444-555555555555" });
    expect(r.status).toBe(200);
    expect(tickets()[0].booking_id).toBeNull();
  });
  it("too short → 400", async () => {
    expect((await post({ topic: "other", message: "hi" })).status).toBe(400);
  });
});
