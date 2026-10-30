/**
 * photo-dump-shared.ts — types + pure helpers for the "Photo dump" (latest
 * photos), safe to import from client components. The storage side (R2
 * binding, manifest read/write) lives in photo-dump.ts (server-only).
 *
 * Storage layout in the PORTFOLIO bucket:
 *   dump/<YYYY>/<MM>/<id>.webp   one resized photo (max 2560px long edge)
 *   dump/manifest.json           the list of albums + photos (this file's types)
 *
 * scripts/photo-dump-import.mjs writes the same format, so keep the two in step.
 */

export type L = { en: string; es: string };
export type Lang = "en" | "es";

export const DUMP_TAGS = ["portraits", "church", "party", "dress-session", "details", "family"] as const;
export type DumpTag = (typeof DUMP_TAGS)[number];

export const TAG_LABELS: Record<DumpTag, L> = {
  portraits: { en: "Portraits", es: "Retratos" },
  church: { en: "Church", es: "Misa" },
  party: { en: "Party", es: "Fiesta" },
  "dress-session": { en: "Dress session", es: "Sesión con vestido" },
  details: { en: "Details", es: "Detalles" },
  family: { en: "Family", es: "Familia" },
};

export type DumpPhoto = {
  id: string;
  key: string;
  w: number;
  h: number;
  alt: L;
  tags: string[];
  driveId?: string;
  createdAt: string;
  featured?: boolean;
  hidden?: boolean;
};

export type DumpAlbum = {
  id: string;
  title: L;
  caption?: L;
  createdAt: string;
  source: "admin" | "drive";
  hidden?: boolean;
  photos: DumpPhoto[];
};

export type DumpManifest = {
  version: 1;
  updatedAt: string;
  /** Newest album first (the admin can reorder). */
  albums: DumpAlbum[];
  /** Homepage image swaps: slot id → photo key. */
  overrides?: Record<string, string>;
};

/** One photo as the public site shows it (album context attached). */
export type FeedPhoto = {
  id: string;
  key: string;
  w: number;
  h: number;
  alt: L;
  tags: string[];
  featured: boolean;
  album: { id: string; title: L };
};

export type FeedPage = {
  photos: FeedPhoto[];
  /** Offset of the next page, or null when there is nothing more. */
  next: number | null;
  total: number;
  /** Tags present across the whole (unfiltered) feed. */
  tags: DumpTag[];
};

export const PAGE_SIZE = 12;
export const MAX_EDGE = 2560;
export const MANIFEST_KEY = "dump/manifest.json";

/** dump/2026/10/abc123.webp — the only keys the media route will serve. */
export const KEY_RE = /^dump\/\d{4}\/\d{2}\/[a-z0-9-]{4,64}\.(webp|jpg)$/;

export function emptyManifest(): DumpManifest {
  return { version: 1, updatedAt: new Date(0).toISOString(), albums: [] };
}

export function isDumpTag(v: unknown): v is DumpTag {
  return typeof v === "string" && (DUMP_TAGS as readonly string[]).includes(v);
}

export function pickL(lang: Lang, value: L | undefined): string {
  if (!value) return "";
  return (lang === "es" ? value.es || value.en : value.en || value.es) || "";
}

/* ---------------------------- media URLs ---------------------------- */

export function mediaUrl(key: string, width?: number): string {
  const base = `/api/photos/media/${key}`;
  return width ? `${base}?w=${width}` : base;
}

/** Derivative widths; never one above the photo's own width (no upscaling). */
const STEPS = [384, 640, 828, 1080, 1440, 1920, 2560];

export function srcSetFor(photo: { key: string; w: number }): string {
  const widths = STEPS.filter((s) => s < photo.w);
  widths.push(photo.w);
  return widths.map((w) => `${mediaUrl(photo.key, w)} ${w}w`).join(", ");
}

/** A single src no wider than `target` and never wider than the photo itself. */
export function srcFor(photo: { key: string; w: number }, target: number): string {
  const step = STEPS.find((s) => s >= target) ?? MAX_EDGE;
  return mediaUrl(photo.key, Math.min(step, photo.w));
}

/* --------------------------- normalizing ---------------------------- */

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");
const toL = (v: unknown, max = 300): L => {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { en: str(o.en, max), es: str(o.es, max) };
};
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : 0);

/**
 * Coerce whatever JSON is in the bucket into a valid manifest. A hand-edited
 * or half-written file never crashes the homepage; bad entries are dropped.
 */
