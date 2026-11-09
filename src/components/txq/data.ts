/**
 * TX Quince — content model for the editorial site.
 *
 * Every user-facing string that belongs to a record (a work, a film, a tier)
 * is stored as { en, es } so the language toggle swaps it in place. UI chrome
 * strings live in ./copy.ts.
 *
 * Prices are not here: every price lives in the live price book.
 */

export type Lang = "en" | "es";
export type L = { en: string; es: string };

export const pick = (lang: Lang, v: L) => v[lang];

import { COORDINATOR_INCLUDED, addOnAllowed, canAddHours, fmtHours, maxHoursFor, usd, type AddOnId, type PriceBook, type TierId } from "@/lib/commission";
import { contentOf, photosCell, pkgBullets, pkgField, pkgL } from "@/lib/package-text";

/* ------------------------------------------------------------------ */
/* Hero plates                                                          */
/* ------------------------------------------------------------------ */

/**
 * The two built-in hero photographs (real TX Quince frames from the public
 * portfolio, see src/content/portfolio-fallback.ts). An image-slot override
 * or a Photo dump swap replaces either one.
 *
 * There is deliberately no client name or invented place here: the homepage
 * gallery comes from the real portfolio (src/lib/home-galleries.ts), never
 * from hand-written records.
 */
export type HeroPlate = {
  src: string;
  width: number;
  height: number;
  /** object-position for cropped frames */
  focus: string;
  alt: L;
};

export const HERO_PLATES = {
  a: {
    src: "/portfolio/hero.webp",
    width: 1440,
    height: 1920,
    focus: "50% 58%",
    alt: {
      en: "Quinceañera in a blush ball gown beneath a gilded, hand-painted ceiling dome and crystal chandelier",
      es: "Quinceañera con vestido rosa palo bajo una cúpula dorada pintada a mano y un candelabro de cristal",
    },
  },
  b: {
    src: "/portfolio/canal.webp",
    width: 720,
    height: 1080,
    focus: "34% 55%",
    alt: {
      en: "Quinceañera in a bright pink gown posing by a stone railing at the Mandalay Canal Walk in Irving",
      es: "Quinceañera con vestido rosa junto a un barandal de piedra en el Mandalay Canal de Irving",
    },
  },
} as const satisfies Record<"a" | "b", HeroPlate>;

/* ------------------------------------------------------------------ */
/* Cinema Room                                                         */
/* ------------------------------------------------------------------ */

/** A real film from the admin video library (see films.ts). */
export type CinemaFilm = {
  id: string;
  /** May be empty — the UI falls back to a generic label. */
  title: string;
  provider: "youtube" | "vimeo" | "file" | "link";
  /** iframe src (YouTube/Vimeo, autoplay on open) or a direct video file URL. */
  embed: string;
  poster: string | null;
  /** Lower-res poster to swap in when the max-res still doesn't exist. */
  fallbackPoster: string | null;
  vertical: boolean;
  feature: boolean;
};

/* ------------------------------------------------------------------ */
/* Commissions                                                         */
/* ------------------------------------------------------------------ */

// Names and deliverables live here; every PRICE and hour count lives in the
// live price book (PriceBook — read with usePriceBook() on the client and
// getPriceBook() on the server), so the server re-prices every checkout.
export type { TierId, AddOnId } from "@/lib/commission";

export type Tier = {
  id: TierId;
  numeral: string;
  name: L;
  /** The package we suggest to most families (badge on its card). */
  recommended?: boolean;
  scope: "stills" | "both";
};

/*
 * What each package INCLUDES (card paragraph, card points, team, photo count,
 * film, album …) is not here: it is wording in the live price book
 * (src/lib/package-content.ts, edited at /admin/packages). Read it with
 * tierSummary / tierBullets / matrixFor below, or src/lib/package-text.ts.
 */
export const TIERS: Tier[] = [
  { id: "study", numeral: "I.", name: { en: "Portrait Session", es: "Sesión de retratos" }, scope: "stills" },
  { id: "moments", numeral: "II.", name: { en: "Just the Moments", es: "Los Momentos" }, scope: "stills" },
  { id: "solo", numeral: "III.", name: { en: "The Solo", es: "El Solo" }, scope: "both" },
  { id: "cinema", numeral: "IV.", name: { en: "The Duo", es: "El Dúo" }, scope: "both" },
  { id: "trio", numeral: "V.", name: { en: "The Trio", es: "El Trío" }, recommended: true, scope: "both" },
];

export const RETIRED_TIERS: Tier[] = [
  { id: "production", numeral: "VI.", name: { en: "Full Celebration", es: "Celebración completa" }, scope: "both" },
  { id: "archive", numeral: "VII.", name: { en: "Two-Day Celebration", es: "Celebración de dos días" }, scope: "both" },
];

/** The package card paragraph, from the live wording. */
export const tierSummary = (book: PriceBook, id: TierId): L => pkgL(book, id, contentOf(book, id).summary);
/** The package card points, from the live wording. */
export const tierBullets = (book: PriceBook, id: TierId): L[] => pkgBullets(book, id);
/** The short line on the home page package list. */
export const tierDetail = (book: PriceBook, id: TierId): L => pkgL(book, id, contentOf(book, id).detail);
/** Who comes, from the live wording ("1 photographer + 1 videographer"). */
export const tierTeam = (book: PriceBook, id: TierId): L => pkgL(book, id, contentOf(book, id).team);
/** A package's live name (edited at /admin/packages); the static TIERS names are only the launch defaults. */
export const tierNameL = (book: PriceBook, id: TierId): L => contentOf(book, id).name;

export type MatrixRow = { label: L; values: Record<TierId, L | null> };
export type MatrixGroup = { id: string; title: L; rows: MatrixRow[] };

