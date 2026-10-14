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

export type Film = {
  id: string;
  title: L;
  kind: L;
  /** seconds */
  duration: number;
  /** stills sequenced into the screening preview */
  frames: string[];
  spec: string;
};

export const FEATURE: Film = {
  id: "feature",
  title: { en: "Sofía, at Fifteen", es: "Sofía, a los quince" },
  kind: { en: "Feature film", es: "Largometraje" },
  duration: 6 * 60 + 24,
  frames: ["w01", "w03", "w06", "w07", "w04"],
  spec: "4K · 2.39:1 · 24 FPS",
};

export const REELS: Film[] = [
  {
    id: "entrada",
    title: { en: "La Entrada", es: "La Entrada" },
    kind: { en: "Vertical cut", es: "Corte vertical" },
    duration: 42,
    frames: ["w04", "w02"],
    spec: "9:16 · 4K",
  },
  {
    id: "teaser",
    title: { en: "Ximena — Teaser", es: "Ximena — Avance" },
    kind: { en: "Theatrical teaser", es: "Avance cinematográfico" },
    duration: 68,
    frames: ["w02", "w05", "w08"],
    spec: "2.39:1 · 4K",
  },
  {
    id: "vals",
    title: { en: "El Vals", es: "El Vals" },
    kind: { en: "Vertical cut", es: "Corte vertical" },
    duration: 36,
    frames: ["w06", "w10"],
    spec: "9:16 · 4K",
  },
];

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
    name: { en: "Portrait Study", es: "Estudio de retrato" },
    summary: {
      en: "A single unhurried session before the celebration. Couture, light, and her.",
      es: "Una sola sesión sin prisa antes de la celebración. Vestido, luz y ella.",
    },
    price: TIER_PRICE_USD.study,
    scope: "stills",
  },
  {
    id: "cinema",
    numeral: "II.",
    name: { en: "Cinema & Stills", es: "Cine y fotografía" },
    summary: {
      en: "The day, told twice: once in frames, once in motion, by two directors.",
      es: "El día, contado dos veces: en imágenes y en movimiento, por dos directores.",
    },
    price: TIER_PRICE_USD.cinema,
    scope: "both",
  },
  {
    id: "production",
    numeral: "III.",
    name: { en: "The Full Production", es: "La producción completa" },
    summary: {
      en: "Portrait session, Mass, and fiesta under one crew, bound in linen.",
      es: "Sesión de retrato, misa y fiesta con un solo equipo, encuadernado en lino.",
    },
    price: TIER_PRICE_USD.production,
    scope: "both",
  },
  {
    id: "archive",
    numeral: "IV.",
    name: { en: "Multi-Day Editorial Archive", es: "Archivo editorial de varios días" },
    summary: {
      en: "From the dress fitting to the last song. A documentary of the whole season.",
      es: "De la prueba del vestido a la última canción. Un documental de toda la temporada.",
    },
    price: TIER_PRICE_USD.archive,
    scope: "both",
  },
];

export type MatrixRow = { label: L; values: Record<TierId, L | null> };
export type MatrixGroup = { id: string; title: L; rows: MatrixRow[] };

const v = (en: string, es: string = en): L => ({ en, es });

