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
  /** Branded serve URL (/api/img/{slug}) — never the raw bucket URL. */
  url: string;
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

/** All portfolio images, ordered. Empty array if storage/DB not configured. */
export const getPortfolioImages = cache(async (): Promise<PortfolioImage[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    // select("*") so newly-added columns (e.g. focal anchors) flow through
    // without a brittle hand-kept list — and a lagging migration can never
    // blank the gallery.
    const { data, error } = await supabase
      .from("portfolio_images")
      .select("*")
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    // Branded serve route when a slug exists (always, post-0017); raw URL is
    // the last-resort fallback so a missing slug shows the photo rather than 404.
    return data.map((r) => ({
      ...r,
      url: r.slug ? imageServeUrl(r.slug, r.storage_path) : storageUrl(r.storage_path),
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
      const { data, error } = await supabase
        .from("portfolio_images")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) return null;
      return { ...data, url: imageServeUrl(data.slug as string, data.storage_path) };
    } catch {
      return null;
    }
  },
);

export async function getImagesBySection(section: string): Promise<PortfolioImage[]> {
  return (await getPortfolioImages()).filter((i) => i.section === section);
}

export async function getFeaturedImages(limit = 9): Promise<PortfolioImage[]> {
  const all = await getPortfolioImages();
  const featured = all.filter((i) => i.is_feature);
  return (featured.length ? featured : all).slice(0, limit);
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
