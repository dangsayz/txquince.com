/**
 * image-slot-resolve.ts — pure: turn (slot definition, stored version, the
 * page's own fallback) into exactly what to render. Shared by the server
 * <SlotImage> and the homepage's client sections (resolved on the server and
 * handed down as props), so both render the same thing.
 *
 * Precedence: the admin's override → the page's own pick (`fallback`, e.g. a
 * featured portfolio photo) → the registry default.
 */
import type { SlotDef, L } from "@/lib/image-slots";
import { focalPosition, renditionUrl } from "@/lib/image-slot-shared";
import type { Version } from "@/lib/image-slot-state";

export type ResolvedSlotImage = {
  slot: string;
  label: string;
  src: string;
  srcSet?: string;
  sizes: string;
  /** Natural size — reserved as width/height so nothing shifts on load. */
  width?: number;
  height?: number;
  alt: L;
  objectPosition?: string;
  /** True when the admin replaced the photo. */
  overridden: boolean;
  lcp: boolean;
};

/** The page's own choice for this spot when there is no override. */
export type SlotFallback = {
  src: string;
  /** A string is the alt in the page's language. */
  alt?: string | L;
  width?: number | null;
  height?: number | null;
  focus?: string;
};

/** Widths /api/img serves (next.config deviceSizes). */
const BRANDED_WIDTHS = [640, 828, 1080, 1440, 1920, 2400];

/** srcset for a branded /api/img source, never wider than the photo. */
export function brandedSrcSet(src: string, naturalWidth?: number | null): string | undefined {
  if (!src.startsWith("/api/img/")) return undefined;
  const cap = naturalWidth && naturalWidth > 0 ? naturalWidth : Infinity;
  const widths = BRANDED_WIDTHS.filter((w) => w <= cap);
  if (!widths.length) return undefined;
  const sep = src.includes("?") ? "&" : "?";
  return widths.map((w) => `${src}${sep}w=${w} ${w}w`).join(", ");
}

/** srcset for a stored version: only the widths actually produced. */
export function versionSrcSet(v: Version): string {
  return v.widths.map((w) => `${renditionUrl(v.key, w, v.ext ?? "webp")} ${w}w`).join(", ");
}

export function resolveSlotImage(
  def: SlotDef,
  version: Version | null | undefined,
  fallback?: SlotFallback | null,
): ResolvedSlotImage {
  const base = { slot: def.id, label: def.label, sizes: def.sizes, lcp: Boolean(def.lcp) };
  if (version) {
    const widest = Math.max(...version.widths);
    return {
      ...base,
      src: renditionUrl(version.key, widest, version.ext ?? "webp"),
      srcSet: versionSrcSet(version),
      width: version.w,
      height: version.h,
      alt: version.alt,
      objectPosition: focalPosition(version.focal),
      overridden: true,
    };
  }
  if (fallback?.src) {
    const alt =
      typeof fallback.alt === "string"
        ? { en: fallback.alt, es: fallback.alt }
        : (fallback.alt ?? def.defaultAlt);
    return {
      ...base,
      src: fallback.src,
      srcSet: brandedSrcSet(fallback.src, fallback.width),
      width: fallback.width ?? undefined,
      height: fallback.height ?? undefined,
      alt,
      objectPosition: fallback.focus ?? def.defaultFocus,
      overridden: false,
    };
  }
  return {
    ...base,
    src: def.defaultSrc,
    srcSet: brandedSrcSet(def.defaultSrc, def.defaultWidth),
    width: def.defaultWidth,
    height: def.defaultHeight,
    alt: def.defaultAlt,
    objectPosition: def.defaultFocus,
    overridden: false,
  };
}
