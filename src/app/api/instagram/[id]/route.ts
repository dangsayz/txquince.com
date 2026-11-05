/**
 * /api/instagram/<mediaId>?w=640 — the homepage Instagram tiles.
 *
 * Serves the copy of each post's still that the hourly sync stored in the
 * private PORTFOLIO bucket (key `instagram/media/<id>.jpg`), resized and
 * converted to WebP by the Cloudflare Images binding. Visitors never load
 * anything from Instagram, and these never expire the way Instagram's signed
 * CDN links do. Only numeric media ids are readable; anything else is a 404.
 *
 * An Instagram media id always names the same picture, so the response is
 * cached for a long time (browser + edge).
 */
import { getInstagramBucket } from "@/lib/instagram";
import { IG_ID_RE, igMediaKey } from "@/lib/instagram-shared";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

const WIDTHS = [384, 640, 1080];
const CACHE = "public, max-age=604800, stale-while-revalidate=86400";

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

interface CfImages {
  input(data: ReadableStream): {
    transform(o: Record<string, unknown>): { output(o: Record<string, unknown>): Promise<{ response(): Response }> };
  };
}
type EdgeCache = { match(r: Request): Promise<Response | undefined>; put(r: Request, res: Response): Promise<void> };
type Obj = { body: ReadableStream; httpMetadata?: { contentType?: string } };

const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

async function images(): Promise<CfImages | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    return ((mod.getCloudflareContext().env as { IMAGES?: CfImages }).IMAGES ?? null);
  } catch {
    return null;
  }
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!IG_ID_RE.test(id)) return notFound();
  if (hotlinked(request)) return new Response("Hotlinking is not permitted.", { status: 403 });

  const asked = Number(new URL(request.url).searchParams.get("w"));
  const width = WIDTHS.find((w) => w >= asked) ?? WIDTHS[WIDTHS.length - 1];

  const cache = (globalThis as { caches?: { default?: EdgeCache } }).caches?.default ?? null;
  const cacheKey = new Request(new URL(`/api/instagram/${id}?w=${width}`, request.url).toString());
  const hit = await cache?.match(cacheKey).catch(() => undefined);
  if (hit) return hit;

  const bucket = await getInstagramBucket();
  if (!bucket) return notFound();
  const obj = (await bucket.get(igMediaKey(id))) as Obj | null;
  if (!obj) return notFound();

  let res: Response;
  const cf = await images();
  try {
    if (!cf) throw new Error("no IMAGES binding");
    const out = await cf.input(obj.body).transform({ width, height: width, fit: "cover" }).output({ format: "image/webp", quality: 82 });
    const body = out.response().body;
    res = new Response(body, { headers: { "content-type": "image/webp" } });
  } catch {
    const again = (await bucket.get(igMediaKey(id))) as Obj | null;
    if (!again) return notFound();
    res = new Response(again.body, { headers: { "content-type": again.httpMetadata?.contentType ?? "image/jpeg" } });
  }
  res.headers.set("cache-control", CACHE);
  res.headers.set("x-content-type-options", "nosniff");
  if (cache) await cache.put(cacheKey, res.clone()).catch(() => undefined);
  return res;
}
