/**
 * gallery.ts — PORTFOLIO MANIFESTS (curate ruthlessly)
 *
 * Only the best work goes here — a weak image lowers the price ceiling. Every
 * image must be release-cleared (LAW 5). Reference each by its R2 key; until a
 * key + base URL exist, a labeled placeholder renders in its place.
 *
 * ALT TEXT IS REQUIRED on every image (accessibility + image SEO — SEO LAW).
 */

export type GalleryImage = {
  key: string; // R2 key, e.g. "portfolio/church/01.jpg"
  alt: string; // required, descriptive
  // Aspect ratio hint for layout (width/height). Defaults to 3/4 (portrait).
  ratio?: "portrait" | "landscape" | "square";
  /** Feature an image larger in the editorial grid. */
  feature?: boolean;
};

export type GallerySection = {
  id: "save-the-date" | "church" | "portraits" | "celebration" | "films";
  eyebrow: string;
  title: string;
  intro: string;
  images: GalleryImage[];
};

/** Curated teaser for the Home "The Work" grid (6–9 best, mixed scenes). */
export const homeTeaser: GalleryImage[] = [
  { key: "", alt: "Quinceañera portrait in her ballgown at golden hour.", ratio: "portrait", feature: true },
  { key: "", alt: "Father and daughter during el vals on the dance floor.", ratio: "portrait" },
  { key: "", alt: "Candlelit church ceremony during la misa.", ratio: "landscape" },
  { key: "", alt: "Detail of the quinceañera's crown and bouquet.", ratio: "square" },
  { key: "", alt: "The corte de honor walking into the reception.", ratio: "landscape" },
  { key: "", alt: "Mother adjusting her daughter's dress before the ceremony.", ratio: "portrait" },
  { key: "", alt: "First dance under string lights at the reception.", ratio: "portrait" },
  { key: "", alt: "Quinceañera laughing with her court outdoors.", ratio: "landscape" },
];

export const gallerySections: GallerySection[] = [
  {
    id: "save-the-date",
    eyebrow: "Before the day",
    title: "Save-the-Date",
    intro:
      "A relaxed portrait session, included with every collection — and the first time she sees herself as the girl this whole day is for.",
    images: [
      { key: "", alt: "Save-the-date portrait in an open field at sunset.", ratio: "portrait", feature: true },
      { key: "", alt: "Quinceañera in casual elegance against a brick wall.", ratio: "portrait" },
      { key: "", alt: "Detail of save-the-date styling and accessories.", ratio: "square" },
    ],
  },
  {
    id: "church",
    eyebrow: "La misa",
    title: "Church & Mass",
    intro:
      "The sacred center of the day — photographed with reverence and a quiet, unobtrusive presence.",
    images: [
      { key: "", alt: "Quinceañera kneeling at the altar during la misa.", ratio: "landscape", feature: true },
      { key: "", alt: "Family receiving a blessing from the priest.", ratio: "portrait" },
      { key: "", alt: "Candle and rosary detail inside the church.", ratio: "square" },
      { key: "", alt: "The quinceañera walking down the aisle.", ratio: "portrait" },
    ],
  },
  {
    id: "portraits",
    eyebrow: "Her, exactly as she is",
    title: "Portraits",
    intro:
      "Candid, modern, and timeless. Portraits she'll still love at thirty.",
    images: [
      { key: "", alt: "Editorial portrait of the quinceañera in her ballgown.", ratio: "portrait", feature: true },
      { key: "", alt: "Close portrait with soft natural light.", ratio: "portrait" },
      { key: "", alt: "Full-length gown portrait against architecture.", ratio: "portrait" },
      { key: "", alt: "Quinceañera with her bouquet, laughing.", ratio: "landscape" },
    ],
  },
  {
    id: "celebration",
    eyebrow: "El vals & beyond",
    title: "The Celebration",
    intro:
      "El vals, el saludo, los padrinos, the dancing — the joy of the room, kept exactly as it felt.",
    images: [
      { key: "", alt: "Father–daughter waltz during el vals.", ratio: "landscape", feature: true },
      { key: "", alt: "The surprise dance with the court.", ratio: "portrait" },
      { key: "", alt: "Guests celebrating on a packed dance floor.", ratio: "landscape" },
      { key: "", alt: "Toast and tears with family at the reception.", ratio: "portrait" },
    ],
  },
  {
    id: "films",
    eyebrow: "Motion",
    title: "Films",
    intro:
      "The day in motion — her voice, the music, the room. A film the family watches for years.",
    images: [
      { key: "", alt: "Highlight film still: the quinceañera entering the reception.", ratio: "landscape", feature: true },
      { key: "", alt: "Film still of el vals in slow motion.", ratio: "landscape" },
    ],
  },
];
