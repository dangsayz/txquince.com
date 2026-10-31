import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getAllPosts, getAllEsPosts, esSlugForEn, enSlugForEs } from "@/content/blog";
import { getVendors } from "@/lib/content-db";
import { getPriceGuide } from "@/lib/plan-db";
import { guideUpdated } from "@/lib/price-guide";
import { venues } from "@/content/venues";
import { languageAlternates } from "@/lib/hreflang";

/**
 * Stable last-modified for the structural/marketing pages. Bump this only when
 * the site's structure or static copy materially changes — NOT on every deploy.
 * (Stamping every URL with `new Date()` each build teaches Google our lastmod is
 * noise, so it stops trusting it. Blog posts carry their own real dates below.)
 *
 * Single-photograph pages (/photos/[category]/[slug]) are NOT listed here or in
 * /image-sitemap.xml: they are `noindex, follow` share targets. The images
 * themselves are in /image-sitemap.xml under /portfolio, the gallery that shows
 * them. Only list a URL here if it is indexable and canonical to itself.
 */
const LASTMOD = "2026-06-28";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Structural + marketing pages (stable lastmod).
  const staticRoutes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/portfolio", priority: 0.8 },
    { path: "/quinceanera-videographer", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/check-your-date", priority: 0.9 },
    { path: "/quinceanera-guide", priority: 0.9 },
    { path: "/quinceanera-photographer", priority: 0.8 },
    { path: "/es/fotografo-de-quinceaneras", priority: 0.8 },
    { path: "/es", priority: 0.9 },
    { path: "/es/consulta", priority: 0.9 },
    // Personalized quince plan intake (EN ↔ ES).
    { path: "/plan", priority: 0.6 },
    { path: "/es/plan", priority: 0.6 },
    { path: "/es/salones", priority: 0.7 },
    { path: "/es/videografo-de-quinceaneras", priority: 0.8 },
    { path: "/quinceanera-photoshoot", priority: 0.8 },
    { path: "/es/sesion-de-fotos-quinceanera", priority: 0.8 },
    // Latest photo-dump albums (EN ↔ ES pair; both pages carry hreflang).
    { path: "/photos/latest", priority: 0.7 },
    { path: "/es/fotos-recientes", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    { path: "/venues", priority: 0.7 },
    { path: "/vendors", priority: 0.6 },
    // Venue landing pages — one per venue we shoot at (keyword targets).
    ...venues.map((v) => ({ path: `/venues/${v.slug}`, priority: 0.7 })),
    // Local SEO landing pages — one per DFW city served, EN + ES.
    ...locations.map((l) => ({ path: `/quinceanera-photographer/${l.slug}`, priority: 0.7 })),
    ...locations.map((l) => ({ path: `/es/fotografo-de-quinceaneras/${l.slug}`, priority: 0.7 })),
  ];

  // Blog posts carry their REAL publish/update dates (honest freshness signal),
  // and each EN↔ES translation pair lists its hreflang alternates (mirrors the
  // <link rel="alternate"> tags on the pages).
  const enPosts = getAllPosts();
  const esPosts = getAllEsPosts();
  const newest = (list: typeof enPosts) =>
    list.reduce((max, p) => {
      const d = p.updatedAt || p.publishedAt;
      return d > max ? d : max;
    }, LASTMOD);
  const pair = (en: string, es: string) => ({
    languages: languageAlternates(`${site.url}/blog/${en}`, `${site.url}/es/blog/${es}`),
  });
  const blogEntries: MetadataRoute.Sitemap = [
    // Index pages change whenever a post is added/updated.
    {
      url: `${site.url}/blog`,
      lastModified: newest(enPosts),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: languageAlternates(`${site.url}/blog`, `${site.url}/es/blog`) },
    },
    {
      url: `${site.url}/es/blog`,
      lastModified: newest(esPosts),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: languageAlternates(`${site.url}/blog`, `${site.url}/es/blog`) },
    },
    ...enPosts.map((p) => {
      const es = esSlugForEn(p.slug);
      return {
        url: `${site.url}/blog/${p.slug}`,
        lastModified: p.updatedAt || p.publishedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...(es ? { alternates: pair(p.slug, es) } : {}),
      };
    }),
    ...esPosts.map((p) => {
      const en = enSlugForEs(p.slug);
      return {
        url: `${site.url}/es/blog/${p.slug}`,
        lastModified: p.updatedAt || p.publishedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        ...(en ? { alternates: pair(en, p.slug) } : {}),
      };
    }),
  ];

  // One indexable credit page per vendor.
  const vendorEntries: MetadataRoute.Sitemap = (await getVendors()).map((v) => ({
    url: `${site.url}/vendors/${v.slug}`,
    lastModified: LASTMOD,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  // The DFW price guide pair, only once it has rows (empty = noindex).
  const guide = await getPriceGuide();
  const guideUpdatedAt = guideUpdated(guide);
  const guideAlt = { languages: languageAlternates(`${site.url}/quince-prices-dfw`, `${site.url}/precios-quince-dfw`) };
  const guideEntries: MetadataRoute.Sitemap = guide.length
    ? ["/precios-quince-dfw", "/quince-prices-dfw"].map((path) => ({
        url: `${site.url}${path}`,
        lastModified: guideUpdatedAt ?? LASTMOD,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: guideAlt,
      }))
    : [];

  return [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: LASTMOD,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...blogEntries,
    ...guideEntries,
    ...vendorEntries,
  ];
}
