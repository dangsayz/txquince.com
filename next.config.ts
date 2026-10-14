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
  // The fixed-price collections and their booking flow were retired for the
  // commission model on the homepage; keep their search equity with 308s.
  async redirects() {
    return [
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
  // Premium perception dies on a slow site (PERFORMANCE BUDGET LAW).
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
