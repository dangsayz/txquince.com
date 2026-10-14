/**
 * image-slot-shared.ts — constants and pure helpers for image slots that
 * client code may import too (no zod, no registry, no server code).
 */

export const HISTORY_LIMIT = 10;

/** Target rendition widths; each is capped at the original's width. */
export const RENDITION_WIDTHS = [480, 960, 1600, 2400] as const;

/** Max bytes for one uploaded rendition. */
export const MAX_RENDITION_BYTES = 8 * 1024 * 1024;

export const ALT_MIN = 3;
export const ALT_MAX = 250;

/**
 * Widths to produce for an original `originalWidth` px wide: every target,
 * capped at the original (never upscaled), de-duplicated, ascending.
 * 1200px original → [480, 960, 1200]; 300px → [300].
 */
export function renditionWidths(originalWidth: number): number[] {
  const w = Math.floor(originalWidth);
  if (!Number.isFinite(w) || w < 1) return [];
  return [...new Set(RENDITION_WIDTHS.map((t) => Math.min(t, w)))].sort((a, b) => a - b);
}

/** R2 key prefix of one version; renditions are `<key>-<w>.<ext>`. */
export function versionKey(slotId: string, versionId: string): string {
  return `slots/${slotId}/${versionId}`;
}

export function renditionKey(key: string, w: number, ext: "webp" | "jpg" = "webp"): string {
  return `${key}-${w}.${ext}`;
}

/** Public URL of a rendition (served by /api/photos/media). */
export function renditionUrl(key: string, w: number, ext: "webp" | "jpg" = "webp"): string {
  return `/api/photos/media/${renditionKey(key, w, ext)}`;
}

/** Rendition keys the media route will serve. */
export const SLOT_MEDIA_KEY_RE = /^slots\/[a-z0-9-]+(?:\.[a-z0-9-]+){1,3}\/[a-z0-9-]{8,40}-\d{1,4}\.(webp|jpg)$/;

/** CSS object-position from a focal point. */
export function focalPosition(f: { x: number; y: number }): string {
  return `${Math.round(f.x * 1000) / 10}% ${Math.round(f.y * 1000) / 10}%`;
}
