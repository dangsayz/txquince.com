import type { Metadata } from "next";
import { site } from "@/content/site";
import { getAllEsPosts } from "@/content/blog";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
import { BlogIndexView, type BlogThumb } from "@/components/BlogContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guía de Quinceañera (Dallas–Fort Worth)",
  description:
    "Guías honestas para planear una quinceañera en Dallas–Fort Worth: costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo y equipo de video.",
  alternates: {
    canonical: "/es/blog",
    languages: { "es-MX": "/es/blog", "en-US": "/blog", "x-default": "/blog" },
  },
  openGraph: {
    locale: "es_MX",
    title: "Guía de Quinceañera · TX Quince",
    description: "Costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo en Dallas–Fort Worth.",
    url: `${site.url}/es/blog`,
  },
};

export default async function EsBlogIndexPage() {
  const posts = getAllEsPosts();

  const imgs = await getFeaturedImages(24);
  const toThumb = (image: (typeof imgs)[number]): BlogThumb => ({
    url: image.url,
    alt: image.alt || "Fotografía de quinceañera en Dallas–Fort Worth",
    focus_x: image.focus_x,
    focus_y: image.focus_y,
  });
  const fallbacks: BlogThumb[] = portfolioFallback.map((image) => ({ url: image.url, alt: image.alt }));
  const heroImg = (await getPageHero("blog")) ?? imgs[0] ?? null;
  const featuredImage = heroImg ? toThumb(heroImg) : (fallbacks[0] ?? null);
  const pool: BlogThumb[] = imgs.filter((i) => i.url !== heroImg?.url).map(toThumb);
  const tiles = pool.length ? pool : fallbacks.slice(1);
  const thumbs = new Map(posts.map((p, idx) => [p.slug, tiles.length ? tiles[idx % tiles.length] : null]));

  return (
    <BlogIndexView
      lang="es"
      title={
        <>
          Planea su quinceañera <em>con claridad.</em>
        </>
      }
      dek="Costos, fechas y tradiciones para las familias de Dallas–Fort Worth. Respuestas concretas antes de tomar decisiones."
      posts={posts}
      featuredImage={featuredImage}
      thumbs={thumbs}
    />
  );
}
