import "server-only";
import { cache } from "react";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import type { VideoProvider } from "@/lib/video";

/** Public URL for an object in the (public) `portfolio` storage bucket. */
export function storageUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/portfolio/${path}`;
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
    const { data, error } = await supabase
      .from("portfolio_images")
      .select("id, storage_path, alt, section, is_feature, sort_order, width, height, location")
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data.map((r) => ({ ...r, url: storageUrl(r.storage_path) }));
  } catch {
    return [];
  }
});

export async function getImagesBySection(section: string): Promise<PortfolioImage[]> {
  return (await getPortfolioImages()).filter((i) => i.section === section);
}

export async function getFeaturedImages(limit = 9): Promise<PortfolioImage[]> {
  const all = await getPortfolioImages();
  const featured = all.filter((i) => i.is_feature);
  return (featured.length ? featured : all).slice(0, limit);
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
      imageUrl: v.imageUrl ?? null,
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
