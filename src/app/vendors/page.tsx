/**
 * /vendors — the public vendor directory. Every vendor we've tagged, grouped by
 * what they do, each linking to their own credit page. A real local-SEO asset
 * (vendor names + categories + DFW) and a cross-promotion hub.
 */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { getVendors, getPortfolioImages } from "@/lib/content-db";
import { VENDOR_CATEGORIES, altPhraseFor, vendorCategoryLabel } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { FinalCTA } from "@/components/FinalCTA";
import "@/components/txq/pages/pages.css";
import { jsonLdString } from "@/lib/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quinceañera Vendors in Dallas–Fort Worth",
  description:
    "The venues, florists, glam artists, bakers, DJs, and planners we love working with on quinceañeras across Dallas–Fort Worth.",
  alternates: { canonical: "/vendors" },
  openGraph: {
    title: `Quinceañera Vendors · ${site.brand}`,
    description:
      "Our favorite quinceañera vendors across Dallas–Fort Worth — venues, florists, HMUA, bakeries, DJs, and more.",
    url: `${site.url}/vendors`,
  },
};

export default async function VendorsPage() {
  const [vendors, images] = await Promise.all([getVendors(), getPortfolioImages()]);
  const heroPhoto = images.find((image) => Boolean(image.url)) ?? null;

  // Photos per vendor (drives the count + sorts the busiest first).
  const counts = new Map<string, number>();
  const covers = new Map<string, (typeof images)[number]>();
  for (const img of images)
    for (const v of img.vendors ?? []) {
      counts.set(v.vendor_id, (counts.get(v.vendor_id) ?? 0) + 1);
      if (!covers.has(v.vendor_id)) covers.set(v.vendor_id, img);
    }

  // Group vendors by category in the taxonomy's order; unknown → "Other".
  const order = VENDOR_CATEGORIES.map((c) => c.id);
  const byCat = new Map<string, typeof vendors>();
  for (const v of vendors) {
    const key = v.category && order.includes(v.category) ? v.category : "other";
    const list = byCat.get(key) ?? [];
    list.push(v);
    byCat.set(key, list);
  }
  const sections = [...order, "other"]
    .filter((id) => byCat.get(id)?.length)
    .map((id) => ({
      id,
      label: vendorCategoryLabel(id),
      vendors: [...(byCat.get(id) ?? [])].sort(
        (a, b) =>
          (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) ||
          a.name.localeCompare(b.name),
      ),
    }));

  const jsonLd =
    vendors.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Quinceañera vendors · ${site.brand}`,
          itemListElement: vendors.map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: v.business || v.name,
            url: `${site.url}/vendors/${v.slug}`,
          })),
        }
      : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />}
      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="vendors-title">
          <p className="tq-pg-mast__index tq-mono">[TX Quince / Community]</p>
          <div className="tq-pg-mast__body">
            <h1 id="vendors-title" className="tq-display tq-pg-mast__title">
              The people behind the celebration.
            </h1>
            <p className="tq-pg-mast__dek">Explore the vendors credited in TX Quince photographs across Dallas–Fort Worth.</p>
            <div className="tq-pg-actions">
              <a href="#vendor-directory" className="tq-btn tq-btn--lg tq-btn--ghost">
                Explore the directory <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </header>
        <figure className="tq-pg-plate tq-pg-plate--short">
          <Image src={heroPhoto?.url ?? "/portfolio/reception.webp"} alt={heroPhoto ? publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt : "Quinceañera celebration in Dallas–Fort Worth"} fill priority unoptimized={!heroPhoto} sizes="100vw" style={heroPhoto ? { objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.4) * 100)}%` } : undefined} />
          <figcaption>
            <span className="tq-tag tq-tag--bl tq-mono">[{vendors.length} vendors credited]</span>
          </figcaption>
        </figure>
      </div>

      <div id="vendor-directory">
        {sections.length === 0 ? (
          <section className="tq-section" aria-labelledby="vendor-empty">
            <div className="tq-wrap">
              <div className="tq-pg-empty" style={{ borderBottom: 0 }}>
                <span className="tq-mono tq-muted">[Directory]</span>
                <h2 id="vendor-empty" className="tq-display">No vendor credits yet.</h2>
                <p>Explore the photographs while this directory is being curated.</p>
                <Link href="/portfolio" className="tq-btn tq-btn--lg tq-btn--ghost">
                  View the portfolio <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
              </div>
            </div>
          </section>
        ) : sections.map((section, sectionIndex) => (
          <section key={section.id} className="tq-section" aria-labelledby={`vendor-category-${sectionIndex}`}>
            <div className="tq-wrap">
              <header className="tq-head">
                <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
                  [{String(sectionIndex + 1).padStart(2, "0")} / Vendor credits]
                </p>
                <h2 id={`vendor-category-${sectionIndex}`} className="tq-display tq-head__title">
                  {section.label}
                </h2>
                <p className="tq-head__dek tq-mono">
                  {section.vendors.length} {section.vendors.length === 1 ? "vendor" : "vendors"}
                </p>
              </header>
              <ul className="tq-pg-cards">
                {section.vendors.map((vendor) => {
                  const count = counts.get(vendor.id) ?? 0;
                  const image = covers.get(vendor.id);
                  return (
                    <li key={vendor.id}>
                      <Link href={`/vendors/${vendor.slug}`} className="tq-pg-card">
                        <span className="tq-pg-card__media">
                          {image?.url ? (
                            <Image src={image.url} alt={publicPhotoCopy(image, altPhraseFor(image.section)).alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1039px) 50vw, 33vw" />
                          ) : (
                            <span className="tq-pg-card__empty tq-mono">[Photographs coming soon]</span>
                          )}
                        </span>
                        <span className="tq-pg-card__name">
                          <span>{vendor.business || vendor.name}</span>
                          <span className="tq-arrow tq-muted" aria-hidden>↗</span>
                        </span>
                        <span className="tq-pg-card__meta tq-mono">
                          {count > 0 ? `${count} ${count === 1 ? "photograph" : "photographs"}` : "See vendor"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <FinalCTA headline="Planning with your favorite vendors? Let's check the date." />
    </>
  );
}
