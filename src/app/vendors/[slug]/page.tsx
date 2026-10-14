/**
 * /vendors/[slug] — a public credit page for one wedding/quince vendor: who
 * they are, links to their IG/site, and every photo we tagged them in. Great
 * for cross-promotion (they share it, link back) and SEO. Email/phone are
 * admin-only and never appear here.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getVendorBySlug, getImagesByVendor, type PortfolioImage } from "@/lib/content-db";
import { altPhraseFor, vendorCategoryLabel, vendorCreditLabel } from "@/content/portfolio-taxonomy";
import { igUrl, websiteUrl, websiteLabel } from "@/lib/vendor-links";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { Reveal } from "@/components/Reveal";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { FinalCTA } from "@/components/FinalCTA";
import "@/components/txq/pages/pages.css";

export const revalidate = 3600;

function displayName(v: { name: string; business: string | null }): string {
  return v.business?.trim() || v.name;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return {};
  const name = displayName(vendor);
  const kind = vendorCategoryLabel(vendor.category);
  const title = `${name} · ${kind}`;
  const description = `${name} — ${kind.toLowerCase()} for quinceañeras in Dallas–Fort Worth. Explore vendor credits and ${site.brand} photography.`;
  return {
    title,
    description,
    alternates: { canonical: `/vendors/${slug}` },
    openGraph: {
      title: `${name} · ${site.brand}`,
      description,
      url: `${site.url}/vendors/${slug}`,
    },
  };
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const name = displayName(vendor);
  const kind = vendorCategoryLabel(vendor.category);
  const credit = vendorCreditLabel(vendor.category);
  const ig = igUrl(vendor.ig_handle);
  const web = websiteUrl(vendor.website);
  const photos = await getImagesByVendor(slug);
  const heroPhoto = photos[0] ?? null;

  // Tiles WITHOUT vendor credits (we're already on this vendor's page).
  const items: GalleryItem[] = photos.map((i: PortfolioImage) => ({
    url: i.url,
    alt: publicPhotoCopy(i, altPhraseFor(i.section)).alt,
    ratio: i.is_feature ? "landscape" : "portrait",
    feature: i.is_feature,
    width: i.width,
    height: i.height,
    slug: i.slug,
    section: i.section,
    id: i.id,
    fx: i.focus_x,
    fy: i.focus_y,
  }));

  const pageUrl = `${site.url}/vendors/${slug}`;
  const sameAs = [ig, web].filter(Boolean) as string[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${pageUrl}#vendor`,
        name,
        url: pageUrl,
        ...(sameAs.length ? { sameAs } : {}),
        areaServed: "Dallas–Fort Worth, TX",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Vendors", item: `${site.url}/vendors` },
          { "@type": "ListItem", position: 3, name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }}
      />

      <div className="tq-wrap">
        <nav className="tq-pg-crumbs tq-mono" aria-label="Breadcrumb">
          <Link href="/vendors">
            <span aria-hidden="true">←</span> Vendors
          </Link>
          <span>{kind} / Dallas–Fort Worth</span>
        </nav>
        <Reveal as="header" className="tq-pg-mast">
          <p className="tq-pg-mast__index tq-mono">[{kind}]</p>
          <div className="tq-pg-mast__body">
            <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{name}</h1>
            <p className="tq-pg-mast__dek">{credit} for quinceañeras in Dallas–Fort Worth.</p>
            {ig || web ? (
              <div className="tq-pg-actions">
                {ig ? (
                  <a href={ig} target="_blank" rel="noopener noreferrer" className="tq-btn tq-btn--ghost">
                    @{vendor.ig_handle} <span className="tq-arrow" aria-hidden>↗</span>
                  </a>
                ) : null}
                {web ? (
                  <a href={web} target="_blank" rel="noopener noreferrer" className="tq-btn tq-btn--ghost">
                    {websiteLabel(vendor.website)} <span className="tq-arrow" aria-hidden>↗</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </Reveal>
        {heroPhoto && (
          <figure className="tq-pg-plate">
            <Image src={heroPhoto.url} alt={publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt} fill priority sizes="100vw" style={{ objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.5) * 100)}%` }} />
            <figcaption>
              <span className="tq-tag tq-tag--bl tq-mono">[Vendor credit — {kind}]</span>
            </figcaption>
          </figure>
        )}
      </div>

      <section className="tq-section" aria-labelledby="vendor-work-title">
        <div className="tq-wrap">
          <Reveal as="header" className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [The collaboration]
            </p>
            <h2 id="vendor-work-title" className="tq-display tq-head__title">
              {photos.length ? `Photographed with ${name}` : `Explore the work of TX Quince`}
            </h2>
            {photos.length ? (
              <p className="tq-head__dek tq-mono">
                {photos.length} {photos.length === 1 ? "photograph" : "photographs"}
              </p>
            ) : null}
          </Reveal>
          {items.length ? (
            <PortfolioGallery images={items} editorial imageSizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, 40vw" />
          ) : (
            <div className="tq-pg-row" style={{ paddingTop: 0 }}>
              <div className="tq-pg-row__body">
                <p className="tq-muted" style={{ margin: 0 }}>
                  No photographs crediting {name} are published yet.{" "}
                  <Link href="/portfolio" className="tq-pg-inline">
                    Explore the portfolio
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
