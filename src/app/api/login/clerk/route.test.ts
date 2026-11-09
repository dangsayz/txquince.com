import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ user: null as null | { verifiedEmails: string[] }, created: [] as string[] }));
vi.mock("@/lib/clerk-user", () => ({ getSignedInUser: async () => state.user }));
vi.mock("@/lib/admin-session", async () => {
  const { isAuthorizedAdminEmail } = await import("@/lib/admin-auth");
  return {
    createAdminSession: async (e: string) => (isAuthorizedAdminEmail(e) ? (state.created.push(e), "t".repeat(43)) : null),
    sessionCookie: (v: string) => ({ name: "txq_admin", value: v, httpOnly: true, path: "/" }),
  };
});

import { GET } from "./route";
const get = (q = "") => GET(new NextRequest(`https://txquince.com/api/login/clerk${q}`));

beforeEach(() => {
  state.user = null;
  state.created = [];
  vi.stubEnv("ADMIN_EMAILS", "owner@example.com");
});

describe("Studio sign-in with Google (Clerk)", () => {
  it("not signed in to Clerk → back to Studio login", async () => {
    const r = await get();
    expect(r.headers.get("location")).toBe("https://txquince.com/admin/login?error=google");
  });
  it("a Google account that isn't on the admin list gets no session", async () => {
    state.user = { verifiedEmails: ["mom@example.com"] };
    const r = await get();
    expect(r.headers.get("location")).toContain("error=not-admin");
    expect(state.created).toEqual([]);
    expect(r.headers.get("set-cookie")).toBeNull();
  });
  it("the owner's verified Google email → Studio session, back to next", async () => {
    state.user = { verifiedEmails: ["other@example.com", "owner@example.com"] };
    const r = await get("?next=%2Fadmin%2Fbookings");
    expect(r.headers.get("location")).toBe("https://txquince.com/admin/bookings");
    expect(state.created).toEqual(["owner@example.com"]);
    expect(r.headers.get("set-cookie")).toContain("txq_admin=");
  });
  it("never redirects off /admin (no open redirect)", async () => {
    state.user = { verifiedEmails: ["owner@example.com"] };
    for (const bad of ["https://evil.example", "//evil.example", "/login"]) {
      const r = await get(`?next=${encodeURIComponent(bad)}`);
      expect(r.headers.get("location")).toBe("https://txquince.com/admin");
    }
  });
});
