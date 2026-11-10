/**
 * venue-events.ts — one venue's photos, grouped into the quinceañeras we shot
 * there (pure; server, client and tests).
 *
 * WHY: a venue page is where a mom decides "do I want my party here?". One
 * long column of photos answers that badly. Grouped by event, she sees each
 * quince as its own look (colors, moments, who shot it) and the page stays
 * short when we add the tenth.
 *
 * HOW AN EVENT IS FOUND (no new database columns):
 *   1. A photo tag `xv:<anything>` (Admin → Portfolio → tags) puts photos in
 *      the same event. Use it when the automatic grouping is wrong.
 *   2. Otherwise the ingest slug: `<venue-slug>-<file stem>`, where the stem
 *      is the 12img file name ("Ana-433.jpg" → "ana-433"). Dropping the frame
 *      number leaves the shoot's name, the same for every photo of that shoot.
 *   The key is only ever used for grouping. It is never shown, never put in a
 *   URL or an id (a girl's name must not appear anywhere public).
 *
 * THE THEME LINE ("Blush & gold"):
 *   1. a photo tag `theme:<words>` (owner-written, wins), else
 *   2. the event's two most common colors (Admin color tags, else colors named
 *      in the photos' own alt/caption), else nothing: the title falls back to
 *      "Quinceañera 01". Never invented.
 */
import { CATEGORIES, categoryLabel, groupForCategory, type GroupId } from "@/content/portfolio-taxonomy";
import { colorLabel, imageColors, type ColorId } from "@/lib/quince-colors";

/** The fields read from a portfolio row (a subset of PortfolioImage). */
export type VenueEventPhoto = {
  id: string;
  url: string;
  alt: string;
  section: string;
  is_feature: boolean;
  sort_order: number;
  width: number | null;
  height: number | null;
  slug?: string | null;
  title?: string | null;
  caption?: string | null;
  hook?: string | null;
  tags?: string | null;
  colors?: string[] | null;
  focus_x?: number | null;
  focus_y?: number | null;
  vendors?: { name: string; business: string | null; slug: string; category: string | null; role: string | null }[];
};

export type EventMoment = { id: GroupId; label: { en: string; es: string }; count: number };

export type VenueEvent<P extends VenueEventPhoto = VenueEventPhoto> = {
  /** 1-based, in the order the owner set (portfolio sort order). */
  number: number;
  /** Public anchor id: "xv-01". Never derived from a name. */
  anchor: string;
  /** Owner theme or color pair, per language; null when unknown. */
  theme: { en: string; es: string } | null;
  colors: ColorId[];
  /** Moments present, in the order of the day. */
  moments: EventMoment[];
  /** Specific named moments present (Grand Entrance, El Vals, Crowning…), taxonomy order. */
  highlights: { id: string; label: string }[];
  /** Photos in the order of the day (before → misa → portraits → party → details). */
  photos: P[];
  /** Up to 5 photos for the collapsed mosaic: a portrait lead, then variety across moments. */
  preview: P[];
  /** Moment of each photo, by photo id (for the "see all" sections). */
  momentOf: Record<string, GroupId>;
  /** Vendors credited on any photo of the event (deduped by slug). */
  vendors: { name: string; slug: string; role: string | null; category: string | null }[];
};

/** Order of the day, for sorting photos and listing moments. */
const DAY_ORDER: GroupId[] = ["before", "misa", "portraits", "celebration", "details", "vendors", "films"];

const MOMENT_LABEL: Record<GroupId, { en: string; es: string }> = {
  before: { en: "Getting ready", es: "Preparativos" },
  misa: { en: "La misa", es: "La misa" },
  portraits: { en: "Portraits", es: "Retratos" },
  celebration: { en: "The party", es: "La fiesta" },
  details: { en: "Details", es: "Detalles" },
  vendors: { en: "Décor", es: "Decoración" },
  films: { en: "Film", es: "Video" },
};

const PREVIEW_SIZE = 5;

/** Catch-all categories that say nothing specific about a moment. */
const GENERIC = new Set(["portraits", "celebration", "the-details", "venue-decor", "films"]);

/** `xv:` and `theme:` values from a comma-separated tag string. */
export function tagValue(tags: string | null | undefined, key: "xv" | "theme"): string | null {
  if (!tags) return null;
  for (const raw of tags.split(",")) {
    const t = raw.trim();
    const i = t.indexOf(":");
    if (i > 0 && t.slice(0, i).trim().toLowerCase() === key) {
      const v = t.slice(i + 1).trim();
      if (v) return v;
    }
  }
  return null;
}

/**
 * A photo's tags without the internal ones (`xv:`, `theme:`), for public
 * output such as the keywords meta tag. Null when nothing is left.
 */
export function publicTags(tags: string | null | undefined): string | null {
  const kept = (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t && !/^(?:xv|theme)\s*:/i.test(t));
  return kept.length ? kept.join(", ") : null;
}

