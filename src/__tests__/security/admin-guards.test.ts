/**
 * Server guard rule: every /api/admin handler and every protected /admin page
 * checks the admin session ITSELF. These tests call the handlers directly,
 * with no middleware in front, and the precondition (an allowlisted admin
 * session) violated.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// The session the Supabase server client reports. null = signed out.
const session = vi.hoisted(() => ({ user: null as null | { email: string } }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: session.user }, error: null }),
      signOut: async () => ({ error: null }),
    },
  }),
}));

// Storage for the upload tests; any other admin route never gets this far.
const bucket = vi.hoisted(() => ({ puts: [] as { key: string; type?: string; size: number }[] }));
vi.mock("@/lib/r2-portfolio", async (orig) => ({
  ...(await orig<typeof import("@/lib/r2-portfolio")>()),
  getPortfolioBucket: async () => ({
    get: async () => null,
    delete: async () => {},
    put: async (key: string, value: ArrayBuffer, opts?: { httpMetadata?: { contentType?: string } }) => {
      bucket.puts.push({ key, type: opts?.httpMetadata?.contentType, size: value.byteLength });
      return {};
    },
  }),
}));

const ROOT = join(__dirname, "../../..");
const SRC = join(ROOT, "src");

function walk(dir: string, name: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) return walk(p, name);
    return entry === name ? [p] : [];
  });
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const adminRoutes = walk(join(SRC, "app/api/admin"), "route.ts");

// Deliberately public: signing out is harmless, and /me only answers {admin:false}.
// session: answers only {admin: boolean} for the Replace-photo island on public pages.
const OPEN_BY_DESIGN = new Set([
  "app/api/admin/signout/route.ts",
  "app/api/admin/me/route.ts",
  "app/api/admin/session/route.ts",
]);

function requestFor(file: string, method: string): Request {
  const path = "/" + relative(join(SRC, "app"), file).replace(/\/route\.ts$/, "");
  const hasBody = method !== "GET" && method !== "DELETE";
  return new Request(`https://txquince.com${path}`, {
    method,
    headers: { "content-type": "application/json", origin: "https://txquince.com" },
    body: hasBody ? JSON.stringify({ id: "00000000-0000-0000-0000-000000000000" }) : undefined,
  });
}

beforeEach(() => {
  session.user = null;
  bucket.puts.length = 0;
  vi.stubEnv("ADMIN_EMAILS", "owner@example.com");
});

describe("every /api/admin handler refuses a caller without an admin session", () => {
  it("finds the admin routes", () => {
    expect(adminRoutes.length).toBeGreaterThanOrEqual(20);
    expect(adminRoutes.map((f) => relative(SRC, f))).toContain("app/api/admin/upload/route.ts");
  });

  for (const file of adminRoutes) {
    const rel = relative(SRC, file);
    if (OPEN_BY_DESIGN.has(rel)) continue;

    for (const who of ["signed out", "signed in, not on ADMIN_EMAILS"] as const) {
      it(`${rel} — ${who}`, async () => {
        session.user = who === "signed out" ? null : { email: "stranger@example.com" };
        const mod = (await import(file)) as Record<string, unknown>;
        const handlers = METHODS.filter((m) => typeof mod[m] === "function");
        expect(handlers.length, "route exports at least one handler").toBeGreaterThan(0);
        for (const m of handlers) {
          const res = (await (mod[m] as (r: Request, ctx?: unknown) => Promise<Response>)(requestFor(file, m), {
            params: Promise.resolve({}),
          })) as Response;
          expect([401, 403], `${m} ${rel} → ${res.status}`).toContain(res.status);
        }
      });
    }
  }

  it("/api/admin/me tells a stranger they are not an admin", async () => {
    session.user = { email: "stranger@example.com" };
    const { GET } = await import("@/app/api/admin/me/route");
    expect(await (await GET()).json()).toEqual({ admin: false });
  });
});

describe("/api/admin/upload — guards beyond the session", () => {
  const upload = async (body: Uint8Array, query = "?ext=jpg", headers: Record<string, string> = {}) => {
    const { POST } = await import("@/app/api/admin/upload/route");
    return POST(
      new Request(`https://txquince.com/api/admin/upload${query}`, {
        method: "POST",
        headers: { "content-type": "image/jpeg", ...headers },
        body: body as BodyInit,
      }),
    );
  };

  it("writes nothing for a signed-out caller", async () => {
    const res = await upload(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]));
    expect(res.status).toBe(401);
    expect(bucket.puts).toHaveLength(0);
  });

  it("rejects bytes that aren't an image, whatever the client claims", async () => {
    session.user = { email: "owner@example.com" };
    const html = new TextEncoder().encode("<!doctype html><script>alert(1)</script>");
    const res = await upload(html, "?ext=jpg", { "content-type": "image/jpeg" });
    expect(res.status).toBe(415);
    expect(bucket.puts).toHaveLength(0);
  });

  it("rejects an SVG (script-capable) upload", async () => {
    session.user = { email: "owner@example.com" };
    const svg = new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>`);
    expect((await upload(svg, "?ext=png", { "content-type": "image/svg+xml" })).status).toBe(415);
  });

  it("rejects an oversized upload by Content-Length before reading it", async () => {
    session.user = { email: "owner@example.com" };
    const res = await upload(new Uint8Array([0xff, 0xd8, 0xff]), "?ext=jpg", { "content-length": String(26 * 1024 * 1024) });
    expect(res.status).toBe(413);
  });

  it("stores a real image with the type taken from its bytes, not the request", async () => {
    session.user = { email: "owner@example.com" };
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const res = await upload(png, "?ext=jpg", { "content-type": "text/html" });
    expect(res.status).toBe(200);
    const { path } = (await res.json()) as { path: string };
    expect(path).toMatch(/^portfolio\/\d+-[0-9a-f-]+\.png$/);
    expect(bucket.puts).toEqual([{ key: path, type: "image/png", size: png.byteLength }]);
  });
});

describe("every protected /admin page gates itself on the server", () => {
  const PUBLIC_PAGES = new Set(["app/admin/login/page.tsx", "app/admin/reset-password/page.tsx"]);
  const pages = walk(join(SRC, "app/admin"), "page.tsx").map((f) => relative(SRC, f));

  it("finds the admin pages", () => {
    expect(pages.length).toBeGreaterThanOrEqual(10);
  });

  for (const page of pages) {
    if (PUBLIC_PAGES.has(page)) continue;
    it(`${page} checks the admin session before reading data`, () => {
      const src = readFileSync(join(SRC, page), "utf8");
      const body = src.slice(src.search(/export default async function/));
      expect(body, "default export must be an async server component").not.toBe("");
      // The first thing the page awaits must be the guard, so no data is read
      // (and no RSC payload built) for a caller who isn't an admin.
      const firstAwait = body.match(/await\s+([\w.]+)\(/)?.[1];
      expect(["requireAdminPage", "getAdminEmail"], `first await in ${page}: ${firstAwait}`).toContain(firstAwait);
      if (firstAwait === "getAdminEmail") expect(body).toMatch(/if \(!\(await getAdminEmail\(\)\)\) redirect\(/);
    });
  }

  it("requireAdminPage() redirects a signed-out caller to the login page", async () => {
    const { requireAdminPage } = await import("@/lib/require-admin");
    const err = await requireAdminPage("/admin/bookings").then(
      () => null,
      (e: unknown) => e as { digest?: string },
    );
    expect(err?.digest).toMatch(/^NEXT_REDIRECT;.*;\/admin\/login\?next=%2Fadmin%2Fbookings;/);
  });

  it("requireAdminPage() redirects a signed-in non-admin too", async () => {
    session.user = { email: "stranger@example.com" };
    const { requireAdminPage } = await import("@/lib/require-admin");
    await expect(requireAdminPage()).rejects.toMatchObject({ digest: expect.stringMatching(/^NEXT_REDIRECT;/) });
  });

  it("requireAdminPage() lets an allowlisted admin through", async () => {
    session.user = { email: "Owner@Example.com" };
    const { requireAdminPage } = await import("@/lib/require-admin");
    await expect(requireAdminPage()).resolves.toBe("Owner@Example.com");
  });
});
