/**
 * home-locations.ts — the homepage "From the dress session to the dance floor"
 * strip: every place we have published photos from, built from live data so
 * it grows on its own.
 *
 *   1. Every registry venue (src/content/venues.json) with photos, counting
 *      its portfolio rows + its curated albums (src/content/albums), the same
 *      set its /venues/{slug} page shows. Links to that page.
 *   2. Every album with a named place but no venue page yet (e.g. a ballroom
 *      whose city isn't confirmed), linked to the blog story that features it.
 *
 * Pure: safe for server code and tests. Albums without a place (venue not
 * confirmed) never appear: we never name a place we can't stand behind.
 */
import { ALBUMS, albumPhotos, albumSlug, withAlbums } from "@/content/albums";
import { venues, venueForLocation } from "@/content/venues";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import type { BlogPost } from "@/content/blog";
import type { GalleryImageInput, HomeGallery } from "@/lib/home-galleries";

type Photo = {
  url: string;
  alt: string;
  section: string;
  is_feature: boolean;
  width: number | null;
  height: number | null;
  focus_x?: number | null;
  focus_y?: number | null;
};

const pct = (v: number | null | undefined, d: number) => `${Math.round((v ?? d) * 100)}%`;
const portrait = (p: Photo) => !p.width || !p.height || p.height >= p.width;

/** Sections that show a table, a cake or a room, not her. A card should open on a person. */
const NOT_HER = /^(the-details|venue-decor|cake|dinner|films|vendor-)/;
const ofHer = (p: Photo) => !NOT_HER.test(p.section);
const focusOf = (p: Photo) => `${pct(p.focus_x, 0.5)} ${pct(p.focus_y, 0.4)}`;

/** The card photo: a starred portrait of her first, then any portrait of her, then what there is. */
function pickCover(photos: Photo[]): Photo {
  return (
    photos.find((p) => p.is_feature && portrait(p) && ofHer(p)) ??
    photos.find((p) => portrait(p) && ofHer(p)) ??
    photos.find((p) => p.is_feature && portrait(p)) ??
    photos.find(portrait) ??
    photos[0]
  );
}

function cover(photos: Photo[]): Pick<HomeGallery, "cover" | "previews"> {
  const c = pickCover(photos);
  // Two more upright photos, spread through the gallery so they differ from the cover.
  const rest = photos.filter((p) => p !== c && p.url !== c.url && portrait(p));
  const spread = [rest[Math.floor(rest.length / 3)], rest[Math.floor((rest.length * 2) / 3)]].filter(
    (p, i, all): p is Photo => !!p && all.indexOf(p) === i,
  );
  return {
    cover: { src: c.url, width: c.width, height: c.height, alt: publicPhotoCopy(c, altPhraseFor(c.section)).alt, focus: focusOf(c) },
    previews: spread.map((p) => ({ src: p.url, focus: focusOf(p) })),
  };
}

export function homeLocations(
  portfolio: readonly (GalleryImageInput & { id?: string })[],
  posts: readonly BlogPost[],
  blogBase: "/blog" | "/es/blog",
): HomeGallery[] {
  const out: HomeGallery[] = [];

  for (const v of venues) {
    const db = portfolio.filter((p) => p.url && venueForLocation(p.location)?.slug === v.slug);
    const rows = db.map((p, i) => ({ ...p, id: p.id ?? `db-${i}`, sort_order: i })) as unknown as Parameters<typeof withAlbums>[0];
    const photos = withAlbums(rows, v.slug) as unknown as Photo[];
    if (!photos.length) continue;
    out.push({ key: `venue:${v.slug}`, title: v.venue, city: v.city, href: `/venues/${v.slug}`, count: photos.length, ...cover(photos) });
  }

  // Named places without a venue page: one card per place (a place can hold
  // several albums), linked to the first blog story that features it.
  const byPlace = new Map<string, (typeof ALBUMS)[number][]>();
  for (const a of ALBUMS) {
    if (a.venueSlug || !a.place || !a.photos.length) continue;
    byPlace.set(a.place, [...(byPlace.get(a.place) ?? []), a]);
  }
  for (const [place, albums] of byPlace) {
    const slugs = new Set(albums.flatMap((a) => a.photos.map(([n]) => albumSlug(a, n))));
    const post = posts.find((p) => p.content.some((b) => b.type === "image" && slugs.has(b.slug)));
    if (!post) continue;
    const photos = albums.flatMap((a) => albumPhotos(a)) as unknown as Photo[];
    out.push({ key: `place:${place}`, title: place, city: albums[0].city, href: `${blogBase}/${post.slug}`, count: photos.length, ...cover(photos) });
  }

  // Most photos first, so the strip opens on the fullest galleries.
  return out.sort((x, y) => y.count - x.count || x.title.localeCompare(y.title));
}
