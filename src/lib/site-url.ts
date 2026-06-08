/**
 * site-url.ts — the canonical absolute origin for building Stripe redirect URLs.
 *
 * Prefers an explicit env override, then Vercel's deployment URLs, then the
 * production domain from site config. Never has a trailing slash.
 */
import { site } from "@/content/site";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    site.url;

  return raw.trim().replace(/\/+$/, "");
}
