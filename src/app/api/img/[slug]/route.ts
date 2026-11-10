/**
 * /api/img/[slug] — the ONLY way image bytes reach a visitor.
 *
 * Resolves a permanent slug → storage object, then serves a protected
 * derivative via the Cloudflare Images binding:
 *   · responsive widths via ?w= (snapped to fixed steps, capped at 2400px wide)
 *   · the largest sizes (over 1440px) only to pages of this site that show
 *     photos large; an image address opened on its own, or a blog post, is
 *     sent to the 1440px copy instead (maxWidthForReferer)
 *   · WebP, quality-tuned; EXIF stripped by the transform pipeline
 *   · signed: a small wordmark in the corner of every content photo 640px
 *     and wider (lib/watermark.ts); page banners (hero, cover-*) stay clean
 *   · hotlink-checked (empty referer allowed — iMessage/OG fetchers send none;
 *     Pinterest allowed so its "Save" picker can preview the pin image)
 *   · immutable edge cache (slugs are permanent)
 *
 * `hero` is a reserved slug serving the admin-set homepage hero.
 * Without the IMAGES binding (local `next dev`), proxies the original so
 * development still renders — protection applies on Cloudflare.
 */
import { NextResponse } from "next/server";
import { getImageBySlug, getSlugForOldSlug, getHeroRawImageUrl, getCoverRawImageUrl, storageUrl } from "@/lib/content-db";
import { getPortfolioBucket, storageKeyFromUrl } from "@/lib/r2-portfolio";
import { FULL_MAX_WIDTH, OPEN_MAX_WIDTH, imageTransformForWidth, maxWidthForReferer } from "@/lib/image-derivative";
import { site } from "@/content/site";
import { isPinterestHost } from "@/lib/pinterest";
import { albumObjectKey, albumPhotoSize } from "@/content/albums";
import { MARK_OPACITY, markPlan, markStream, scaledSize, slugTakesMark } from "@/lib/watermark";

export const dynamic = "force-dynamic";

/**
 * Derivative widths the route will produce (mirrors next.config deviceSizes +
 * imageSizes). ?w= snaps UP to the nearest step so the edge cache stays small
 * and srcset entries are pixel-true. No param → 1440 (OG fetchers, old links).
 */
const WIDTHS = [256, 384, 512, 640, 828, 1080, 1440, 1920, 2400];
const MAX_WIDTH = FULL_MAX_WIDTH;
const QUALITY = 86;

/** Minimal structural types for the Images binding (no generated env types). */
interface CfImageTransformer {
  transform(options: Record<string, unknown>): CfImageTransformer;
  draw(image: CfImageTransformer, options?: Record<string, unknown>): CfImageTransformer;
  output(options: Record<string, unknown>): Promise<{ response(): Response }>;
}
interface CfImages {
  input(data: ReadableStream | ArrayBuffer): CfImageTransformer;
}

const ALLOWED_HOSTS = [site.domain, `www.${site.domain}`, "localhost", "txquince.12img.workers.dev"];
const PREVIEW_HOST = /^(?:[a-z0-9-]+-)?txquince\.12img\.workers\.dev$/;

const isSiteHost = (host: string) => ALLOWED_HOSTS.includes(host) || PREVIEW_HOST.test(host);

function hotlinked(req: Request): boolean {
  const ref = req.headers.get("referer");
  if (!ref) return false; // direct opens, iMessage/OG/Google fetchers
  try {
    const host = new URL(ref).hostname;
    return !isSiteHost(host) && !isPinterestHost(host);
  } catch {
    return false;
  }
}

const CACHE = "public, max-age=31536000, immutable";
// `hero` is the one mutable slug (admin can swap it) — short cache, no immutable.
const HERO_CACHE = "public, max-age=3600";

function pickWidth(request: Request): number {
  let w = NaN;
  try {
    w = Number(new URL(request.url).searchParams.get("w"));
  } catch {
    /* default */
  }
  if (!Number.isFinite(w) || w <= 0) return OPEN_MAX_WIDTH;
  return WIDTHS.find((step) => step >= w) ?? MAX_WIDTH;
}

/** Header-safe note: strip newlines/control chars (illegal in header values). */
function hdr(s: string): string {
  return s.replace(/[^\x20-\x7E]+/g, " ").trim().slice(0, 48);
}

/**
 * Fetch a storage object from the PRIVATE PORTFOLIO R2 bucket (this route is
 * the only reader). Internal storage URLs are translated to object keys; plain
 * `next dev` (no binding) falls back to fetching the URL directly.
 */
async function fetchOriginal(url: string): Promise<Response> {
  const key = storageKeyFromUrl(url);
  if (key) {
    const bucket = await getPortfolioBucket();
    if (bucket) {
      const obj = await bucket.get(key);
      if (!obj) return new Response(null, { status: 404 });
      return new Response(obj.body, {
        headers: { "content-type": obj.httpMetadata?.contentType ?? "image/webp" },
      });
    }
  }
  return fetch(url, { cf: { cacheTtl: 86400 } } as RequestInit);
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    return await serve(request, ctx);
  } catch (err) {
    console.error("[img] handler crashed:", err);
    const detail =
      process.env.NODE_ENV !== "production" && err instanceof Error
        ? `${err.message}\n${err.stack ?? ""}`
        : "Image unavailable";
    return new NextResponse(detail, { status: 500 });
  }
}

