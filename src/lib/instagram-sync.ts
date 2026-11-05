/**
 * instagram-sync.ts — pull the latest @txquince posts into R2.
 *
 * Run hourly by /api/cron/instagram (pinged by cron-worker/). Every
 * dependency is passed in (bucket, fetch, clock, alert), so the whole flow is
 * tested with a mocked API in instagram-sync.test.ts.
 *
 * Guarantees:
 *   · feed.json is only ever replaced by a feed whose images are already
 *     copied into R2, so the homepage never points at a missing image or at
 *     an Instagram CDN link that will expire.
 *   · On any failure (expired token, API down, rate limit) the last good feed
 *     stays as it is, the error is logged (Workers logs) and the operator is
 *     emailed, at most once a day.
 *   · The access token: the INSTAGRAM_ACCESS_TOKEN secret seeds it. A Worker
 *     cannot rewrite its own secrets, so each weekly refresh (which may hand
 *     back a new token) is kept in instagram/state.json in the PRIVATE bucket.
 *     Putting a new secret replaces it (we notice the secret changed).
 *   · The token is never logged or written anywhere else.
 */
import {
  DAY_MS,
  IG_API_VERSION,
  IG_FEED_KEY,
  IG_FEED_MAX,
  IG_FIELDS,
  IG_FIELDS_NO_CAPTION,
  IG_GRAPH,
  IG_ID_RE,
  IG_KEEP_IMAGES,
  IG_STATE_KEY,
  classifyApiError,
  igMediaKey,
  normalizeFeed,
  parseMediaResponse,
  tokenRefreshDue,
  type IgApiPost,
  type IgErrorKind,
  type IgFeed,
  type IgPost,
} from "./instagram-shared";

/* ---------------- injected dependencies ---------------- */

export interface IgBucket {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string | ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
}

export interface SyncDeps {
  bucket: IgBucket;
  /** The INSTAGRAM_ACCESS_TOKEN secret (the seed token). */
  seedToken?: string;
  fetch?: typeof fetch;
  now?: () => number;
  /** Notify the operator (email). Called at most once per ALERT_EVERY_MS. */
  alert?: (subject: string, body: string) => Promise<unknown>;
  log?: Pick<Console, "log" | "warn" | "error">;
}

export interface SyncState {
  token?: string;
  /** When `token` was issued or last refreshed (unknown for a pasted secret). */
  tokenIssuedAt?: string;
  /** Fingerprint of the secret the stored token descends from. */
  seedHash?: string;
  lastSuccessAt?: string;
  lastError?: string;
  lastErrorKind?: IgErrorKind | "images" | "internal";
  lastErrorAt?: string;
  lastAlertAt?: string;
  /** Media ids whose image is copied to R2, newest first. */
  stored: string[];
}

export type SyncResult =
  | { ok: true; status: "updated" | "unchanged"; posts: number; refreshed: boolean }
  | { ok: false; status: "not-configured" }
  | { ok: false; status: "error"; kind: NonNullable<SyncState["lastErrorKind"]>; message: string; refreshed: boolean };

export const ALERT_EVERY_MS = DAY_MS;
/** Warn when the token is this old and still has not been refreshed. */
export const TOKEN_WARN_AGE_MS = 45 * DAY_MS;
const MEDIA_LIMIT = 15; // a few spare in case some posts have no usable still
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const TIMEOUT_MS = 15_000;

/* ---------------- small helpers ---------------- */

async function readJson(bucket: IgBucket, key: string): Promise<unknown> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  try {
    return JSON.parse(await obj.text());
  } catch {
    return null;
  }
}

function normalizeState(json: unknown): SyncState {
  const s = (json && typeof json === "object" ? json : {}) as Record<string, unknown>;
  const opt = (v: unknown) => (typeof v === "string" && v ? v : undefined);
  const kinds = ["token", "fields", "rate", "api", "images", "internal"] as const;
  return {
    token: opt(s.token),
    tokenIssuedAt: opt(s.tokenIssuedAt),
    seedHash: opt(s.seedHash),
    lastSuccessAt: opt(s.lastSuccessAt),
    lastError: opt(s.lastError),
    lastErrorKind: kinds.find((k) => k === s.lastErrorKind),
    lastErrorAt: opt(s.lastErrorAt),
    lastAlertAt: opt(s.lastAlertAt),
    stored: Array.isArray(s.stored) ? s.stored.filter((x): x is string => typeof x === "string" && IG_ID_RE.test(x)) : [],
  };
}

