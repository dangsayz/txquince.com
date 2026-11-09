/**
 * albums.ts — full shoots published straight from 12img, without the
 * portfolio database (pure; server, client and tests).
 *
 * WHY: a venue page should show a real share of the album (about a third to a
 * half of the day), not 7 frames. Adding hundreds of rows by hand in Admin is
 * slow, so a curated album is a small JSON file here plus the originals in the
 * private PORTFOLIO bucket at `albums/<album id>/<nnn>.jpg`. They are served
 * like every other photo, through /api/img/<slug> (capped derivatives, hotlink
 * check, never the original).
 *
 * Slugs: `album-<album id>-<nnn>`. No names anywhere: not in ids, files, alt
 * text or URLs.
 *
 * `replacesDbEvent`: when the database already holds a few photos of the same
 * shoot, the album is the fuller set, so the venue page drops those rows. It is
 * a hash of the internal grouping key (see venue-events.ts), not the key.
 */
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { eventKey, type VenueEventPhoto } from "@/lib/venue-events";
import plazaPinkGold from "./albums/plaza-pink-gold.json";
import fgsRanchRed from "./albums/fgs-ranch-red.json";
import horseRed from "./albums/horse-red.json";
// Grokbot handoff, 2026-11-08 (Drive "Claude Code master asset handoff").
import arboretumPinkGarden from "./albums/arboretum-pink-garden.json";
import hamptonsPinkStorybook from "./albums/hamptons-pink-storybook.json";
import latinoBallroomButterfly from "./albums/latino-ballroom-butterfly.json";
import luxuryRedWhiteReception from "./albums/luxury-red-white-reception.json";
import mandalayBlackFloral from "./albums/mandalay-black-floral.json";
import pinkCandlelitReception from "./albums/pink-candlelit-reception.json";
import slatePinkGown from "./albums/slate-pink-gown.json";
import arboretumRedGarden from "./albums/arboretum-red-garden.json";
import dreamhausPinkTiara from "./albums/dreamhaus-pink-tiara.json";
import hamptonsTwinsDressSession from "./albums/hamptons-twins-dress-session.json";
import laPradaPink from "./albums/la-prada-pink.json";
import vmBallroomPink from "./albums/vm-ballroom-pink.json";

export type Album = {
  id: string;
  /** Venue page this album belongs to, or null (location not published). */
  venueSlug: string | null;
  place: string | null;
  city: string | null;
  theme: { en: string; es: string };
  replacesDbEvent?: string;
  /**
   * [sequence, width, height, portfolio category id, alt?], in display order.
   * The optional alt describes what that photo actually shows (no names);
   * without it the alt is the category phrase + place.
   */
  photos: ([number, number, number, string] | [number, number, number, string, string])[];
};

export const ALBUMS: readonly Album[] = [
  plazaPinkGold,
  fgsRanchRed,
  horseRed,
  arboretumPinkGarden,
  hamptonsPinkStorybook,
  latinoBallroomButterfly,
  luxuryRedWhiteReception,
  mandalayBlackFloral,
  pinkCandlelitReception,
  slatePinkGown,
  arboretumRedGarden,
  dreamhausPinkTiara,
  hamptonsTwinsDressSession,
  laPradaPink,
  vmBallroomPink,
] as Album[];

const pad3 = (n: number) => String(n).padStart(3, "0");

export function albumSlug(album: Pick<Album, "id">, seq: number): string {
  return `album-${album.id}-${pad3(seq)}`;
}

/** Storage key for an album slug, or null when it is not one. */
export function albumObjectKey(slug: string): string | null {
  const m = /^album-([a-z0-9-]+)-(\d{3})$/.exec(slug);
  if (!m) return null;
  const album = ALBUMS.find((a) => a.id === m[1]);
  if (!album || !album.photos.some(([seq]) => pad3(seq) === m[2])) return null;
  return `albums/${album.id}/${m[2]}.jpg`;
}

/** FNV-1a, 32-bit, hex — matches the hash stored in `replacesDbEvent`. */
export function shortHash(s: string): string {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(s)) h = Math.imul(h ^ b, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}

function altFor(album: Album, section: string): string {
  const where = album.place ? ` at ${album.place}${album.city ? `, ${album.city}, Texas` : ""}` : " in Dallas–Fort Worth";
  return `${altPhraseFor(section)}${where}`;
}

/** An album's photos in the shape the venue page and blog use. */
export function albumPhotos(album: Album): VenueEventPhoto[] {
  return album.photos.map(([seq, width, height, section, alt], i) => ({
    id: albumSlug(album, seq),
    url: `/api/img/${albumSlug(album, seq)}`,
    alt: alt || altFor(album, section),
    section,
    is_feature: i === 0,
    sort_order: 100_000 + i,
    width,
    height,
    slug: null,
    tags: `xv:${album.id}, theme:${album.theme.en}`,
  }));
}

export function albumsForVenue(venueSlug: string): Album[] {
  return ALBUMS.filter((a) => a.venueSlug === venueSlug);
}

/**
 * A venue's photos: database rows (minus any shoot an album replaces) followed
 * by its albums.
 */
export function withAlbums<P extends VenueEventPhoto>(db: readonly P[], venueSlug: string): (P | VenueEventPhoto)[] {
  const albums = albumsForVenue(venueSlug);
  if (!albums.length) return [...db];
  const replaced = new Set(albums.map((a) => a.replacesDbEvent).filter(Boolean));
  const kept = db.filter((p) => !replaced.has(shortHash(eventKey(p, venueSlug))));
  return [...kept, ...albums.flatMap(albumPhotos)];
}

export function getAlbum(id: string): Album | undefined {
  return ALBUMS.find((a) => a.id === id);
}
