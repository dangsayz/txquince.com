/**
 * /api/photos/media/dump/<YYYY>/<MM>/<id>.webp[?w=640] — serves Photo dump
 * images from the private PORTFOLIO bucket. Only `dump/` photo keys are
 * readable; anything else is a 404.
 *
 * Keys are permanent (a replaced photo gets a new key), so responses are
 * cached for a year, immutable. `?w=` asks the Cloudflare Images binding for
 * a smaller copy (snapped to fixed steps, "scale-down" so it never upscales);
 * without the binding (local dev) the stored file is sent as-is.
 */
import { getDumpBucket, getImagesBinding } from "@/lib/photo-dump";
import { KEY_RE } from "@/lib/photo-dump-shared";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

const CACHE = "public, max-age=31536000, immutable";
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

export async function GET(request: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!KEY_RE.test(key)) return notFound();
  if (hotlinked(request)) return new Response("Hotlinking is not permitted.", { status: 403 });

  const url = new URL(request.url);
  const asked = Number(url.searchParams.get("w"));
  const width = Number.isFinite(asked) && asked > 0 ? (WIDTHS.find((s) => s >= asked) ?? 2560) : 0;

  // Edge cache keyed on the snapped width, so ?w=600 and ?w=640 share a copy.
  const cacheKey = new Request(`${url.origin}/api/photos/media/${key}${width ? `?w=${width}` : ""}`);
  const cache = edgeCache();
  const hit = await cache?.match(cacheKey).catch(() => undefined);
  if (hit) return hit;

  const bucket = await getDumpBucket();
  if (!bucket) return notFound();
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
          headers: { "content-type": "image/webp", "cache-control": CACHE, "x-content-type-options": "nosniff" },
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
      headers: { "content-type": type, "cache-control": CACHE, "x-content-type-options": "nosniff" },
    });
  }
  if (cache) {
    try {
      await cache.put(cacheKey, response.clone());
    } catch {
      /* best-effort */
    }
  }
  return response;
}
