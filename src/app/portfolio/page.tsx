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

  // VideoObject markup for the films (eligible for video rich results).
  const videoJsonLd =
    videos.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": videos.map((v) => {
            const thumb =
              v.poster_url ||
              (v.provider === "youtube" && v.video_id
                ? `https://i.ytimg.com/vi/${v.video_id}/maxresdefault.jpg`
                : undefined);
            const embedUrl =
              v.provider === "youtube" && v.video_id
                ? `https://www.youtube.com/embed/${v.video_id}`
                : v.provider === "vimeo" && v.video_id
                  ? `https://player.vimeo.com/video/${v.video_id}`
                  : v.url;
            return {
              "@type": "VideoObject",
              name: v.title || "Quinceañera film",
              description: `Quinceañera film by ${site.brand} — ${v.title || "a Dallas–Fort Worth celebration"}.`,
              ...(thumb ? { thumbnailUrl: thumb } : {}),
              embedUrl,
              contentUrl: v.url,
            };
          }),
        }
      : null;

  return (
    <>
      {videoJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
        />
      ) : null}
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
              width: i.width,
              height: i.height,
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
            id={section.id}
            className="scroll-mt-24 mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg"
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
