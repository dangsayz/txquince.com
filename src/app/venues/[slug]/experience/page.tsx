/**
 * /venues/<slug>/experience — the page a shared "Our experience at this venue"
 * link opens. It exists so the link can carry its own preview (title, first
 * lines and a picture made for it) on Facebook, WhatsApp and Messages.
 *
 * It repeats text that already lives on the venue page, so search engines are
 * told not to index it and that the venue page is the original. A venue with
 * nothing written has no share page (404).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getVenue } from "@/content/venues";
import { VenueExperience } from "@/components/VenueExperience";
import { getVenueExperience } from "@/lib/venue-experience-db";
import { cardPath, excerpt, experienceTitle, sharePath } from "@/lib/venue-experience-share";
import { ogSize } from "@/lib/og";
import "@/components/txq/pages/places.css";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const venue = getVenue(slug);
  const x = venue ? await getVenueExperience(venue.slug) : null;
  if (!venue || !x) return { robots: { index: false, follow: true } };
  const title = experienceTitle(venue.venue);
  const description = excerpt(x.body_en, 190);
  const image = { url: `${site.url}${cardPath(venue.slug, x)}`, ...ogSize, alt: title, type: "image/png" };
  return {
    title,
    description,
    alternates: { canonical: `/venues/${venue.slug}` },
    robots: { index: false, follow: true },
    // No og:url on purpose: Facebook then keeps the shared address, with its
    // ?src= tag, so a visit from the post is counted as coming from Facebook.
    openGraph: {
      type: "article",
      siteName: site.brand,
      locale: "en_US",
      title,
      description,
      modifiedTime: x.updated_at,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function VenueExperiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = getVenue(slug);
  if (!venue) notFound();
  const experience = await getVenueExperience(venue.slug);
  if (!experience) notFound();

  return (
    <div className="tq-wrap">
      <div style={{ paddingInline: "var(--pad)", paddingBlock: "24px 72px" }}>
        <nav className="tq-place-crumbs tq-mono" aria-label="Breadcrumb" style={{ paddingInline: 0 }}>
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href={`/venues/${venue.slug}`}>{venue.venue}</Link>
            </li>
          </ol>
        </nav>
        <VenueExperience
          venue={{ slug: venue.slug, name: venue.venue }}
          initial={experience}
          shareUrl={`${site.url}${sharePath(venue.slug)}`}
          headingLevel="h1"
        />
        <p style={{ fontSize: "1.0625rem" }}>
          <Link href={`/venues/${venue.slug}`} style={{ textDecoration: "underline", textUnderlineOffset: 3, display: "inline-flex", alignItems: "center", minHeight: 44 }}>
            See the quinceañeras we photographed at {venue.venue} →
          </Link>
        </p>
      </div>
    </div>
  );
}
