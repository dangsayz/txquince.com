/**
 * /api/photos/media must not serve deleted or hidden Photo dump photos, and
 * must not hand browsers a year-long cache. Called directly, no middleware.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DumpManifest } from "@/lib/photo-dump-shared";
import { mediaVisibility } from "@/lib/photo-media-access";

vi.mock("server-only", () => ({}));

const PUBLIC = "dump/2026/10/publicphoto.webp";
const HIDDEN = "dump/2026/10/hiddenphoto.webp";
const IN_HIDDEN_ALBUM = "dump/2026/10/albumhidden.webp";
const SWAPPED_HIDDEN = "dump/2026/10/swappedhide.webp";
const DELETED = "dump/2026/10/deletedphoto.webp"; // object still in R2, gone from the manifest

const photo = (key: string, extra: Record<string, unknown> = {}) => ({
  id: key.slice(13, 25), key, w: 2000, h: 1500, alt: { en: "", es: "" }, tags: [], createdAt: "2026-10-01T00:00:00Z", ...extra,
});
const manifest: DumpManifest = {
  version: 1,
  updatedAt: "2026-10-14T00:00:00Z",
  albums: [
    { id: "a1", title: { en: "", es: "" }, createdAt: "", source: "admin", photos: [photo(PUBLIC), photo(HIDDEN, { hidden: true }), photo(SWAPPED_HIDDEN, { hidden: true })] },
    { id: "a2", title: { en: "", es: "" }, createdAt: "", source: "admin", hidden: true, photos: [photo(IN_HIDDEN_ALBUM)] },
  ],
  overrides: { "home.hero.a": SWAPPED_HIDDEN },
};

const admin = vi.hoisted(() => ({ is: false }));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: async () => admin.is }));

const stored = new Set([PUBLIC, HIDDEN, IN_HIDDEN_ALBUM, SWAPPED_HIDDEN, DELETED]);
vi.mock("@/lib/photo-dump", () => ({
  getImagesBinding: async () => null,
  readManifest: async () => ({ manifest, etag: "e1" }),
  getDumpBucket: async () => ({
    get: async (key: string) =>
      stored.has(key)
        ? { body: new Response("img").body, httpMetadata: { contentType: "image/webp" }, size: 3, etag: "x", text: async () => "" }
        : null,
    put: async () => ({}),
    delete: async () => {},
  }),
}));

async function get(key: string) {
  const { GET } = await import("@/app/api/photos/media/[...key]/route");
  return GET(new Request(`https://txquince.com/api/photos/media/${key}`), {
    params: Promise.resolve({ key: key.split("/") }),
  });
}

beforeEach(() => {
  admin.is = false;
});

describe("mediaVisibility", () => {
  it("classifies from the manifest", () => {
    expect(mediaVisibility(manifest, PUBLIC)).toBe("public");
    expect(mediaVisibility(manifest, HIDDEN)).toBe("hidden");
    expect(mediaVisibility(manifest, IN_HIDDEN_ALBUM)).toBe("hidden");
    expect(mediaVisibility(manifest, SWAPPED_HIDDEN)).toBe("public"); // the homepage shows it
    expect(mediaVisibility(manifest, DELETED)).toBe("missing");
  });
});

describe("GET /api/photos/media/[...key]", () => {
  it("serves a public photo with a short browser cache (not a year, not immutable)", async () => {
    const res = await get(PUBLIC);
    expect(res.status).toBe(200);
    const cc = res.headers.get("cache-control")!;
    expect(cc).toMatch(/max-age=3600/);
    expect(cc).not.toContain("immutable");
    expect(cc).not.toContain("31536000");
  });

  it("404s a deleted photo even though the object is still in R2", async () => {
    const res = await get(DELETED);
    expect(res.status).toBe(404);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("404s a hidden photo for the public", async () => {
    expect((await get(HIDDEN)).status).toBe(404);
    expect((await get(IN_HIDDEN_ALBUM)).status).toBe(404);
  });

  it("serves a hidden photo to an admin, never cacheable", async () => {
    admin.is = true;
    const res = await get(HIDDEN);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("still rejects keys outside dump/", async () => {
    expect((await get("portfolio/secret.jpg")).status).toBe(404);
  });
});
