import type { Metadata } from "next";
import { site } from "@/content/site";
import { getAllEsPosts } from "@/content/blog";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
import { BlogIndexView, type BlogThumb } from "@/components/BlogContent";
import { blogIndexJsonLd } from "@/app/blog/structured-data";
import { jsonLdString } from "@/lib/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Guía de Quinceañera (Dallas–Fort Worth)",
  description:
    "Guías honestas para planear una quinceañera en Dallas–Fort Worth: costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo y equipo de video.",
  alternates: {
    canonical: "/es/blog",
    languages: { "es-MX": "/es/blog", "en-US": "/blog", "x-default": "/blog" },
  },
  // openGraph/twitter replace the root layout's objects wholesale (shallow
  // merge), so the index restates siteName/locale/image and its own card copy.
  openGraph: {
    type: "website",
    siteName: site.brand,
    locale: "es_MX",
    alternateLocale: ["en_US"],
    title: "Guía de Quinceañera · TX Quince",
    description: "Costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo en Dallas–Fort Worth.",
    url: `${site.url}/es/blog`,
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "TX Quince — Fotos y video de quinceañera en Dallas–Fort Worth" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guía de Quinceañera · TX Quince",
    description: "Costos reales, fechas, tradiciones y cómo elegir a tu fotógrafo en Dallas–Fort Worth.",
    images: [`${site.url}/opengraph-image`],
  },
};

export default async function EsBlogIndexPage() {
  const posts = fillDeep(getAllEsPosts(), await getPriceBook());

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

  const jsonLd = blogIndexJsonLd({
    url: `${site.url}/es/blog`,
    name: "Diario",
    description: String(metadata.description ?? ""),
    lang: "es",
    posts,
    crumbs: [{ name: "Inicio", item: `${site.url}/es` }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
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
    </>
  );
}
