import type { Metadata } from "next";
import Link from "next/link";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { getPortfolioImages } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved photographs",
  description: "Keep your favorite TX Quince photographs together on this device.",
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const images = await getPortfolioImages();
  const items: GalleryItem[] = images.map((image) => {
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
  });
  const sections = [...new Set(images.map((image) => image.section))]
    .map((id) => ({ id, title: categoryLabel(id) }));

  return (
    <div className="mx-auto max-w-[90rem] px-5 pb-24 pt-14 md:px-10 md:pt-20 lg:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Your collection</p>
        <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">Saved photographs</h1>
        <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">Keep inspiration close as you imagine her day. Saved photographs stay in this browser on this device.</p>
        <Link href="/portfolio" className="mt-5 inline-flex min-h-11 items-center text-base font-medium text-ink underline underline-offset-4 hover:text-ink-soft">← Back to portfolio</Link>
      </div>
      <div className="mt-10 border-t border-line pt-8">
      <PortfolioGallery images={items} sections={sections} savedOnly />
      </div>
    </div>
  );
}
