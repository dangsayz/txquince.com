/**
 * home-galleries.ts — the homepage "Real quinceañeras, full galleries" cards.
 *
 * TRUTH RULE: every card is a real shoot from the portfolio (Admin →
 * Portfolio, the `portfolio_images` table). Photos are grouped by the
 * `location` the ingest stamps on each one, so a card's title and city are
 * exactly what is already published on those photos' own pages (e.g.
 * "Convention Plaza Ballroom, Irving"). Nothing here invents a client name or
 * a place, and nothing falls back to hand-written records: when the portfolio
 * cannot be read, the section shows real photos instead (see Archive.tsx).
 *
 * Pure: safe for server code and tests. The page reads the images with
 * getPortfolioImages() and passes them through `galleriesFromImages`.
 */
import { getLocation } from "@/content/locations";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { venueForLocation, venueSlugify } from "@/content/venues";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

/** The fields a card needs from a portfolio row (a subset of PortfolioImage). */
export type GalleryImageInput = {
  url: string;
  alt: string;
  section: string;
  is_feature: boolean;
  width: number | null;
  height: number | null;
  location: string | null;
  city?: string | null;
  title?: string | null;
  caption?: string | null;
  focus_x?: number | null;
  focus_y?: number | null;
};

/** One homepage gallery card (serializable: it crosses into a client component). */
export type HomeGallery = {
  key: string;
  /** The venue or place, as published on the gallery's photos. */
  title: string;
  /** City as stored ("Irving"), or null when the photos carry none. */
  city: string | null;
  /** The full gallery: the venue page, else the portfolio searched for the place. */
  href: string;
  /** Photos in the gallery. */
  count: number;
  cover: { src: string; width: number | null; height: number | null; alt: string; focus: string };
};

/** A gallery needs at least this many photos to be called one. */
export const MIN_GALLERY_PHOTOS = 3;
/** Cards on the homepage. */
export const MAX_HOME_GALLERIES = 6;

/** "fort-worth" → "Fort Worth" (stored city slugs), via the city registry when it knows it. */
function cityName(raw: string | null | undefined): string | null {
  const slug = raw?.trim().toLowerCase();
  if (!slug) return null;
  return getLocation(slug)?.city ?? slug.replace(/-/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Portrait-shaped photos crop cleanly into the 4:5 card. */
const isPortrait = (i: GalleryImageInput) => !i.width || !i.height || i.height >= i.width;

function pickCover(images: GalleryImageInput[]): GalleryImageInput {
  return (
    images.find((i) => i.is_feature && isPortrait(i)) ??
    images.find(isPortrait) ??
    images.find((i) => i.is_feature) ??
    images[0]
  );
}

const pct = (v: number | null | undefined, d: number) => `${Math.round((v ?? d) * 100)}%`;

export function galleriesFromImages(images: readonly GalleryImageInput[], limit = MAX_HOME_GALLERIES): HomeGallery[] {
  const groups = new Map<string, { title: string; city: string | null; href: string; images: GalleryImageInput[] }>();

  for (const img of images) {
    const location = img.location?.trim();
    if (!location || !img.url) continue;
    const venue = venueForLocation(location);
    let key: string;
    let title: string;
    let city: string | null;
    let href: string;
    if (venue) {
      key = `venue:${venue.slug}`;
      title = venue.venue;
      city = venue.city;
      href = `/venues/${venue.slug}`;
    } else {
      // Not a registry venue: use the stored place itself, but only when it is
      // written copy (a filename-ish location is never published as a title).
      title = publicPhotoCopy({ title: location }, "").title;
      if (!title) continue;
      key = `place:${venueSlugify(title)}`;
      city = cityName(img.city);
      href = `/portfolio?q=${encodeURIComponent(title)}`;
    }
    const g = groups.get(key) ?? { title, city, href, images: [] };
    g.city ??= cityName(img.city);
    g.images.push(img);
    groups.set(key, g);
  }

  const out: HomeGallery[] = [];
  for (const [key, g] of groups) {
    if (g.images.length < MIN_GALLERY_PHOTOS) continue;
    const c = pickCover(g.images);
    out.push({
      key,
      title: g.title,
      city: g.city,
      href: g.href,
      count: g.images.length,
      cover: {
        src: c.url,
        width: c.width,
        height: c.height,
        alt: publicPhotoCopy(c, altPhraseFor(c.section)).alt,
        focus: `${pct(c.focus_x, 0.5)} ${pct(c.focus_y, 0.4)}`,
      },
    });
    if (out.length >= limit) break;
  }
  return out;
}
