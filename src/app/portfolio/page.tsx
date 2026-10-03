import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { site } from "@/content/site";
import { getPortfolioImages, getVideos } from "@/lib/content-db";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { portfolioFallback } from "@/content/portfolio-fallback";
import PortfolioLoading from "./loading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Quinceañera galleries across Dallas–Fort Worth — save-the-date, la misa, portraits, the celebration, and films.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · TX Quince",
    description: "Quinceañera galleries across Dallas–Fort Worth — church, portraits, the celebration, and films.",
    url: `${site.url}/portfolio`,
  },
};

export default function PortfolioPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return (
    <>
      <Suspense fallback={<PortfolioLoading />}>
        <PortfolioContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function PortfolioContent({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [dbImages, videos, params] = await Promise.all([getPortfolioImages(), getVideos(), searchParams]);
  const initialQuery = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const sections = [...new Set((dbImages.length ? dbImages : portfolioFallback).map((image) => image.section))]
    .map((id) => ({ id, title: categoryLabel(id) }));
  const items: GalleryItem[] = dbImages.length ? dbImages.map((image) => {
    const copy = publicPhotoCopy(image, altPhraseFor(image.section));
    return {
      url: image.url,
      alt: copy.alt,
      width: image.width,
      height: image.height,
      slug: image.slug,
      section: image.section,
      id: image.id,
      fx: image.focus_x,
      fy: image.focus_y,
      title: copy.title,
      caption: copy.description,
      city: image.city,
      feature: image.is_feature,
      vendors: image.vendors?.map((vendor) => ({
        name: vendor.name,
        business: vendor.business,
        slug: vendor.slug,
        category: vendor.category,
        ig_handle: vendor.ig_handle,
        website: vendor.website,
        role: vendor.role,
      })),
    };
  }) : portfolioFallback.map((image) => ({
    url: image.url,
    alt: image.alt,
    width: image.width,
    height: image.height,
    slug: image.slug,
    section: image.section,
    id: null,
    detailAvailable: false,
    title: image.title,
    caption: image.caption ?? null,
    city: image.city ?? null,
  }));
  const heroPhoto = dbImages.length
    ? items[0]
    : items.find((item) => item.url === "/portfolio/red-garden.webp") ?? items[0] ?? null;
  const videoJsonLd = videos.length > 0 ? {
    "@context": "https://schema.org",
    "@graph": videos.map((video) => {
      const thumb = video.poster_url || (video.provider === "youtube" && video.video_id
        ? `https://i.ytimg.com/vi/${video.video_id}/maxresdefault.jpg`
        : undefined);
      const embedUrl = video.provider === "youtube" && video.video_id
        ? `https://www.youtube.com/embed/${video.video_id}`
        : video.provider === "vimeo" && video.video_id
          ? `https://player.vimeo.com/video/${video.video_id}`
          : video.url;
      return {
        "@type": "VideoObject",
        name: video.title || "Quinceañera film",
        description: `Quinceañera film by ${site.brand} — ${video.title || "a Dallas–Fort Worth celebration"}.`,
        ...(thumb ? { thumbnailUrl: thumb } : {}),
        embedUrl,
        contentUrl: video.url,
      };
    }),
  } : null;

  const imageGalleryJsonLd = dbImages.length ? {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `Portfolio · ${site.brand}`,
    url: `${site.url}/portfolio`,
    associatedMedia: dbImages.slice(0, 60).map((image) => {
      const copy = publicPhotoCopy(image, altPhraseFor(image.section));
      return {
        "@type": ["ImageObject", "Photograph"],
        contentUrl: image.url.startsWith("http") ? image.url.split("?")[0] : `${site.url}${image.url.split("?")[0]}`,
        name: copy.title,
        description: copy.description,
        ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
        creator: { "@type": "Organization", name: site.brand, url: site.url },
        copyrightHolder: { "@type": "Organization", name: site.brand },
        copyrightNotice: `© ${site.brand}`,
        creditText: site.brand,
        license: `${site.url}/privacy`,
        acquireLicensePage: `${site.url}/investment`,
        contentLocation: image.city
          ? { "@type": "City", name: `${image.city}, TX` }
          : { "@type": "Place", name: "Dallas–Fort Worth, TX" },
      };
    }),
  } : null;

  return (
    <>
      {videoJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd).replaceAll("<", "\\u003c") }} /> : null}
      {imageGalleryJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd).replaceAll("<", "\\u003c") }} /> : null}
      <header className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <div className="relative mx-auto min-h-[55svh] max-w-[92rem] overflow-hidden bg-ink sm:min-h-[70svh]">
          <Image src={heroPhoto?.url ?? "/portfolio/hero.webp"} alt={heroPhoto?.alt ?? "Quinceañera portrait in Dallas–Fort Worth"} fill priority unoptimized={!heroPhoto?.url || heroPhoto.url.startsWith("/portfolio/")} sizes="(max-width: 1472px) 100vw, 1472px" className="object-cover" style={heroPhoto ? { objectPosition: `${Math.round((heroPhoto.fx ?? 0.5) * 100)}% ${Math.round((heroPhoto.fy ?? 0.4) * 100)}%` } : undefined} />
          <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative flex min-h-[55svh] flex-col items-center justify-center px-6 py-20 text-center text-white sm:min-h-[70svh]">
            <p className="text-[0.6875rem] uppercase tracking-[0.28em]">The photographs</p>
            <h1 className="mt-5 font-body text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-[1.1] tracking-[-0.035em]">Portfolio</h1>
            <p className="mt-5 max-w-[37rem] text-[0.6875rem] uppercase leading-5 tracking-[0.2em]">Quinceañera portraits, traditions & celebration in Dallas–Fort Worth</p>
          </div>
        </div>
        <p className="mx-auto max-w-2xl px-2 py-9 text-center font-serif text-lg leading-relaxed text-ink-soft sm:py-12 sm:text-xl">The dress, the quiet moments before, the room when everyone is together. Every photograph belongs to her story.</p>
      </header>
      <section id="photographs" className="scroll-mt-24 bg-white" aria-label="Photograph gallery">
        <div className="mx-auto max-w-[92rem] px-4 pb-24 pt-5 sm:px-6 md:px-10 md:pb-32 md:pt-16 lg:px-14">
          <PortfolioGallery key={initialQuery} images={items} sections={sections} initialQuery={initialQuery} editorial imageSizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 45vw, 42vw" />
        </div>
      </section>

      {videos.length ? (
        <section id="films" className="scroll-mt-24 bg-cream">
          <div className="mx-auto max-w-[92rem] px-4 py-20 sm:px-6 md:px-10 md:py-28 lg:px-14">
            <p className="text-center text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-ink-soft">Photography & film</p>
            <h2 className="mt-4 text-center font-body text-[clamp(2.25rem,4vw,3.25rem)] font-light tracking-[-0.04em] text-ink">Her day in motion</h2>
            <p className="mx-auto mb-12 mt-4 max-w-lg text-center font-serif text-lg leading-relaxed text-ink-soft">Watch the joy unfold in a film to return to for years.</p>
            <VideoGallery videos={videos} />
          </div>
        </section>
      ) : null}
    </>
  );
}
