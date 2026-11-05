import { describe, expect, it, vi } from "vitest";
import { ALERT_EVERY_MS, syncInstagram, type IgBucket } from "./instagram-sync";
import {
  DAY_MS,
  IG_FEED_KEY,
  IG_STATE_KEY,
  altFor,
  classifyApiError,
  cleanCaption,
  displayCount,
  excerptFor,
  igMediaKey,
  normalizeFeed,
  parseMediaResponse,
  tokenRefreshDue,
} from "./instagram-shared";

/* ---------------- fakes ---------------- */

function memoryBucket(seed: Record<string, string> = {}) {
  const store = new Map<string, string | ArrayBuffer>(Object.entries(seed));
  const bucket: IgBucket = {
    async get(key) {
      const v = store.get(key);
      if (v === undefined) return null;
      return { text: async () => (typeof v === "string" ? v : new TextDecoder().decode(v)) };
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(keys) {
      for (const k of Array.isArray(keys) ? keys : [keys]) store.delete(k);
    },
  };
  const json = (key: string) => {
    const v = store.get(key);
    return typeof v === "string" ? JSON.parse(v) : null;
  };
  return { bucket, store, json };
}

const media = (n: number, extra: Record<string, unknown>[] = []) => ({
  data: [
    ...extra,
    ...Array.from({ length: n }, (_, i) => ({
      id: String(1000 + i),
      caption: `Post ${i} #quince`,
      media_type: i === 1 ? "VIDEO" : "IMAGE",
      media_url: i === 1 ? `https://cdn.example/v${i}.mp4` : `https://cdn.example/p${i}.jpg`,
      thumbnail_url: i === 1 ? `https://cdn.example/t${i}.jpg` : undefined,
      permalink: `https://www.instagram.com/p/abc${i}/`,
      timestamp: `2026-11-0${(i % 9) + 1}T12:00:00+0000`,
    })),
  ],
});

type Route = (url: URL) => Response | Promise<Response>;
function fakeFetch(routes: { media?: Route; refresh?: Route; image?: Route }) {
  const calls: string[] = [];
  const f = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    calls.push(url.pathname);
    if (url.hostname === "graph.instagram.com" && url.pathname.endsWith("/me/media")) return routes.media!(url);
    if (url.hostname === "graph.instagram.com" && url.pathname === "/refresh_access_token") return routes.refresh!(url);
    return (routes.image ?? (() => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } })))(url);
  });
  return { fetch: f as unknown as typeof fetch, calls };
}

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
const fail = (status: number, error: Record<string, unknown>) => new Response(JSON.stringify({ error }), { status });
const expired = () =>
  fail(400, { message: "Error validating access token: Session has expired on Friday.", type: "OAuthException", code: 190, error_subtype: 463 });

const NOW = Date.parse("2026-11-05T12:00:00Z");
const quiet = { log: () => {}, warn: () => {}, error: () => {} };

/* ---------------- parsing ---------------- */

describe("parseMediaResponse", () => {
  it("keeps images, videos (by thumbnail) and carousels; skips unusable entries", () => {
    const posts = parseMediaResponse(
      media(3, [
        { id: "1", media_type: "STORY", media_url: "https://x/a.jpg", permalink: "https://www.instagram.com/p/s/" },
        { id: "2", media_type: "VIDEO", media_url: "https://x/v.mp4", permalink: "https://www.instagram.com/reel/r/" }, // no still
        { id: "3", media_type: "IMAGE", media_url: "https://x/a.jpg", permalink: "https://evil.example/p/" },
        { id: "nope", media_type: "IMAGE", media_url: "https://x/a.jpg", permalink: "https://www.instagram.com/p/n/" },
        { id: "4", media_type: "CAROUSEL_ALBUM", media_url: "https://x/c.jpg", permalink: "https://www.instagram.com/p/c/" },
      ]),
    );
    expect(posts.map((p) => [p.id, p.kind])).toEqual([
      ["4", "carousel"],
      ["1000", "image"],
      ["1001", "video"],
      ["1002", "image"],
    ]);
    expect(posts.find((p) => p.id === "1001")?.imageUrl).toBe("https://cdn.example/t1.jpg");
    expect(posts[1].timestamp).toBe("2026-11-01T12:00:00.000Z");
  });

  it("returns [] for junk", () => {
    expect(parseMediaResponse(null)).toEqual([]);
    expect(parseMediaResponse({ data: "x" })).toEqual([]);
  });
});

