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

      <section className="mx-auto max-w-[90rem] px-5 pb-12 pt-12 md:px-10 md:pb-16 md:pt-16 lg:px-16 lg:pt-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-ink-soft">
            <Link href="/vendors" className="transition-colors hover:text-ink">
              Vendors
            </Link>
            <span aria-hidden> — </span>
            {kind}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink text-balance">
            {name}
          </h1>
          <p className="mt-4 text-base font-medium text-ink-soft">{credit} for quinceañeras in DFW</p>
          {/* Public links only — email & phone stay private. */}
          {ig || web ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base">
              {ig ? (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ink"
                >
                  @{vendor.ig_handle}
                </a>
              ) : null}
              {web ? (
                <a
                  href={web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ink"
                >
                  {websiteLabel(vendor.website)}
                </a>
              ) : null}
            </div>
          ) : null}
        </Reveal>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-14 md:px-10 lg:px-16 md:py-20">
          <Reveal className="mb-10">
            <p className="text-sm font-medium text-ink-soft">
              Work together
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-ink">
              {photos.length
                ? `Photographed with ${name}`
                : `We'd love to work with ${name}`}
            </h2>
          </Reveal>
          {items.length ? (
            <PortfolioGallery images={items} />
          ) : (
            <p className="rounded-lg border border-line bg-ivory p-6 text-base leading-7 text-ink-soft">
              No tagged photos yet — check back soon.
            </p>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
