/**
 * /vendors/[slug] — a public credit page for one wedding/quince vendor: who
 * they are, links to their IG/site, and every photo we tagged them in. Great
 * for cross-promotion (they share it, link back) and SEO. Email/phone are
 * admin-only and never appear here.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getVendorBySlug, getImagesByVendor, type PortfolioImage } from "@/lib/content-db";
import { vendorCategoryLabel, vendorCreditLabel } from "@/content/portfolio-taxonomy";
import { igUrl, websiteUrl, websiteLabel } from "@/lib/vendor-links";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

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
  const description = `${name} — ${kind.toLowerCase()} for quinceañeras in Dallas–Fort Worth. See the work we've photographed together, and reserve ${site.brand} for your daughter's day.`;
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

  // Tiles WITHOUT vendor credits (we're already on this vendor's page).
  const items: GalleryItem[] = photos.map((i: PortfolioImage) => ({
    url: i.url,
    alt: i.alt,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mx-auto max-w-[90rem] px-5 pb-10 pt-20 md:px-10 lg:px-16 md:pb-14 md:pt-28">
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-ink-faint">
            <Link href="/vendors" className="transition-colors hover:text-ink">
              Vendors
            </Link>
            <span aria-hidden> — </span>
            {kind}
          </p>
          <h1
            className="mt-5 max-w-4xl font-display text-ink"
            style={{ fontSize: "clamp(2.4rem,6vw,4.8rem)", lineHeight: 1, letterSpacing: "-0.025em" }}
          >
            {name}
          </h1>
          <p className="accent mt-4 text-xl text-wine-deep">{credit} for quinceañeras in DFW</p>
          {/* Public links only — email & phone stay private. */}
          {ig || web ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {ig ? (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:text-wine hover:decoration-wine"
                >
                  @{vendor.ig_handle}
                </a>
              ) : null}
              {web ? (
                <a
                  href={web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:text-wine hover:decoration-wine"
                >
                  {websiteLabel(vendor.website)}
                </a>
              ) : null}
            </div>
          ) : null}
        </Reveal>
      </section>

      <section className="mt-4 border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-14 md:px-10 lg:px-16 md:py-20">
          <Reveal className="mb-10">
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
              Work together
            </p>
            <h2
              className="mt-3 font-display text-ink"
              style={{ fontSize: "clamp(1.8rem,3.6vw,2.8rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              {photos.length
                ? `Photographed with ${name}`
                : `We'd love to work with ${name}`}
            </h2>
          </Reveal>
          {items.length ? (
            <PortfolioGallery images={items} />
          ) : (
            <p className="accent text-xl text-ink-faint">
              No tagged photos yet — check back soon.
            </p>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
