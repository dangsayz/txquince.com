import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { site } from "@/content/site";
import { getPortfolioImages, getVideos } from "@/lib/content-db";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { FinalCTA } from "@/components/FinalCTA";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { ProtectedImg } from "@/components/ProtectedImg";
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
      <FinalCTA />
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
  const featured = dbImages.find((image) => image.is_feature) ?? dbImages[0];
  const featuredCopy = featured ? publicPhotoCopy(featured, altPhraseFor(featured.section)) : null;

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
      <header className="bg-cream">
        <div className="mx-auto grid max-w-[100rem] lg:min-h-[min(48rem,80svh)] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
          <div className="order-2 flex flex-col justify-between px-5 pb-14 pt-9 md:px-10 md:pb-20 lg:order-1 lg:px-16 lg:py-16">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">TX Quince <span className="mx-2 text-ink-faint" aria-hidden="true">/</span> The work</p>
            <div className="mt-14 max-w-lg lg:mt-10">
              <h1 className="font-body text-[clamp(2.125rem,3.6vw,3.375rem)] font-normal leading-[1.08] tracking-[-0.045em] text-ink">
                A quinceañera, through our eyes.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-ink-soft">
                Portraits, traditions, and celebrations photographed across Dallas–Fort Worth. Explore the moments that make each day her own.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                <Link href="#photographs" className="inline-flex min-h-12 items-center whitespace-nowrap border-b border-ink text-base text-ink transition-colors hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  Explore the photographs <span className="ml-3" aria-hidden="true">↓</span>
                </Link>
                <Link href="/check-your-date" className="inline-flex min-h-12 items-center whitespace-nowrap text-base text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  Check her date <span className="ml-3" aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
            <p className="mt-12 hidden text-xs uppercase tracking-[0.16em] text-ink-faint lg:block">Photography & film · Dallas–Fort Worth</p>
          </div>
          {featured && featuredCopy ? (
            <div className="order-1 relative aspect-[4/5] min-h-0 overflow-hidden bg-greige sm:aspect-[5/4] lg:order-2 lg:aspect-auto">
              <ProtectedImg
                src={featured.url}
                alt={featuredCopy.alt}
                width={featured.width}
                height={featured.height}
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-ink/50 to-transparent px-5 pb-5 pt-14 text-xs font-medium uppercase tracking-[0.14em] text-white md:px-10">
                <span>{categoryLabel(featured.section)}</span>
                <span>01 / The portfolio</span>
              </div>
            </div>
          ) : (
            <div className="order-1 relative aspect-[4/5] min-h-0 overflow-hidden bg-greige sm:aspect-[5/4] lg:order-2 lg:aspect-auto">
              <Image src={portfolioFallback[0].url} alt={portfolioFallback[0].alt} fill priority sizes="(max-width: 1023px) 100vw, 58vw" className="object-cover" style={{ objectPosition: "50% 76%" }} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/50 to-transparent px-5 pb-5 pt-14 text-xs uppercase tracking-[0.14em] text-white md:px-10">The portfolio</div>
            </div>
          )}
        </div>
      </header>
      <section id="photographs" className="scroll-mt-24 border-t border-line bg-white" aria-label="Photograph gallery">
        <div className="mx-auto max-w-[100rem] px-5 py-14 md:px-10 md:py-20 lg:px-16">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-line pb-7 md:mb-12 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">The collection</p>
              <h2 className="mt-3 font-body text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">The moments, one by one.</h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-ink-soft">Move through the day at your own pace. Save the frames you love.</p>
          </div>
          <PortfolioGallery key={initialQuery} images={items} sections={sections} initialQuery={initialQuery} editorial />
        </div>
      </section>

      {videos.length ? (
        <section id="films" className="scroll-mt-24 border-t border-line bg-cream">
          <div className="mx-auto max-w-[100rem] px-5 py-16 md:px-10 md:py-24 lg:px-16">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">Films</p>
            <h2 className="mt-3 font-body text-[clamp(1.75rem,2.5vw,2.5rem)] font-normal tracking-[-0.025em] text-ink">Her day in motion</h2>
            <p className="mb-10 mt-4 max-w-lg text-base leading-relaxed text-ink-soft">Watch highlights from quinceañera celebrations.</p>
            <VideoGallery videos={videos} />
          </div>
        </section>
      ) : null}
    </>
  );
}
