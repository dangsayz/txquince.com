/**
 * Who may see a Photo dump object, decided from the manifest (the source of
 * truth), not from whether the object still sits in R2 or in a cache.
 *
 *   "public"  — a visible photo in a visible album, or a homepage swap target
 *   "hidden"  — listed, but the photo or its album is hidden (admin only)
 *   "missing" — not listed: deleted, or never published (404)
 */
import type { DumpManifest } from "@/lib/photo-dump-shared";

export type MediaVisibility = "public" | "hidden" | "missing";

export function mediaVisibility(m: DumpManifest, key: string): MediaVisibility {
  let listed = false;
  for (const a of m.albums) {
    for (const p of a.photos) {
      if (p.key !== key) continue;
      listed = true;
      if (!a.hidden && !p.hidden) return "public";
    }
  }
  // The homepage can show a swapped-in photo even if it's hidden from the feed
  // (resolveOverrides does the same), so a listed override target is public.
  if (listed && m.overrides && Object.values(m.overrides).includes(key)) return "public";
  return listed ? "hidden" : "missing";
}

/** Browser cache for public photos: short, so a hide/delete takes effect within the hour. */
export const PUBLIC_BROWSER_CACHE = "public, max-age=3600, stale-while-revalidate=600";
/** Edge copy (Workers Cache API): long, because every request checks the manifest BEFORE the cache. */
export const EDGE_CACHE = "public, max-age=31536000, immutable";
/** Hidden photos (admin preview): never stored anywhere. */
export const PRIVATE_CACHE = "private, no-store";
