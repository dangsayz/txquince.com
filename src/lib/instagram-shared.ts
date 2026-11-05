/**
 * instagram-shared.ts — pure helpers for the homepage "Instagram updates"
 * section (no I/O, safe on the server, the client and in tests).
 *
 * Data flow (see README → "Instagram feed"):
 *   cron-worker (hourly) → /api/cron/instagram → instagram-sync.ts
 *     · calls the Instagram API (Instagram Login, graph.instagram.com)
 *     · copies each post's image into the private PORTFOLIO R2 bucket
 *     · writes instagram/feed.json (the last good feed, never a broken one)
 *   homepage (ISR, hourly + on-demand after a sync) → getInstagramFeed()
 *     · reads instagram/feed.json, images served by /api/instagram/<id>
 * Visitors never call Instagram, and the images never expire on us.
 */

/** Instagram Graph API base + version (Instagram API with Instagram Login). */
export const IG_GRAPH = "https://graph.instagram.com";
export const IG_API_VERSION = "v27.0";

/** Fields we read. `caption` is marked Facebook-Login-only in Meta's media
 * reference; we ask for it and quietly retry without it if it is refused. */
export const IG_FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
export const IG_FIELDS_NO_CAPTION = "id,media_type,media_url,thumbnail_url,permalink,timestamp";

/** R2 keys (PORTFOLIO bucket, which is private). */
export const IG_FEED_KEY = "instagram/feed.json";
export const IG_STATE_KEY = "instagram/state.json";
export const igMediaKey = (id: string) => `instagram/media/${id}.jpg`;
/** Instagram media ids are numeric strings. */
export const IG_ID_RE = /^\d{1,40}$/;

/** How many posts the feed keeps (the grid shows 6 or 9 of them). */
export const IG_FEED_MAX = 9;
/** How many copied images stay in R2: older pages still cached for an hour
 * may point at a post that just left the feed, so we keep a buffer. */
export const IG_KEEP_IMAGES = 24;

export type IgKind = "image" | "video" | "carousel";

/** One post as stored in feed.json. */
export interface IgPost {
  id: string;
  permalink: string;
  caption: string;
  kind: IgKind;
  /** ISO timestamp from Instagram. */
  timestamp: string;
}

export interface IgFeed {
  updatedAt: string;
  posts: IgPost[];
}

/** A post ready to render: the stored post plus where its image is served. */
export interface InstagramTile extends IgPost {
  src: string;
  srcSet?: string;
}

/** A post from the API with the URL we would copy the image from. */
export interface IgApiPost extends IgPost {
  imageUrl: string;
}

/* ------------------------------------------------------------------ */
/* API response parsing                                                */
/* ------------------------------------------------------------------ */

const str = (v: unknown, max = 4000): string => (typeof v === "string" ? v.slice(0, max) : "");

function kindOf(mediaType: string): IgKind | null {
  if (mediaType === "IMAGE") return "image";
  if (mediaType === "VIDEO") return "video";
  if (mediaType === "CAROUSEL_ALBUM") return "carousel";
  return null;
}

/** Only links back to Instagram itself, over https. */
export function safePermalink(v: unknown): string | null {
  const s = str(v, 500);
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    if (u.hostname !== "www.instagram.com" && u.hostname !== "instagram.com") return null;
    return u.toString();
  } catch {
    return null;
  }
}