const v = (en: string, es: string = en): L => ({ en, es });
const ALL_TIERS = [...TIERS, ...RETIRED_TIERS].map((t) => t.id);
const row = (label: L, cell: (id: TierId) => L | null): MatrixRow => ({
  label,
  values: Object.fromEntries(ALL_TIERS.map((id) => [id, cell(id)])) as Record<TierId, L | null>,
});

/** "6 hours" / "6 horas", plus how far it can grow (from the live book). */
const hoursCell = (book: PriceBook, tier: TierId): L => {
  const base = fmtHours(book.packages[tier].hours);
  const en = base === "1" ? "1 hour" : `${base} hours`;
  const es = base === "1" ? "1 hora" : `${base} horas`;
  if (!canAddHours(book, tier)) {
    return tier === "archive" ? v(`${base} hours, both days`, `${base} horas, ambos días`) : v(en, es);
  }
  const max = fmtHours(maxHoursFor(book, tier));
  return v(`${en} (add up to ${max})`, `${es} (hasta ${max})`);
};

/** An extra the package can add, priced from the live book: "Add … for $500". */
const offerCell = (book: PriceBook, tier: TierId, id: AddOnId, en: string, es: string): L | null =>
  addOnAllowed(tier, id) ? v(`${en} ${usd(book.addOns[id])}`, `${es} ${usd(book.addOns[id])}`) : null;

/**
 * The comparison table. Hours come from the live prices; every inclusion
 * comes from the live wording (an empty field = not included). Where a
 * package doesn't include something but can add it, the cell offers the
 * extra at its live price.
 */
export const matrixFor = (book: PriceBook): MatrixGroup[] => [
  {
    id: "coverage",
    title: { en: "Your day", es: "Tu día" },
    rows: [
      row(v("Hours", "Horas"), (id) => hoursCell(book, id)),
      row(v("Your team", "Tu equipo"), (id) => pkgField(book, id, "team")),
      row(v("Coordinator who runs the day", "Coordinadora que lleva el día"), (id) =>
        COORDINATOR_INCLUDED[id]
          ? id === "archive"
            ? v("Included, both days", "Incluida, ambos días")
            : v("Included", "Incluida")
          : coordinatorCell(book, id),
      ),
      row(v("Dress or save-the-date session", "Sesión con el vestido o de save the date"), (id) => pkgField(book, id, "session")),
    ],
  },
  {
    id: "motion",
    title: { en: "Video", es: "Video" },
    rows: [
      row(v("Full-length film", "Video completo"), (id) =>
        pkgField(book, id, "video") ?? offerCell(book, id, "momentsfilm", "Add a film of the presentation for", "Agrega un video de la presentación por"),
      ),
      row(v("Highlight video", "Video resumen"), (id) =>
        pkgField(book, id, "highlight") ?? offerCell(book, id, "highlight", "Add a 3–5 min film for", "Agrega uno de 3–5 min por"),
      ),
      row(v("Short videos for social media", "Videos cortos para redes"), (id) => pkgField(book, id, "social")),
    ],
  },
  {
    id: "print",
    title: { en: "Photos & album", es: "Fotos y álbum" },
    rows: [
      row(v("Edited photos", "Fotos editadas"), (id) => photosCell(book, id)),
      row(v("Printed photo album", "Álbum de fotos impreso"), (id) => pkgField(book, id, "album")),
      row(v("All your original files", "Todos tus archivos originales"), (id) => pkgField(book, id, "files")),
    ],
  },
];

/** The coordinator is an extra on most packages: "Add for $500 a day", priced from the live book. */
const coordinatorCell = (book: PriceBook, tier: TierId): L | null =>
  addOnAllowed(tier, "coordinator")
    ? v(`Add for ${usd(book.addOns.coordinator)} a day`, `Agrégala por ${usd(book.addOns.coordinator)} al día`)
    : null;

/** The extras. What each one is (its description) is wording in the live book: addOnNote(book, id). */
export type AddOn = { id: AddOnId; name: L };

export const ADD_ONS: AddOn[] = [
  { id: "momentsfilm", name: { en: "Presentation Film", es: "Video de la presentación" } },
  { id: "destination", name: { en: "Dress Session", es: "Sesión con el vestido" } },
  { id: "sameday", name: { en: "Same-Day Edit", es: "Edición el mismo día" } },
  { id: "super8", name: { en: "Vintage Film Clip", es: "Clip de película vintage" } },
  { id: "parents", name: { en: "Albums for Mom & Dad", es: "Álbumes para mamá y papá" } },
  { id: "secondday", name: { en: "Second Portrait Day", es: "Segundo día de retratos" } },
  { id: "coordinator", name: { en: "Day-of Coordinator", es: "Coordinadora del día" } },
  { id: "highlight", name: { en: "Highlight Film (3–5 min)", es: "Video resumen (3–5 min)" } },
];

export const tierById = (id: TierId) => [...TIERS, ...RETIRED_TIERS].find((t) => t.id === id)!;

export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ------------------------------------------------------------------ */
/* Intake                                                              */
/* ------------------------------------------------------------------ */

export const CITIES: { id: string; label: L }[] = [
  { id: "dfw", label: v("Dallas–Fort Worth") },
  { id: "hou", label: v("Houston") },
  { id: "atx", label: v("Austin") },
  { id: "satx", label: v("San Antonio") },
  { id: "other", label: v("Elsewhere in Texas", "Otra ciudad de Texas") },
];

export type Scope = "both" | "stills" | "motion";
export const SCOPES: { id: Scope; label: L }[] = [
  { id: "both", label: v("Photos + video", "Fotos + video") },
  { id: "stills", label: v("Photos only", "Solo fotos") },
  { id: "motion", label: v("Video only", "Solo video") },
];