export async function fingerprint(token: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(bytes).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchJson(f: typeof fetch, url: string): Promise<{ status: number; json: unknown }> {
  const res = await f(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "application/json" } });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON error page */
  }
  return { status: res.status, json: res.ok ? json : (json ?? {}) };
}

class IgError extends Error {
  constructor(
    readonly kind: NonNullable<SyncState["lastErrorKind"]>,
    message: string,
  ) {
    super(message);
  }
}

/** GET /me/media; if a field (caption) is refused, ask again without it. */
async function fetchMedia(f: typeof fetch, token: string): Promise<IgApiPost[]> {
  const url = (fields: string) =>
    `${IG_GRAPH}/${IG_API_VERSION}/me/media?fields=${fields}&limit=${MEDIA_LIMIT}&access_token=${encodeURIComponent(token)}`;
  let r = await fetchJson(f, url(IG_FIELDS));
  if (r.status !== 200) {
    const err = classifyApiError(r.status, r.json);
    if (err.kind !== "fields") throw new IgError(err.kind, err.message);
    r = await fetchJson(f, url(IG_FIELDS_NO_CAPTION));
    if (r.status !== 200) {
      const again = classifyApiError(r.status, r.json);
      throw new IgError(again.kind, again.message);
    }
  }
  if (!Array.isArray((r.json as { data?: unknown } | null)?.data)) throw new IgError("api", "Unexpected response from Instagram (no data list)");
  return parseMediaResponse(r.json);
}

