import type { NextConfig } from "next";

/**
 * TX Quince — Next.js config
 *
 * MEDIA OWNERSHIP (LAW 4): all imagery/video is served from the operator's own
 * Cloudflare R2 bucket. Set NEXT_PUBLIC_R2_BASE_URL to your R2 public domain,
 * e.g. https://media.txquince.com  (custom domain on the bucket — recommended)
 * or  https://pub-xxxxxxxx.r2.dev  (the bucket's public r2.dev URL).
 *
 * We derive the allowed remote image hostname from that env var so next/image
 * works in production without hand-editing this file. Generic R2 patterns stay
 * as a fallback.
 */
function r2Hostname(): string | null {
  const base = process.env.NEXT_PUBLIC_R2_BASE_URL;
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

const dynamicR2 = r2Hostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Operator's configured R2 public domain (custom domain or pub-*.r2.dev)
      ...(dynamicR2
        ? [{ protocol: "https" as const, hostname: dynamicR2, pathname: "/**" }]
        : []),
      // Fallbacks so it still works if the env hostname shape changes
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com", pathname: "/**" },
      // Supabase Storage (uploaded portfolio images)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // YouTube/Vimeo poster thumbnails for the video gallery
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
    // The hero/portfolio imagery is large and editorial — allow modern formats.
    formats: ["image/avif", "image/webp"],
  },
  // Premium perception dies on a slow site (PERFORMANCE BUDGET LAW).
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
