/**
 * /api/photos/media/dump/<YYYY>/<MM>/<id>.webp[?w=640] — serves Photo dump
 * images from the private PORTFOLIO bucket. Only `dump/` photo keys are
 * readable; anything else is a 404.
 *
 * Visibility comes from the manifest, checked on EVERY request before any
 * cache: a deleted photo is a 404 and a hidden one is admin-only, even if a
 * copy still sits in the edge cache or the object is still in R2.
 *
 * Caching: the edge copy (Workers Cache API) can live long because it is only
 * reached after the manifest check; browsers get a short max-age so a hide or
 * delete reaches returning visitors within the hour. Hidden photos (admin
 * preview) are `private, no-store` and never cached.
 *
 * `?w=` asks the Cloudflare Images binding for a smaller copy (snapped to fixed
 * steps, "scale-down" so it never upscales); without the binding (local dev)
 * the stored file is sent as-is.
 */
import { getDumpBucket, getImagesBinding, readManifest } from "@/lib/photo-dump";
import { KEY_RE, type DumpManifest } from "@/lib/photo-dump-shared";
import {
  EDGE_CACHE,
  PRIVATE_CACHE,
  PUBLIC_BROWSER_CACHE,
  mediaVisibility,
  type MediaVisibility,
} from "@/lib/photo-media-access";
import { requireAdmin } from "@/lib/require-admin";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

const WIDTHS = [384, 640, 828, 1080, 1440, 1920, 2560];

const ALLOWED_HOSTS = [site.domain, `www.${site.domain}`, "localhost", "127.0.0.1", "txquince.12img.workers.dev"];
const PREVIEW_HOST = /^(?:[a-z0-9-]+-)?txquince\.12img\.workers\.dev$/;

function hotlinked(req: Request): boolean {
  const ref = req.headers.get("referer");
  if (!ref) return false;
  try {
    const host = new URL(ref).hostname;
    return !ALLOWED_HOSTS.includes(host) && !PREVIEW_HOST.test(host);
  } catch {
    return false;
  }
}

type EdgeCache = { match(r: Request): Promise<Response | undefined>; put(r: Request, res: Response): Promise<void> };
function edgeCache(): EdgeCache | null {
  try {
    const c = (globalThis as { caches?: { default?: EdgeCache } }).caches?.default;
    return c ?? null;
  } catch {
    return null;
  }
}

const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

/* The manifest is read per request, memoized briefly per isolate. A key that
   isn't in the memo is re-checked against a fresh read, so a just-uploaded
   photo never 404s; a just-hidden one can be served for up to MEMO_MS. */
const MEMO_MS = 10_000;
let memo: { at: number; manifest: DumpManifest } | null = null;

type Bucket = NonNullable<Awaited<ReturnType<typeof getDumpBucket>>>;

async function manifestOf(bucket: Bucket, fresh: boolean): Promise<DumpManifest | null> {
  if (!fresh && memo && Date.now() - memo.at < MEMO_MS) return memo.manifest;
  const read = await readManifest(bucket).catch(() => null);
  if (!read) return null;
  memo = { at: Date.now(), manifest: read.manifest };
  return read.manifest;
}

async function visibilityOf(bucket: Bucket, key: string): Promise<MediaVisibility> {
  const cached = await manifestOf(bucket, false);
  const first = cached ? mediaVisibility(cached, key) : "missing";
  if (first !== "missing") return first;
  const fresh = await manifestOf(bucket, true);
  return fresh ? mediaVisibility(fresh, key) : "missing";
}

function withCache(res: Response, cacheControl: string): Response {
  const headers = new Headers(res.headers);
  headers.set("cache-control", cacheControl);
  return new Response(res.body, { status: res.status, headers });
}

export async function GET(request: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!KEY_RE.test(key)) return notFound();
  if (hotlinked(request)) return new Response("Hotlinking is not permitted.", { status: 403 });

  const bucket = await getDumpBucket();
  if (!bucket) return notFound();

  const visibility = await visibilityOf(bucket, key);
  if (visibility === "missing") return notFound();
  if (visibility === "hidden" && !(await requireAdmin())) return notFound();
  const isPublic = visibility === "public";
  const browserCache = isPublic ? PUBLIC_BROWSER_CACHE : PRIVATE_CACHE;

  const url = new URL(request.url);
  const asked = Number(url.searchParams.get("w"));
  const width = Number.isFinite(asked) && asked > 0 ? (WIDTHS.find((s) => s >= asked) ?? 2560) : 0;

  // Edge cache keyed on the snapped width, so ?w=600 and ?w=640 share a copy.
  // Only public photos are ever stored there.
  const cacheKey = new Request(`${url.origin}/api/photos/media/${key}${width ? `?w=${width}` : ""}`);
  const cache = isPublic ? edgeCache() : null;
  const hit = await cache?.match(cacheKey).catch(() => undefined);
  if (hit) return withCache(hit, browserCache);

  const obj = await bucket.get(key);
  if (!obj) return notFound();
  const type = obj.httpMetadata?.contentType ?? (key.endsWith(".jpg") ? "image/jpeg" : "image/webp");

  let response: Response | null = null;
  let consumed = false;
  if (width) {
    const images = await getImagesBinding();
    if (images) {
      consumed = true;
      try {
        const out = await images
          .input(obj.body)
          .transform({ width, fit: "scale-down" })
          .output({ format: "image/webp", quality: 86 });
        const res = out.response();
        response = new Response(res.body, {
          headers: { "content-type": "image/webp", "cache-control": browserCache, "x-content-type-options": "nosniff" },
        });
      } catch {
        response = null; // fall through to the stored file
      }
    }
  }
  if (!response) {
    // The body stream may have been consumed by a failed transform; re-read.
    const fresh = consumed ? await bucket.get(key) : obj;
    if (!fresh) return notFound();
    response = new Response(fresh.body, {
      headers: { "content-type": type, "cache-control": browserCache, "x-content-type-options": "nosniff" },
    });
  }
  if (cache) {
    try {
      await cache.put(cacheKey, withCache(response.clone(), EDGE_CACHE));
    } catch {
      /* best-effort */
    }
  }
  return response;
}
