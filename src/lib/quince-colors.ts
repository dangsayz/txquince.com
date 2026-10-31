/**
 * quince-colors.ts — the quinceañera color vocabulary and the gallery matcher
 * behind /plan (pure; safe for client, server and tests).
 *
 * Families write colors the way they say them: "fucsia", "rosa palo",
 * "azul rey", "rose gold", "champagne". Every spelling maps to ONE canonical
 * id (what we store in quince_plans.colors and portfolio_images.colors), and
 * each id lists its NEARBY colors so a "fucsia" family still sees the pink and
 * magenta work when nothing is tagged fucsia exactly.
 *
 * Matching order for a photo's colors:
 *   1. portfolio_images.colors — set by hand in Admin → Portfolio (authoritative)
 *   2. otherwise inferred from the photo's own words (alt, title, caption,
 *      hook, tags), so the feature works before a single photo is tagged.
 */

export type ColorId =
  | "fucsia"
  | "rosa"
  | "rosa-palo"
  | "oro-rosa"
  | "coral"
  | "rojo"
  | "vino"
  | "morado"
  | "lila"
  | "azul-rey"
  | "azul-marino"
  | "celeste"
  | "turquesa"
  | "esmeralda"
  | "verde-salvia"
  | "amarillo"
  | "naranja"
  | "dorado"
  | "plateado"
  | "blanco"
  | "champagne"
  | "negro";

export type QuinceColor = {
  id: ColorId;
  en: string;
  es: string;
  /** Swatch for chips (decorative only; the label always carries the meaning). */
  hex: string;
  /** Other spellings, both languages, accent-free and lowercase. */
  aliases: string[];
  /** Colors close enough to show when nothing matches exactly. */
  near: ColorId[];
};

export const QUINCE_COLORS: readonly QuinceColor[] = [
  { id: "fucsia", en: "Fuchsia", es: "Fucsia", hex: "#c2185b", aliases: ["fuchsia", "fucsia", "fiusha", "magenta", "hot pink", "rosa mexicano", "rosa fuerte"], near: ["rosa", "morado", "rojo"] },
  { id: "rosa", en: "Pink", es: "Rosa", hex: "#ec8fb5", aliases: ["pink", "rosa", "rosado", "rosada"], near: ["fucsia", "rosa-palo", "oro-rosa", "coral"] },
  { id: "rosa-palo", en: "Blush", es: "Rosa palo", hex: "#f2c4cf", aliases: ["blush", "rosa palo", "palo de rosa", "light pink", "rosa claro", "dusty pink", "dusty rose", "baby pink"], near: ["rosa", "oro-rosa", "champagne"] },
  { id: "oro-rosa", en: "Rose gold", es: "Oro rosa", hex: "#c99486", aliases: ["rose gold", "oro rosa", "rosegold"], near: ["rosa-palo", "dorado", "champagne", "rosa"] },
  { id: "coral", en: "Coral", es: "Coral", hex: "#f08070", aliases: ["coral", "peach", "durazno", "salmon", "salmón"], near: ["rosa", "naranja", "rosa-palo"] },
  { id: "rojo", en: "Red", es: "Rojo", hex: "#c62828", aliases: ["red", "rojo", "roja", "scarlet", "escarlata", "carmesi"], near: ["vino", "fucsia", "coral"] },
  { id: "vino", en: "Burgundy", es: "Vino", hex: "#6d1a2f", aliases: ["burgundy", "wine", "vino", "guinda", "maroon", "borgona", "marsala", "tinto"], near: ["rojo", "morado"] },
  { id: "morado", en: "Purple", es: "Morado", hex: "#6a1b9a", aliases: ["purple", "morado", "morada", "purpura", "violeta", "violet", "plum", "ciruela"], near: ["lila", "fucsia", "vino"] },
  { id: "lila", en: "Lilac", es: "Lila", hex: "#c3a6e0", aliases: ["lilac", "lila", "lavender", "lavanda", "lavanda claro"], near: ["morado", "rosa-palo", "celeste"] },
  { id: "azul-rey", en: "Royal blue", es: "Azul rey", hex: "#1f4fbf", aliases: ["royal blue", "azul rey", "blue", "azul", "cobalt", "cobalto"], near: ["azul-marino", "celeste", "turquesa"] },
  { id: "azul-marino", en: "Navy", es: "Azul marino", hex: "#1b2a4a", aliases: ["navy", "navy blue", "azul marino", "midnight blue", "azul oscuro"], near: ["azul-rey", "plateado"] },
  { id: "celeste", en: "Light blue", es: "Celeste", hex: "#9ccbea", aliases: ["light blue", "baby blue", "celeste", "azul cielo", "azul claro", "sky blue", "cinderella blue", "powder blue"], near: ["azul-rey", "turquesa", "plateado", "lila"] },
  { id: "turquesa", en: "Teal", es: "Turquesa", hex: "#11867f", aliases: ["teal", "turquoise", "turquesa", "aqua", "aquamarine", "aguamarina", "tiffany", "tiffany blue"], near: ["celeste", "esmeralda", "azul-rey"] },
  { id: "esmeralda", en: "Emerald", es: "Esmeralda", hex: "#0f6b45", aliases: ["emerald", "esmeralda", "green", "verde", "verde esmeralda", "jade", "hunter green"], near: ["verde-salvia", "turquesa"] },
  { id: "verde-salvia", en: "Sage", es: "Verde salvia", hex: "#9cae8f", aliases: ["sage", "sage green", "verde salvia", "salvia", "olive", "verde olivo", "mint", "menta", "eucalyptus", "eucalipto"], near: ["esmeralda", "champagne", "blanco"] },
  { id: "amarillo", en: "Yellow", es: "Amarillo", hex: "#f2c94c", aliases: ["yellow", "amarillo", "amarilla", "mustard", "mostaza", "canary", "canario"], near: ["dorado", "naranja"] },
  { id: "naranja", en: "Orange", es: "Naranja", hex: "#e8772e", aliases: ["orange", "naranja", "anaranjado", "terracotta", "terracota", "burnt orange"], near: ["coral", "amarillo", "dorado"] },
  { id: "dorado", en: "Gold", es: "Dorado", hex: "#c9a227", aliases: ["gold", "dorado", "dorada", "oro", "golden"], near: ["champagne", "oro-rosa", "amarillo"] },
  { id: "plateado", en: "Silver", es: "Plateado", hex: "#a8adb3", aliases: ["silver", "plateado", "plateada", "plata", "gray", "grey", "gris"], near: ["blanco", "azul-marino", "celeste"] },
  { id: "blanco", en: "White", es: "Blanco", hex: "#ffffff", aliases: ["white", "blanco", "blanca", "ivory", "marfil", "off white", "cream", "crema"], near: ["champagne", "plateado", "rosa-palo"] },
  { id: "champagne", en: "Champagne", es: "Champán", hex: "#e8d6b0", aliases: ["champagne", "champan", "champana", "beige", "nude", "taupe", "arena"], near: ["dorado", "blanco", "rosa-palo", "oro-rosa"] },
  { id: "negro", en: "Black", es: "Negro", hex: "#111110", aliases: ["black", "negro", "negra"], near: ["plateado", "dorado"] },
];

