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
import { BlogArticleView } from "@/components/BlogContent";

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
  const post = getEsPost(slug);
  if (!post) return {};
  const url = `${site.url}/es/blog/${post.slug}`;
  const enSlug = enSlugForEs(post.slug);
  return {
    title: post.metaTitle ?? post.title,
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
    openGraph: {
      type: "article",
      locale: "es_MX",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

export default async function EsBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getEsPost(slug);
  if (!post) notFound();

  const url = `${site.url}/es/blog/${post.slug}`;
  const related = relatedEsPosts(post);
  const images = await getBlogImages(post.content);
  const imageUrls = Object.values(images).map((im) =>
    im.url.startsWith("http") ? im.url : `${site.url}${im.url}`,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: "es",
        author: { "@type": "Organization", name: site.brand, url: site.url },
        publisher: { "@type": "Organization", name: site.brand, url: site.url },
        mainEntityOfPage: url,
        articleSection: post.category,
        ...(imageUrls.length ? { image: imageUrls } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
          { "@type": "ListItem", position: 2, name: "Diario", item: `${site.url}/es/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faqs && post.faqs.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              inLanguage: "es",
              mainEntity: post.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticleView lang="es" post={post} images={images} related={related} />
    </>
  );
}
