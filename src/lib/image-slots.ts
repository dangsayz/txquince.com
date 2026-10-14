/**
 * image-slots.ts — the registry of every replaceable image on the public site.
 *
 * Each spot where a photograph appears gets a stable slot id. The admin can
 * replace the photo in any slot (Admin → Website → Every image, or the
 * "Replace photo" button that appears on the live page for a signed-in
 * admin). The override lives in site_settings under `image:<slotId>`; with no
 * override the page shows exactly what it showed before (its own dynamic pick,
 * or the default recorded here).
 *
 * Not slots (managed elsewhere): Photo dump albums (Admin → Photo dump), the
 * portfolio grid and photo pages (Admin → Portfolio), venue and vendor photos
 * (tagged portfolio photos), and video thumbnails (YouTube/Vimeo posters).
 *
 * Pure data + helpers: safe for server code and tests. Never import this from
 * a client component (it pulls in the blog and city content).
 */
import { WORKS } from "@/components/txq/data";
import { locations } from "@/content/locations";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { posts, esPosts, enSlugForEs } from "@/content/blog";

export type L = { en: string; es: string };

/** How the frame crops the photo on a phone and on a desktop (CSS ratios). */
export type Crops = { phone: string; desktop: string };

export type SlotDef = {
  id: string;
  /** Group heading in the admin ("Homepage", "Dallas page"…). */
  group: string;
  /** Main public URL the slot appears on (the admin "View" link). */
  page: string;
  /** Every path that shows this slot — revalidated after a change. */
  paths: string[];
  /** Plain-language name for the owner. */
  label: string;
  /** Default photograph (a /public path or an absolute URL). */
  defaultSrc: string;
  defaultAlt: L;
  /** Natural size of the default photograph, when known. */
  defaultWidth?: number;
  defaultHeight?: number;
  /** Default object-position ("50% 40%"). */
  defaultFocus?: string;
  /** The frame's crop (preview + admin thumbnails). */
  crops: Crops;
  /** `sizes` hint for the srcset. */
  sizes: string;
  /** Above the fold (LCP candidate): loaded eagerly with high priority. */
  lcp?: boolean;
  /** Store JPEG instead of WebP (social cards: the OG renderer can't read WebP). */
  format?: "jpeg";
};

/* ------------------------------ frames ------------------------------ */

const F = {
  homeHeroA: { phone: "3 / 4", desktop: "6 / 5" },
  homeHeroB: { phone: "3 / 5", desktop: "3 / 5" },
  card: { phone: "4 / 5", desktop: "4 / 5" },
  wideCard: { phone: "4 / 3", desktop: "4 / 3" },
  pagePlate: { phone: "4 / 5", desktop: "21 / 9" },
  shortPlate: { phone: "4 / 3", desktop: "3 / 1" },
  placeStage: { phone: "9 / 10", desktop: "2 / 1" },
  blogCover: { phone: "4 / 3", desktop: "2 / 1" },
  blogFeature: { phone: "4 / 3", desktop: "3 / 2" },
  og: { phone: "1200 / 630", desktop: "1200 / 630" },
} satisfies Record<string, Crops>;

const SIZES = {
  full: "100vw",
  third: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  duo: "(max-width: 960px) 100vw, 40vw",
  placeCard: "(min-width: 1280px) 25vw, (min-width: 960px) 33vw, (min-width: 640px) 50vw, 100vw",
  blogCover:
    "(max-width: 639px) calc(100vw - 48px), (max-width: 959px) calc(100vw - 96px), (max-width: 1279px) calc(100vw - 144px), calc(100vw - 160px)",
  blogFeature: "(max-width: 959px) calc(100vw - 48px), 58vw",
};

function fallbackPhoto(url: string) {
  const p = portfolioFallback.find((x) => x.url === url);
  // A /public photo outside the fallback list keeps its own URL (size unknown).
  return p ? { defaultSrc: p.url, defaultWidth: p.width, defaultHeight: p.height } : { defaultSrc: url };
}