describe("classifyApiError", () => {
  it("recognizes an expired token", () => {
    expect(classifyApiError(400, { error: { code: 190, message: "Error validating access token" } }).kind).toBe("token");
  });
  it("recognizes a refused field and rate limits", () => {
    expect(classifyApiError(400, { error: { code: 100, message: "Tried accessing nonexisting field (caption)" } }).kind).toBe("fields");
    expect(classifyApiError(400, { error: { code: 4, message: "Application request limit reached" } }).kind).toBe("rate");
    expect(classifyApiError(500, {}).kind).toBe("api");
  });
});

describe("display helpers", () => {
  it("shows 9, 6 or nothing", () => {
    expect([0, 5, 6, 8, 9, 12].map(displayCount)).toEqual([0, 0, 6, 6, 9, 9]);
  });
  it("cleans captions for alt text and excerpts", () => {
    expect(cleanCaption("Golden hour ✨ in Dallas #quince #dfw https://t.co/x")).toBe("Golden hour in Dallas");
    expect(altFor({ caption: "", timestamp: "2026-11-02T00:00:00Z", kind: "image" }, "en")).toBe(
      "Photo from a quinceañera, posted by @txquince on Instagram on November 2, 2026",
    );
    expect(altFor({ caption: "#only #tags", timestamp: "2026-11-02T00:00:00Z", kind: "video" }, "es")).toBe(
      "Video de una quinceañera publicada por @txquince en Instagram el 2 de noviembre de 2026",
    );
    expect(excerptFor("a ".repeat(100)).length).toBeLessThanOrEqual(90);
  });
  it("validates the stored feed", () => {
    expect(normalizeFeed({ posts: [{ id: "1", kind: "image", permalink: "javascript:alert(1)" }] })?.posts).toEqual([]);
    expect(normalizeFeed("nope")).toBeNull();
  });
  it("refreshes weekly, never under 24h", () => {
    expect(tokenRefreshDue(undefined, NOW)).toBe(true);
    expect(tokenRefreshDue(new Date(NOW - 2 * DAY_MS).toISOString(), NOW)).toBe(false);
    expect(tokenRefreshDue(new Date(NOW - 8 * DAY_MS).toISOString(), NOW)).toBe(true);
  });
});

/* ---------------- the sync ---------------- */

