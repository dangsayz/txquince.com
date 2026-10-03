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
import { FinalCTA } from "@/components/FinalCTA";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

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
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />}
      <header className="bg-[#f4f2ee]">
        <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14 lg:px-16 lg:py-24">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">TX Quince / Community</p>
          <div>
            <h1 className="max-w-[20ch] font-display text-[clamp(2.125rem,3.6vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-ink">The people behind the celebration.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">Explore the vendors credited in TX Quince photographs across Dallas–Fort Worth.</p>
            <a href="#vendor-directory" className="mt-7 inline-flex min-h-11 items-center gap-4 border-b border-ink text-sm font-medium text-ink">Explore the directory <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </header>

      <div id="vendor-directory" className="scroll-mt-24 bg-white">
        {sections.length === 0 ? (
          <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-10 lg:px-16">
            <h2 className="font-display text-2xl font-normal text-ink">No vendor credits yet.</h2>
            <p className="mt-3 max-w-md text-base leading-7 text-ink-soft">Explore the photographs while this directory is being curated.</p>
            <Link href="/portfolio" className="mt-6 inline-flex min-h-11 items-center gap-3 border-b border-ink text-sm font-medium text-ink">View the portfolio <span aria-hidden="true">↗</span></Link>
          </div>
        ) : sections.map((section, sectionIndex) => (
          <section key={section.id} className="border-t border-line" aria-labelledby={`vendor-category-${sectionIndex}`}>
            <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:gap-14 lg:px-16">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">0{sectionIndex + 1} / Vendor credits</p>
                <h2 id={`vendor-category-${sectionIndex}`} className="mt-3 font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">{section.label}</h2>
              </div>
              <ul className="border-t border-line">
                {section.vendors.map((vendor) => {
                  const count = counts.get(vendor.id) ?? 0;
                  const image = covers.get(vendor.id);
                  return <li key={vendor.id} className="border-b border-line">
                    <Link href={`/vendors/${vendor.slug}`} className="group grid min-h-28 grid-cols-[minmax(0,1fr)_6rem] items-center gap-5 py-4 text-ink sm:grid-cols-[minmax(0,1fr)_8rem]">
                      <span>
                        <span className="block font-display text-[clamp(1.25rem,2vw,1.75rem)] font-normal leading-tight group-hover:underline group-hover:underline-offset-4">{vendor.business || vendor.name}</span>
                        <span className="mt-2 block text-sm text-ink-soft">{count > 0 ? `${count} ${count === 1 ? "photograph" : "photographs"}` : "See vendor"} <span aria-hidden="true">↗</span></span>
                      </span>
                      <span className="relative block aspect-[4/3] overflow-hidden bg-greige">
                        {image?.url && <Image src={image.url} alt={publicPhotoCopy(image, altPhraseFor(image.section)).alt} fill sizes="(max-width: 639px) 96px, 128px" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" />}
                      </span>
                    </Link>
                  </li>;
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>
      <FinalCTA />
    </>
  );
}
