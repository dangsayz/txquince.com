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
import { FinalCTA } from "@/components/FinalCTA";
import "@/components/txq/pages/pages.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Quinceañera galleries across Dallas–Fort Worth — save-the-date, la misa, portraits, the celebration, and videos.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · TX Quince",
    description: "Quinceañera galleries across Dallas–Fort Worth — church, portraits, the celebration, and videos.",
    url: `${site.url}/portfolio`,
  },
};

export default function PortfolioPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return (
    <>
      <Suspense fallback={<PortfolioFallback />}>
        <PortfolioContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function PortfolioFallback() {
  return (
    <div className="tq-wrap" role="status" aria-label="Loading portfolio">
      <div className="tq-pg-mast" aria-hidden="true">
        <span className="tq-pg-skel tq-pg-skel-line" style={{ width: 160 }} />
        <div className="tq-pg-mast__body">
          <span className="tq-pg-skel" style={{ display: "block", height: 64, maxWidth: 420 }} />
          <span className="tq-pg-skel tq-pg-skel-line" style={{ maxWidth: 360 }} />
        </div>
      </div>
      <div className="tq-pg-plate tq-pg-skel" aria-hidden="true" />
      <span className="tq-sr">Loading photographs</span>
    </div>
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
        name: video.title || "Quinceañera video",
        description: `Quinceañera video by ${site.brand} — ${video.title || "a Dallas–Fort Worth celebration"}.`,
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
      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="portfolio-title">
          <p className="tq-pg-mast__index tq-mono">[01 / Archive — Dallas–Fort Worth]</p>
          <div className="tq-pg-mast__body">
            <h1 id="portfolio-title" className="tq-display tq-pg-mast__title">
              Portfolio <em>— portraits, traditions &amp; celebration.</em>
            </h1>
            <p className="tq-pg-mast__dek">
              The dress, the quiet moments before, the room when everyone is together. Every photograph belongs to her story.
            </p>
            <div className="tq-pg-actions">
              <a href="#photographs" className="tq-btn tq-btn--lg tq-btn--ghost">
                The photographs <span aria-hidden>↓</span>
              </a>
              {videos.length ? (
                <a href="#films" className="tq-btn tq-btn--lg tq-btn--ghost">
                  The videos <span aria-hidden>↓</span>
                </a>
              ) : null}
            </div>
          </div>
        </header>
        <figure className="tq-pg-plate">
          <Image src={heroPhoto?.url ?? "/portfolio/hero.webp"} alt={heroPhoto?.alt ?? "Quinceañera portrait in Dallas–Fort Worth"} fill priority unoptimized={!heroPhoto?.url || heroPhoto.url.startsWith("/portfolio/")} sizes="100vw" style={heroPhoto ? { objectPosition: `${Math.round((heroPhoto.fx ?? 0.5) * 100)}% ${Math.round((heroPhoto.fy ?? 0.4) * 100)}%` } : undefined} />
          <figcaption>
            <span className="tq-tag tq-tag--bl tq-mono">[Plate 01 — {items.length} photographs]</span>
          </figcaption>
        </figure>
      </div>

      <section id="photographs" className="tq-section" aria-labelledby="photographs-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [02 / Photographs]
            </p>
            <h2 id="photographs-title" className="tq-display tq-head__title">
              Every moment, <em>from la misa to the last dance.</em>
            </h2>
            <p className="tq-head__dek">Filter by moment, search a place, and save the frames that feel most like her.</p>
          </header>
          <PortfolioGallery key={initialQuery} images={items} sections={sections} initialQuery={initialQuery} editorial imageSizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, 40vw" />
        </div>
      </section>

      {videos.length ? (
        <section id="films" className="tq-section" aria-labelledby="films-title">
          <div className="tq-wrap">
            <header className="tq-head">
              <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
                [03 / Motion]
              </p>
              <h2 id="films-title" className="tq-display tq-head__title">
                Her day on video.
              </h2>
              <p className="tq-head__dek">Watch the joy unfold in a video to return to for years.</p>
            </header>
            <div className="tq-inner" style={{ paddingBottom: 72 }}>
              <VideoGallery videos={videos} />
            </div>
          </div>
        </section>
      ) : null}

      <FinalCTA headline="Picture her here. Let's check the date." />
    </>
  );
}
