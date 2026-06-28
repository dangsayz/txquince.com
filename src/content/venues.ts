/**
 * venues.ts — the VENUE REGISTRY (the source of truth for venue landing pages).
 *
 * The raw facts live in `venues.json`, which is ALSO read by
 * `scripts/ingest-venues.mjs` (the weekly shoot-folder importer) — so adding a
 * venue in one place makes its photos ingest AND its /venues/{slug} page appear,
 * with zero drift. Editable marketing copy (about + FAQ) is layered on top from
 * the `venues` DB table (admin-editable, AI-draftable) — see content-db.ts.
 *
 * Each venue's photos are matched by the `location` value the ingest script
 * stamps on every row: `venueFull` with a leading "the " stripped
 * (= `locationTag` below). Keep that contract in sync with the script.
 */
import raw from "./venues.json";

export type VenueDef = {
  /** media-inbox folder name (used only by the ingest script). */
  folder: string;
  /** locations.ts slug, or null when we don't have a city page for it. */
  citySlug: string | null;
  city: string;
  /** Clean display name, e.g. "Convention Plaza Ballroom". */
  venue: string;
  /** Long form woven into alt/credits, e.g. "the Fort Worth Stockyards". */
  venueFull: string;
  section: string;
};

export type Venue = VenueDef & {
  /** URL slug → /venues/{slug}. */
  slug: string;
  /** Exact `portfolio_images.location` value its photos carry. */
  locationTag: string;
};

/** Mirror of the ingest script's slugify so URL slugs and image-slug prefixes
 *  agree. Keep these identical. */
export function venueSlugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/_/g, "-")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export const venues: Venue[] = (raw as VenueDef[]).map((v) => ({
  ...v,
  slug: venueSlugify(v.venue),
  locationTag: v.venueFull.replace(/^the /i, ""),
}));

const BY_SLUG: Record<string, Venue> = Object.fromEntries(venues.map((v) => [v.slug, v]));

export function getVenue(slug: string): Venue | undefined {
  return BY_SLUG[slug];
}

/** Venues we have a page for in a given city (by locations.ts slug). */
export function venuesByCity(citySlug: string): Venue[] {
  return venues.filter((v) => v.citySlug === citySlug);
}

/** Match a photo's free-text location to a registry venue (exact, then loose). */
export function venueForLocation(location: string | null | undefined): Venue | undefined {
  const loc = (location ?? "").trim();
  if (!loc) return undefined;
  return (
    venues.find((v) => v.locationTag === loc) ||
    venues.find((v) => venueSlugify(loc) === v.slug) ||
    venues.find((v) => loc.toLowerCase().includes(v.venue.toLowerCase()))
  );
}
