import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { locations } from "@/content/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/portfolio", priority: 0.8 },
    { path: "/investment", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/check-your-date", priority: 0.9 },
    { path: "/quinceanera-photographer", priority: 0.8 },
    { path: "/privacy", priority: 0.2 },
    // Local SEO landing pages — one per DFW city served.
    ...locations.map((l) => ({
      path: `/quinceanera-photographer/${l.slug}`,
      priority: 0.7,
    })),
  ];
  return routes.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