/** Refresh the long-lived token (needs it ≥24h old and not yet expired). */
async function refreshToken(f: typeof fetch, token: string): Promise<string> {
  const { status, json } = await fetchJson(
    f,
    `${IG_GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
  );
  const next = (json as { access_token?: unknown } | null)?.access_token;
  if (status !== 200 || typeof next !== "string" || !next) {
    const err = classifyApiError(status, json);
    throw new IgError(err.kind, err.message);
  }
  return next;
}

/** Copy one post's still into R2. */
async function copyImage(f: typeof fetch, bucket: IgBucket, post: IgApiPost): Promise<boolean> {
  try {
    const res = await f(post.imageUrl, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(jpeg|png|webp|heic|heif|avif)/i.test(type)) return false;
    const buf = await res.arrayBuffer();
    if (!buf.byteLength || buf.byteLength > MAX_IMAGE_BYTES) return false;
    await bucket.put(igMediaKey(post.id), buf, { httpMetadata: { contentType: type.split(";")[0] } });
    return true;
  } catch {
    return false;
  }
}

const sameFeed = (a: IgPost[], b: IgPost[]) =>
  a.length === b.length &&
  a.every((p, i) => p.id === b[i].id && p.caption === b[i].caption && p.kind === b[i].kind && p.permalink === b[i].permalink);

/* ---------------- the sync ---------------- */

export async function syncInstagram(deps: SyncDeps): Promise<SyncResult> {
  const f = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now;
  const log = deps.log ?? console;
  const iso = () => new Date(now()).toISOString();
  const { bucket } = deps;

  const state = normalizeState(await readJson(bucket, IG_STATE_KEY).catch(() => null));
  const saveState = () => bucket.put(IG_STATE_KEY, JSON.stringify(state), { httpMetadata: { contentType: "application/json" } });

  // A new secret (the owner pasted a fresh token) replaces whatever we had.
  const seed = deps.seedToken?.trim();
  if (seed) {
    const hash = await fingerprint(seed);
    if (hash !== state.seedHash) {
      state.seedHash = hash;
      state.token = seed;
      state.tokenIssuedAt = undefined;
    }
  }
  const startToken = state.token ?? seed;
  if (!startToken) {
    log.log("[instagram] not configured: INSTAGRAM_ACCESS_TOKEN is not set");
    return { ok: false, status: "not-configured" };
  }
  state.token = startToken;

  let refreshed = false;
  try {
    // 1) Keep the token alive (weekly). A failed refresh is not fatal on its
    //    own: the token may still have weeks left. Only remember the error.
    let refreshError: IgError | null = null;
    if (tokenRefreshDue(state.tokenIssuedAt, now())) {
      try {
        state.token = await refreshToken(f, startToken);
        state.tokenIssuedAt = iso();
        refreshed = true;
      } catch (e) {
        refreshError = e instanceof IgError ? e : new IgError("api", String(e));
        log.warn(`[instagram] token refresh failed (${refreshError.kind}): ${refreshError.message}`);
      }
    }

    // 2) The latest posts.
    const latest = await fetchMedia(f, state.token);

    // 3) Copy any new stills into R2, newest first, up to IG_FEED_MAX posts.
    const posts: IgPost[] = [];
    for (const p of latest) {
      if (posts.length >= IG_FEED_MAX) break;
      const have = state.stored.includes(p.id) || (await copyImage(f, bucket, p));
      if (!have) {
        log.warn(`[instagram] skipped post ${p.id}: image could not be copied`);
        continue;
      }
      if (!state.stored.includes(p.id)) state.stored.unshift(p.id);
      posts.push({ id: p.id, permalink: p.permalink, caption: p.caption, kind: p.kind, timestamp: p.timestamp });
    }
    if (latest.length && !posts.length) throw new IgError("images", "No post images could be copied from Instagram");

    // 4) Publish the feed (only when something changed).
    const previous = normalizeFeed(await readJson(bucket, IG_FEED_KEY).catch(() => null));
    const changed = !previous || !sameFeed(previous.posts, posts);
    if (changed) {
      const feed: IgFeed = { updatedAt: iso(), posts };
      await bucket.put(IG_FEED_KEY, JSON.stringify(feed), { httpMetadata: { contentType: "application/json" } });
    }

    // 5) Forget old stills (keeping a buffer for pages still in cache).
    const keep = [...posts.map((p) => p.id), ...state.stored.filter((id) => !posts.some((p) => p.id === id))];
    const drop = keep.slice(IG_KEEP_IMAGES);
    state.stored = keep.slice(0, IG_KEEP_IMAGES);
    if (drop.length) await bucket.delete(drop.map(igMediaKey)).catch(() => undefined);

    state.lastSuccessAt = iso();
    state.lastError = state.lastErrorKind = state.lastErrorAt = undefined;

    // A token that keeps failing to refresh will die at 60 days: say so early.
    const issued = state.tokenIssuedAt ? Date.parse(state.tokenIssuedAt) : NaN;
    if (refreshError && !Number.isNaN(issued) && now() - issued >= TOKEN_WARN_AGE_MS) {
      const daysLeft = Math.max(0, Math.round((issued + 60 * DAY_MS - now()) / DAY_MS));
      await maybeAlert(
        "Instagram token is about to expire",
        `The Instagram feed on txquince.com still works, but its access token could not be refreshed (${refreshError.message}). ` +
          `It expires in about ${daysLeft} day(s). Generate a new token in the Meta App Dashboard and run:\n\n` +
          `  npx wrangler secret put INSTAGRAM_ACCESS_TOKEN\n\nSee README → Instagram feed.`,
      );
    }

    await saveState();
    log.log(`[instagram] ok: ${posts.length} posts${changed ? " (updated)" : ""}${refreshed ? ", token refreshed" : ""}`);
    return { ok: true, status: changed ? "updated" : "unchanged", posts: posts.length, refreshed };
  } catch (e) {
    const err = e instanceof IgError ? e : new IgError("internal", e instanceof Error ? e.message : String(e));
    state.lastError = err.message;
    state.lastErrorKind = err.kind;
    state.lastErrorAt = iso();
    log.error(`[instagram] sync failed (${err.kind}): ${err.message} — the homepage keeps the last good feed`);
    const fix =
      err.kind === "token"
        ? "The access token is expired or was revoked. Generate a new one in the Meta App Dashboard " +
          "(Instagram → API setup with Instagram business login → Generate token) and run:\n\n  npx wrangler secret put INSTAGRAM_ACCESS_TOKEN\n\n"
        : "This is usually temporary (Instagram down or rate-limited). If it keeps happening, check the Worker logs.\n\n";
    await maybeAlert(
      "Instagram feed is not updating",
      `The Instagram section on txquince.com could not update (${err.kind}): ${err.message}\n\n${fix}` +
        `Visitors still see the last good posts (or no section at all). Nothing is broken on the page.\nSee README → Instagram feed.`,
    );
    await saveState().catch(() => undefined);
    return { ok: false, status: "error", kind: err.kind, message: err.message, refreshed };
  }

  async function maybeAlert(subject: string, body: string) {
    const last = state.lastAlertAt ? Date.parse(state.lastAlertAt) : NaN;
    if (!deps.alert || (!Number.isNaN(last) && now() - last < ALERT_EVERY_MS)) return;
    state.lastAlertAt = iso();
    try {
      await deps.alert(subject, body);
    } catch (e) {
      log.error("[instagram] alert email failed:", e instanceof Error ? e.message : e);
    }
  }
}
