/**
 * photo-dump.ts — SERVER-ONLY storage for the "Photo dump" (latest photos).
 *
 * Everything lives in the PORTFOLIO R2 bucket — no database tables — so a
 * scheduled job with only Cloudflare access (scripts/photo-dump-import.mjs)
 * can add photos too:
 *   dump/<YYYY>/<MM>/<id>.webp   the photos
 *   dump/manifest.json           albums, photo details, homepage swaps
 *
 * Writes are read-modify-write with optimistic concurrency: the manifest is
 * re-read right before each write and the put is conditional on its etag, so
 * two uploads finishing at once both land (the loser simply retries).
 *
 * Local development: without the Cloudflare binding, `next dev` uses
 * public/dump/ on disk instead (so the admin page and homepage work offline).
 * A production `next build` / `next start` without the binding gets `null`
 * and every public section hides itself.
 */
import "server-only";
import { cache } from "react";
import {
  emptyManifest,
  feedFromManifest,
  feedPage,
  KEY_RE,
  MANIFEST_KEY,
  normalizeManifest,
  resolveOverrides,
  type DumpManifest,
  type FeedPage,
  type HomeOverrides,
} from "./photo-dump-shared";

/* ---------------- minimal structural R2 types ---------------- */

export interface DumpObject {
  body: ReadableStream;
  etag: string;
  size: number;
  httpMetadata?: { contentType?: string };
  text(): Promise<string>;
}
export interface DumpBucket {
  get(key: string): Promise<DumpObject | null>;
  put(
    key: string,
    value: ArrayBuffer | ReadableStream | string,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string };
      onlyIf?: { etagMatches?: string };
    },
  ): Promise<{ etag: string } | null>;
  delete(keys: string | string[]): Promise<void>;
}

/** Cloudflare Images binding (used to transcode a JPEG fallback to WebP). */
interface CfImageTransformer {
  transform(options: Record<string, unknown>): CfImageTransformer;
  output(options: Record<string, unknown>): Promise<{ response(): Response }>;
}
interface CfImages {
  input(data: ReadableStream | ArrayBuffer): CfImageTransformer;
  info(data: ReadableStream | ArrayBuffer): Promise<{ format: string; width?: number; height?: number }>;
}

async function cfEnv(): Promise<Record<string, unknown> | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    return mod.getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getImagesBinding(): Promise<CfImages | null> {
  const env = await cfEnv();
  return (env?.IMAGES as CfImages | undefined) ?? null;
}

function localEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.PHOTO_DUMP_LOCAL === "1";
}

/** The PORTFOLIO bucket on Workers, public/ on disk in dev, else null. */
export async function getDumpBucket(): Promise<DumpBucket | null> {
  const env = await cfEnv();
  const bucket = env?.PORTFOLIO as DumpBucket | undefined;
  if (bucket) return bucket;
  return localEnabled() ? localBucket() : null;
}

/* ------------- dev-only bucket backed by public/ on disk ------------- */

function localBucket(): DumpBucket {
  const root = () => `${process.cwd()}/public`;
  const safe = (key: string) => {
    if (key !== MANIFEST_KEY && !KEY_RE.test(key)) throw new Error("bad key");
    return `${root()}/${key}`;
  };
  const fs = () => import("node:fs/promises");
  const tagOf = (st: { mtimeMs: number; size: number }) => `${Math.round(st.mtimeMs)}-${st.size}`;
  return {
    async get(key) {
      const f = await fs();
      try {
        const path = safe(key);
        const [buf, st] = await Promise.all([f.readFile(path), f.stat(path)]);
        return {
          body: new Response(buf).body as ReadableStream,
          etag: tagOf(st),
          size: buf.byteLength,
          httpMetadata: { contentType: key.endsWith(".json") ? "application/json" : key.endsWith(".jpg") ? "image/jpeg" : "image/webp" },
          text: async () => buf.toString("utf8"),
        };
      } catch {
        return null;
      }
    },
    async put(key, value, options) {
      const f = await fs();
      const path = safe(key);
      if (options?.onlyIf?.etagMatches) {
        const st = await f.stat(path).catch(() => null);
        if (!st || tagOf(st) !== options.onlyIf.etagMatches) return null;
      }
      await f.mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
      const data =
        typeof value === "string"
          ? Buffer.from(value)
          : Buffer.from(value instanceof ArrayBuffer ? value : await new Response(value).arrayBuffer());
      await f.writeFile(path, data);
      return { etag: tagOf(await f.stat(path)) };
    },
    async delete(keys) {
      const f = await fs();
      for (const key of Array.isArray(keys) ? keys : [keys]) await f.rm(safe(key), { force: true });
    },
  };
}

/* ---------------------------- manifest ------------------------------- */

export class ManifestError extends Error {}

/**
 * Read the manifest. `null` = storage unavailable. A missing file is an empty
 * manifest; an unreadable one is empty for the public site but throws for
 * writers (`strict`), so a corrupt file is never silently overwritten.
 */
