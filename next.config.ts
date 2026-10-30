import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

/**
 * TX Quince — Next.js config
 *
 * MEDIA OWNERSHIP (LAW 4): every public image is served from /api/img/[slug]
 * (private bucket behind it). next/image uses a custom loader (below) so the
 * route gets explicit widths and the client gets a real responsive srcset.
 */
const WWW_HOST = [{ type: "host" as const, value: "www\\.txquince\\.com" }];
const WWW_REDIRECTS = [
  { source: "/", has: WWW_HOST, destination: "https://txquince.com/", permanent: true },
  { source: "/:path+", has: WWW_HOST, destination: "https://txquince.com/:path+", permanent: true },
];

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
  // The fixed-price collections and their booking flow were retired for the
  // commission model on the homepage; keep their search equity with 308s.
  async redirects() {
    return [
      // One host: www.txquince.com → https://txquince.com, same path + query
      // (Next carries the query string over). Runs in the routing layer
      // (OpenNext implements `has: host`), so the public pages' middleware-free
      // fast path stays as is. http → https is Cloudflare's "Always Use HTTPS".
      // The root gets its own rule: OpenNext compiles an empty `/:path*` match
      // into a literal ":path*" in the Location header.
      ...WWW_REDIRECTS,
      { source: "/investment", destination: "/#commissions", permanent: true },
      { source: "/payment-plans", destination: "/#commissions", permanent: true },
      { source: "/reserve", destination: "/#intake", permanent: true },
      { source: "/es/paquetes", destination: "/es#commissions", permanent: true },
      { source: "/es/planes-de-pago", destination: "/es#commissions", permanent: true },
      // The bundled Save-the-Date session became the Portrait Study.
      { source: "/quinceanera-save-the-date", destination: "/quinceanera-photoshoot", permanent: true },
      { source: "/es/save-the-date-quinceanera", destination: "/es/sesion-de-fotos-quinceanera", permanent: true },
    ];
  },
  // Security headers on every route (M4). The CSP is Report-Only for now —
  // see src/lib/security-headers.ts for the allowlist and the switch-over plan.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          dev: process.env.NODE_ENV === "development",
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          mediaBaseUrl: process.env.NEXT_PUBLIC_R2_BASE_URL,
        }),
      },
    ];
  },
  // Two root layouts (app/(en) and app/es, so each language renders its own
  // <html lang>) means no single layout for unmatched URLs; app/global-not-found.tsx
  // is the 404 for those.
  experimental: {
    globalNotFound: true,
  },
  // Premium perception dies on a slow site (PERFORMANCE BUDGET LAW).
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
