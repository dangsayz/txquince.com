/**
 * /blog/feed.json — every Journal post as a JSON Feed (jsonfeed.org 1.1).
 *
 * Made for the social bots (Muse on Facebook, Grokbot): one address that always
 * lists every post, newest first, with a short summary, the cover photo, the
 * topic and the Spanish version. A new post appears here the moment it ships,
 * so nobody has to hand a bot a list again.
 *
 * Summaries can carry price tokens; they are filled from the live price book.
 */
import { getAllPosts, getEsPost, esSlugForEn } from "@/content/blog";
import { getBlogPhoto } from "@/content/blog-photos";
import { site } from "@/content/site";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";

export const revalidate = 3600;

function coverOf(content: { type: string; slug?: string }[]): string | undefined {
  const first = content.find((b) => b.type === "image" && b.slug);
  if (!first?.slug) return undefined;
  const src = getBlogPhoto(first.slug)?.src ?? `/api/img/${first.slug}`;
  return `${site.url}${src}${src.startsWith("/api/img/") ? "?w=1200" : ""}`;
}

export async function GET() {
  const book = await getPriceBook();
  const posts = [...getAllPosts()].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
  const items = posts.map((raw) => {
    const p = fillDeep({ title: raw.title, excerpt: raw.excerpt, description: raw.description }, book);
    const esSlug = esSlugForEn(raw.slug);
    const es = esSlug ? getEsPost(esSlug) : undefined;
    const esText = es ? fillDeep({ title: es.title, excerpt: es.excerpt }, book) : undefined;
    return {
      id: `${site.url}/blog/${raw.slug}`,
      url: `${site.url}/blog/${raw.slug}`,
      title: p.title,
      summary: p.excerpt || p.description,
      image: coverOf(raw.content),
      date_published: `${raw.publishedAt}T12:00:00-06:00`,
      tags: [raw.category],
      language: "en",
      _spanish: es && esText ? { url: `${site.url}/es/blog/${es.slug}`, title: esText.title, summary: esText.excerpt } : undefined,
    };
  });
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "TX Quince Journal",
    home_page_url: `${site.url}/blog`,
    feed_url: `${site.url}/blog/feed.json`,
    description:
      "Every TX Quince Journal post, newest first. For any price, read the live budget page first. Do not add prices or claims that are not in the post.",
    language: "en",
    _rules: {
      prices: `${site.url}/budget`,
      spanish_index: `${site.url}/es/blog`,
      note: "Quote the post. Never invent prices, reviews, numbers or availability.",
    },
    items,
  };
  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "content-type": "application/feed+json; charset=utf-8", "cache-control": "public, max-age=600, s-maxage=3600" },
  });
}