/** Spanish alt text for the bundled fallback photographs. */
const FALLBACK_ALT_ES: Record<string, string> = {
  "/portfolio/hero.webp": "Quinceañera bajo una gran cúpula en un salón de baile",
  "/portfolio/save-date.webp": "Quinceañera con vestido rojo y sombrero vaquero blanco sobre un muro de piedra",
  "/portfolio/red-garden.webp": "Quinceañera con vestido rojo entre la vegetación de un jardín",
  "/portfolio/lilac-arch.webp": "Quinceañera con vestido lila frente a un arco de piedra",
  "/portfolio/canal.webp": "Quinceañera con vestido rosa junto a un barandal de piedra en el Mandalay Canal de Irving",
  "/portfolio/kimberly-reception.webp": "Quinceañera durante su recepción en Dallas–Fort Worth",
  "/portfolio/reception.webp": "Retrato de quinceañera con vestido rosa en su recepción",
  "/portfolio/stockyards.webp": "Retrato de quinceañera en los Fort Worth Stockyards",
  "/portfolio/dance.webp": "Quinceañera bailando el vals con su familia",
  "/portfolio/shoe-ceremony.webp": "Ceremonia del cambio de zapatillas de una quinceañera",
  "/portfolio/gown-overhead.webp": "Vestido de quinceañera visto desde arriba",
};

function fallbackAlt(url: string, en?: string): L {
  const p = portfolioFallback.find((x) => x.url === url);
  return {
    en: en ?? p?.alt ?? "Quinceañera portrait in Dallas–Fort Worth",
    es: FALLBACK_ALT_ES[url] ?? "Retrato de quinceañera en Dallas–Fort Worth",
  };
}

function staticSlot(
  base: Omit<SlotDef, "defaultSrc" | "defaultAlt" | "defaultWidth" | "defaultHeight">,
  url: string,
  altEn?: string,
): SlotDef {
  return { ...base, ...fallbackPhoto(url), defaultAlt: fallbackAlt(url, altEn) };
}

/* ----------------------------- homepage ----------------------------- */

const HOME = ["/", "/es"];
const pad = (n: number) => String(n).padStart(2, "0");
const work = (id: string) => WORKS.find((w) => w.id === id) ?? WORKS[0];

const homeSlots: SlotDef[] = [
  ...(["a", "b"] as const).map((which): SlotDef => {
    const w = work(which === "a" ? "w01" : "w02");
    return {
      id: `home.hero.${which}`,
      group: "Homepage",
      page: "/",
      paths: HOME,
      label: which === "a" ? "Homepage — big top photo (left)" : "Homepage — small top photo (right, computers only)",
      defaultSrc: w.src,
      defaultAlt: w.alt,
      defaultWidth: w.width,
      defaultHeight: w.height,
      defaultFocus: w.focus,
      crops: which === "a" ? F.homeHeroA : F.homeHeroB,
      sizes: which === "a" ? "(min-width: 640px) 66vw, 100vw" : "33vw",
      lcp: true,
    };
  }),
  ...WORKS.map(
    (w, i): SlotDef => ({
      id: `home.archive.${w.id}`,
      group: "Homepage",
      page: "/#archive",
      paths: HOME,
      label: `Homepage — gallery photo ${pad(i + 1)} (${w.subject})`,
      defaultSrc: w.src,
      defaultAlt: w.alt,
      defaultWidth: w.width,
      defaultHeight: w.height,
      defaultFocus: w.focus,
      crops: F.card,
      sizes: SIZES.third,
    }),
  ),
  (() => {
    const w = work("w02");
    return {
      id: "home.intake.portrait",
      group: "Homepage",
      page: "/#intake",
      paths: HOME,
      label: "Homepage — portrait beside the date form",
      defaultSrc: w.src,
      defaultAlt: w.alt,
      defaultWidth: w.width,
      defaultHeight: w.height,
      defaultFocus: w.focus,
      crops: F.card,
      sizes: "(min-width: 960px) 40vw, 100vw",
    } satisfies SlotDef;
  })(),
];

/* --------------------------- marketing pages -------------------------- */

