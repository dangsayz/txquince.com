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

import { canAddHours, usd, type AddOnId, type PriceBook, type TierId } from "@/lib/commission";

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
  summary: L;
  /** Three or four plain-language points for the package card (prices and hours come from the book). */
  bullets: L[];
  /** The package we suggest to most families (badge on its card). */
  recommended?: boolean;
  scope: "stills" | "both";
};

export const TIERS: Tier[] = [
  {
    id: "study",
    numeral: "I.",
    name: { en: "Portrait Session", es: "Sesión de retratos" },
    summary: {
      en: "Photos only. A relaxed session before the big day — her dress, her style, beautiful light.",
      es: "Solo fotos. Una sesión tranquila antes del gran día — su vestido, su estilo, luz hermosa.",
    },
    bullets: [
      { en: "Photos only — no video", es: "Solo fotos — sin video" },
      { en: "A relaxed session in her dress, before the big day", es: "Una sesión tranquila con su vestido, antes del gran día" },
      { en: "60 edited photos", es: "60 fotos editadas" },
    ],
    scope: "stills",
  },
  {
    id: "cinema",
    numeral: "II.",
    name: { en: "The Duo", es: "El Dúo" },
    summary: {
      en: "One photographer and one videographer for her day, plus a dress or save-the-date session: the photos, and the full-length film of everything that happened.",
      es: "Un fotógrafo y un videógrafo para su día, más una sesión con el vestido o de save the date: las fotos y el video completo de todo lo que pasó.",
    },
    bullets: [
      { en: "1 photographer + 1 videographer", es: "1 fotógrafo + 1 videógrafo" },
      { en: "A dress or save-the-date session, booked after your deposit", es: "Una sesión con el vestido o de save the date, después de tu depósito" },
      { en: "The full-length film of her day + a 1-minute highlight", es: "El video completo de su día + un resumen de 1 minuto" },
      { en: "400+ edited photos", es: "Más de 400 fotos editadas" },
    ],
    scope: "both",
  },
  {
    id: "trio",
    numeral: "III.",
    name: { en: "The Trio", es: "El Trío" },
    summary: {
      en: "Two photographers and one videographer, so both sides of the room are covered while the film rolls, plus a dress or save-the-date session and a printed album. Our pick for most families.",
      es: "Dos fotógrafos y un videógrafo, para cubrir los dos lados del salón mientras se graba el video, más una sesión con el vestido o de save the date y un álbum impreso. Nuestra recomendación para la mayoría de las familias.",
    },
    bullets: [
      { en: "2 photographers + 1 videographer", es: "2 fotógrafos + 1 videógrafo" },
      { en: "A dress or save-the-date session, booked after your deposit", es: "Una sesión con el vestido o de save the date, después de tu depósito" },
      { en: "The full-length film + a 3–5 minute highlight film", es: "El video completo + un resumen de 3–5 minutos" },
      { en: "700+ photos and a printed album", es: "Más de 700 fotos y un álbum impreso" },
    ],
    recommended: true,
    scope: "both",
  },
];

export const RETIRED_TIERS: Tier[] = [
  {
    id: "production",
    numeral: "IV.",
    name: { en: "Full Celebration", es: "Celebración completa" },
    summary: {
      en: "A team of four plus a coordinator who runs the day, so you can enjoy it. Includes a portrait session and a printed album.",
      es: "Un equipo de cuatro más una coordinadora que lleva el día, para que tú lo disfrutes. Incluye sesión de retratos y álbum impreso.",
    },
    bullets: [
      { en: "A coordinator who runs the day", es: "Una coordinadora que lleva el día" },
      { en: "A portrait session at 1 location", es: "Una sesión de retratos en 1 lugar" },
      { en: "The full-length film + a 3–5 minute highlight film", es: "El video completo + un resumen de 3–5 minutos" },
      { en: "700+ photos and a printed album", es: "Más de 700 fotos y un álbum impreso" },
    ],
    scope: "both",
  },
  {
    id: "archive",
    numeral: "V.",
    name: { en: "Two-Day Celebration", es: "Celebración de dos días" },
    summary: {
      en: "Everything in the Full Celebration, plus a second day for portraits, a team of five, and a larger album.",
      es: "Todo lo de la Celebración completa, más un segundo día de retratos, un equipo de cinco y un álbum más grande.",
    },
    bullets: [
      { en: "Everything in the Full Celebration", es: "Todo lo de la Celebración completa" },
      { en: "A second day for portraits at 2 locations", es: "Un segundo día de retratos en 2 lugares" },
      { en: "A 20-minute video and a 2-minute trailer", es: "Un video de 20 minutos y un tráiler de 2 minutos" },
      { en: "1,000+ photos and a large album in a gift box", es: "Más de 1,000 fotos y un álbum grande en caja de regalo" },
    ],
    scope: "both",
  },
];

