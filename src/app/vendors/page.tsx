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
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />}
      <header className="bg-white px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <div className="relative mx-auto min-h-[50svh] max-w-[92rem] overflow-hidden bg-ink sm:min-h-[65svh]">
          <Image src={heroPhoto?.url ?? "/portfolio/reception.webp"} alt={heroPhoto ? publicPhotoCopy(heroPhoto, altPhraseFor(heroPhoto.section)).alt : "Quinceañera celebration in Dallas–Fort Worth"} fill priority unoptimized={!heroPhoto} sizes="(max-width: 1472px) 100vw, 1472px" className="object-cover" style={heroPhoto ? { objectPosition: `${Math.round((heroPhoto.focus_x ?? 0.5) * 100)}% ${Math.round((heroPhoto.focus_y ?? 0.4) * 100)}%` } : undefined} />
          <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
          <div className="relative flex min-h-[50svh] flex-col items-center justify-center px-6 py-20 text-center text-white sm:min-h-[65svh]">
            <p className="text-[0.6875rem] uppercase tracking-[0.28em]">TX Quince / Community</p>
            <h1 className="mt-5 max-w-[18ch] font-body text-[clamp(2.25rem,4.4vw,4rem)] font-light leading-[1.14] tracking-[-0.035em]">The people behind the celebration.</h1>
            <a href="#vendor-directory" className="mt-8 inline-flex min-h-11 items-center border-b border-white/80 text-xs uppercase tracking-[0.18em]">Explore the directory <span className="ml-3" aria-hidden="true">↓</span></a>
          </div>
        </div>
        <p className="mx-auto max-w-[92rem] px-2 py-9 text-center font-serif text-lg leading-relaxed text-ink-soft sm:py-12 sm:text-xl">Explore the vendors credited in TX Quince photographs across Dallas–Fort Worth.</p>
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
            <div className="mx-auto max-w-[92rem] px-4 py-16 sm:px-6 md:px-10 md:py-24 lg:px-14">
              <div>
                <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-ink-soft">0{sectionIndex + 1} / Vendor credits</p>
                <h2 id={`vendor-category-${sectionIndex}`} className="mt-3 font-body text-[clamp(1.75rem,2.7vw,2.5rem)] font-light leading-tight text-ink">{section.label}</h2>
              </div>
              <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7">
                {section.vendors.map((vendor) => {
                  const count = counts.get(vendor.id) ?? 0;
                  const image = covers.get(vendor.id);
                  return <li key={vendor.id}>
                    <Link href={`/vendors/${vendor.slug}`} className="group block text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                      <span className="relative block aspect-[4/5] overflow-hidden bg-cream sm:aspect-[4/3]">
                        {image?.url ? <Image src={image.url} alt={publicPhotoCopy(image, altPhraseFor(image.section)).alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none" /> : <span className="absolute inset-0 flex items-end p-6 font-serif text-lg italic text-ink-soft">Photographs coming soon</span>}
                      </span>
                      <span className="mt-4 flex items-start justify-between gap-3 border-b border-line pb-4">
                        <span className="font-body text-xl font-light leading-tight sm:text-2xl">{vendor.business || vendor.name}</span>
                        <span className="shrink-0 text-sm text-ink-soft" aria-hidden="true">↗</span>
                      </span>
                      <span className="mt-2 block text-xs uppercase tracking-[0.15em] text-ink-soft">{count > 0 ? `${count} ${count === 1 ? "photograph" : "photographs"}` : "See vendor"}</span>
                    </Link>
                  </li>;
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