const pageSlots: SlotDef[] = [
  staticSlot(
    { id: "about.hero", group: "About", page: "/about", paths: ["/about"], label: "About — big top photo", defaultFocus: "center 58%", crops: F.pagePlate, sizes: SIZES.full, lcp: true },
    "/portfolio/stockyards.webp",
    "Quinceañera portrait in Dallas–Fort Worth",
  ),
  staticSlot(
    { id: "about.portrait", group: "About", page: "/about", paths: ["/about"], label: "About — portrait beside the story", crops: F.card, sizes: SIZES.duo },
    "/portfolio/red-garden.webp",
    "Quinceañera in a red gown holding flowers",
  ),
  staticSlot(
    { id: "portfolio.hero", group: "Portfolio", page: "/portfolio", paths: ["/portfolio"], label: "Portfolio — big top photo", defaultFocus: "50% 40%", crops: F.pagePlate, sizes: SIZES.full, lcp: true },
    "/portfolio/hero.webp",
    "Quinceañera portrait in Dallas–Fort Worth",
  ),
  staticSlot(
    { id: "photoshoot.hero", group: "Photoshoot", page: "/quinceanera-photoshoot", paths: ["/quinceanera-photoshoot", "/es/sesion-de-fotos-quinceanera"], label: "Photoshoot page — big top photo", defaultFocus: "50% 35%", crops: F.placeStage, sizes: SIZES.full, lcp: true },
    "/portfolio/save-date.webp",
  ),
  ...[1, 2].map((n) =>
    staticSlot(
      { id: `photoshoot.detail.${n}`, group: "Photoshoot", page: "/quinceanera-photoshoot", paths: ["/quinceanera-photoshoot", "/es/sesion-de-fotos-quinceanera"], label: `Photoshoot page — photo ${n} of 2 under “What’s included”`, crops: F.card, sizes: "(min-width: 960px) 40vw, 50vw" },
      n === 1 ? "/portfolio/lilac-arch.webp" : "/portfolio/canal.webp",
    ),
  ),
  staticSlot(
    { id: "videographer.hero", group: "Videographer", page: "/quinceanera-videographer", paths: ["/quinceanera-videographer", "/es/videografo-de-quinceaneras"], label: "Videographer page — big top photo", defaultFocus: "50% 40%", crops: F.pagePlate, sizes: SIZES.full, lcp: true },
    "/portfolio/kimberly-reception.webp",
    "Quinceañera celebration photographed by TX Quince",
  ),
  staticSlot(
    { id: "areas.hero", group: "Areas served", page: "/quinceanera-photographer", paths: ["/quinceanera-photographer", "/es/fotografo-de-quinceaneras"], label: "Areas served — big top photo", defaultFocus: "50% 60%", crops: F.placeStage, sizes: SIZES.full, lcp: true },
    "/portfolio/kimberly-reception.webp",
  ),
  staticSlot(
    { id: "venues.hero", group: "Venues", page: "/venues", paths: ["/venues", "/es/salones"], label: "Venues — big top photo", defaultFocus: "50% 60%", crops: F.placeStage, sizes: SIZES.full, lcp: true },
    "/portfolio/kimberly-reception.webp",
  ),
  staticSlot(
    { id: "vendors.hero", group: "Vendors", page: "/vendors", paths: ["/vendors"], label: "Vendors — top photo", defaultFocus: "50% 40%", crops: F.shortPlate, sizes: SIZES.full, lcp: true },
    "/portfolio/reception.webp",
    "Quinceañera celebration in Dallas–Fort Worth",
  ),
  staticSlot(
    { id: "guide.hero", group: "Quinceañera guide", page: "/quinceanera-guide", paths: ["/quinceanera-guide"], label: "Guide — big top photo", defaultFocus: "50% 50%", crops: F.pagePlate, sizes: SIZES.full, lcp: true },
    "/portfolio/gown-overhead.webp",
    "Quinceañera gown and details of the day",
  ),
  ...(
    [
      ["planning", "Planning", "/portfolio/save-date.webp", "Quinceañera save-the-date portrait"],
      ["cost", "Cost", "/portfolio/reception.webp", "Quinceañera portrait in a pink gown"],
      ["photo-film", "Photos and video", "/portfolio/lilac-arch.webp", "Quinceañera portrait in a lilac gown"],
      ["celebration", "The celebration", "/portfolio/kimberly-reception.webp", "Quinceañera celebration and dance"],
    ] as const
  ).map(([id, name, url, alt], i) =>
    staticSlot(
      { id: `guide.section.${id}`, group: "Quinceañera guide", page: `/quinceanera-guide#${id}`, paths: ["/quinceanera-guide"], label: `Guide — photo for part ${pad(i + 1)}, “${name}”`, crops: F.card, sizes: "(max-width: 959px) 100vw, 40vw" },
      url,
      alt,
    ),
  ),
  staticSlot(
    { id: "links.hero", group: "Link page", page: "/links", paths: ["/links"], label: "Link-in-bio page — top photo", defaultFocus: "center 35%", crops: F.shortPlate, sizes: SIZES.full, lcp: true },
    "/portfolio/red-garden.webp",
    "Quinceañera in a red gown among garden greenery",
  ),
  staticSlot(
    { id: "inquiry.hero", group: "Check your date", page: "/check-your-date", paths: ["/check-your-date", "/es/consulta"], label: "Check-your-date page — top photo", defaultFocus: "center 39%", crops: F.shortPlate, sizes: SIZES.full, lcp: true },
    "/portfolio/hero.webp",
    "Quinceañera portrait",
  ),
  staticSlot(
    { id: "confirmation.hero", group: "Thank-you pages", page: "/thank-you", paths: ["/thank-you", "/es/gracias", "/reserve/success"], label: "Thank-you pages — top photo", defaultFocus: "center 46%", crops: F.shortPlate, sizes: SIZES.full, lcp: true },
    "/portfolio/hero.webp",
  ),
  staticSlot(
    { id: "blog.hero", group: "Blog", page: "/blog", paths: ["/blog", "/es/blog"], label: "Blog — featured story photo", crops: F.blogFeature, sizes: SIZES.blogFeature, lcp: true },
    "/portfolio/hero.webp",
  ),
  staticSlot(
    { id: "og.default", group: "Sharing", page: "/", paths: ["/", "/es"], label: "Link preview — the picture shown when the homepage is shared (texts, Facebook, WhatsApp)", crops: F.og, sizes: "1200px", format: "jpeg" },
    "/portfolio/hero.webp",
  ),
];

