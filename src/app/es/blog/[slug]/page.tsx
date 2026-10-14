import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import {
  getAllEsPosts,
  getEsPost,
  relatedEsPosts,
  enSlugForEs,
} from "@/content/blog";
import { getBlogImages } from "@/lib/content-db";
import { absoluteImageUrl, ogImageFor, resolveBlogCover } from "@/lib/blog-cover";
import { blogPostingJsonLd, postMetaTitle } from "@/app/blog/structured-data";
import { BlogArticleView } from "@/components/BlogContent";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllEsPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Posts carry price tokens; fill from the live book (meta + body + JSON-LD).
  const raw = getEsPost(slug);
  if (!raw) return {};
  const post = fillDeep(raw, await getPriceBook());
  const url = `${site.url}/es/blog/${post.slug}`;
  const enSlug = enSlugForEs(post.slug);
  const cover = await resolveBlogCover(post, await getBlogImages(post.content), "es");
  const og = ogImageFor(cover);
  return {
    title: postMetaTitle(post),
    description: post.description,
    alternates: {
      canonical: `/es/blog/${post.slug}`,
      ...(enSlug
        ? {
            languages: {
              "es-MX": `/es/blog/${post.slug}`,
              "en-US": `/blog/${enSlug}`,
              "x-default": `/blog/${enSlug}`,
            },
          }
        : {}),
    },
    // openGraph/twitter replace the root layout's objects wholesale (shallow
    // merge), so every field a post needs is restated here.
    openGraph: {
      type: "article",
      siteName: site.brand,
      locale: "es_MX",
      ...(enSlug ? { alternateLocale: ["en_US"] } : {}),
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

export default async function EsBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = getEsPost(slug);
  if (!raw) notFound();
  const book = await getPriceBook();
  const post = fillDeep(raw, book);

  const url = `${site.url}/es/blog/${post.slug}`;
  const related = fillDeep(relatedEsPosts(raw), book);
  const images = await getBlogImages(post.content);
  const cover = await resolveBlogCover(post, images, "es");
  const coverAbs = absoluteImageUrl(cover.url);

  const jsonLd = blogPostingJsonLd({
    post,
    url,
    lang: "es",
    coverUrl: coverAbs,
    imageUrls: Object.values(images).map((im) => absoluteImageUrl(im.url)),
    crumbs: [
      { name: "Inicio", item: `${site.url}/es` },
      { name: "Diario", item: `${site.url}/es/blog` },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticleView
        lang="es"
        post={post}
        images={images}
        cover={cover}
        related={related}
        shareUrl={url}
        shareImage={coverAbs}
      />
    </>
  );
}
