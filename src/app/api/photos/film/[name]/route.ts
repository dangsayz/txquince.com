/**
 * /api/photos/film/<name>.mp4|.webm — homepage background clips from the
 * private PORTFOLIO bucket (key `home-film/<name>`), with byte-range support.
 *
 * Safari (every iPhone) asks for `Range: bytes=0-1` first and refuses to play
 * a video whose server answers 200 with the whole file, so ranges are answered
 * with 206 Partial Content. Only `home-film/` clips with a plain lowercase
 * name are readable; anything else is a 404.
 *
 * Upload a clip with:
 *   npx wrangler r2 object put <bucket>/home-film/hero-1080.mp4 --file hero-1080.mp4 \
 *     --content-type video/mp4 --remote
 * then list its URL in src/components/editorial/media.ts. Names are
 * versioned by hand (hero-1080-v2.mp4), so the long browser cache is safe.
 */
import { contentRange, parseByteRange } from "@/lib/byte-range";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,80}\.(mp4|webm)$/;
const CACHE = "public, max-age=31536000, immutable";

type Obj = {
  body: ReadableStream;
  size: number;
  etag?: string;
  httpEtag?: string;
  httpMetadata?: { contentType?: string };
};
type FilmBucket = {
  head(key: string): Promise<Omit<Obj, "body"> | null>;
  get(key: string, options?: { range?: { offset: number; length: number } }): Promise<Obj | null>;
};

async function bucket(): Promise<FilmBucket | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    return ((getCloudflareContext().env as { PORTFOLIO?: FilmBucket }).PORTFOLIO ?? null);
  } catch {
    return null;
  }
}

const ALLOWED_HOSTS = [site.domain, `www.${site.domain}`, "localhost", "127.0.0.1"];
const PREVIEW_HOST = /^(?:[a-z0-9-]+-)?txquince\.12img\.workers\.dev$/;

/** Another site embedding our clips: refuse (they would spend our bandwidth). */
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

const notFound = () => new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });

async function serve(request: Request, name: string, headOnly: boolean): Promise<Response> {
  if (!NAME_RE.test(name)) return notFound();
  if (hotlinked(request)) return new Response("Hotlinking is not permitted.", { status: 403 });
  const b = await bucket();
  if (!b) return notFound();
  const key = `home-film/${name}`;

  const meta = await b.head(key);
  if (!meta) return notFound();
  const size = meta.size;
  const type = meta.httpMetadata?.contentType ?? (name.endsWith(".webm") ? "video/webm" : "video/mp4");
  const base: Record<string, string> = {
    "content-type": type,
    "accept-ranges": "bytes",
    "cache-control": CACHE,
    "x-content-type-options": "nosniff",
  };
  if (meta.httpEtag) base.etag = meta.httpEtag;

  const range = parseByteRange(request.headers.get("range"), size);
  if (range === "unsatisfiable") {
    return new Response(null, { status: 416, headers: { ...base, "content-range": `bytes */${size}` } });
  }
  if (headOnly) {
    return new Response(null, { status: 200, headers: { ...base, "content-length": String(size) } });
  }
  if (!range) {
    const obj = await b.get(key);
    if (!obj) return notFound();
    return new Response(obj.body, { status: 200, headers: { ...base, "content-length": String(size) } });
  }
  const obj = await b.get(key, { range });
  if (!obj) return notFound();
  return new Response(obj.body, {
    status: 206,
    headers: { ...base, "content-length": String(range.length), "content-range": contentRange(range, size) },
  });
}

export async function GET(request: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return serve(request, decodeURIComponent(name), false);
}

export async function HEAD(request: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  return serve(request, decodeURIComponent(name), true);
}