const BY_ID = new Map<ColorId, QuinceColor>(QUINCE_COLORS.map((c) => [c.id, c]));

/** Lowercase, strip accents and punctuation, collapse spaces. */
export function foldText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Every alias (folded) → its id, longest phrases first so "rosa palo" beats "rosa". */
const ALIASES: { phrase: string; id: ColorId }[] = QUINCE_COLORS.flatMap((c) =>
  [c.id.replace(/-/g, " "), foldText(c.en), foldText(c.es), ...c.aliases.map(foldText)].map((phrase) => ({ phrase, id: c.id })),
)
  .filter((a, i, all) => all.findIndex((b) => b.phrase === a.phrase) === i)
  .sort((a, b) => b.phrase.length - a.phrase.length);

const ALIAS_MAP = new Map(ALIASES.map((a) => [a.phrase, a.id]));

export function isColorId(v: unknown): v is ColorId {
  return typeof v === "string" && BY_ID.has(v as ColorId);
}

export function colorById(id: ColorId): QuinceColor {
  return BY_ID.get(id)!;
}

export function colorLabel(id: ColorId, lang: "en" | "es"): string {
  return BY_ID.get(id)?.[lang] ?? id;
}

/** One color as a family typed it → canonical id (null when unknown). */
export function normalizeColor(input: string): ColorId | null {
  const f = foldText(input);
  if (!f) return null;
  if (isColorId(f.replace(/ /g, "-"))) return f.replace(/ /g, "-") as ColorId;
  return ALIAS_MAP.get(f) ?? null;
}

export const MAX_PLAN_COLORS = 5;

/**
 * A list of colors ("fucsia,blanco,dorado", an array, or free text like
 * "pink & gold") → unique canonical ids, in the order given, at most `max`.
 * Free text is scanned phrase by phrase, so "rosa palo y dorado" works.
 */
