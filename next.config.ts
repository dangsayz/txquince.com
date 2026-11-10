import type { NextConfig } from "next";
import { getDeploymentId } from "@opennextjs/cloudflare";
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
  // A new id per build. Next tags asset and page requests with it, and the
  // Worker sends requests from an older build to that older version
  // (skew protection, see open-next.config.ts), so open tabs survive a deploy.
  deploymentId: getDeploymentId(),
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
      // /reserve is a route handler (src/app/reserve/route.ts), not a rule here:
      // it has to keep ?collection= and ?src= in front of the #intake hash.
      // Addresses families type or guess: packages live on the homepage,
      // contact is the check-your-date inquiry page.
      { source: "/packages", destination: "/#commissions", permanent: true },
      { source: "/pricing", destination: "/#commissions", permanent: true },
      { source: "/contact", destination: "/check-your-date", permanent: true },
      // /photos has category pages under it but no page of its own; the gallery is /portfolio.
      { source: "/photos", destination: "/portfolio", permanent: true },
      // Slate's official name is "Slate Venues at II Creeks" (Richardson, not Allen).
      { source: "/venues/slate-at-eleven-creeks", destination: "/venues/slate-venues-at-ii-creeks", permanent: true },
      { source: "/es/contacto", destination: "/es/consulta", permanent: true },
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
  // No `stale-while-revalidate` on pages. Next's default sends
  // `s-maxage=3600, stale-while-revalidate=<1 year>`, meant for a CDN. Here the
  // header goes straight to the browser, and Chrome obeys it: after a deploy it
  // hands a page its year-stale stored copy of the in-app page data (the
  // `?_rsc=` address is the same across deploys), that copy names script and
  // style files the deploy deleted, they 404, and the family sees "We couldn't
  // load this page" until she refreshes. Equal to the pages' `revalidate`
  // (3600) the stale window is zero, so the header is just `s-maxage=3600`.
  // Keep it at or below the smallest page `revalidate`; the secret shopper
  // fails any page that sends the stale header again.
  expireTime: 3600,
  // Premium perception dies on a slow site (PERFORMANCE BUDGET LAW).
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
