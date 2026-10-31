import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { seriesFor } from "@/content/blog-clusters";
import { getAllPosts, getPost, relatedPosts, esSlugForEn } from "@/content/blog";
import { getBlogImages } from "@/lib/content-db";
import { absoluteImageUrl, ogImageFor, resolveBlogCover } from "@/lib/blog-cover";
import { blogPostingJsonLd, postMetaTitle } from "@/lib/blog-structured-data";
import { BlogArticleView } from "@/components/BlogContent";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { jsonLdString } from "@/lib/json-ld";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Posts carry price tokens; fill from the live book (meta + body + JSON-LD).
  const raw = getPost(slug);
  if (!raw) return {};
  const post = fillDeep(raw, await getPriceBook());
  const url = `${site.url}/blog/${post.slug}`;
  const esSlug = esSlugForEn(post.slug);
  const cover = await resolveBlogCover(post, await getBlogImages(post.content), "en");
  const og = ogImageFor(cover);
  return {
    title: postMetaTitle(post),
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
      ...(esSlug
        ? {
            languages: languageAlternates(`/blog/${post.slug}`, `/es/blog/${esSlug}`),
          }
        : {}),
    },
    // openGraph/twitter replace the root layout's objects wholesale (shallow
    // merge), so every field a post needs is restated here.
    openGraph: {
      type: "article",
      siteName: site.brand,
      locale: "en_US",
      ...(esSlug ? { alternateLocale: [OG_LOCALE.es] } : {}),
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      section: post.category,
      images: [og],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [og.url],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = getPost(slug);
  if (!raw) notFound();
  const book = await getPriceBook();
  const post = fillDeep(raw, book);

  const url = `${site.url}/blog/${post.slug}`;
  const related = fillDeep(relatedPosts(raw), book);
  const series = fillDeep(seriesFor(raw.slug, "en"), book);
  const images = await getBlogImages(post.content);
  const cover = await resolveBlogCover(post, images, "en");
  const coverAbs = absoluteImageUrl(cover.url);

  const jsonLd = blogPostingJsonLd({
    post,
    url,
    lang: "en",
    coverUrl: coverAbs,
    imageUrls: Object.values(images).map((im) => absoluteImageUrl(im.url)),
    crumbs: [
      { name: "Home", item: site.url },
      { name: "Journal", item: `${site.url}/blog` },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <BlogArticleView
        lang="en"
        post={post}
        images={images}
        cover={cover}
        related={related}
        series={series}
        shareUrl={url}
        shareImage={coverAbs}
      />
    </>
  );
}
