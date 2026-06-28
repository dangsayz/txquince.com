import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import type { VideoProvider } from "@/lib/video";

/**
 * INTERNAL storage URL — only ever fetched server-side (by /api/img). Raw
 * bucket URLs must never reach the client: pages/share links use imagePageUrl,
 * bytes are served from imageServeUrl (branded, capped).
 */
export function storageUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/portfolio/${path}`;
}

/** Tiny stable hash → cache-busting version tag derived from the storage path,
 *  so replacing a photo in place (same permanent slug) busts the immutable
 *  browser cache without breaking shared links.
 *  PIPELINE_EPOCH salts the tag — bump it whenever the serve pipeline's output
 *  changes for every image (e.g. watermark removed), so year-long immutable
 *  caches refresh without touching storage paths. */
const PIPELINE_EPOCH = "2";
function versionTag(s: string): string {
  const input = `${PIPELINE_EPOCH}:${s}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Branded image bytes — the ONLY image src the public site renders. */
export function imageServeUrl(slug: string, storagePath?: string): string {
  return `/api/img/${slug}${storagePath ? `?v=${versionTag(storagePath)}` : ""}`;
}

/** Shareable, indexable page for an image (what the share sheet copies). */
export function imagePagePath(section: string, slug: string): string {
  return `/photos/${section}/${slug}`;
}

/** A vendor credited on a photo — the PUBLIC-safe shape (no email/phone). */
export type ImageVendorCredit = {
  vendor_id: string;
  name: string;
  business: string | null;
  slug: string;
  category: string | null;
  ig_handle: string | null;
  website: string | null;
  /** Credit label override; falls back to the category's credit word. */
  role: string | null;
};

export type PortfolioImage = {
  id: string;
  storage_path: string;
  alt: string;
  section: string;
  is_feature: boolean;
  sort_order: number;
  width: number | null;
  height: number | null;
  location: string | null;
  /** Focal anchor (0..1 from left/top) — cropped renders align this point. */
  focus_x?: number | null;
  focus_y?: number | null;
  /** Permanent SEO slug — /photos/{section}/{slug}, bytes at /api/img/{slug}. */
  slug?: string | null;
  title?: string | null;
  caption?: string | null;
  city?: string | null;
  /** Short punchy line shown under the title. */
  hook?: string | null;
  /** Free-form comma-separated keywords (meta) for search/SEO. */
  tags?: string | null;
  /** Vendors credited on this photo (public-safe). */
  vendors?: ImageVendorCredit[];
  /** Branded serve URL (/api/img/{slug}) — never the raw bucket URL. */
  url: string;
};

/** A vendor directory record — FULL shape (admin only; email/phone private). */
export type Vendor = {
  id: string;
  name: string;
  business: string | null;
  category: string | null;
  ig_handle: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  slug: string;
};

export type VideoRow = {
  id: string;
  url: string;
  provider: VideoProvider;
  video_id: string | null;
  title: string;
  poster_url: string | null;
  is_feature: boolean;
  sort_order: number;
};

/**
 * Vendor credits keyed by image id. Small tables, so we load both in full and
 * stitch in memory (one map reused across every image this request). Guarded:
 * if the vendor tables don't exist yet (migration not applied) it returns an
 * empty map and the gallery renders exactly as before.
 */
const loadVendorCredits = cache(
  async (): Promise<Map<string, ImageVendorCredit[]>> => {
    const map = new Map<string, ImageVendorCredit[]>();
    if (!isSupabaseConfigured()) return map;
    try {
      const supabase = getServiceSupabase();
      const [linksRes, vendorsRes] = await Promise.all([
        supabase.from("portfolio_image_vendors").select("image_id, vendor_id, role"),
        supabase
          .from("vendors")
          .select("id, name, business, slug, category, ig_handle, website"),
      ]);
      const links = linksRes.data;
      const vendors = vendorsRes.data;
      if (!links || !vendors) return map;
      const vById = new Map(vendors.map((v) => [v.id as string, v]));
      for (const l of links) {
        const v = vById.get(l.vendor_id as string);
        if (!v) continue;
        const list = map.get(l.image_id as string) ?? [];
        list.push({
          vendor_id: v.id as string,
          name: v.name as string,
          business: (v.business as string) ?? null,
          slug: v.slug as string,
          category: (v.category as string) ?? null,
          ig_handle: (v.ig_handle as string) ?? null,
          website: (v.website as string) ?? null,
          role: (l.role as string) ?? null,
        });
        map.set(l.image_id as string, list);
      }
    } catch {
      /* vendor tables not present yet — credits stay empty */
    }
    return map;
  },
);

/** All portfolio images, ordered, with vendor credits attached. Empty array if
 *  storage/DB not configured. */
