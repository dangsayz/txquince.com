import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/content/site";
import { getPortfolioImages, getVideos } from "@/lib/content-db";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { FinalCTA } from "@/components/FinalCTA";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
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
      <header className="border-b border-line bg-white px-5 pb-12 pt-14 text-center md:px-10 md:pb-16 md:pt-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">The portfolio</p>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2rem,3vw,2.75rem)] font-medium leading-[1.15] tracking-[-0.035em] text-ink">
          Quinceañera photography, seen in full.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          Portraits, traditions, and celebrations across Dallas–Fort Worth. Browse the moments that matter to her.
        </p>
        <Link href={site.cta.href} className="mt-7 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg bg-accent px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          Check her date <span aria-hidden="true" className="ml-3">↗</span>
        </Link>
      </header>
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
  const sections = [...new Set(dbImages.map((image) => image.section))]
    .map((id) => ({ id, title: categoryLabel(id) }));
  const items: GalleryItem[] = dbImages.map((image) => {
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
  });

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
      <section className="bg-white" aria-label="Photograph gallery">
        <div className="mx-auto max-w-[90rem] px-5 py-10 md:px-10 md:py-14 lg:px-16">
          <PortfolioGallery key={initialQuery} images={items} sections={sections} initialQuery={initialQuery} />
        </div>
      </section>

      {videos.length ? (
        <section id="films" className="scroll-mt-24 border-t border-line bg-white">
          <div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-24 lg:px-16">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">Films</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,2.5vw,2.5rem)] font-medium tracking-[-0.025em] text-ink">Her day in motion</h2>
            <p className="mb-10 mt-4 max-w-lg text-base leading-relaxed text-ink-soft">Watch highlights from quinceañera celebrations.</p>
            <VideoGallery videos={videos} />
          </div>
        </section>
      ) : null}
    </>
  );
}
