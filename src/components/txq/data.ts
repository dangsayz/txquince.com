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

import {
  ADD_ON_PRICE_USD,
  BASE_HOURS,
  MAX_HOURS,
  TIER_PRICE_USD,
  quoteCommission,
  type AddOnId,
  type TierId,
} from "@/lib/commission";

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

const M = {
  medium: { en: "Medium Format", es: "Formato medio" },
  film: { en: "35mm + Digital", es: "35mm + Digital" },
  motion: { en: "Digital + Motion", es: "Digital + Cine" },
  digital: { en: "Digital", es: "Digital" },
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

// Prices live in the shared price book so the server re-prices every checkout.
export type { TierId, AddOnId } from "@/lib/commission";

export type Tier = {
  id: TierId;
  numeral: string;
  name: L;
  summary: L;
  price: number;
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
    price: TIER_PRICE_USD.study,
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
    price: TIER_PRICE_USD.cinema,
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
    price: TIER_PRICE_USD.production,
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
    price: TIER_PRICE_USD.archive,
    scope: "both",
  },
];

export type MatrixRow = { label: L; values: Record<TierId, L | null> };
export type MatrixGroup = { id: string; title: L; rows: MatrixRow[] };

const v = (en: string, es: string = en): L => ({ en, es });

/** "6 hours" / "6 horas", plus how far it can grow. */
const hoursCell = (tier: TierId): L => {
  const base = BASE_HOURS[tier];
  if (base >= MAX_HOURS) return v(`${base} hours, both days`, `${base} horas, ambos días`);
  return v(`${base} hours (add up to ${MAX_HOURS})`, `${base} horas (hasta ${MAX_HOURS})`);
};

export const MATRIX: MatrixGroup[] = [
  {
    id: "coverage",
    title: { en: "Your day", es: "Tu día" },
    rows: [
      {
        label: v("Hours", "Horas"),
        values: {
          study: hoursCell("study"),
          cinema: hoursCell("cinema"),
          production: hoursCell("production"),
          archive: hoursCell("archive"),
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

export type AddOn = { id: AddOnId; name: L; note: L; price: number };

export const ADD_ONS: AddOn[] = [
  {
    id: "destination",
    name: { en: "Extra Portrait Session", es: "Sesión de retratos extra" },
    note: {
      en: "A second portrait session anywhere in Texas — Galveston, the Hill Country, wherever she loves.",
      es: "Una segunda sesión de retratos en cualquier parte de Texas — Galveston, el Hill Country, donde ella quiera.",
    },
    price: ADD_ON_PRICE_USD.destination,
  },
  {
    id: "sameday",
    name: { en: "Same-Night Highlight Video", es: "Video resumen la misma noche" },
    note: {
      en: "A 2-minute video of her day, played for your guests before the party ends.",
      es: "Un video de 2 minutos de su día, proyectado para tus invitados antes de que termine la fiesta.",
    },
    price: ADD_ON_PRICE_USD.sameday,
  },
  {
    id: "super8",
    name: { en: "Vintage Film Clip", es: "Clip de película vintage" },
    note: {
      en: "Three minutes shot on real old-style film (Super 8), added to her video.",
      es: "Tres minutos grabados en película antigua de verdad (Super 8), dentro de su video.",
    },
    price: ADD_ON_PRICE_USD.super8,
  },
  {
    id: "parents",
    name: { en: "Albums for Mom & Dad", es: "Álbumes para mamá y papá" },
    note: {
      en: "Two smaller 8×8 copies of her album, one for each home.",
      es: "Dos copias más pequeñas de 20×20 cm de su álbum, una para cada hogar.",
    },
    price: ADD_ON_PRICE_USD.parents,
  },
];

export const tierById = (id: TierId) => TIERS.find((t) => t.id === id)!;

export function estimate(tier: TierId, addOns: AddOnId[], hours?: number) {
  return quoteCommission(tier, addOns, hours).totalUsd;
}

export function retainer(tier: TierId, addOns: AddOnId[], hours?: number) {
  return quoteCommission(tier, addOns, hours).retainerUsd;
}

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
  { id: "both", label: v("Stills + Motion", "Foto + Cine") },
  { id: "stills", label: v("Stills Only", "Solo foto") },
  { id: "motion", label: v("Motion Only", "Solo cine") },
];
