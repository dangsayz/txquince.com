/**
 * media.ts — every photo and clip on the editorial homepage, in one place.
 *
 * Clips are optional. While a `video` entry is null the section shows its
 * poster still (real TX Quince photos), so the page is complete without them.
 * To add a clip: upload it to R2 under `home-film/` (see the film route,
 * src/app/api/photos/film/[name]/route.ts) and fill in its URLs here.
 *
 * Encoding targets (H.264 MP4, plus an optional WebM/AV1 next to it):
 *   hero    16:9, 12–15 s loop · desktop 1920×1080 ≈ 4–5 MB · mobile 1280×720 ≈ 1.5–2 MB
 *   details 3:4, 4–5 s loop    · 900×1200 ≈ 0.4–0.8 MB · mobile 600×800 ≈ 0.25–0.4 MB
 *   band    16:9, 8–12 s loop  · same as the hero
 * Strip audio (-an), `-movflags +faststart` so playback starts before the file
 * finishes downloading. Name files with a version (hero-1080-v2.mp4): they are
 * cached for a year.
 */

export type L = { en: string; es: string };

/** One clip in up to two sizes; the small one is used below 768px. */
export type Clip = {
  mp4: string;
  webm?: string;
  mp4Mobile?: string;
  webmMobile?: string;
};

export type Still = { src: string; width: number; height: number; alt: L; focus?: string };

/** URL of a clip uploaded to R2 under home-film/, e.g. film("hero-1080-v1.mp4"). */
export const film = (name: string) => `/api/photos/film/${name}`;

/** Hero: the poster is the admin's hero image slot (Admin → Images), else this still. */
export const HERO: { still: Still; video: Clip | null } = {
  still: {
    src: "/portfolio/hero.webp",
    width: 1440,
    height: 1920,
    focus: "50% 58%",
    alt: {
      en: "Quinceañera in a blush ball gown beneath a gilded, hand-painted ceiling dome and crystal chandelier",
      es: "Quinceañera con vestido rosa palo bajo una cúpula dorada pintada a mano y un candelabro de cristal",
    },
  },
  video: null,
};

export type Detail = { id: string; still: Still; video: Clip | null; lines: { en: string[]; es: string[] } };

/** The staggered portrait gallery: one moment of the day per clip. */
export const DETAILS: Detail[] = [
  {
    id: "folklorico",
    still: {
      src: "/portfolio/dance.webp",
      width: 719,
      height: 1080,
      alt: {
        en: "Dancers in bright folklórico skirts spinning at a quinceañera reception",
        es: "Bailarinas con faldas folklóricas de colores girando en una recepción de quinceañera",
      },
    },
    video: null,
    lines: {
      en: ["The baile folklórico.", "Every turn of the skirt,", "caught mid-spin."],
      es: ["El baile folklórico.", "Cada vuelta de la falda,", "en pleno giro."],
    },
  },
  {
    id: "vals",
    still: {
      src: "/portfolio/kimberly-reception.webp",
      width: 719,
      height: 1080,
      alt: {
        en: "Quinceañera in a black gown dancing with her father beneath lighted marquee letters",
        es: "Quinceañera con vestido negro bailando con su papá bajo letras iluminadas",
      },
    },
    video: null,
    lines: {
      en: ["The vals with papá.", "The dance he has waited", "fifteen years for."],
      es: ["El vals con papá.", "El baile que esperó", "quince años."],
    },
  },
  {
    id: "ready",
    still: {
      src: "/portfolio/save-date.webp",
      width: 810,
      height: 1080,
      alt: {
        en: "Quinceañera in a blush gown in a bright white room before her celebration",
        es: "Quinceañera con vestido rosa palo en un cuarto blanco antes de su celebración",
      },
    },
    video: null,
    lines: {
      en: ["Getting ready.", "The quiet hour before", "the doors open."],
      es: ["Arreglándose.", "La hora tranquila antes", "de abrir las puertas."],
    },
  },
  {
    id: "portraits",
    still: {
      src: "/portfolio/lilac-arch.webp",
      width: 810,
      height: 1080,
      alt: {
        en: "Quinceañera in a lilac gown at the arched doorway of a stone building",
        es: "Quinceañera con vestido lila en la entrada en arco de un edificio de piedra",
      },
    },
    video: null,
    lines: {
      en: ["The portrait session.", "Her dress, her light,", "before the big day."],
      es: ["La sesión de retratos.", "Su vestido, su luz,", "antes del gran día."],
    },
  },
  {
    id: "roots",
    still: {
      src: "/portfolio/red-garden.webp",
      width: 720,
      height: 1080,
      alt: {
        en: "Quinceañera in a red gown with a Mexican sarape and a bouquet in a garden",
        es: "Quinceañera con vestido rojo, sarape y ramo de flores en un jardín",
      },
    },
    video: null,
    lines: {
      en: ["Raíces.", "The sarape, the flowers,", "the family history."],
      es: ["Raíces.", "El sarape, las flores,", "la historia de la familia."],
    },
  },
  {
    id: "gifts",
    still: {
      src: "/portfolio/shoe-ceremony.webp",
      width: 719,
      height: 1080,
      alt: {
        en: "Quinceañera in a black and gold gown behind a large red gift box at her party",
        es: "Quinceañera con vestido negro y dorado detrás de una gran caja de regalo roja en su fiesta",
      },
    },
    video: null,
    lines: {
      en: ["Her gifts.", "The moments in between", "are the ones you keep."],
      es: ["Sus regalos.", "Los momentos de en medio", "son los que se quedan."],
    },
  },
];

/** Full-bleed black-and-white backdrop behind the featured-package card. */
export const FEATURE_STILL: Still = {
  src: "/portfolio/gown-overhead.webp",
  width: 1600,
  height: 1066,
  alt: {
    en: "A quinceañera ball gown seen from above, its skirt spread in soft folds",
    es: "Un vestido de quinceañera visto desde arriba, con la falda extendida en pliegues suaves",
  },
};

/** Optional ambient clip for the dark band; without it the band shows the newest film's poster. */
export const BAND_VIDEO: Clip | null = null;

/**
 * A real photo to sit on each journal card, by the post's category (the posts
 * carry no images of their own). Decorative: the card's title says what it is.
 */
export const JOURNAL_PHOTO: Record<string, { src: string; width: number; height: number }> = {
  "Cost & Budget": { src: "/portfolio/shoe-ceremony.webp", width: 719, height: 1080 },
  Planning: { src: "/portfolio/save-date.webp", width: 810, height: 1080 },
  Traditions: { src: "/portfolio/dance.webp", width: 719, height: 1080 },
  "Photography & Film": { src: "/portfolio/kimberly-reception.webp", width: 719, height: 1080 },
  Locations: { src: "/portfolio/lilac-arch.webp", width: 810, height: 1080 },
};
export const JOURNAL_PHOTO_FALLBACK = { src: "/portfolio/red-garden.webp", width: 720, height: 1080 };
