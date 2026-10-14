import "server-only";
import { getVideos } from "@/lib/content-db";
import { embedSrc } from "@/lib/video";
import type { CinemaFilm } from "./data";

/**
 * The Cinema Room's films: the real videos managed in /admin (Supabase
 * `videos`), feature first. Only playable providers are kept — a plain
 * "link" row has nothing to screen.
 */
export async function getCinemaFilms(): Promise<CinemaFilm[]> {
  const rows = await getVideos();
  const films: CinemaFilm[] = [];
  for (const v of rows) {
    const embed = embedSrc(v.provider, v.video_id, v.url);
    if (!embed) continue;
    const poster =
      v.poster_url ||
      (v.provider === "youtube" && v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/maxresdefault.jpg` : null);
    films.push({
      id: v.id,
      title: v.title.trim(),
      provider: v.provider,
      embed,
      poster,
      fallbackPoster:
        v.provider === "youtube" && v.video_id ? `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg` : null,
      vertical: v.orientation === "vertical",
      feature: v.is_feature,
    });
  }
  // Feature first (else the first landscape film), the rest in admin order.
  const lead =
    films.findIndex((f) => f.feature) >= 0
      ? films.findIndex((f) => f.feature)
      : Math.max(0, films.findIndex((f) => !f.vertical));
  if (lead > 0) films.unshift(...films.splice(lead, 1));
  return films;
}