/* -------------------------- cities (EN + ES) -------------------------- */

const cityPool = portfolioFallback.map((p) => p.url);

const citySlots: SlotDef[] = locations.flatMap((loc, i): SlotDef[] => {
  const en = `/quinceanera-photographer/${loc.slug}`;
  const es = `/es/fotografo-de-quinceaneras/${loc.slug}`;
  const own = portfolioFallback.find((p) => p.city === loc.city)?.url;
  const cardUrl = own ?? cityPool[i % cityPool.length];
  return [
    staticSlot(
      { id: `city.${loc.slug}.hero`, group: `${loc.city} page`, page: en, paths: [en, es], label: `${loc.city} page — big top photo`, defaultFocus: "50% 35%", crops: F.placeStage, sizes: SIZES.full, lcp: true },
      own ?? "/portfolio/kimberly-reception.webp",
    ),
    staticSlot(
      { id: `city.${loc.slug}.card`, group: `${loc.city} page`, page: "/quinceanera-photographer#cities", paths: ["/quinceanera-photographer", "/es/fotografo-de-quinceaneras"], label: `Areas served — ${loc.city} card`, defaultFocus: "50% 35%", crops: F.card, sizes: SIZES.placeCard },
      cardUrl,
    ),
  ];
});

/* ---------------------------- blog covers ---------------------------- */

/** One cover per story; the English and Spanish versions of a story share it. */
export function blogCoverSlotId(slug: string, lang: "en" | "es"): string {
  const key = lang === "es" ? (enSlugForEs(slug) ?? slug) : slug;
  return `blog.cover.${key}`;
}

const largestFallback = [...portfolioFallback].sort((a, b) => b.width - a.width)[0];

const blogSlots: SlotDef[] = [
  ...posts.map((p) => ({ post: p, en: p.slug, es: undefined as string | undefined })),
  ...esPosts.filter((p) => !enSlugForEs(p.slug)).map((p) => ({ post: p, en: undefined as string | undefined, es: p.slug })),
].map(({ post, en, es }) => {
  const esPair = en ? esPosts.find((p) => enSlugForEs(p.slug) === en)?.slug : es;
  const paths = [...(en ? [`/blog/${en}`, "/blog"] : []), ...(esPair ? [`/es/blog/${esPair}`, "/es/blog"] : [])];
  return staticSlot(
    {
      id: `blog.cover.${en ?? es}`,
      group: "Blog covers",
      page: paths[0],
      paths,
      label: `Blog cover — “${post.title}”`,
      crops: F.blogCover,
      sizes: SIZES.blogCover,
      lcp: true,
    },
    largestFallback.url,
  );
});

/* ------------------------------ registry ----------------------------- */

export const SLOTS: readonly SlotDef[] = [...homeSlots, ...pageSlots, ...citySlots, ...blogSlots];

const BY_ID = new Map(SLOTS.map((s) => [s.id, s]));

export function getSlot(id: string): SlotDef | undefined {
  return BY_ID.get(id);
}

export function isSlotId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

/** Slot ids are lowercase words joined by dots and dashes. */
export const SLOT_ID_RE = /^[a-z0-9-]+(?:\.[a-z0-9-]+){1,3}$/;

/** Slots grouped for the admin page, in registry order. */
export function slotGroups(): { group: string; slots: SlotDef[] }[] {
  const out: { group: string; slots: SlotDef[] }[] = [];
  for (const s of SLOTS) {
    const last = out[out.length - 1];
    if (last && last.group === s.group) last.slots.push(s);
    else out.push({ group: s.group, slots: [s] });
  }
  return out;
}