describe("syncInstagram", () => {
  it("does nothing without a token", async () => {
    const { bucket, store } = memoryBucket();
    const { fetch } = fakeFetch({});
    const r = await syncInstagram({ bucket, fetch, now: () => NOW, log: quiet });
    expect(r).toEqual({ ok: false, status: "not-configured" });
    expect(store.size).toBe(0);
  });

  it("copies images into R2 and writes the feed (first run, with refresh)", async () => {
    const { bucket, store, json } = memoryBucket();
    const { fetch } = fakeFetch({
      refresh: (u) => {
        expect(u.searchParams.get("grant_type")).toBe("ig_refresh_token");
        return ok({ access_token: "NEW", token_type: "bearer", expires_in: 5183944 });
      },
      media: (u) => {
        expect(u.searchParams.get("access_token")).toBe("NEW");
        return ok(media(12));
      },
    });
    const r = await syncInstagram({ bucket, fetch, seedToken: "SEED", now: () => NOW, log: quiet });
    expect(r).toMatchObject({ ok: true, status: "updated", posts: 9, refreshed: true });
    const feed = json(IG_FEED_KEY);
    expect(feed.posts).toHaveLength(9);
    expect(feed.posts[1]).toMatchObject({ id: "1001", kind: "video" });
    expect(store.has(igMediaKey("1000"))).toBe(true);
    expect(store.has(igMediaKey("1009"))).toBe(false); // only what we show
    const state = json(IG_STATE_KEY);
    expect(state.token).toBe("NEW");
    expect(state.tokenIssuedAt).toBe(new Date(NOW).toISOString());
  });

  it("reuses stored images and reports unchanged on the next run", async () => {
    const { bucket } = memoryBucket();
    const first = fakeFetch({ refresh: () => ok({ access_token: "T" }), media: () => ok(media(9)) });
    await syncInstagram({ bucket, fetch: first.fetch, seedToken: "SEED", now: () => NOW, log: quiet });
    const second = fakeFetch({ media: () => ok(media(9)) });
    const r = await syncInstagram({ bucket, fetch: second.fetch, seedToken: "SEED", now: () => NOW + 3600_000, log: quiet });
    expect(r).toMatchObject({ ok: true, status: "unchanged", refreshed: false });
    expect(second.calls).toEqual([`/v27.0/me/media`]); // no image downloads, no refresh
  });

  it("retries without caption when the field is refused", async () => {
    const { bucket, json } = memoryBucket();
    const { fetch } = fakeFetch({
      refresh: () => ok({ access_token: "T" }),
      media: (u) =>
        u.searchParams.get("fields")!.includes("caption")
          ? fail(400, { code: 100, message: "Tried accessing nonexisting field (caption) on node type (IGMedia)" })
          : ok(media(6)),
    });
    const r = await syncInstagram({ bucket, fetch, seedToken: "SEED", now: () => NOW, log: quiet });
    expect(r).toMatchObject({ ok: true, posts: 6 });
    expect(json(IG_FEED_KEY).posts).toHaveLength(6);
  });

  it("keeps the last good feed and alerts once a day when the token has expired", async () => {
    const { bucket, json } = memoryBucket();
    const good = fakeFetch({ refresh: () => ok({ access_token: "T" }), media: () => ok(media(9)) });
    await syncInstagram({ bucket, fetch: good.fetch, seedToken: "SEED", now: () => NOW, log: quiet });
    const before = json(IG_FEED_KEY);

    const alert = vi.fn(async () => {});
    const bad = fakeFetch({ refresh: expired, media: expired });
    const later = NOW + 9 * DAY_MS; // refresh is due, and fails
    const r = await syncInstagram({ bucket, fetch: bad.fetch, seedToken: "SEED", now: () => later, alert, log: quiet });
    expect(r).toMatchObject({ ok: false, status: "error", kind: "token" });
    expect(json(IG_FEED_KEY)).toEqual(before); // untouched
    expect(json(IG_STATE_KEY)).toMatchObject({ lastErrorKind: "token" });
    expect(alert).toHaveBeenCalledTimes(1);
    expect((alert.mock.calls[0] as unknown as string[])[1]).toContain("wrangler secret put INSTAGRAM_ACCESS_TOKEN");

    // An hour later: still failing, no second email.
    await syncInstagram({ bucket, fetch: bad.fetch, seedToken: "SEED", now: () => later + 3600_000, alert, log: quiet });
    expect(alert).toHaveBeenCalledTimes(1);
    // A day later: one more.
    await syncInstagram({ bucket, fetch: bad.fetch, seedToken: "SEED", now: () => later + ALERT_EVERY_MS + 1, alert, log: quiet });
    expect(alert).toHaveBeenCalledTimes(2);
  });

  it("a new secret replaces the stored token (recovery after expiry)", async () => {
    const { bucket, json } = memoryBucket({
      [IG_STATE_KEY]: JSON.stringify({ token: "DEAD", seedHash: "0000000000000000", tokenIssuedAt: new Date(NOW).toISOString(), stored: [] }),
    });
    const { fetch } = fakeFetch({
      refresh: (u) => (u.searchParams.get("access_token") === "FRESH" ? ok({ access_token: "FRESH2" }) : expired()),
      media: (u) => (u.searchParams.get("access_token") === "FRESH2" ? ok(media(6)) : expired()),
    });
    const r = await syncInstagram({ bucket, fetch, seedToken: "FRESH", now: () => NOW, log: quiet });
    expect(r).toMatchObject({ ok: true, posts: 6 });
    expect(json(IG_STATE_KEY).token).toBe("FRESH2");
  });

  it("an API outage keeps the feed; a failed refresh alone does not break the sync", async () => {
    const { bucket, json } = memoryBucket();
    const good = fakeFetch({ refresh: () => ok({ access_token: "T" }), media: () => ok(media(9)) });
    await syncInstagram({ bucket, fetch: good.fetch, seedToken: "S", now: () => NOW, log: quiet });

    const down = fakeFetch({ media: () => new Response("<html>bad gateway</html>", { status: 502 }) });
    const r = await syncInstagram({ bucket, fetch: down.fetch, seedToken: "S", now: () => NOW + 3600_000, log: quiet });
    expect(r).toMatchObject({ ok: false, kind: "api" });
    expect(json(IG_FEED_KEY).posts).toHaveLength(9);

    const flaky = fakeFetch({ refresh: () => fail(500, { message: "oops", code: 2 }), media: () => ok(media(9)) });
    const r2 = await syncInstagram({ bucket, fetch: flaky.fetch, seedToken: "S", now: () => NOW + 8 * DAY_MS, log: quiet });
    expect(r2).toMatchObject({ ok: true, refreshed: false });
  });

  it("skips posts whose image cannot be copied, and never publishes an empty feed", async () => {
    const { bucket, json } = memoryBucket();
    const { fetch } = fakeFetch({
      refresh: () => ok({ access_token: "T" }),
      media: () => ok(media(10)),
      image: (u) => (u.pathname === "/p0.jpg" ? new Response("nope", { status: 403 }) : new Response(new Uint8Array([1]), { headers: { "content-type": "image/jpeg" } })),
    });
    await syncInstagram({ bucket, fetch, seedToken: "S", now: () => NOW, log: quiet });
    const ids = json(IG_FEED_KEY).posts.map((p: { id: string }) => p.id);
    expect(ids).not.toContain("1000");
    expect(ids).toHaveLength(9);

    const { bucket: b2, store: s2 } = memoryBucket();
    const broken = fakeFetch({ refresh: () => ok({ access_token: "T" }), media: () => ok(media(6)), image: () => new Response("x", { status: 500 }) });
    const r = await syncInstagram({ bucket: b2, fetch: broken.fetch, seedToken: "S", now: () => NOW, log: quiet });
    expect(r).toMatchObject({ ok: false, kind: "images" });
    expect(s2.has(IG_FEED_KEY)).toBe(false);
  });

  it("prunes old images beyond the keep buffer", async () => {
    const stored = Array.from({ length: 30 }, (_, i) => String(5000 + i));
    const seed: Record<string, string> = { [IG_STATE_KEY]: JSON.stringify({ stored, tokenIssuedAt: new Date(NOW).toISOString() }) };
    for (const id of stored) seed[igMediaKey(id)] = "x";
    const { bucket, store, json } = memoryBucket(seed);
    const { fetch } = fakeFetch({ refresh: () => ok({ access_token: "T" }), media: () => ok(media(9)) });
    await syncInstagram({ bucket, fetch, seedToken: "S", now: () => NOW, log: quiet });
    expect(json(IG_STATE_KEY).stored).toHaveLength(24);
    expect(store.has(igMediaKey("5029"))).toBe(false);
    expect(store.has(igMediaKey("5000"))).toBe(true);
  });
});
