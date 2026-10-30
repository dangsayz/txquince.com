import type { Metadata } from "next";
import { site } from "@/content/site";
import { getAllPosts } from "@/content/blog";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { getFeaturedImages, getPageHero } from "@/lib/content-db";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { BlogIndexView, type BlogThumb } from "@/components/BlogContent";
import { blogIndexJsonLd } from "@/lib/blog-structured-data";
import { jsonLdString } from "@/lib/json-ld";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quinceañera Planning Guide & Journal",
  description:
    "Honest, no-guesswork guides to planning a quinceañera in Dallas–Fort Worth — real costs, timelines, traditions, and how to choose your photo & video team.",
  alternates: {
    canonical: "/blog",
    languages: languageAlternates("/blog", "/es/blog"),
  },
  // openGraph/twitter replace the root layout's objects wholesale (shallow
  // merge), so the index restates siteName/locale/image and its own card copy.
  openGraph: {
    type: "website",
    siteName: site.brand,
    locale: "en_US",
    alternateLocale: [OG_LOCALE.es],
    title: "Quinceañera Planning Guide · TX Quince",
    description:
      "Real costs, timelines, traditions, and how to choose your photographer in Dallas–Fort Worth.",
    url: `${site.url}/blog`,
    images: [{ url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "TX Quince — Quinceañera photos & video in Dallas–Fort Worth" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quinceañera Planning Guide · TX Quince",
    description:
      "Real costs, timelines, traditions, and how to choose your photographer in Dallas–Fort Worth.",
    images: [`${site.url}/opengraph-image`],
  },
};

export default async function BlogIndexPage() {
  const posts = fillDeep(getAllPosts(), await getPriceBook());

  // Real photography carries the contrast a text-only index can't. The featured
  // frame is operator-choosable in /admin/hero (page "blog"), falling back to
  // the top featured photo; each list row gets a different frame.
  const imgs = await getFeaturedImages(24);
  const toThumb = (image: (typeof imgs)[number]): BlogThumb => ({
    url: image.url,
    alt: publicPhotoCopy(image, altPhraseFor(image.section)).alt,
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
    url: `${site.url}/blog`,
    name: "Journal",
    description: String(metadata.description ?? ""),
    lang: "en",
    posts,
    crumbs: [{ name: "Home", item: site.url }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <BlogIndexView
        lang="en"
        title={
          <>
            Stories around <em>her day.</em>
          </>
        }
        dek="Costs, timelines, photos, video, and the traditions that shape the celebration."
        aside={{ href: "/quinceanera-guide", label: "Begin with the planning guide" }}
        posts={posts}
        featuredImage={featuredImage}
        thumbs={thumbs}
      />
    </>
  );
}
