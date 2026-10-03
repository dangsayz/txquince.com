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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {heroPhoto && (
        <div className="relative mx-4 mt-5 aspect-[4/5] min-h-80 max-h-[48rem] overflow-hidden bg-cream sm:mx-6 sm:aspect-[16/8] md:mx-10 lg:mx-auto lg:max-w-[92rem]">
          <Image src={heroPhoto.url} alt={publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.5) * 100)}%` }} />
        </div>
      )}
      <section className="bg-white px-5 py-16 md:px-10 md:py-24 lg:px-16">
        <Reveal className="mx-auto grid max-w-[82rem] gap-8 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] lg:gap-16">
          <div>
            <Link href="/vendors" className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-ink">← Vendors</Link>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-soft">{kind} / Dallas–Fort Worth</p>
          </div>
          <div>
            <h1 className="max-w-[25ch] font-body text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.13] tracking-[-0.035em] text-ink text-balance">{name}</h1>
            <p className="mt-6 max-w-2xl font-serif text-lg leading-8 text-ink-soft">{credit} for quinceañeras in Dallas–Fort Worth.</p>
          {ig || web ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-line pt-4 text-base">
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
          </div>
        </Reveal>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-14 md:px-10 lg:px-16 md:py-20">
          <Reveal className="mb-10 grid gap-5 border-t border-line pt-6 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)]">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">The collaboration</p>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-tight text-ink">
              {photos.length
                ? `Photographed with ${name}`
                : `Explore the work of TX Quince`}
            </h2>
          </Reveal>
          {items.length ? (
            <PortfolioGallery images={items} editorial imageSizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" />
          ) : (
            <p className="border-t border-line py-8 text-base leading-7 text-ink-soft">
              No photographs crediting {name} are published yet. <Link href="/portfolio" className="font-medium text-ink underline underline-offset-4">Explore the portfolio</Link>.
            </p>
          )}
        </div>
      </section>

    </>
  );
}
