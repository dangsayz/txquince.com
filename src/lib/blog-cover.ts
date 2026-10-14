import "server-only";
import { site } from "@/content/site";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import type { BlogBlock, BlogPost } from "@/content/blog";
import { getAllPosts, enSlugForEs } from "@/content/blog";
import { getFeaturedImages, getPageHero, type ResolvedBlogImage } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { blogCoverSlotId } from "@/lib/image-slots";
import { getSlotVersion } from "@/lib/image-slot-store";
import { renditionUrl } from "@/lib/image-slot-shared";

/**
 * Blog cover (hero) selection — the root-cause fix for blurry blog heroes.
 *
 * The cover frame is wide (up to ~1300px at 16:9 / 2:1). Most posts have no
 * `image` block, so they used to fall back to a small 810px static portrait
 * that got stretched ~2x. Now:
 *   1. a resolved `image` block in the post (reading order) wins — it was
 *      chosen for that story;
 *   2. otherwise a featured portfolio photo whose real source is at least
 *      MIN_COVER_WIDTH wide (served by /api/img up to 2400px), landscape first,
 *      rotated per post so neighbours differ (EN and ES translations share one);
 *   3. otherwise the largest static fallback.
 * The natural width/height always travel with the cover, so the frame can be
 * capped at the photo's real size (never blown up beyond 1:1).
 */

/** A cover narrower than this would be upscaled in the desktop frame. */
const MIN_COVER_WIDTH = 1600;

export type BlogCover = ResolvedBlogImage & {
  focus_x?: number | null;
  focus_y?: number | null;
  /** The post's `image` block slug used as the cover (skipped in the body). */
  blockSlug?: string;
};

type PoolImage = Awaited<ReturnType<typeof getFeaturedImages>>[number];

export async function resolveBlogCover(
  post: BlogPost,
  images: Record<string, ResolvedBlogImage>,
  lang: "en" | "es",
): Promise<BlogCover> {
  // 0. A cover the admin chose for this story (Admin → Every image).
  const chosen = await getSlotVersion(blogCoverSlotId(post.slug, lang));
  if (chosen) {
    const w = Math.max(...chosen.widths.filter((x) => x <= 1600), Math.min(...chosen.widths));
    return {
      url: renditionUrl(chosen.key, w, chosen.ext ?? "webp"),
      width: chosen.w,
      height: chosen.h,
      alt: chosen.alt[lang],
      caption: null,
      focus_x: chosen.focal.x,
      focus_y: chosen.focal.y,
    };
  }

  // 1. The post's own photo.
  const block = post.content.find(
    (b): b is Extract<BlogBlock, { type: "image" }> => b.type === "image" && Boolean(images[b.slug]?.url),
  );
  if (block) {
    const im = images[block.slug];
    return { ...im, alt: block.alt || im.alt, caption: block.caption ?? im.caption, blockSlug: block.slug };
  }

  // 2. A high-resolution featured portfolio photo.
  const [pool, pageHero] = await Promise.all([getFeaturedImages(24), getPageHero("blog")]);
  const usable = pool.filter((i) => i.url !== pageHero?.url);
  const big = usable.filter((i) => (i.width ?? 0) >= MIN_COVER_WIDTH);
  // Rows without recorded dimensions are originals of unknown size: better than
  // a static fallback, and the global NoUpscale guard still caps them if small.
  const candidates = big.length ? big : usable.filter((i) => i.width == null);
  if (candidates.length) {
    const key = lang === "es" ? (enSlugForEs(post.slug) ?? post.slug) : post.slug;
    const order = getAllPosts().findIndex((p) => p.slug === key);
    const idx = order >= 0 ? order : hash(key);
    const landscape = candidates.filter((i) => (i.width ?? 0) > (i.height ?? 0));
    const list = landscape.length ? landscape : candidates;
    const pick = list[idx % list.length];
    return toCover(pick, lang);
  }

  // 3. Largest static fallback (1440px wide).
  const fb = [...portfolioFallback].sort((a, b) => b.width - a.width)[0];
  return { url: fb.url, width: fb.width, height: fb.height, alt: fb.alt, caption: null };
}

function toCover(image: PoolImage, lang: "en" | "es"): BlogCover {
  const alt =
    lang === "es"
      ? image.alt || "Fotografía de quinceañera en Dallas–Fort Worth"
      : publicPhotoCopy(image, altPhraseFor(image.section)).alt;
  return {
    url: image.url,
    width: image.width,
    height: image.height,
    alt,
    caption: null,
    focus_x: image.focus_x,
    focus_y: image.focus_y,
  };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Absolute URL for social cards / structured data: branded /api/img sources get
 * an explicit 1440px derivative (the route's step at/above the 1200px OG
 * minimum); static files are absolute-ised.
 */
const OG_WIDTH = 1440;

export function absoluteImageUrl(url: string, width = OG_WIDTH): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("/api/img/")) {
    return `${site.url}${url}${url.includes("?") ? "&" : "?"}w=${width}`;
  }
  return `${site.url}${url}`;
}

/** OG image entry with honest dimensions (scaled to the served derivative). */
export function ogImageFor(cover: BlogCover): { url: string; width?: number; height?: number; alt: string } {
  const url = absoluteImageUrl(cover.url);
  const w = cover.width ?? undefined;
  const h = cover.height ?? undefined;
  if (!w || !h) return { url, alt: cover.alt };
  // Slot renditions name their own width (…-1600.webp).
  const rendition = cover.url.match(/-(\d+)\.(?:webp|jpg)$/);
  const outW = cover.url.startsWith("/api/img/") ? Math.min(OG_WIDTH, w) : rendition ? Math.min(Number(rendition[1]), w) : w;
  return { url, width: outW, height: Math.round((h * outW) / w), alt: cover.alt };
}
