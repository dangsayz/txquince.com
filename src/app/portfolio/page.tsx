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
  // Once any real photos exist, stop padding empty sections with placeholder
  // blocks — a half-built portfolio shows only the sections that have real work.
  const hasRealImages = dbImages.length > 0;

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
      {/* Cover — editorial: overline, oversized statement, narrow standfirst. */}
      <section className="mx-auto max-w-[90rem] px-5 pt-20 md:px-10 lg:px-16 md:pt-32">
        <Reveal>
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Portfolio</p>
          <h1
            className="mt-5 max-w-5xl font-display text-ink"
            style={{ fontSize: "clamp(2.8rem,7vw,6.2rem)", lineHeight: 0.98, letterSpacing: "-0.028em" }}
          >
            The day, kept exactly as it felt.
          </h1>
          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
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
              slug: i.slug,
              section: i.section,
              id: i.id,
              fx: i.focus_x,
              fy: i.focus_y,
            }))
          : hasRealImages
            ? [] // real work exists elsewhere — don't pad this section with placeholders
            : section.images.map((i) => ({
                url: null,
                alt: i.alt,
                ratio: i.ratio,
                feature: i.feature,
              }));

        // Hide an empty non-film section once the site has real photos.
        if (!isFilms && items.length === 0) return null;

        return (
          // White band per section — the photographs sit on gallery-white,
          // separated by hairlines and generous air.
          <section key={section.id} id={section.id} className="scroll-mt-24 mt-20 border-t border-ink/10 bg-white md:mt-28">
            <div className="mx-auto max-w-[90rem] px-5 py-16 md:px-10 lg:px-16 md:py-24">
              <Reveal className="mb-12 grid items-end md:mb-16 md:grid-cols-12">
                <div className="md:col-span-7">
                  <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
                    {section.eyebrow}
                  </p>
                  <h2
                    className="mt-4 font-display text-ink"
                    style={{ fontSize: "clamp(2.1rem,4.4vw,3.8rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
                  >
                    {section.title}
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
                    {section.intro}
                  </p>
                </div>
                <p
                  aria-hidden
                  className="hidden text-right font-display text-ink/10 md:col-span-5 md:block"
                  style={{ fontSize: "5rem", lineHeight: 1 }}
                >
                  {num}
                </p>
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
            </div>
          </section>
        );
      })}

      <FinalCTA />
    </>
  );
}
