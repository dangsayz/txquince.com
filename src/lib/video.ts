/**
 * video.ts — parse a pasted video link into something we can display.
 * Handles YouTube, Vimeo, direct video files (e.g. a QuinceNetwork R2 .mp4),
 * and falls back to a "link" card for anything else (e.g. an album page).
 * Pure + isomorphic (used on server when saving, and on client for preview).
 */
export type VideoProvider = "youtube" | "vimeo" | "file" | "link";

export type ParsedVideo = {
  provider: VideoProvider;
  videoId: string | null;
  /** Embeddable iframe src (youtube/vimeo) or direct file URL. */
  embedUrl: string | null;
  /** Auto-derived poster when available (YouTube). */
  posterUrl: string | null;
  url: string;
};

function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/live\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function parseVideoUrl(raw: string): ParsedVideo {
  const url = raw.trim();

  const yt = youtubeId(url);
  if (yt) {
    return {
      provider: "youtube",
      videoId: yt,
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`,
      posterUrl: `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`,
      url,
    };
  }

  const vm = vimeoId(url);
  if (vm) {
    return {
      provider: "vimeo",
      videoId: vm,
      embedUrl: `https://player.vimeo.com/video/${vm}?byline=0&portrait=0&title=0`,
      posterUrl: null,
      url,
    };
  }

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) {
    return { provider: "file", videoId: null, embedUrl: url, posterUrl: null, url };
  }

  return { provider: "link", videoId: null, embedUrl: null, posterUrl: null, url };
}

/** Rebuild the embed src from stored provider + id (display side). */
export function embedSrc(provider: VideoProvider, videoId: string | null, url: string): string | null {
  if (provider === "youtube" && videoId)
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
  if (provider === "vimeo" && videoId)
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&byline=0&portrait=0&title=0`;
  if (provider === "file") return url;
  return null;
}