export async function readManifest(
  bucket?: DumpBucket | null,
  strict = false,
): Promise<{ manifest: DumpManifest; etag: string | null } | null> {
  const b = bucket === undefined ? await getDumpBucket() : bucket;
  if (!b) return null;
  const obj = await b.get(MANIFEST_KEY);
  if (!obj) return { manifest: emptyManifest(), etag: null };
  const text = await obj.text();
  try {
    return { manifest: normalizeManifest(JSON.parse(text)), etag: obj.etag };
  } catch {
    if (strict) throw new ManifestError("The photo list file could not be read. Nothing was changed.");
    return { manifest: emptyManifest(), etag: obj.etag };
  }
}

/**
 * Read → change → conditional write, retried on a lost race. `change` may
 * return a value (e.g. the new album id); it must be safe to run again.
 */
export async function mutateManifest<T>(
  change: (m: DumpManifest) => T,
  bucket?: DumpBucket | null,
): Promise<{ manifest: DumpManifest; result: T }> {
  const b = bucket === undefined ? await getDumpBucket() : bucket;
  if (!b) throw new ManifestError("Photo storage is not available here.");
  for (let attempt = 0; attempt < 8; attempt++) {
    const current = await readManifest(b, true);
    if (!current) throw new ManifestError("Photo storage is not available here.");
    const next = structuredClone(current.manifest);
    const result = change(next);
    next.version = 1;
    next.updatedAt = new Date().toISOString();
    const written = await b.put(MANIFEST_KEY, JSON.stringify(next), {
      httpMetadata: { contentType: "application/json", cacheControl: "no-store" },
      ...(current.etag ? { onlyIf: { etagMatches: current.etag } } : {}),
    });
    if (written) return { manifest: next, result };
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 120 * (attempt + 1)));
  }
  throw new ManifestError("Too many changes at once. Please try again.");
}

/* ----------------------------- photos -------------------------------- */

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export function newPhotoKey(ext: "webp" | "jpg", now = new Date()): { id: string; key: string } {
  const id = newId();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return { id, key: `dump/${y}/${m}/${id}.${ext}` };
}

function isWebp(b: Uint8Array) {
  return b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
}
function isJpeg(b: Uint8Array) {
  return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
}
function isPng(b: Uint8Array) {
  return b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
}

/** Width/height straight from a WebP header (VP8, VP8L or VP8X). */
function webpSize(b: Uint8Array): { w?: number; h?: number } {
  if (b.length < 30) return {};
  const chunk = String.fromCharCode(...b.slice(12, 16));
  if (chunk === "VP8X") {
    return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  }
  if (chunk === "VP8 " && b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a) {
    return { w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff };
  }
  if (chunk === "VP8L" && b[20] === 0x2f) {
    return {
      w: 1 + (((b[22] & 0x3f) << 8) | b[21]),
      h: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)),
    };
  }
  return {};
}

/**
 * Store one already-resized photo. WebP is stored as sent. A JPEG/PNG (Safari
 * cannot encode WebP in the browser) is converted to WebP with the Cloudflare
 * Images binding when it is there, otherwise stored as JPEG.
 */
export async function storePhotoObject(
  bucket: DumpBucket,
  bytes: ArrayBuffer,
): Promise<{ id: string; key: string; w?: number; h?: number }> {
  const head = new Uint8Array(bytes.slice(0, 16));
  let out: ArrayBuffer = bytes;
  let ext: "webp" | "jpg";
  let dims: { w?: number; h?: number } = {};
  if (isWebp(head)) {
    ext = "webp";
    dims = webpSize(new Uint8Array(bytes.slice(0, 32)));
  } else if (isJpeg(head) || isPng(head)) {
    ext = "jpg";
    const images = await getImagesBinding();
    if (images) {
      try {
        const info = await images.info(bytes.slice(0));
        if (info.width && info.height) dims = { w: info.width, h: info.height };
        const res = await images.input(bytes.slice(0)).output({ format: "image/webp", quality: 90 });
        out = await res.response().arrayBuffer();
        ext = "webp";
      } catch {
        out = bytes; // keep the JPEG as sent
      }
    }
    if (ext === "jpg" && !isJpeg(head)) throw new ManifestError("This photo could not be converted. Please try again.");
  } else {
    throw new ManifestError("That file is not a photo we can use. Try a JPEG.");
  }
  const { id, key } = newPhotoKey(ext);
  await bucket.put(key, out, {
    httpMetadata: { contentType: ext === "webp" ? "image/webp" : "image/jpeg", cacheControl: "public, max-age=31536000, immutable" },
  });
  return { id, key, ...dims };
}

/* --------------------------- public reads ---------------------------- */

/** Per-request memo of the manifest for public pages. null = unavailable. */
export const getPublicManifest = cache(async (): Promise<DumpManifest | null> => {
  try {
    const read = await readManifest();
    return read ? read.manifest : null;
  } catch {
    return null;
  }
});

/** First page of the homepage feed. null = storage unavailable. */
export async function getFeedPage(cursor = 0, tag?: string | null): Promise<FeedPage | null> {
  const m = await getPublicManifest();
  if (!m) return null;
  return feedPage(feedFromManifest(m), cursor, tag);
}

/** Admin swaps for homepage images (hero plates, archive frames). */
export async function getHomeOverrides(): Promise<HomeOverrides> {
  const m = await getPublicManifest();
  return m ? resolveOverrides(m) : {};
}
