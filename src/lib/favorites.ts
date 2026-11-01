/**
 * favorites.ts — the homepage "favorites" contact sheet (pure; server, client
 * and tests).
 *
 * SOURCE OF TRUTH: Admin → Portfolio. Star a photo ("Feature") and drag it
 * into order; the homepage shows the first 100 starred photos. Nothing here
 * needs a deploy to change.
 *
 * Fallbacks, so the section never renders empty:
 *   1. no starred photos yet → every portfolio photo, in portfolio order
 *   2. database unreachable   → the caller passes the static stills
 */
import { groupForCategory, type GroupId } from "@/content/portfolio-taxonomy";

export const FAVORITES_MAX = 100;
/** Photos shown before the first "View more", and how many each tap adds. */
export const FAVORITES_STEP = 24;

/** Grid derivative widths (capped well below print size), and the lightbox size. */
export const GRID_WIDTHS = [256, 384, 512, 640, 828] as const;
export const LIGHTBOX_WIDTH = 1440;

export type Favorite = {
  /** Stable key (the photo's slug). */
  id: string;
  /** Branded serve URL (/api/img/<slug>?v=…) or a static /portfolio/*.webp fallback. */
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Public portfolio group, for the filter row. */
  group: GroupId;
  /** The photo's own page (crawlable link; the click opens the lightbox instead). */
  href: string | null;
};

/** The fields read from a portfolio row (a subset of PortfolioImage). */
export type FavoriteSource = {
  slug?: string | null;
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
  title?: string | null;
  section: string;
  is_feature: boolean;
  sort_order: number;
};

/** Groups that are not photos of the day (videos live in the films band). */
const EXCLUDED_GROUPS: ReadonlySet<GroupId> = new Set(["films"]);

/**
 * The favorites, in the order the owner set: starred photos only (by
 * sort_order, then portfolio order), or every photo when none are starred.
 * Photos without stored dimensions are skipped (they would shift the layout).
 */
export function favoritesFromImages(images: readonly FavoriteSource[], max = FAVORITES_MAX): Favorite[] {
  const usable = images
    .map((img, i) => ({ img, i }))
    .filter(({ img }) => img.slug && img.width && img.height && !EXCLUDED_GROUPS.has(groupForCategory(img.section)));
  const starred = usable.filter(({ img }) => img.is_feature);
  const pool = starred.length ? starred : usable;
  return [...pool]
    .sort((a, b) => a.img.sort_order - b.img.sort_order || a.i - b.i)
    .slice(0, max)
    .map(({ img }) => ({
      id: img.slug!,
      src: img.url,
      width: img.width!,
      height: img.height!,
      alt: (img.alt || img.title || "").trim(),
      group: groupForCategory(img.section),
      href: `/photos/${img.section}/${img.slug}`,
    }));
}

/** Groups present among the favorites, in first-seen order. */
export function favoriteGroups(favorites: readonly Favorite[]): GroupId[] {
  const out: GroupId[] = [];
  for (const f of favorites) if (!out.includes(f.group)) out.push(f.group);
  return out;
}

/** A sized derivative of a branded image; static fallbacks pass through. */
export function sizedSrc(src: string, width: number): string {
  if (!src.startsWith("/api/img/")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}

/** srcset for a grid cell (never larger than the photo itself). */
export function gridSrcSet(f: Pick<Favorite, "src" | "width">): string | undefined {
  if (!f.src.startsWith("/api/img/")) return undefined;
  const widths = GRID_WIDTHS.filter((w) => w <= Math.max(f.width, GRID_WIDTHS[0]));
  return widths.map((w) => `${sizedSrc(f.src, w)} ${w}w`).join(", ");
}
