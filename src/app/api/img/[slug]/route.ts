/**
 * /api/img/[slug] — the ONLY way image bytes reach a visitor.
 *
 * Resolves a permanent slug → storage object, then serves a protected
 * derivative via the Cloudflare Images binding:
 *   · capped at 1600px long edge (originals never leave storage)
 *   · visible watermark drawn at transform time (never baked into originals)
 *   · WebP, quality-tuned; EXIF stripped by the transform pipeline
 *   · hotlink-checked (empty referer allowed — iMessage/OG fetchers send none)
 *   · immutable edge cache (slugs are permanent)
 *
 * `hero` is a reserved slug serving the admin-set homepage hero.
 * Without the IMAGES binding (local `next dev`), proxies the original so
 * development still renders — protection applies on Cloudflare.
 */
import { NextResponse } from "next/server";
import { getImageBySlug, getHeroRawImageUrl, storageUrl } from "@/lib/content-db";
import { site } from "@/content/site";

export const dynamic = "force-dynamic";

const MAX_EDGE = 1600;
const QUALITY = 82;

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

function hotlinked(req: Request): boolean {
  const ref = req.headers.get("referer");
  if (!ref) return false; // direct opens, iMessage/OG/Google fetchers
  try {
    return !ALLOWED_HOSTS.includes(new URL(ref).hostname);
  } catch {
    return false;
  }
}

const CACHE = "public, max-age=31536000, immutable";

/** Header-safe note: strip newlines/control chars (illegal in header values). */
function hdr(s: string): string {
  return s.replace(/[^\x20-\x7E]+/g, " ").trim().slice(0, 48);
}

/**
 * Fetch a storage object with service-role auth — works whether the bucket is
 * public or PRIVATE (the bucket is locked; this route is the only reader).
 */
function fetchOriginal(url: string): Promise<Response> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (key && url.includes("/storage/v1/object/public/")) {
    return fetch(url.replace("/storage/v1/object/public/", "/storage/v1/object/"), {
      headers: { authorization: `Bearer ${key}`, apikey: key },
      cf: { cacheTtl: 86400 },
    } as RequestInit);
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

  // Resolve the internal source (never revealed to the client).
  let sourceUrl: string | null = null;
  if (slug === "hero") {
    sourceUrl = await getHeroRawImageUrl();
  } else {
    const img = await getImageBySlug(slug);
    if (img) sourceUrl = storageUrl(img.storage_path);
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
        "cache-control": CACHE,
        "x-img": `passthrough:${ctxNote}`,
      },
    });
  }

  try {
    let chain = images.input(upstream.body).transform({ width: MAX_EDGE, height: MAX_EDGE, fit: "scale-down" });

    // Watermark (PNG — SVG is not a valid Images input). Failure must never
    // 500 the image; worst case we serve unwatermarked.
    let wmNote = "wm";
    try {
      const origin = new URL(request.url).origin;
      const wm = await fetch(`${origin}/brand/wm.png`, { cf: { cacheTtl: 86400 } } as RequestInit);
      if (wm.ok && wm.body) {
        chain = chain.draw(images.input(wm.body), { bottom: 20, right: 20, opacity: 0.55 });
      } else {
        wmNote = `no-wm:${wm.status}`;
      }
    } catch (e) {
      wmNote = `wm-err:${hdr(e instanceof Error ? e.message : "?")}`;
    }

    const out = await chain.output({ format: "image/webp", quality: QUALITY });
    const res = out.response();
    return new NextResponse(res.body, {
      headers: {
        "content-type": res.headers.get("content-type") ?? "image/webp",
        "cache-control": CACHE,
        "x-content-type-options": "nosniff",
        "x-img": `transformed:${wmNote}`,
      },
    });
  } catch (err) {
    console.error("[img] transform failed:", err);
    // Last resort: re-fetch and pass through (transform consumed the stream).
    const retry = await fetchOriginal(sourceUrl);
    return new NextResponse(retry.body, {
      headers: {
        "content-type": retry.headers.get("content-type") ?? "image/webp",
        "cache-control": CACHE,
        "x-img": `fallback:${hdr(err instanceof Error ? err.message : "?")}`,
      },
    });
  }
}
