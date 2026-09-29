import type { Metadata } from "next";
import Link from "next/link";
import { categoryLabel } from "@/content/portfolio-taxonomy";
import { getPortfolioImages } from "@/lib/content-db";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved photographs",
  description: "Keep your favorite TX Quince photographs together on this device.",
  robots: { index: false, follow: true },
};

export default async function SavedPage() {
  const images = await getPortfolioImages();
  const items: GalleryItem[] = images.map((image) => ({
    url: image.url,
    alt: image.alt,
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
  }));
  const sections = [...new Set(images.map((image) => image.section))]
    .map((id) => ({ id, title: categoryLabel(id) }));

  return (
    <div className="mx-auto max-w-[90rem] px-5 pb-24 pt-12 md:px-10 md:pt-20 lg:px-16">
      <Link href="/portfolio" className="text-sm font-medium text-accent hover:underline">← Back to portfolio</Link>
      <p className="mt-12 text-xs font-semibold uppercase tracking-[0.22em] text-accent">Your collection</p>
      <h1 className="mt-3 font-display text-[clamp(2rem,4vw,4rem)] text-ink">Saved photographs</h1>
      <p className="mt-5 mb-10 max-w-xl text-base leading-relaxed text-ink-soft">
        Keep inspiration close as you imagine her day. Saved photographs stay in this browser on this device.
      </p>
      <PortfolioGallery images={items} sections={sections} savedOnly />
    </div>
  );
}