export function parseColors(input: string | readonly string[] | null | undefined, max = MAX_PLAN_COLORS): ColorId[] {
  if (!input) return [];
  const parts = typeof input === "string" ? input.split(/[,;/|+]/) : input;
  const out: ColorId[] = [];
  for (const part of parts) {
    if (typeof part !== "string") continue;
    const exact = normalizeColor(part);
    const found = exact ? [exact] : colorsInText(part);
    for (const id of found) if (!out.includes(id)) out.push(id);
    if (out.length >= max) break;
  }
  return out.slice(0, max);
}

/** Phrases that name a photo style, not a color. */
const NOT_COLORS = /\b(black and white|blanco y negro|b w|golden hour|hora dorada|white balance|silver screen|rose petals?|petalos de rosa)\b/g;

/**
 * Colors named anywhere in a piece of text (whole words only, so "golden"
 * hour or "Rosalinda" never count). Longest phrase wins and is consumed.
 */
export function colorsInText(text: string | null | undefined): ColorId[] {
  if (!text) return [];
  let hay = ` ${foldText(text).replace(NOT_COLORS, " ")} `;
  const out: ColorId[] = [];
  for (const { phrase, id } of ALIASES) {
    if (phrase === "golden") continue; // "golden hour" / "golden light" — almost never the palette
    const needle = ` ${phrase} `;
    if (!hay.includes(needle)) continue;
    hay = hay.split(needle).join(" ");
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** The fields of a portfolio row the matcher reads (a subset of PortfolioImage). */
export type ColorMatchImage = {
  colors?: readonly string[] | null;
  alt?: string | null;
  title?: string | null;
  caption?: string | null;
  hook?: string | null;
  tags?: string | null;
  is_feature?: boolean | null;
  sort_order?: number | null;
};

/** A photo's colors: hand-tagged when present, else read from its own words. */
export function imageColors(img: ColorMatchImage): ColorId[] {
  const tagged = (img.colors ?? []).filter(isColorId);
  if (tagged.length) return Array.from(new Set(tagged));
  return colorsInText([img.alt, img.title, img.caption, img.hook, img.tags].filter(Boolean).join(" · "));
}

/** 3 points per wanted color the photo has, 1 per wanted color it is near. */
export function colorScore(wanted: readonly ColorId[], has: readonly ColorId[]): { score: number; exact: number } {
  let score = 0;
  let exact = 0;
  for (const w of wanted) {
    if (has.includes(w)) {
      score += 3;
      exact += 1;
    } else if (BY_ID.get(w)?.near.some((n) => has.includes(n)) || has.some((h) => BY_ID.get(h)?.near.includes(w))) {
      score += 1;
    }
  }
  return { score, exact };
}

export type GalleryMode = "match" | "nearby" | "best";

export type MatchedGallery<T> = {
  images: T[];
  /**
   * match  — at least one photo has one of their exact colors
   * nearby — only close colors matched (shown as "colors close to yours")
   * best   — nothing matched; these are our best-of (featured) photos
   */
  mode: GalleryMode;
  /** How many of `images` actually matched (exact or nearby). */
  matched: number;
};

/**
 * Pick the gallery for a plan. Matching photos come first (most matching
 * colors, then featured, then the portfolio's own order). When fewer than
 * `min` photos match, the rest is filled with best-of so the page never looks
 * empty, and with nothing matching at all it is simply our best work.
 */
export function matchGallery<T extends ColorMatchImage>(
  images: readonly T[],
  wanted: readonly ColorId[],
  opts: { limit?: number; min?: number } = {},
): MatchedGallery<T> {
  const limit = opts.limit ?? 9;
  const min = Math.min(opts.min ?? 4, limit);
  const order = (a: { img: T; i: number }, b: { img: T; i: number }) =>
    Number(Boolean(b.img.is_feature)) - Number(Boolean(a.img.is_feature)) ||
    (a.img.sort_order ?? 0) - (b.img.sort_order ?? 0) ||
    a.i - b.i;

  const indexed = images.map((img, i) => ({ img, i }));
  const best = [...indexed].sort(order);

  if (!wanted.length) return { images: best.slice(0, limit).map((x) => x.img), mode: "best", matched: 0 };

  const scored = indexed
    .map((x) => ({ ...x, ...colorScore(wanted, imageColors(x.img)) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.exact - a.exact || order(a, b));

  if (!scored.length) return { images: best.slice(0, limit).map((x) => x.img), mode: "best", matched: 0 };

  const picked = scored.slice(0, limit);
  const mode: GalleryMode = picked.some((x) => x.exact > 0) ? "match" : "nearby";
  if (picked.length < min) {
    const taken = new Set(picked.map((x) => x.i));
    for (const x of best) {
      if (picked.length >= min) break;
      if (!taken.has(x.i)) picked.push({ ...x, score: 0, exact: 0 });
    }
  }
  return { images: picked.map((x) => x.img), mode, matched: scored.slice(0, limit).length };
}
