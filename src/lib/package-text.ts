/**
 * package-text.ts — package wording, filled and ready to show (client + server).
 *
 * Every place that describes what a package includes reads it through here,
 * from the live price book (PriceBook.content, edited at /admin/packages), so
 * one save changes the cards, home page, comparison table, budget page,
 * agreement and SEO pages together.
 */
import { fmtHours, maxHoursFor, type AddOnId, type PriceBook, type TierId } from "./commission";
import type { L, PackageContent } from "./package-content";
import { contentOf, fillPrices } from "./price-text";

export { contentOf };
type Lang = "en" | "es";

const SHORT = /\{(photos|cameras|hours|maxhours|session|team)\}/g;

/** Fill a package's own tokens ({photos}, {team} …) and any price tokens ({{addon.x}}). */
export function fillPkg(text: string, tier: TierId, book: PriceBook, lang: Lang): string {
  if (!text) return "";
  const c = contentOf(book, tier);
  const one = (s: string, depth: number): string =>
    s.replace(SHORT, (_, k: string) => {
      switch (k) {
        case "photos":
          return c.photos;
        case "cameras":
          return c.cameras;
        case "hours":
          return fmtHours(book.packages[tier].hours);
        case "maxhours":
          return fmtHours(maxHoursFor(book, tier));
        case "session":
          return book.sessionPhotos;
        default:
          // {team} may itself say {cameras}; never recurse past one level.
          return depth > 0 ? "" : one(c.team[lang], depth + 1);
      }
    });
  return fillPrices(one(text, 0), book).trim();
}

/** Both languages of a line, filled. Empty stays empty (= not included). */
export const pkgL = (book: PriceBook, tier: TierId, v: L): L => ({
  en: fillPkg(v.en, tier, book, "en"),
  es: fillPkg(v.es, tier, book, "es"),
});

type LineField = Exclude<keyof PackageContent, "photos" | "cameras" | "bullets" | "notIncluded">;

/** One wording field, filled; null when it is empty (not included). */
export function pkgField(book: PriceBook, tier: TierId, field: LineField): L | null {
  const v = pkgL(book, tier, contentOf(book, tier)[field]);
  return v.en || v.es ? v : null;
}

export const pkgBullets = (book: PriceBook, tier: TierId): L[] =>
  contentOf(book, tier).bullets.map((b) => pkgL(book, tier, b)).filter((b) => b.en || b.es);

export const pkgNotIncluded = (book: PriceBook, tier: TierId): L[] =>
  contentOf(book, tier).notIncluded.map((b) => pkgL(book, tier, b)).filter((b) => b.en || b.es);

/** "150+" plus its note: "50+, more for each added hour". */
export function photosCell(book: PriceBook, tier: TierId): L {
  const c = contentOf(book, tier);
  const note = pkgL(book, tier, c.photosNote);
  return {
    en: note.en ? `${c.photos}, ${note.en}` : c.photos,
    es: note.es ? `${c.photos}, ${note.es}` : c.photos,
  };
}

/** "150+ edited photos" plus its note, for sentences. */
export function photosLine(book: PriceBook, tier: TierId): L {
  const c = contentOf(book, tier);
  const note = pkgL(book, tier, c.photosNote);
  const en = `${c.photos} edited photos`;
  const es = `${c.photos} fotos editadas`;
  return { en: note.en ? `${en}, ${note.en}` : en, es: note.es ? `${es}, ${note.es}` : es };
}

/** What an extra is, in words, filled. */
export const addOnNote = (book: PriceBook, id: AddOnId): L => ({
  en: fillPrices(book.addOnNotes[id].en, book),
  es: fillPrices(book.addOnNotes[id].es, book),
});