async function serve(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (hotlinked(request)) {
    return new NextResponse("Hotlinking is not permitted.", { status: 403 });
  }
  const width = pickWidth(request);
  // Over the limit for where this request comes from: send it to the copy it
  // may have. A redirect (not smaller bytes at the same address) keeps every
  // address meaning one file, so the year-long browser cache stays truthful.
  const allowed = maxWidthForReferer(request.headers.get("referer"), isSiteHost);
  if (width > allowed) {
    const to = new URL(request.url);
    to.searchParams.set("w", String(allowed));
    return new NextResponse(null, {
      status: 302,
      headers: { location: `${to.pathname}${to.search}`, "cache-control": "no-store", vary: "Referer", "x-img": `capped:w${allowed}` },
    });
  }
  // `hero` and `cover-<slot>` are the mutable slugs (admin can swap them) — short
  // cache, never immutable. Permanent portfolio slugs stay year-long immutable.
  const isCover = slug.startsWith("cover-");
  const cacheHeader = slug === "hero" || isCover ? HERO_CACHE : CACHE;

  // Resolve the internal source (never revealed to the client).
  let sourceUrl: string | null = null;
  // Natural size, when known: sizes the signature to the file actually sent.
  let natural: { width?: number | null; height?: number | null } | null = null;
  if (slug === "hero") {
    sourceUrl = await getHeroRawImageUrl();
  } else if (slug.startsWith("album-")) {
    // Curated 12img albums (src/content/albums.ts): originals live in the same
    // private bucket under albums/, resolved by the registry, never by the URL.
    const key = albumObjectKey(slug);
    if (key) sourceUrl = storageUrl(key);
    natural = albumPhotoSize(slug);
  } else if (isCover) {
    sourceUrl = await getCoverRawImageUrl(slug.slice("cover-".length));
  } else {
    const img = await getImageBySlug(slug);
    if (img) {
      sourceUrl = storageUrl(img.storage_path);
      natural = { width: img.width, height: img.height };
    } else {
      // An address this photo used to have: send it to the current one.
      const moved = await getSlugForOldSlug(slug);
      if (moved) {
        return new NextResponse(null, {
          status: 308,
          headers: {
            location: `/api/img/${moved.slug}${new URL(request.url).search}`,
            "cache-control": "public, max-age=86400",
            "x-img": "moved",
          },
        });
      }
    }
  }
  if (!sourceUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const upstream = await fetchOriginal(sourceUrl);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Source unavailable" }, { status: 502 });
  }

  // Cloudflare Images binding — present on Workers, absent in plain next dev.
  // Dynamic import so `next dev` (no OpenNext shim) can never crash the route.
  let images: CfImages | undefined;
  let ctxNote = "ok";
  try {
    const mod = await import("@opennextjs/cloudflare");
    const { env } = mod.getCloudflareContext();
    images = (env as { IMAGES?: CfImages }).IMAGES;
    if (!images) ctxNote = "no-binding";
  } catch (e) {
    ctxNote = `no-ctx:${hdr(e instanceof Error ? e.message : "?")}`;
  }

  if (!images) {
    // Dev fallback: pass through so the site renders locally.
    return new NextResponse(upstream.body, {
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/webp",
        "cache-control": cacheHeader,
        "x-img": `passthrough:${ctxNote}`,
      },
    });
  }

  try {
    let chain = images.input(upstream.body).transform(imageTransformForWidth(width));
    const size = scaledSize(width, natural?.width, natural?.height);
    const mark = slugTakesMark(slug) ? markPlan(size.w, size.h) : null;
    if (mark) {
      chain = chain.draw(images.input(markStream()).transform({ width: mark.width }), {
        bottom: mark.inset,
        right: mark.inset,
        opacity: MARK_OPACITY,
      });
    }

    const out = await chain.output({ format: "image/webp", quality: QUALITY });
    const res = out.response();
    return new NextResponse(res.body, {
      headers: {
        "content-type": res.headers.get("content-type") ?? "image/webp",
        "cache-control": cacheHeader,
        "x-content-type-options": "nosniff",
        "x-img": `transformed:w${width}${mark ? ":signed" : ""}`,
      },
    });
  } catch (err) {
    console.error("[img] transform failed:", err);
    // Album originals can be 20+ MB: never hand those to a visitor.
    if (slug.startsWith("album-")) {
      return NextResponse.json({ error: "Image unavailable" }, { status: 502, headers: { "x-img": `failed:${hdr(err instanceof Error ? err.message : "?")}` } });
    }
    // Last resort: re-fetch and pass through (transform consumed the stream).
    const retry = await fetchOriginal(sourceUrl);
    return new NextResponse(retry.body, {
      headers: {
        "content-type": retry.headers.get("content-type") ?? "image/webp",
        "cache-control": cacheHeader,
        "x-img": `fallback:${hdr(err instanceof Error ? err.message : "?")}`,
      },
    });
  }
}
