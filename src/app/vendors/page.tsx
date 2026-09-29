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
import { VENDOR_CATEGORIES, vendorCategoryLabel } from "@/content/portfolio-taxonomy";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

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
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <section className="mx-auto max-w-[90rem] px-5 pb-14 pt-14 text-center md:px-10 md:pb-20 md:pt-20 lg:px-16">
        <Reveal className="mx-auto max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Vendors</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">The team behind the day.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
            The venues, florists, glam artists, bakers, and DJs we love working
            with across Dallas–Fort Worth. Tap any name to see the work.
          </p>
        </Reveal>
      </section>

      {sections.length === 0 ? (
        <section className="mx-auto max-w-[90rem] px-5 pb-24 md:px-10 lg:px-16">
          <p className="accent text-xl text-ink-faint">Vendor directory coming soon.</p>
        </section>
      ) : (
        sections.map((s) => (
          <section key={s.id} className="border-t border-line bg-white">
            <div className="mx-auto max-w-[90rem] px-5 py-12 md:px-10 lg:px-16 md:py-16">
              <Reveal>
                <h2 className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] text-ink">{s.label}</h2>
              </Reveal>
              <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {s.vendors.map((v) => {
                  const n = counts.get(v.id) ?? 0;
                  const cover = covers.get(v.id);
                  return (
                    <li key={v.id}>
                      <Link
                        href={`/vendors/${v.slug}`}
                        className="group block h-full overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        <span className="relative block aspect-[16/10] overflow-hidden bg-greige">
                          {cover?.url ? <Image src={cover.url} alt={cover.alt || `Quinceañera work with ${v.business || v.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.025]" /> : null}
                        </span>
                        <span className="flex min-h-16 items-center justify-between gap-3 px-5 py-4">
                          <span className="min-w-0"><span className="block text-base font-medium text-ink">{v.business || v.name}</span>{v.ig_handle ? <span className="block text-sm text-ink-soft">@{v.ig_handle}</span> : null}</span>
                          <span className="shrink-0 text-sm text-ink-soft">{n} photo{n === 1 ? "" : "s"} ↗</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))
      )}

      <FinalCTA />
    </>
  );
}
