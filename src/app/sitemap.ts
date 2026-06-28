import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getAllPosts, getAllEsPosts } from "@/content/blog";
import { getPortfolioImages, getVendors } from "@/lib/content-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/portfolio", priority: 0.8 },
    { path: "/investment", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/check-your-date", priority: 0.9 },
    { path: "/quinceanera-photographer", priority: 0.8 },
    { path: "/es/fotografo-de-quinceaneras", priority: 0.8 },
    { path: "/quinceanera-save-the-date", priority: 0.7 },
    { path: "/es/save-the-date-quinceanera", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    { path: "/vendors", priority: 0.6 },
    { path: "/blog", priority: 0.7 },
    // Blog posts (the planning guide), EN + ES.
    ...getAllPosts().map((p) => ({ path: `/blog/${p.slug}`, priority: 0.6 })),
    { path: "/es/blog", priority: 0.7 },
    ...getAllEsPosts().map((p) => ({ path: `/es/blog/${p.slug}`, priority: 0.6 })),
    // Local SEO landing pages — one per DFW city served, EN + ES.
    ...locations.map((l) => ({
      path: `/quinceanera-photographer/${l.slug}`,
      priority: 0.7,
    })),
    ...locations.map((l) => ({
      path: `/es/fotografo-de-quinceaneras/${l.slug}`,
      priority: 0.7,
    })),
  ];

  // Every slugged photograph is an independently indexable page (+ its asset).
  const photoEntries: MetadataRoute.Sitemap = (await getPortfolioImages())
    .filter((i) => i.slug)
    .map((i) => ({
      url: `${site.url}/photos/${i.section}/${i.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      images: [`${site.url}/api/img/${i.slug}`],
    }));

  // One indexable credit page per vendor.
  const vendorEntries: MetadataRoute.Sitemap = (await getVendors()).map((v) => ({
    url: `${site.url}/vendors/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...routes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...vendorEntries,
    ...photoEntries,
  ];
}
