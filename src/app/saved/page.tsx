import type { Metadata } from "next";
import Link from "next/link";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { getPortfolioImages } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { portfolioFallback } from "@/content/portfolio-fallback";

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
      <header className="border-b border-line bg-cream">
        <div className="mx-auto grid max-w-[100rem] gap-6 px-5 pb-14 pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] md:items-end md:px-10 md:pb-20 md:pt-20 lg:px-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">Your collection / TX Quince</p>
            <h1 className="mt-5 font-body text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.12] tracking-[-0.035em] text-ink">Saved photographs</h1>
          </div>
          <div>
            <p className="max-w-md text-base leading-7 text-ink-soft">Keep the photographs you love together as you plan. They stay in this browser on this device.</p>
            <Link href="/portfolio" className="mt-5 inline-flex min-h-11 items-center border-b border-ink text-base text-ink transition-colors hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">← Back to the photographs</Link>
          </div>
        </div>
      </header>
      <section className="bg-white" aria-label="Saved photograph gallery">
        <div className="mx-auto max-w-[100rem] px-5 pb-24 pt-10 md:px-10 md:pt-14 lg:px-16">
          <PortfolioGallery images={items} sections={sections} savedOnly editorial />
        </div>
      </section>
    </>
  );
}
