import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { privateTokenFromPath, privateLinkIsLive } from "./edge-check";
import { middleware } from "@/middleware";
import { GET as legacyGET } from "@/app/booking/[id]/route";
import { makeHarness } from "./testing/harness";
import { params } from "./testing/flow";
import { newToken } from "./tokens";

describe("real 404s for private links", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("parses only private paths", () => {
    const t = newToken();
    expect(privateTokenFromPath(`/my/booking/${t}`)).toBe(t);
    expect(privateTokenFromPath(`/es/mi-reserva/${t}`)).toBe(t);
    expect(privateTokenFromPath(`/my/booking/${t}/contract`)).toBe(t);
    expect(privateTokenFromPath(`/my/booking/bad`)).toBeNull();
    expect(privateTokenFromPath(`/my/booking`)).toBeUndefined();
    expect(privateTokenFromPath(`/blog/x`)).toBeUndefined();
  });

  it("unknown or malformed tokens are rewritten to a 404 before the page streams", async () => {
    process.env.SUPABASE_URL = "http://supabase.invalid";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "k";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("[]", { status: 200 })));
    const r1 = await middleware(new NextRequest(`http://x/my/booking/${newToken()}`));
    expect(r1.headers.get("x-middleware-rewrite")).toContain("/__txq-private-link-not-found");
    const r2 = await middleware(new NextRequest(`http://x/es/mi-reserva/short`));
    expect(r2.headers.get("x-middleware-rewrite")).toContain("/__txq-private-link-not-found");
  });

  it("a live token passes; an expired one doesn't", async () => {
    process.env.SUPABASE_URL = "http://supabase.invalid";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "k";
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([{ expires_at: "2030-01-01T00:00:00Z", revoked_at: null }]))));
    expect(await privateLinkIsLive(newToken(), new Date("2026-10-14T00:00:00Z"))).toBe(true);
    expect(await privateLinkIsLive(newToken(), new Date("2031-01-01T00:00:00Z"))).toBe(false);
  });

  it("legacy /booking/<bad> is a real 404", async () => {
    const h = makeHarness();
    const res = await legacyGET(new Request("http://x/booking/nope?t=abc"), params({ id: "nope" }));
    expect(res.status).toBe(404);
    const res2 = await legacyGET(new Request("http://x/booking/x?t=abc"), params({ id: "8d6f1f0e-1c1b-4c55-9a8e-2f0b3d7c9a10" }));
    expect(res2.status).toBe(404);
    h.cleanup();
  });
});