function safeHttps(v: unknown): string | null {
  const s = str(v, 2000);
  try {
    return new URL(s).protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

/**
 * Turn a `/me/media` response into posts we can show. A video's media_url is
 * the video file, so its still is thumbnail_url; Meta says media_url may be
 * missing (licensed audio), so anything without a usable still is skipped.
 * Stories and unknown types are skipped too. Newest first, as the API returns.
 */
export function parseMediaResponse(json: unknown): IgApiPost[] {
  const data = (json as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) return [];
  const out: IgApiPost[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as Record<string, unknown>;
    const id = str(m.id, 64);
    const kind = kindOf(str(m.media_type, 32));
    const permalink = safePermalink(m.permalink);
    if (!IG_ID_RE.test(id) || !kind || !permalink) continue;
    const imageUrl = kind === "video" ? safeHttps(m.thumbnail_url) : (safeHttps(m.media_url) ?? safeHttps(m.thumbnail_url));
    if (!imageUrl) continue;
    const ts = str(m.timestamp, 40);
    out.push({
      id,
      permalink,
      caption: str(m.caption, 2200),
      kind,
      timestamp: Number.isNaN(Date.parse(ts)) ? "" : new Date(ts).toISOString(),
      imageUrl,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* API errors                                                          */
/* ------------------------------------------------------------------ */

export type IgErrorKind = "token" | "fields" | "rate" | "api";

/**
 * Classify a Graph API error body. 190 is the Graph API's invalid/expired
 * token code (also seen as OAuthException without a code on some errors);
 * 100 with a field complaint means a field we asked for is not available.
 */
export function classifyApiError(status: number, json: unknown): { kind: IgErrorKind; message: string } {
  const e = (json as { error?: Record<string, unknown> } | null)?.error ?? {};
  const code = typeof e.code === "number" ? e.code : Number(e.code);
  const message = str(e.message, 300) || `HTTP ${status}`;
  if (code === 190 || code === 102 || /access token|session has expired|validating access token/i.test(message)) {
    return { kind: "token", message };
  }
  if (code === 4 || code === 17 || code === 32 || code === 613 || status === 429) return { kind: "rate", message };
  if (code === 100 && /field/i.test(message)) return { kind: "fields", message };
  return { kind: "api", message };
}

/* ------------------------------------------------------------------ */
/* Token freshness                                                     */
/* ------------------------------------------------------------------ */

export const DAY_MS = 86_400_000;
/** Refresh weekly: the token always has ~53+ days left, and a few failed
 * weeks in a row still leave plenty of time to notice the alert. */
export const IG_REFRESH_EVERY_MS = 7 * DAY_MS;
/** Meta only refreshes a long-lived token that is at least 24 hours old. */
export const IG_MIN_TOKEN_AGE_MS = DAY_MS;

export function tokenRefreshDue(issuedAt: string | undefined, now: number): boolean {
  const t = issuedAt ? Date.parse(issuedAt) : NaN;
  // Unknown age (a freshly pasted secret): try; Meta rejects it harmlessly if
  // it is under 24 hours old, and we retry next run.
  if (Number.isNaN(t)) return true;
  const age = now - t;
  return age >= IG_REFRESH_EVERY_MS && age >= IG_MIN_TOKEN_AGE_MS;
}

/* ------------------------------------------------------------------ */
/* Stored feed (R2 JSON) validation                                    */
/* ------------------------------------------------------------------ */

/** Validate feed.json; anything malformed is dropped, never trusted. */
export function normalizeFeed(json: unknown): IgFeed | null {
  if (!json || typeof json !== "object") return null;
  const f = json as Record<string, unknown>;
  if (!Array.isArray(f.posts)) return null;
  const posts: IgPost[] = [];
  for (const raw of f.posts) {
    if (!raw || typeof raw !== "object") continue;
    const p = raw as Record<string, unknown>;
    const id = str(p.id, 64);
    const kind = p.kind === "image" || p.kind === "video" || p.kind === "carousel" ? p.kind : null;
    const permalink = safePermalink(p.permalink);
    if (!IG_ID_RE.test(id) || !kind || !permalink) continue;
    posts.push({ id, kind, permalink, caption: str(p.caption, 2200), timestamp: str(p.timestamp, 40) });
  }
  return { updatedAt: str(f.updatedAt, 40), posts: posts.slice(0, IG_FEED_MAX) };
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * How many tiles to show: 9 (three full rows of three) or 6 (two rows; on a
 * phone, three rows of two). Fewer than 6 hides the section, so the grid is
 * never ragged or half empty.
 */
export function displayCount(n: number): 0 | 6 | 9 {
  if (n >= 9) return 9;
  if (n >= 6) return 6;
  return 0;
}

/** Caption → plain text: no hashtags, links or emoji, whitespace collapsed. */
export function cleanCaption(caption: string): string {
  return caption
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, " ")
    .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();
}

/** Trim to `max` characters on a word boundary, with an ellipsis. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,;:!?-]+$/, "")}…`;
}

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
} as const;

/** "2026-11-02T…" → "November 2, 2026" / "2 de noviembre de 2026" (UTC, so server and client agree). */
export function postDate(iso: string, lang: "en" | "es"): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const m = MONTHS[lang][d.getUTCMonth()];
  return lang === "es" ? `${d.getUTCDate()} de ${m} de ${d.getUTCFullYear()}` : `${m} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Alt text: the caption (cleaned), else a plain description with the date. */
export function altFor(post: Pick<IgPost, "caption" | "timestamp" | "kind">, lang: "en" | "es"): string {
  const text = clip(cleanCaption(post.caption), 160);
  if (text) return text;
  const date = postDate(post.timestamp, lang);
  const what = lang === "es" ? (post.kind === "video" ? "Video" : "Foto") : post.kind === "video" ? "Video" : "Photo";
  return lang === "es"
    ? `${what} de una quinceañera publicada por @txquince en Instagram${date ? ` el ${date}` : ""}`
    : `${what} from a quinceañera, posted by @txquince on Instagram${date ? ` on ${date}` : ""}`;
}

/** Short caption shown over the tile on hover/focus ("" = none). */
export function excerptFor(caption: string): string {
  return clip(cleanCaption(caption), 90);
}
