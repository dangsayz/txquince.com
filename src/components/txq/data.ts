/**
 * TX Quince — content model for the editorial site.
 *
 * Every user-facing string that belongs to a record (a work, a film, a tier)
 * is stored as { en, es } so the language toggle swaps it in place. UI chrome
 * strings live in ./copy.ts.
 *
 * Subjects, places and prices below are launch placeholders: swap in real
 * client credits (with consent) and final pricing before going live.
 */

export type Lang = "en" | "es";
export type L = { en: string; es: string };

export const pick = (lang: Lang, v: L) => v[lang];

import { canAddHours, type AddOnId, type PriceBook, type TierId } from "@/lib/commission";

/* ------------------------------------------------------------------ */
/* Archive                                                             */
/* ------------------------------------------------------------------ */

export type Category = "couture" | "ceremony" | "fiesta" | "editorial";

export type Work = {
  id: string;
  subject: string;
  place: L;
  medium: L;
  year: number;
  category: Category;
  src: string;
  width: number;
  height: number;
  /** object-position for cropped frames */
  focus: string;
  alt: L;
};

/** What each work is, in plain words (shown at the end of its caption). */
const M = {
  medium: { en: "Portrait", es: "Retrato" },
  film: { en: "Portrait", es: "Retrato" },
  motion: { en: "Photo + video", es: "Foto + video" },
  digital: { en: "Photo", es: "Foto" },
} satisfies Record<string, L>;

export const WORKS: Work[] = [
  {
    id: "w01",
    subject: "Sofía M.",
    place: { en: "Gilded Salon, Dallas", es: "Salón Dorado, Dallas" },
    medium: M.medium,
    year: 2026,
    category: "couture",
    src: "/portfolio/hero.webp",
    width: 1440,
    height: 1920,
    focus: "50% 58%",
    alt: {
      en: "Quinceañera in a blush ball gown beneath a gilded, hand-painted ceiling dome and crystal chandelier",
      es: "Quinceañera con vestido rosa palo bajo una cúpula dorada pintada a mano y un candelabro de cristal",
    },
  },
  {
    id: "w02",
    subject: "Ximena R.",
    place: { en: "Limestone Stair, San Antonio", es: "Escalera de piedra, San Antonio" },
    medium: M.film,
    year: 2026,
    category: "editorial",
    src: "/portfolio/canal.webp",
    width: 720,
    height: 1080,
    focus: "34% 55%",
    alt: {
      en: "Quinceañera in a fuchsia gown with a long train seated on a limestone stair",
      es: "Quinceañera con vestido fucsia de cola larga sentada en una escalera de piedra caliza",
    },
  },
  {
    id: "w03",
    subject: "Familia Torres",
    place: { en: "Folklórico Hall, Houston", es: "Salón folclórico, Houston" },
    medium: M.motion,
    year: 2025,
    category: "fiesta",
    src: "/portfolio/dance.webp",
    width: 719,
    height: 1080,
    focus: "50% 42%",
    alt: {
      en: "Folklórico dancers mid-turn, striped skirts fanned wide under papel picado",
      es: "Bailarinas de folclor girando, faldas a rayas abiertas bajo papel picado",
    },
  },
  {
    id: "w04",
    subject: "Renata G.",
    place: { en: "Stone Portico, Fort Worth", es: "Pórtico de piedra, Fort Worth" },
    medium: M.medium,
    year: 2026,
    category: "ceremony",
    src: "/portfolio/lilac-arch.webp",
    width: 810,
    height: 1080,
    focus: "45% 62%",
    alt: {
      en: "Quinceañera in a lilac gown walking toward an arched stone doorway",
      es: "Quinceañera con vestido lila caminando hacia una puerta de piedra en arco",
    },
  },
  {
    id: "w05",
    subject: "Camila S.",
    place: { en: "Garden Terrace, Dallas", es: "Terraza jardín, Dallas" },
    medium: M.film,
    year: 2025,
    category: "editorial",
    src: "/portfolio/red-garden.webp",
    width: 720,
    height: 1080,
    focus: "50% 60%",
    alt: {
      en: "Quinceañera in a crimson gown and sarape shawl holding a bright bouquet in a garden",
      es: "Quinceañera con vestido carmesí y rebozo de sarape sosteniendo un ramo en un jardín",
    },
  },
  {
    id: "w06",
    subject: "Kimberly",
    place: { en: "Father–Daughter Waltz, Arlington", es: "Vals con papá, Arlington" },
    medium: M.motion,
    year: 2025,
    category: "fiesta",
    src: "/portfolio/kimberly-reception.webp",
    width: 719,
    height: 1080,
    focus: "60% 60%",
    alt: {
      en: "Father embracing his daughter in a black gown on the dance floor beneath marquee letters",
      es: "Un padre abraza a su hija con vestido negro en la pista bajo letras luminosas",
    },
  },
  {
    id: "w07",
    subject: "Valeria T.",
    place: { en: "The Shoe Ceremony, Grand Prairie", es: "Cambio de zapatilla, Grand Prairie" },
    medium: M.digital,
    year: 2026,
    category: "ceremony",
    src: "/portfolio/shoe-ceremony.webp",
    width: 719,
    height: 1080,
    focus: "50% 62%",
    alt: {
      en: "Quinceañera in a black gown during the shoe ceremony under stage lights",
      es: "Quinceañera con vestido negro durante el cambio de zapatilla bajo luces de escenario",
    },
  },
  {
    id: "w08",
    subject: "Daniela P.",
    place: { en: "Limestone Garden, Austin", es: "Jardín de piedra, Austin" },
    medium: M.medium,
    year: 2026,
    category: "couture",
    src: "/portfolio/save-date.webp",
    width: 810,
    height: 1080,
    focus: "50% 70%",
    alt: {
      en: "Quinceañera in a red gown seated on a stone wall beneath tall oaks and open sky",
      es: "Quinceañera con vestido rojo sentada en un muro de piedra bajo robles y cielo abierto",
    },
  },
  {
    id: "w09",
    subject: "Ariana L.",
    place: { en: "Prickly Pear Garden, Fort Worth", es: "Jardín de nopales, Fort Worth" },
    medium: M.film,
    year: 2025,
    category: "couture",
    src: "/portfolio/stockyards.webp",
    width: 720,
    height: 1080,
    focus: "50% 64%",
    alt: {
      en: "Quinceañera in a rose-gold gown and tiara seated before a wall of prickly pear cactus at dusk",
      es: "Quinceañera con vestido oro rosa y tiara frente a un muro de nopales al atardecer",
    },
  },
  {
    id: "w10",
    subject: "Natalia C.",
    place: { en: "White Gallery, Houston", es: "Galería blanca, Houston" },
    medium: M.digital,
    year: 2026,
    category: "editorial",
    src: "/portfolio/reception.webp",
    width: 719,
    height: 1080,
    focus: "50% 40%",
    alt: {
      en: "Quinceañera in a pale pink corseted gown in a bright white corridor",
      es: "Quinceañera con vestido rosa pálido de corsé en un pasillo blanco y luminoso",
    },
  },
];

