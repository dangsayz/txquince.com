import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getAllPosts, getAllEsPosts, esSlugForEn, enSlugForEs } from "@/content/blog";
import { getVendors } from "@/lib/content-db";
import { venues } from "@/content/venues";

/**
 * Stable last-modified for the structural/marketing pages. Bump this only when
 * the site's structure or static copy materially changes — NOT on every deploy.
 * (Stamping every URL with `new Date()` each build teaches Google our lastmod is
 * noise, so it stops trusting it. Blog posts carry their own real dates below.)
 *
 * Photograph pages are intentionally NOT listed here — they live in
 * /image-sitemap.xml (URL + image), so duplicating them here would only dilute
 * the crawl signal of the pages that actually need to rank.
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
    languages: { "en-US": `${site.url}/blog/${en}`, "es-MX": `${site.url}/es/blog/${es}`, "x-default": `${site.url}/blog/${en}` },
  });
  const blogEntries: MetadataRoute.Sitemap = [
    // Index pages change whenever a post is added/updated.
    {
      url: `${site.url}/blog`,
      lastModified: newest(enPosts),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: { "en-US": `${site.url}/blog`, "es-MX": `${site.url}/es/blog`, "x-default": `${site.url}/blog` } },
    },
    {
      url: `${site.url}/es/blog`,
      lastModified: newest(esPosts),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: { "en-US": `${site.url}/blog`, "es-MX": `${site.url}/es/blog`, "x-default": `${site.url}/blog` } },
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

  return [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: LASTMOD,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...blogEntries,
    ...vendorEntries,
  ];
}
