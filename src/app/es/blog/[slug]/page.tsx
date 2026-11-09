import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { seriesFor } from "@/content/blog-clusters";
import {
  getAllEsPosts,
  getEsPost,
  relatedEsPosts,
  enSlugForEs,
} from "@/content/blog";
import { getBlogImages } from "@/lib/content-db";
import { absoluteImageUrl, coverThumbs, ogImageFor, resolveBlogCover } from "@/lib/blog-cover";
import { blogPostingJsonLd, postMetaTitle } from "@/lib/blog-structured-data";
import { BlogArticleView } from "@/components/BlogContent";
import { VenueExperience } from "@/components/VenueExperience";
import { getVenue } from "@/content/venues";
import { getVenueExperience } from "@/lib/venue-experience-db";
import { BlogCommentRail, BlogComments } from "@/components/comments/BlogComments";
import { getPriceBook } from "@/lib/pricing";
import { fillDeep } from "@/lib/price-text";
import { jsonLdString } from "@/lib/json-ld";
import { languageAlternates, OG_LOCALE } from "@/lib/hreflang";

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
            languages: languageAlternates(`/blog/${enSlug}`, `/es/blog/${post.slug}`),
          }
        : {}),
    },
    // openGraph/twitter replace the root layout's objects wholesale (shallow
    // merge), so every field a post needs is restated here.
    openGraph: {
      type: "article",
      siteName: site.brand,
      locale: OG_LOCALE.es,
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
  const series = fillDeep(seriesFor(raw.slug, "es"), book);
  const images = await getBlogImages(post.content);
  const cover = await resolveBlogCover(post, images, "es");
  const coverAbs = absoluteImageUrl(cover.url);
  // Venue posts open with the owner's own account of working there.
  const postVenues = (raw.venues ?? []).map((v) => getVenue(v)).filter((v) => v !== undefined);
  const experiences = await Promise.all(postVenues.map((v) => getVenueExperience(v.slug)));
  const relatedThumbs = await coverThumbs(related, "es");

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <BlogArticleView
        lang="es"
        post={post}
        images={images}
        cover={cover}
        related={related}
        relatedThumbs={relatedThumbs}
        experience={
          postVenues.length ? (
            <>
              {postVenues.map((v, i) => (
                <VenueExperience
                  key={v.slug}
                  lang="es"
                  venue={{ slug: v.slug, name: v.venue }}
                  initial={experiences[i]}
                  shareUrl={`${site.url}/venues/${v.slug}/experience`}
                />
              ))}
            </>
          ) : null
        }
        series={series}
        shareUrl={url}
        shareImage={coverAbs}
        comments={<BlogComments lang="es" slug={post.slug} />}
        commentRail={<BlogCommentRail lang="es" slug={post.slug} />}
      />
    </>
  );
}