export const workById = (id: string) => WORKS.find((w) => w.id === id)!;

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
    name: { en: "Photo + Video", es: "Foto + Video" },
    summary: {
      en: "One photographer and one videographer for the celebration, so you get the photos and the video.",
      es: "Un fotógrafo y un videógrafo en la celebración, para que tengas las fotos y el video.",
    },
    bullets: [
      { en: "Photos and video of the celebration", es: "Fotos y video de la celebración" },
      { en: "An 8–10 minute video and a 1-minute trailer", es: "Un video de 8–10 minutos y un tráiler de 1 minuto" },
      { en: "400+ edited photos", es: "Más de 400 fotos editadas" },
      { en: "2 short videos for social media", es: "2 videos cortos para redes" },
    ],
    scope: "both",
  },
  {
    id: "production",
    numeral: "III.",
    name: { en: "Full Celebration", es: "Celebración completa" },
    summary: {
      en: "The one we recommend most. A team of four plus a coordinator who runs the day, so you can enjoy it. Includes a portrait session and a printed album.",
      es: "La que más recomendamos. Un equipo de cuatro más una coordinadora que lleva el día, para que tú lo disfrutes. Incluye sesión de retratos y álbum impreso.",
    },
    bullets: [
      { en: "A coordinator who runs the day", es: "Una coordinadora que lleva el día" },
      { en: "A portrait session at 1 location", es: "Una sesión de retratos en 1 lugar" },
      { en: "A 12–15 minute video and a 90-second trailer", es: "Un video de 12–15 minutos y un tráiler de 90 segundos" },
      { en: "700+ photos and a printed album", es: "Más de 700 fotos y un álbum impreso" },
    ],
    recommended: true,
    scope: "both",
  },
  {
    id: "archive",
    numeral: "IV.",
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
          production: hoursCell(book, "production"),
          archive: hoursCell(book, "archive"),
        },
      },
      {
        label: v("Your team", "Tu equipo"),
        values: {
          study: v("1 photographer", "1 fotógrafo"),
          cinema: v("1 photographer + 1 videographer", "1 fotógrafo + 1 videógrafo"),
          production: v("4 people — you pick photo or video", "4 personas — tú eliges foto o video"),
          archive: v("5 people — you pick photo or video", "5 personas — tú eliges foto o video"),
        },
      },
      {
        label: v("Coordinator who runs the day", "Coordinadora que lleva el día"),
        values: {
          study: null,
          cinema: null,
          production: v("Included", "Incluida"),
          archive: v("Included, both days", "Incluida, ambos días"),
        },
      },
      {
        label: v("Portrait session", "Sesión de retratos"),
        values: {
          study: v("Yes — that's this package", "Sí — es este paquete"),
          cinema: null,
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
        label: v("Full-length video", "Video completo"),
        values: {
          study: null,
          cinema: v("8–10 minutes", "8–10 minutos"),
          production: v("12–15 minutes", "12–15 minutos"),
          archive: v("20 minutes", "20 minutos"),
        },
      },
      {
        label: v("Short trailer", "Tráiler corto"),
        values: {
          study: null,
          cinema: v("1 minute", "1 minuto"),
          production: v("90 seconds", "90 segundos"),
          archive: v("2 minutes", "2 minutos"),
        },
      },
      {
        label: v("Short videos for social media", "Videos cortos para redes"),
        values: {
          study: v("1", "1"),
          cinema: v("2", "2"),
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
          production: v("700+", "700+"),
          archive: v("1,000+", "1,000+"),
        },
      },
      {
        label: v("Printed photo album", "Álbum de fotos impreso"),
        values: {
          study: null,
          cinema: null,
          production: v("10×10 in, 40 pages", "25×25 cm, 40 páginas"),
          archive: v("12×12 in, 60 pages, gift box", "30×30 cm, 60 páginas, caja de regalo"),
        },
      },
      {
        label: v("All your original files", "Todos tus archivos originales"),
        values: {
          study: null,
          cinema: null,
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
];

export const tierById = (id: TierId) => TIERS.find((t) => t.id === id)!;

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
