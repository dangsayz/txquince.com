import type { Metadata } from "next";
import { gallerySections } from "@/content/gallery";
import { site } from "@/content/site";
import { getPortfolioImages, getVideos } from "@/lib/content-db";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Quinceañera galleries across Dallas–Fort Worth — save-the-date, la misa, portraits, the celebration, and films.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · TX Quince",
    description:
      "Quinceañera galleries across Dallas–Fort Worth — church, portraits, the celebration, and films.",
    url: `${site.url}/portfolio`,
  },
};

export default async function PortfolioPage() {
  const [dbImages, videos] = await Promise.all([getPortfolioImages(), getVideos()]);

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pt-section md:px-8 md:pt-section-lg">
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-5">Portfolio</p>
          <h1 className="display-1 text-ink text-balance">
            The day, kept exactly as it felt.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
            A selection from quinceañeras across Dallas–Fort Worth — from the quiet
            of la misa to the last dance of the night.
          </p>
        </Reveal>
      </section>

      {gallerySections.map((section, idx) => {
        const num = String(idx + 1).padStart(2, "0");
        const isFilms = section.id === "films";

        const dbForSection = dbImages.filter((i) => i.section === section.id);
        const items: GalleryItem[] = dbForSection.length
          ? dbForSection.map((i) => ({
              url: i.url,
              alt: i.alt || section.title,
              ratio: i.is_feature ? "landscape" : "portrait",
              feature: i.is_feature,
            }))
          : section.images.map((i) => ({
              url: null,
              alt: i.alt,
              ratio: i.ratio,
              feature: i.feature,
            }));

        return (
          <section
            key={section.id}
            className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg"
          >
            <Reveal className="mb-10 flex items-end justify-between gap-6 md:mb-12">
              <div className="max-w-2xl">
                <p className="eyebrow mb-4">
                  <span className="text-wine">{num}</span> &nbsp;/&nbsp; {section.eyebrow}
                </p>
                <h2 className="display-2 text-ink">{section.title}</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
                  {section.intro}
                </p>
              </div>
            </Reveal>

            {isFilms ? (
              videos.length ? (
                <VideoGallery videos={videos} />
              ) : (
                <p className="accent text-xl text-ink-faint">Films coming soon.</p>
              )
            ) : (
              <PortfolioGallery images={items} />
            )}
          </section>
        );
      })}

      <FinalCTA />
    </>
  );
}