export const getPortfolioImages = cache(async (): Promise<PortfolioImage[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    // select("*") so newly-added columns (e.g. focal anchors) flow through
    // without a brittle hand-kept list — and a lagging migration can never
    // blank the gallery.
    const [{ data, error }, credits] = await Promise.all([
      supabase
        .from("portfolio_images")
        .select("*")
        .order("section", { ascending: true })
        .order("sort_order", { ascending: true }),
      loadVendorCredits(),
    ]);
    if (error || !data) return [];
    // Branded serve route when a slug exists (always, post-0017); raw URL is
    // the last-resort fallback so a missing slug shows the photo rather than 404.
    return data.map((r) => ({
      ...r,
      url: r.slug ? imageServeUrl(r.slug, r.storage_path) : storageUrl(r.storage_path),
      vendors: credits.get(r.id as string) ?? [],
    }));
  } catch {
    return [];
  }
});

/** One image by its permanent slug (image pages + the serve route). */
export const getImageBySlug = cache(
  async (slug: string): Promise<PortfolioImage | null> => {
    if (!isSupabaseConfigured()) return null;
    try {
      const supabase = getServiceSupabase();
      const [{ data, error }, credits] = await Promise.all([
        supabase.from("portfolio_images").select("*").eq("slug", slug).maybeSingle(),
        loadVendorCredits(),
      ]);
      if (error || !data) return null;
      return {
        ...data,
        url: imageServeUrl(data.slug as string, data.storage_path),
        vendors: credits.get(data.id as string) ?? [],
      };
    } catch {
      return null;
    }
  },
);

/** Every vendor in the directory, ordered by name. Empty if not configured /
 *  tables absent. FULL records (admin use); strip email/phone before rendering
 *  publicly. */
export const getVendors = cache(async (): Promise<Vendor[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("vendors")
      .select("id, name, business, category, ig_handle, email, phone, website, notes, slug")
      .order("name", { ascending: true });
    if (error || !data) return [];
    return data as Vendor[];
  } catch {
    return [];
  }
});

/** One vendor by public slug. */
export const getVendorBySlug = cache(
  async (slug: string): Promise<Vendor | null> => {
    const all = await getVendors();
    return all.find((v) => v.slug === slug) ?? null;
  },
);

/** Every photo that credits a given vendor (by slug), in gallery order. */
export async function getImagesByVendor(slug: string): Promise<PortfolioImage[]> {
  const target = slug.trim().toLowerCase();
  if (!target) return [];
  const all = await getPortfolioImages();
  return all.filter((i) => i.vendors?.some((v) => v.slug.toLowerCase() === target));
}

export async function getImagesBySection(section: string): Promise<PortfolioImage[]> {
  return (await getPortfolioImages()).filter((i) => i.section === section);
}

export async function getFeaturedImages(limit = 9): Promise<PortfolioImage[]> {
  const all = await getPortfolioImages();
  const featured = all.filter((i) => i.is_feature);
  return (featured.length ? featured : all).slice(0, limit);
}

/**
 * Photos tagged with a given city (slug, e.g. "dallas") — powers the per-city
 * gallery so each /quinceanera-photographer/<city> page shows its OWN real work
 * instead of the same featured set everywhere. Empty until the operator tags
 * images by city in /admin/portfolio (callers fall back to featured).
 */
export async function getImagesByCity(citySlug: string, limit = 6): Promise<PortfolioImage[]> {
  const target = citySlug.trim().toLowerCase();
  if (!target) return [];
  const all = await getPortfolioImages();
  return all
    .filter((i) => (i.city ?? "").trim().toLowerCase() === target)
    .slice(0, limit);
}

/** Raw hero image source — server-only, consumed by /api/img/hero. */
export async function getHeroRawImageUrl(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_media")
      .maybeSingle();
    const v = data?.value as Partial<HeroMedia> | undefined;
    return v?.kind === "image" && v.imageUrl ? v.imageUrl : null;
  } catch {
    return null;
  }
}

export type HeroMedia = {
  kind: "image" | "video";
  imageUrl: string | null;
  imageAlt: string;
  videoUrl: string | null;
  provider: VideoProvider | null;
  videoId: string | null;
  posterUrl: string | null;
};

/**
 * The hero showcase media set in /admin/hero — a photo or a video link
 * (YouTube/Vimeo/MP4). Null means "fall back to the top featured photo."
 */
export const getHeroMedia = cache(async (): Promise<HeroMedia | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_media")
      .maybeSingle();
    if (error || !data?.value) return null;
    const v = data.value as Partial<HeroMedia>;
    if (v.kind !== "image" && v.kind !== "video") return null;
    if (v.kind === "image" && !v.imageUrl) return null;
    if (v.kind === "video" && !v.videoUrl) return null;
    return {
      kind: v.kind,
      // Raw bucket URL stays server-side; the client gets the branded route
      // (capped) — /api/img/hero resolves the source itself.
      imageUrl: v.kind === "image" && v.imageUrl ? "/api/img/hero" : null,
      imageAlt: v.imageAlt ?? "Quinceañera portrait",
      videoUrl: v.videoUrl ?? null,
      provider: (v.provider as VideoProvider) ?? null,
      videoId: v.videoId ?? null,
      posterUrl: v.posterUrl ?? null,
    };
  } catch {
    return null;
  }
});

/** All videos, ordered. */
export const getVideos = cache(async (): Promise<VideoRow[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("videos")
      .select("id, url, provider, video_id, title, poster_url, is_feature, sort_order")
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data as VideoRow[];
  } catch {
    return [];
  }
});