export type MatrixRow = { label: L; values: Record<TierId, L | null> };
export type MatrixGroup = { id: string; title: L; rows: MatrixRow[] };

const v = (en: string, es: string = en): L => ({ en, es });

/** "6 hours" / "6 horas", plus how far it can grow (from the live book). */
const hoursCell = (book: PriceBook, tier: TierId): L => {
  const base = book.packages[tier].hours;
  if (!canAddHours(book, tier)) {
    return tier === "archive"
      ? v(`${base} hours, both days`, `${base} horas, ambos días`)
      : v(`${base} hours`, `${base} horas`);
  }
  return v(`${base} hours (add up to ${book.maxHours})`, `${base} horas (hasta ${book.maxHours})`);
};

/** The full-length film: the whole day as it happened, so its length follows her day. */
const FULL_FILM = v(
  "Her whole day: the misa, every presentation and toast in full, 15–20 min of dancing",
  "Todo su día: la misa, cada presentación y brindis completos, 15–20 min de baile",
);

/** The coordinator is an extra now: "Add for $500 a day", priced from the live book. */
const coordinatorCell = (book: PriceBook): L =>
  v(`Add for ${usd(book.addOns.coordinator)} a day`, `Agrégala por ${usd(book.addOns.coordinator)} al día`);

/** The comparison matrix. Hours come from the live price book. */
export const matrixFor = (book: PriceBook): MatrixGroup[] => [
  {
    id: "coverage",
    title: { en: "Your day", es: "Tu día" },
    rows: [
      {
        label: v("Hours", "Horas"),
        values: {
          study: hoursCell(book, "study"),
          cinema: hoursCell(book, "cinema"),
          trio: hoursCell(book, "trio"),
          production: hoursCell(book, "production"),
          archive: hoursCell(book, "archive"),
        },
      },
      {
        label: v("Your team", "Tu equipo"),
        values: {
          study: v("1 photographer", "1 fotógrafo"),
          cinema: v("1 photographer + 1 videographer", "1 fotógrafo + 1 videógrafo"),
          trio: v("2 photographers + 1 videographer (you can switch)", "2 fotógrafos + 1 videógrafo (puedes cambiar)"),
          production: v("4 people — you pick photo or video", "4 personas — tú eliges foto o video"),
          archive: v("5 people — you pick photo or video", "5 personas — tú eliges foto o video"),
        },
      },
      {
        label: v("Coordinator who runs the day", "Coordinadora que lleva el día"),
        values: {
          study: null,
          cinema: coordinatorCell(book),
          trio: coordinatorCell(book),
          production: v("Included", "Incluida"),
          archive: v("Included, both days", "Incluida, ambos días"),
        },
      },
      {
        label: v("Dress or save-the-date session", "Sesión con el vestido o de save the date"),
        values: {
          study: v("Yes — that's this package", "Sí — es este paquete"),
          cinema: v("Included, after your deposit", "Incluida, después del depósito"),
          trio: v("Included, after your deposit", "Incluida, después del depósito"),
          production: v("1 location", "1 lugar"),
          archive: v("2 locations, on its own day", "2 lugares, en su propio día"),
        },
      },
    ],
  },
  {
    id: "motion",
    title: { en: "Video", es: "Video" },
    rows: [
      {
        label: v("Full-length film", "Video completo"),
        values: {
          study: null,
          cinema: FULL_FILM,
          trio: FULL_FILM,
          production: FULL_FILM,
          archive: v("20 minutes", "20 minutos"),
        },
      },
      {
        label: v("Highlight video", "Video resumen"),
        values: {
          study: null,
          cinema: v("1 minute", "1 minuto"),
          trio: v("3–5 minutes", "3–5 minutos"),
          production: v("3–5 minutes", "3–5 minutos"),
          archive: v("2 minutes", "2 minutos"),
        },
      },
      {
        label: v("Short videos for social media", "Videos cortos para redes"),
        values: {
          study: v("1", "1"),
          cinema: v("2", "2"),
          trio: v("4", "4"),
          production: v("4", "4"),
          archive: v("6, first one in 48 hours", "6, el primero en 48 horas"),
        },
      },
    ],
  },
  {
    id: "print",
    title: { en: "Photos & album", es: "Fotos y álbum" },
    rows: [
      {
        label: v("Edited photos", "Fotos editadas"),
        values: {
          study: v("60", "60"),
          cinema: v("400+", "400+"),
          trio: v("700+", "700+"),
          production: v("700+", "700+"),
          archive: v("1,000+", "1,000+"),
        },
      },
      {
        label: v("Printed photo album", "Álbum de fotos impreso"),
        values: {
          study: null,
          cinema: null,
          trio: v("10×10 in, 40 pages", "25×25 cm, 40 páginas"),
          production: v("10×10 in, 40 pages", "25×25 cm, 40 páginas"),
          archive: v("12×12 in, 60 pages, gift box", "30×30 cm, 60 páginas, caja de regalo"),
        },
      },
      {
        label: v("All your original files", "Todos tus archivos originales"),
        values: {
          study: null,
          cinema: null,
          trio: v("Photos", "Fotos"),
          production: v("Photos", "Fotos"),
          archive: v("Photos + video", "Fotos + video"),
        },
      },
    ],
  },
];