/** The grouping key for one photo (internal only — see file header). */
export function eventKey(photo: Pick<VenueEventPhoto, "slug" | "tags" | "id">, venueSlug: string): string {
  const tagged = tagValue(photo.tags, "xv");
  if (tagged) return `tag:${tagged.toLowerCase()}`;
  const slug = (photo.slug ?? "").toLowerCase();
  const rest = slug.startsWith(`${venueSlug}-`) ? slug.slice(venueSlug.length + 1) : slug;
  const words = rest.split("-").filter((w) => w && !/^\d+$/.test(w));
  return words.length ? `stem:${words.join("-")}` : "stem:";
}

const isPortrait = (p: VenueEventPhoto) => !p.width || !p.height || p.height >= p.width;

function pickPreview<P extends VenueEventPhoto>(photos: P[]): P[] {
  if (photos.length <= PREVIEW_SIZE) return photos;
  const lead = photos.find((p) => p.is_feature && isPortrait(p)) ?? photos.find(isPortrait) ?? photos[0];
  const out: P[] = [lead];
  // One per moment first (variety), then fill evenly across the set.
  const seen = new Set<GroupId>([groupForCategory(lead.section)]);
  for (const p of photos) {
    if (out.length >= PREVIEW_SIZE) break;
    const g = groupForCategory(p.section);
    if (!seen.has(g) && p !== lead) {
      seen.add(g);
      out.push(p);
    }
  }
  const rest = photos.filter((p) => !out.includes(p));
  const need = PREVIEW_SIZE - out.length;
  for (let i = 0; i < need && rest.length; i++) out.push(rest[Math.floor((i * rest.length) / need)]);
  return out;
}

function topColors(photos: VenueEventPhoto[]): ColorId[] {
  const count = new Map<ColorId, number>();
  for (const p of photos) for (const c of new Set(imageColors(p))) count.set(c, (count.get(c) ?? 0) + 1);
  // A color has to show up in a real share of the set to name the theme.
  const min = Math.max(1, Math.ceil(photos.length * 0.15));
  return [...count.entries()]
    .filter(([, n]) => n >= min)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([c]) => c);
}

function themeFor(photos: VenueEventPhoto[], colors: ColorId[]): VenueEvent["theme"] {
  for (const p of photos) {
    const t = tagValue(p.tags, "theme");
    if (t) return { en: t, es: t };
  }
  if (!colors.length) return null;
  const join = (lang: "en" | "es") => colors.map((c) => colorLabel(c, lang)).join(lang === "es" ? " y " : " & ");
  const es = join("es");
  return { en: join("en"), es: es.charAt(0).toUpperCase() + es.slice(1).toLowerCase() };
}

/** Group a venue's photos into events, in the owner's order. */
export function venueEvents<P extends VenueEventPhoto>(photos: readonly P[], venueSlug: string): VenueEvent<P>[] {
  const groups = new Map<string, P[]>();
  const sorted = photos.map((p, i) => ({ p, i })).sort((a, b) => a.p.sort_order - b.p.sort_order || a.i - b.i);
  for (const { p } of sorted) {
    const k = eventKey(p, venueSlug);
    const list = groups.get(k);
    if (list) list.push(p);
    else groups.set(k, [p]);
  }

  return [...groups.values()].map((list, idx) => {
    const byDay = list
      .map((p, i) => ({ p, i }))
      .sort((a, b) => DAY_ORDER.indexOf(groupForCategory(a.p.section)) - DAY_ORDER.indexOf(groupForCategory(b.p.section)) || a.i - b.i)
      .map(({ p }) => p);
    const momentCount = new Map<GroupId, number>();
    for (const p of byDay) {
      const g = groupForCategory(p.section);
      momentCount.set(g, (momentCount.get(g) ?? 0) + 1);
    }
    const vendors = new Map<string, VenueEvent["vendors"][number]>();
    for (const p of byDay) {
      for (const v of p.vendors ?? []) {
        if (!vendors.has(v.slug)) vendors.set(v.slug, { name: v.business || v.name, slug: v.slug, role: v.role, category: v.category });
      }
    }
    const colors = topColors(byDay);
    const number = idx + 1;
    return {
      number,
      anchor: `xv-${String(number).padStart(2, "0")}`,
      theme: themeFor(byDay, colors),
      colors,
      highlights: CATEGORIES.filter((c) => !GENERIC.has(c.id) && byDay.some((p) => p.section === c.id)).map((c) => ({ id: c.id, label: categoryLabel(c.id) })),
      moments: DAY_ORDER.filter((g) => momentCount.has(g)).map((g) => ({ id: g, label: MOMENT_LABEL[g], count: momentCount.get(g)! })),
      photos: byDay,
      preview: pickPreview(byDay),
      momentOf: Object.fromEntries(byDay.map((p) => [p.id, groupForCategory(p.section)])),
      vendors: [...vendors.values()],
    };
  });
}
