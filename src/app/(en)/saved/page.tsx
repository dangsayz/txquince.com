import type { Metadata } from "next";
import Link from "next/link";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { getPortfolioImages } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { portfolioFallback } from "@/content/portfolio-fallback";
import "@/components/txq/pages/pages.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved photographs",
  description: "Keep your favorite TX Quince photographs together on this device.",
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const images = await getPortfolioImages();
  const items: GalleryItem[] = [...images.map((image) => {
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
    };
  }), ...portfolioFallback.map((image) => ({
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
  }))];
  const sections = [...new Set(items.map((image) => image.section).filter((section): section is string => Boolean(section)))]
    .map((id) => ({ id, title: categoryLabel(id) }));

  return (
    <>
      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="saved-title">
          <p className="tq-pg-mast__index tq-mono">[Your collection]</p>
          <div className="tq-pg-mast__body">
            <h1 id="saved-title" className="tq-display tq-pg-mast__title">
              Saved photographs
            </h1>
            <p className="tq-pg-mast__dek">Keep the images that feel most like her. They stay in this browser while you plan.</p>
            <div className="tq-pg-actions">
              <Link href="/portfolio" className="tq-btn tq-btn--lg tq-btn--ghost">
                <span aria-hidden>←</span> Back to the portfolio
              </Link>
            </div>
          </div>
        </header>
        <section aria-label="Saved photograph gallery">
          <PortfolioGallery images={items} sections={sections} savedOnly editorial imageSizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, 40vw" />
        </section>
      </div>
    </>
  );
}
