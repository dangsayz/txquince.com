import { beforeEach, describe, expect, it, vi } from "vitest";
import { createD1Client } from "@/lib/db/d1-query";
import { sqliteD1 } from "@/lib/db/sqlite-d1.test-helper";

const sent: { to: string; text: string }[] = [];
const jar = new Map<string, string>();
let raw: ReturnType<typeof sqliteD1>;

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (n: string) => (jar.has(n) ? { value: jar.get(n) } : undefined) }) }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: async (e: { to: string; text: string }) => (sent.push(e), { error: null }) };
  },
}));
vi.mock("@/lib/db", () => ({ isDbConfigured: () => true, getDb: () => createD1Client(async () => raw) }));

import { getSessionEmail, requestLoginCode, revokeSession, SESSION_COOKIE, verifyLoginCode } from "./admin-session";

const OWNER = "owner@example.com";
const codeFromEmail = () => /\b(\d{6})\b/.exec(sent.at(-1)!.text)![1];

beforeEach(() => {
  raw = sqliteD1();
  sent.length = 0;
  jar.clear();
  vi.stubEnv("ADMIN_EMAILS", `${OWNER}, other@example.com`);
  vi.stubEnv("RESEND_API_KEY", "re_test");
});

describe("email code sign-in", () => {
  it("emails a code to an admin, and the right code signs in once", async () => {
    await requestLoginCode(" Owner@Example.com ");
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe(OWNER);
    const code = codeFromEmail();
    const token = await verifyLoginCode(OWNER, code, "ua");
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await verifyLoginCode(OWNER, code, "ua")).toBeNull(); // single use
    // only hashes are stored
    const rows = raw.raw.prepare("SELECT code_hash FROM admin_login_codes").all() as { code_hash: string }[];
    expect(JSON.stringify(rows)).not.toContain(code);
    expect(JSON.stringify(raw.raw.prepare("SELECT * FROM admin_sessions").all())).not.toContain(token!);
  });

  it("non-admin emails get nothing (and no hint)", async () => {
    await requestLoginCode("stranger@example.com");
    expect(sent).toHaveLength(0);
    expect(await verifyLoginCode("stranger@example.com", "123456", "ua")).toBeNull();
  });

  it("5 wrong tries burn the code", async () => {
    await requestLoginCode(OWNER);
    const code = codeFromEmail();
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < 5; i++) expect(await verifyLoginCode(OWNER, wrong, "ua")).toBeNull();
    expect(await verifyLoginCode(OWNER, code, "ua")).toBeNull();
  });

  it("an expired code fails; a newer code replaces the older one", async () => {
    await requestLoginCode(OWNER);
    const first = codeFromEmail();
    await requestLoginCode(OWNER);
    const second = codeFromEmail();
    if (first !== second) expect(await verifyLoginCode(OWNER, first, "ua")).toBeNull();
    raw.raw.prepare("UPDATE admin_login_codes SET expires_at = '2000-01-01T00:00:00.000Z'").run();
    expect(await verifyLoginCode(OWNER, second, "ua")).toBeNull();
  });

  it("at most 5 codes per email per 15 minutes", async () => {
    for (let i = 0; i < 8; i++) await requestLoginCode(OWNER);
    expect(sent).toHaveLength(5);
  });

  it("session cookie → email; revoked, expired or de-listed → null", async () => {
    await requestLoginCode(OWNER);
    const token = (await verifyLoginCode(OWNER, codeFromEmail(), "ua"))!;
    jar.set(SESSION_COOKIE, token);
    expect(await getSessionEmail()).toBe(OWNER);

    vi.stubEnv("ADMIN_EMAILS", "other@example.com"); // removed from the allowlist
    expect(await getSessionEmail()).toBeNull();
    vi.stubEnv("ADMIN_EMAILS", OWNER);

    jar.set(SESSION_COOKIE, token.slice(0, -1) + (token.endsWith("A") ? "B" : "A")); // forged
    expect(await getSessionEmail()).toBeNull();

    jar.set(SESSION_COOKIE, token);
    await revokeSession();
    expect(await getSessionEmail()).toBeNull();
  });
});
