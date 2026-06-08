/**
 * media.ts — MEDIA SOURCE (Cloudflare R2, operator-owned — LAW 4)
 *
 * All imagery/video lives on YOUR R2 bucket. Set NEXT_PUBLIC_R2_BASE_URL in the
 * environment (Vercel + .env.local) to the bucket's public domain, e.g.
 *   https://media.txquince.com        (custom domain — recommended)
 *   https://pub-xxxxxxxxxxxx.r2.dev   (the bucket's public r2.dev URL)
 *
 * Then reference media by its KEY (the path inside the bucket), e.g. "home/hero-poster.jpg".
 * Until a key + base URL exist, the UI renders a tasteful, clearly-labeled
 * placeholder (LAW 5: only release-cleared media goes live; placeholders never
 * pretend to be a real photo).
 */

export const R2_BASE_URL = process.env.NEXT_PUBLIC_R2_BASE_URL ?? "";

/** Build a full URL from an R2 key. Returns null when not resolvable yet. */
export function mediaUrl(key?: string | null): string | null {
  if (!key) return null;
  // Allow already-absolute URLs to pass through (e.g. a temporary CDN link).
  if (/^https?:\/\//i.test(key)) return key;
  if (!R2_BASE_URL) return null;
  return `${R2_BASE_URL.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

/**
 * HERO MEDIA (PERF LAW): the poster still is the LCP element. The compressed,
 * muted, looping highlight video lazy-loads AFTER and only autoplays on larger
 * screens; mobile keeps the still. Provide compressed files on R2.
 */
export const hero = {
  posterKey: "" as string, // e.g. "home/hero-poster.jpg" (1920x1080+, compressed)
  videoMp4Key: "" as string, // e.g. "home/hero-loop.mp4" (muted, ~6–12s, <3MB)
  videoWebmKey: "" as string, // e.g. "home/hero-loop.webm" (optional, smaller)
  // Alt/spoken description of the poster for accessibility + image SEO.
  posterAlt:
    "A quinceañera in her ballgown at golden hour, photographed across Dallas–Fort Worth.",
};

/** Home highlight film — one strong embedded reel (R2). */
export const homeFilm = {
  // A poster frame for the film section.
  posterKey: "" as string, // e.g. "home/film-poster.jpg"
  mp4Key: "" as string, // e.g. "films/highlight-reel.mp4"
  webmKey: "" as string,
  title: "A quinceañera, start to finish",
  alt: "Highlight film still: la misa, el vals, and the celebration.",
};
