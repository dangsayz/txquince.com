import type { NextConfig } from "next";

/**
 * TX Quince — Next.js config
 *
 * MEDIA OWNERSHIP (LAW 4): every public image is served from /api/img/[slug]
 * (private bucket behind it). next/image uses a custom loader (below) so the
 * route gets explicit widths and the client gets a real responsive srcset.
 */
const nextConfig: NextConfig = {
  images: {
    // Every site image is served by /api/img (protected derivatives). A custom
    // loader appends ?w= so next/image emits a true responsive srcset — sharp
    // on retina full-bleeds, light on thumbnails — and the OpenNext optimizer
    // (which 404s on relative dynamic routes) is never involved.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 828, 1080, 1440, 1920, 2400],
    imageSizes: [256, 384, 512],
  },
  // Premium perception dies on a slow site (PERFORMANCE BUDGET LAW).
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
