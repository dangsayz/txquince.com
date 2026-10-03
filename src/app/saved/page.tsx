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
      <header className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <div className="mx-auto flex max-w-[92rem] flex-col items-center bg-cream px-6 pb-20 pt-20 text-center md:pb-28 md:pt-28">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-ink-soft">Your collection</p>
          <h1 className="mt-5 font-body text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1.1] tracking-[-0.045em] text-ink">Saved photographs</h1>
          <p className="mt-6 max-w-[32rem] font-serif text-lg leading-[1.6] text-ink-soft">Keep the images that feel most like her. They stay in this browser while you plan.</p>
          <Link href="/portfolio" className="mt-7 inline-flex min-h-12 items-center text-sm text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">← Back to the portfolio</Link>
        </div>
      </header>
      <section className="bg-white" aria-label="Saved photograph gallery">
        <div className="mx-auto max-w-[92rem] px-4 pb-24 pt-12 sm:px-6 md:px-10 md:pb-32 md:pt-16 lg:px-14">
          <PortfolioGallery images={items} sections={sections} savedOnly editorial imageSizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 45vw, 42vw" />
        </div>
      </section>
    </>
  );
}
