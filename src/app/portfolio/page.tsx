import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/content/site";
import { getPortfolioImages, getVideos } from "@/lib/content-db";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { FinalCTA } from "@/components/FinalCTA";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import PortfolioLoading from "./loading";

export const dynamic = "force-dynamic";

function cleanAlt(raw: string | null | undefined, section: string): string {
  const alt = (raw || "").trim();
  return !alt || /\b(jpe?g|png|webp|heic|avif|12img)\b/i.test(alt) || /\d{1,2}[\s\-_]\d{1,2}[\s\-_]\d{2,4}/.test(alt)
    ? altPhraseFor(section)
    : alt;
}

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
      <header className="mx-auto max-w-[90rem] px-5 pb-12 pt-12 md:px-10 md:pb-16 md:pt-20 lg:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-semibold text-accent">Portfolio</p>
          <Link href={site.cta.href} className="inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-sm font-medium text-ink hover:bg-ink hover:text-white">Ask about your date ↗</Link>
        </div>
        <h1 className="mt-8 max-w-5xl font-display text-[clamp(2rem,4vw,4rem)] leading-[1.12] text-ink">
          Quinceañera photography <span className="text-accent">portfolio.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
          Explore quinceañera portraits, ceremonies, and celebrations photographed across Dallas–Fort Worth.
        </p>
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
  const items: GalleryItem[] = dbImages.map((image) => ({
    url: image.url,
    alt: cleanAlt(image.alt, image.section),
    width: image.width,
    height: image.height,
    slug: image.slug,
    section: image.section,
    id: image.id,
    fx: image.focus_x,
    fy: image.focus_y,
    title: image.title,
    caption: image.caption,
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
  }));

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
    associatedMedia: dbImages.slice(0, 60).map((image) => ({
      "@type": ["ImageObject", "Photograph"],
      contentUrl: image.url.startsWith("http") ? image.url.split("?")[0] : `${site.url}${image.url.split("?")[0]}`,
      name: image.title || cleanAlt(image.alt, image.section),
      description: image.caption || cleanAlt(image.alt, image.section),
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
    })),
  } : null;

  return (
    <>
      {videoJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd).replaceAll("<", "\\u003c") }} /> : null}
      {imageGalleryJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd).replaceAll("<", "\\u003c") }} /> : null}
      <section className="border-t border-line bg-ivory" aria-label="Photograph gallery">
        <div className="mx-auto max-w-[90rem] px-5 py-10 md:px-10 md:py-14 lg:px-16">
          <PortfolioGallery key={initialQuery} images={items} sections={sections} initialQuery={initialQuery} />
        </div>
      </section>

      {videos.length ? (
        <section id="films" className="scroll-mt-24 border-t border-line bg-white">
          <div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 md:py-24 lg:px-16">
            <p className="text-xs font-semibold text-accent">Films</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Quinceañera films</h2>
            <p className="mt-4 mb-10 max-w-lg text-sm leading-relaxed text-ink-soft">Watch highlights from quinceañera celebrations.</p>
            <VideoGallery videos={videos} />
          </div>
        </section>
      ) : null}
    </>
  );
}
