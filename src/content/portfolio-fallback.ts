/**
 * TX Quince photographs copied from the public txquince.com portfolio
 * on 2026-09-28. These are a visual fallback when the configured portfolio data
 * is unavailable; database images always take precedence.
 */
export type PortfolioFallbackPhoto = {
  url: string;
  alt: string;
  section: "save-the-date" | "church" | "portraits" | "celebration";
  slug: string;
  title: string;
  caption?: string;
  city?: string;
  width: number;
  height: number;
};

export const portfolioFallback: readonly PortfolioFallbackPhoto[] = [
  {
    url: "/portfolio/hero.webp",
    alt: "Quinceañera beneath a grand domed ceiling in an opulent ballroom",
    section: "portraits",
    slug: "domed-ballroom-portrait",
    title: "Under the dome",
    width: 1440,
    height: 1920,
  },
  {
    url: "/portfolio/save-date.webp",
    alt: "Quinceañera in a red gown and white cowboy hat seated on a stone wall beneath trees",
    section: "save-the-date",
    slug: "red-carpet-save-the-date",
    title: "A date to remember",
    width: 810,
    height: 1080,
  },
  {
    url: "/portfolio/red-garden.webp",
    alt: "Quinceañera in a deep red ballgown among garden greenery in Dallas–Fort Worth",
    section: "portraits",
    slug: "red-gown-garden-portrait",
    title: "In the garden",
    width: 720,
    height: 1080,
  },
  {
    url: "/portfolio/lilac-arch.webp",
    alt: "Quinceañera in a lilac ruffled ballgown before an arched stone doorway",
    section: "portraits",
    slug: "lilac-gown-stone-arch",
    title: "At the stone arch",
    width: 810,
    height: 1080,
  },
  {
    url: "/portfolio/canal.webp",
    alt: "Quinceañera in a bright pink gown posing by a stone railing at the Mandalay Canal Walk in Irving",
    section: "portraits",
    slug: "mandalay-canal-portrait",
    title: "At the Mandalay Canal",
    city: "Irving",
    width: 720,
    height: 1080,
  },
  {
    url: "/portfolio/stockyards.webp",
    alt: "Quinceañera in a blush gown holding a bouquet among cactus at the Fort Worth Stockyards",
    section: "portraits",
    slug: "fort-worth-stockyards-portrait",
    title: "At the Stockyards",
    city: "Fort Worth",
    width: 720,
    height: 1080,
  },
  {
    url: "/portfolio/reception.webp",
    alt: "Quinceañera in a pale pink ballgown posing in a bright hallway",
    section: "portraits",
    slug: "pink-gown-hallway-portrait",
    title: "A quiet portrait",
    width: 719,
    height: 1080,
  },
  {
    url: "/portfolio/dance.webp",
    alt: "Quinceañera in a folklórico dress dancing with others at her reception",
    section: "celebration",
    slug: "folklorico-reception-dance",
    title: "A dance to remember",
    width: 719,
    height: 1080,
  },
  {
    url: "/portfolio/kimberly-reception.webp",
    alt: "Quinceañera in a dark gown dancing with her father at the reception",
    section: "celebration",
    slug: "father-daughter-reception-dance",
    title: "Father and daughter",
    width: 719,
    height: 1080,
  },
  {
    url: "/portfolio/shoe-ceremony.webp",
    alt: "Crowned quinceañera in a black gown opening a gift at her reception",
    section: "celebration",
    slug: "quinceanera-reception-gift",
    title: "The gifts and gestures",
    width: 719,
    height: 1080,
  },
];