export function normalizeManifest(raw: unknown): DumpManifest {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const albums: DumpAlbum[] = [];
  for (const a of Array.isArray(o.albums) ? o.albums : []) {
    if (!a || typeof a !== "object") continue;
    const r = a as Record<string, unknown>;
    const id = str(r.id, 64);
    if (!id) continue;
    const photos: DumpPhoto[] = [];
    for (const p of Array.isArray(r.photos) ? r.photos : []) {
      if (!p || typeof p !== "object") continue;
      const q = p as Record<string, unknown>;
      const key = str(q.key, 200);
      const w = int(q.w);
      const h = int(q.h);
      if (!str(q.id, 64) || !KEY_RE.test(key) || w <= 0 || h <= 0) continue;
      photos.push({
        id: str(q.id, 64),
        key,
        w,
        h,
        alt: toL(q.alt),
        tags: (Array.isArray(q.tags) ? q.tags : []).filter(isDumpTag),
        ...(str(q.driveId, 200) ? { driveId: str(q.driveId, 200) } : {}),
        createdAt: str(q.createdAt, 40) || new Date(0).toISOString(),
        ...(q.featured === true ? { featured: true } : {}),
        ...(q.hidden === true ? { hidden: true } : {}),
      });
    }
    const caption = r.caption ? toL(r.caption, 600) : undefined;
    albums.push({
      id,
      title: toL(r.title, 140),
      ...(caption && (caption.en || caption.es) ? { caption } : {}),
      createdAt: str(r.createdAt, 40) || new Date(0).toISOString(),
      source: r.source === "drive" ? "drive" : "admin",
      ...(r.hidden === true ? { hidden: true } : {}),
      photos,
    });
  }
  const overrides: Record<string, string> = {};
  if (o.overrides && typeof o.overrides === "object") {
    for (const [slot, key] of Object.entries(o.overrides as Record<string, unknown>)) {
      if (/^[a-z0-9.-]{1,60}$/.test(slot) && typeof key === "string" && KEY_RE.test(key)) overrides[slot] = key;
    }
  }
  return {
    version: 1,
    updatedAt: str(o.updatedAt, 40) || new Date(0).toISOString(),
    albums,
    ...(Object.keys(overrides).length ? { overrides } : {}),
  };
}

/* ------------------------------ feed -------------------------------- */

/**
 * Every visible photo in the order the site shows them: featured first, then
 * the rest — both in manifest order (newest album first, admin's photo order).
 */
export function feedFromManifest(m: DumpManifest): FeedPhoto[] {
  const all: FeedPhoto[] = [];
  for (const a of m.albums) {
    if (a.hidden) continue;
    for (const p of a.photos) {
      if (p.hidden) continue;
      all.push({
        id: p.id,
        key: p.key,
        w: p.w,
        h: p.h,
        alt: p.alt,
        tags: p.tags,
        featured: !!p.featured,
        album: { id: a.id, title: a.title },
      });
    }
  }
  return [...all.filter((p) => p.featured), ...all.filter((p) => !p.featured)];
}

export function feedTags(feed: FeedPhoto[]): DumpTag[] {
  const seen = new Set(feed.flatMap((p) => p.tags));
  return DUMP_TAGS.filter((t) => seen.has(t));
}

export function feedPage(feed: FeedPhoto[], cursor = 0, tag?: string | null, limit = PAGE_SIZE): FeedPage {
  const list = tag && isDumpTag(tag) ? feed.filter((p) => p.tags.includes(tag)) : feed;
  const start = Math.max(0, Math.min(cursor, list.length));
  const end = start + limit;
  return {
    photos: list.slice(start, end),
    next: end < list.length ? end : null,
    total: list.length,
    tags: feedTags(feed),
  };
}

/* ------------------------- homepage swaps --------------------------- */

/**
 * Homepage image spots the admin can swap for a photo from the dump:
 *   home.hero.a / home.hero.b   the two hero plates
 *
 * (The old home.archive.wNN frames are gone: the homepage gallery shows the
 * real portfolio galleries, so a swap can no longer dress a placeholder up as
 * a client. Any stale archive entry left in a manifest is simply ignored.)
 */
export const HERO_SLOTS = ["home.hero.a", "home.hero.b"] as const;
export function isHomeSlot(slot: string): boolean {
  return /^home\.hero\.(a|b)$/.test(slot);
}

export type SlotImage = { src: string; full: string; w: number; h: number; alt: L };
export type HomeOverrides = Record<string, SlotImage>;

export function resolveOverrides(m: DumpManifest): HomeOverrides {
  const out: HomeOverrides = {};
  if (!m.overrides) return out;
  const byKey = new Map<string, DumpPhoto>();
  for (const a of m.albums) for (const p of a.photos) byKey.set(p.key, p);
  for (const [slot, key] of Object.entries(m.overrides)) {
    const p = byKey.get(key);
    if (!p) continue;
    out[slot] = {
      src: srcFor(p, 1440),
      full: srcFor(p, 2560),
      w: p.w,
      h: p.h,
      alt: p.alt,
    };
  }
  return out;
}

/* ------------------------- album listing page ------------------------ */

export type AlbumBlock = { id: string; title: L; caption?: L; createdAt: string; photos: FeedPhoto[] };

/** Visible, non-empty albums in manifest order, each with its visible photos. */
export function albumsFromManifest(m: DumpManifest): AlbumBlock[] {
  const out: AlbumBlock[] = [];
  for (const a of m.albums) {
    if (a.hidden) continue;
    const photos = a.photos
      .filter((p) => !p.hidden)
      .map((p) => ({
        id: p.id,
        key: p.key,
        w: p.w,
        h: p.h,
        alt: p.alt,
        tags: p.tags,
        featured: !!p.featured,
        album: { id: a.id, title: a.title },
      }));
    if (!photos.length) continue;
    // Untitled single uploads in a row share one "More photos" block.
    const untitled = !a.title.en && !a.title.es && !a.caption;
    const prev = out[out.length - 1];
    if (untitled && prev?.id.startsWith("loose-")) {
      prev.photos.push(...photos);
      continue;
    }
    out.push(
      untitled
        ? { id: `loose-${a.id}`, title: { en: "More photos", es: "Más fotos" }, createdAt: a.createdAt, photos }
        : { id: a.id, title: a.title, ...(a.caption ? { caption: a.caption } : {}), createdAt: a.createdAt, photos },
    );
  }
  return out;
}
