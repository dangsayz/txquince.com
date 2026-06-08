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
      .select("id, storage_path, alt, section, is_feature, sort_order")
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