export type AddOn = { id: AddOnId; name: L; note: L };

export const ADD_ONS: AddOn[] = [
  {
    id: "destination",
    name: { en: "Dress Session", es: "Sesión con el vestido" },
    note: {
      en: "A photo session in her dress before the big day — a park, a garden, wherever she loves.",
      es: "Una sesión de fotos con su vestido antes del gran día — un parque, un jardín, donde ella quiera.",
    },
  },
  {
    id: "sameday",
    name: { en: "Same-Day Edit", es: "Edición el mismo día" },
    note: {
      en: "A short highlight video of her day, ready within 24 hours to share with family.",
      es: "Un video corto con lo mejor de su día, listo en 24 horas para compartir con la familia.",
    },
  },
  {
    id: "super8",
    name: { en: "Vintage Film Clip", es: "Clip de película vintage" },
    note: {
      en: "Three minutes shot on real old-style film (Super 8), added to her video.",
      es: "Tres minutos grabados en película antigua de verdad (Super 8), dentro de su video.",
    },
  },
  {
    id: "parents",
    name: { en: "Albums for Mom & Dad", es: "Álbumes para mamá y papá" },
    note: {
      en: "Two smaller 8×8 copies of her album, one for each home.",
      es: "Dos copias más pequeñas de 20×20 cm de su álbum, una para cada hogar.",
    },
  },
  {
    id: "secondday",
    name: { en: "Second Portrait Day", es: "Segundo día de retratos" },
    note: {
      en: "A separate day for portraits in her dress, photos and video, at up to 2 locations.",
      es: "Un día aparte para retratos con su vestido, fotos y video, en hasta 2 lugares.",
    },
  },
  {
    id: "coordinator",
    name: { en: "Day-of Coordinator", es: "Coordinadora del día" },
    note: {
      en: "Runs the schedule and lines up the court, so your family can just enjoy the day. Priced per day.",
      es: "Lleva el horario y organiza a la corte, para que tu familia solo disfrute. Precio por día.",
    },
  },
  {
    id: "highlight",
    name: { en: "Highlight Film (3–5 min)", es: "Video resumen (3–5 min)" },
    note: {
      en: "A 3–5 minute highlight film of her day, cut from the same footage as her full-length film.",
      es: "Un resumen de 3–5 minutos de su día, editado con las mismas tomas de su video completo.",
    },
  },
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