export const MATRIX: MatrixGroup[] = [
  {
    id: "coverage",
    title: { en: "Coverage & Direction", es: "Cobertura y dirección" },
    rows: [
      {
        label: v("Hours of coverage", "Horas de cobertura"),
        values: {
          study: v("3 hrs, one session", "3 h, una sesión"),
          cinema: v("8 hrs", "8 h"),
          production: v("11 hrs", "11 h"),
          archive: v("2 days + 12 hrs", "2 días + 12 h"),
        },
      },
      {
        label: v("Lead director", "Director principal"),
        values: {
          study: v("Stills", "Foto"),
          cinema: v("Stills", "Foto"),
          production: v("Stills", "Foto"),
          archive: v("Stills", "Foto"),
        },
      },
      {
        label: v("Second director", "Segundo director"),
        values: {
          study: null,
          cinema: v("Motion", "Cine"),
          production: v("Motion + second stills", "Cine + segunda foto"),
          archive: v("Full crew of four", "Equipo completo de cuatro"),
        },
      },
      {
        label: v("Portrait session", "Sesión de retrato"),
        values: {
          study: v("The session itself", "La sesión misma"),
          cinema: null,
          production: v("One location", "Una locación"),
          archive: v("Two locations", "Dos locaciones"),
        },
      },
    ],
  },
  {
    id: "motion",
    title: { en: "Motion Deliverables", es: "Entregas de cine" },
    rows: [
      {
        label: v("4K feature cut", "Largometraje 4K"),
        values: {
          study: null,
          cinema: v("8–10 min", "8–10 min"),
          production: v("12–15 min", "12–15 min"),
          archive: v("20 min documentary", "Documental de 20 min"),
        },
      },
      {
        label: v("Theatrical teaser", "Avance cinematográfico"),
        values: {
          study: null,
          cinema: v("60 sec", "60 s"),
          production: v("90 sec", "90 s"),
          archive: v("2 min trailer", "Tráiler de 2 min"),
        },
      },
      {
        label: v("Vertical reels", "Reels verticales"),
        values: {
          study: v("1 motion portrait", "1 retrato en movimiento"),
          cinema: v("2 cuts", "2 cortes"),
          production: v("4 cuts", "4 cortes"),
          archive: v("6 cuts, 48-hr preview", "6 cortes, avance en 48 h"),
        },
      },
    ],
  },
  {
    id: "print",
    title: { en: "Print & Archival", es: "Impresión y archivo" },
    rows: [
      {
        label: v("Retouched selects", "Selección retocada"),
        values: {
          study: v("60 frames", "60 imágenes"),
          cinema: v("400+ frames", "400+ imágenes"),
          production: v("700+ frames", "700+ imágenes"),
          archive: v("1,000+ frames", "1,000+ imágenes"),
        },
      },
      {
        label: v("Linen heirloom monograph", "Monografía de lino"),
        values: {
          study: null,
          cinema: null,
          production: v("10×10 in, 40 pp", "25×25 cm, 40 pp"),
          archive: v("12×12 in, 60 pp, slipcase", "30×30 cm, 60 pp, estuche"),
        },
      },
      {
        label: v("Raw archive delivery", "Entrega del archivo crudo"),
        values: {
          study: null,
          cinema: null,
          production: v("Stills", "Foto"),
          archive: v("Stills + motion, two drives", "Foto + cine, dos discos"),
        },
      },
    ],
  },
];

export type AddOn = { id: AddOnId; name: L; note: L; price: number };

export const ADD_ONS: AddOn[] = [
  {
    id: "destination",
    name: { en: "Pre-Event Destination Portrait Session", es: "Sesión de retrato en destino" },
    note: {
      en: "A half-day anywhere in Texas: Marfa, Galveston, the Hill Country.",
      es: "Medio día en cualquier parte de Texas: Marfa, Galveston, el Hill Country.",
    },
    price: ADD_ON_PRICE_USD.destination,
  },
  {
    id: "sameday",
    name: { en: "Same-Day Reception Edit", es: "Edición el mismo día" },
    note: {
      en: "A two-minute film screened for your guests before the last dance.",
      es: "Una película de dos minutos proyectada antes del último baile.",
    },
    price: ADD_ON_PRICE_USD.sameday,
  },
  {
    id: "super8",
    name: { en: "Super 8mm Film Roll", es: "Rollo de Super 8" },
    note: {
      en: "Three minutes of real film, grain and all, cut into the feature.",
      es: "Tres minutos de película real, con todo y grano, dentro del largometraje.",
    },
    price: ADD_ON_PRICE_USD.super8,
  },
  {
    id: "parents",
    name: { en: "Fine Art Parent Albums", es: "Álbumes de arte para padres" },
    note: {
      en: "Two 8×8 linen companions to the monograph, one for each household.",
      es: "Dos álbumes de lino de 20×20 cm, uno para cada hogar.",
    },
    price: ADD_ON_PRICE_USD.parents,
  },
];

export const tierById = (id: TierId) => TIERS.find((t) => t.id === id)!;

export function estimate(tier: TierId, addOns: AddOnId[]) {
  return quoteCommission(tier, addOns).totalUsd;
}

export function retainer(tier: TierId, addOns: AddOnId[]) {
  return quoteCommission(tier, addOns).retainerUsd;
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
