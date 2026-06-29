import type { Metadata } from "next";
import { site } from "@/content/site";
import { getPortfolioImages, getVideos } from "@/lib/content-db";
import { type GalleryItem } from "@/components/PortfolioGallery";
import { PortfolioBrowser, type TabGroup } from "@/components/PortfolioBrowser";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";
import { GROUPS, altPhraseFor, groupForCategory } from "@/content/portfolio-taxonomy";

// Render fresh each request — the ISR cache on Cloudflare was serving a stale
// prerender (old design + before new uploads). Dynamic guarantees the live code
// and the latest portfolio images always show.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Quinceañera galleries across Dallas–Fort Worth — every part of the day: save-the-date, la misa, portraits, the celebration, details, films, and the vendors behind it.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio · TX Quince",
    description:
      "Quinceañera galleries across Dallas–Fort Worth — church, portraits, the celebration, films, and our favorite vendors.",
    url: `${site.url}/portfolio`,
  },
};

/** Clean, viewer-facing alt — never the raw upload filename (e.g. "12img save
 *  the date 6 13 26 ... jpg"). Junky alts fall back to a category-based phrase
 *  that's meaningful to people AND keyword-relevant for SEO. */
function cleanAlt(raw: string | null | undefined, sectionId: string): string {
  const a = (raw || "").trim();
  const looksLikeFilename =
    !a ||
    /\b(jpe?g|png|webp|heic|avif)\b/i.test(a) ||
    /\b12img\b/i.test(a) ||
    /\d{1,2}[\s\-_]\d{1,2}[\s\-_]\d{2,4}/.test(a);
  return looksLikeFilename ? altPhraseFor(sectionId) : a;
}

export default async function PortfolioPage() {
  const [dbImages, videos] = await Promise.all([getPortfolioImages(), getVideos()]);

  // GalleryItem from a DB row, carrying its vendor credits (public-safe).
  const toItem = (i: (typeof dbImages)[number]): GalleryItem => ({
    url: i.url,
    alt: cleanAlt(i.alt, i.section),
    ratio: i.is_feature ? "landscape" : "portrait",
    feature: i.is_feature,
    width: i.width,
    height: i.height,
    slug: i.slug,
    section: i.section,
    id: i.id,
    fx: i.focus_x,
    fy: i.focus_y,
    vendors: (i.vendors ?? []).map((v) => ({
      name: v.name,
      business: v.business,
      slug: v.slug,
      category: v.category,
      ig_handle: v.ig_handle,
      website: v.website,
      role: v.role,
    })),
  });

  // One tab per public group (films handled separately as videos). Only groups
  // with real photos are shown.
  const groups: TabGroup[] = GROUPS.filter((g) => g.id !== "films")
    .map((g) => ({
      id: g.id,
      label: g.label,
      eyebrow: g.eyebrow,
      title: g.title,
      hook: g.hook,
      intro: g.intro,
      items: dbImages.filter((i) => groupForCategory(i.section) === g.id).map(toItem),
    }))
    .filter((g) => g.items.length > 0);

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

  // ImageGallery markup for the grid — one ImageObject per photograph (the same
  // convention the per-image detail pages carry), so the listing itself is
  // eligible for image rich results. Capped at the first 60 to keep the payload
  // sane. Absolute contentUrl, with any `?v=` cache-busting query stripped.
  const imageGalleryJsonLd =
    dbImages.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: `Portfolio · ${site.brand}`,
          url: `${site.url}/portfolio`,
          associatedMedia: dbImages.slice(0, 60).map((i) => {
            const path = i.url.split("?")[0];
            const contentUrl = path.startsWith("http") ? path : `${site.url}${path}`;
            return {
              "@type": ["ImageObject", "Photograph"],
              contentUrl,
              name: i.title || i.alt,
              description: i.caption || i.alt,
              ...(i.width && i.height ? { width: i.width, height: i.height } : {}),
              creator: { "@type": "Organization", name: site.brand, url: site.url },
              copyrightHolder: { "@type": "Organization", name: site.brand },
              copyrightNotice: `© ${site.brand}`,
              creditText: site.brand,
              license: `${site.url}/privacy`,
              acquireLicensePage: `${site.url}/investment`,
              ...(i.city
                ? { contentLocation: { "@type": "City", name: `${i.city}, TX` } }
                : { contentLocation: { "@type": "Place", name: "Dallas–Fort Worth, TX" } }),
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
      {imageGalleryJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd) }}
        />
      ) : null}
      {/* Cover — editorial: overline, oversized statement, narrow standfirst. */}
      <section className="mx-auto max-w-[90rem] px-5 pb-10 pt-20 md:px-10 lg:px-16 md:pb-14 md:pt-32">
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
            of la misa to the last dance of the night. Browse by moment, or meet the
            vendors who make the day.
          </p>
        </Reveal>
      </section>

      {groups.length === 0 && videos.length === 0 ? (
        <section className="mx-auto max-w-[90rem] px-5 pb-24 md:px-10 lg:px-16">
          <p className="accent text-xl text-ink-faint">New work coming soon.</p>
        </section>
      ) : (
        <PortfolioBrowser groups={groups} videos={videos} />
      )}

      <FinalCTA />
    </>
  );
}
