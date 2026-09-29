/**
 * /vendors — the public vendor directory. Every vendor we've tagged, grouped by
 * what they do, each linking to their own credit page. A real local-SEO asset
 * (vendor names + categories + DFW) and a cross-promotion hub.
 */
import type { Metadata } from "next";
import Link from "next/link";
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
  for (const img of images)
    for (const v of img.vendors ?? [])
      counts.set(v.vendor_id, (counts.get(v.vendor_id) ?? 0) + 1);

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

      <section className="mx-auto max-w-[90rem] px-5 pb-10 pt-20 md:px-10 lg:px-16 md:pb-14 md:pt-32">
        <Reveal>
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Vendors</p>
          <h1
            className="mt-5 max-w-4xl font-display text-ink"
            style={{ fontSize: "clamp(2.6rem,6.5vw,5.4rem)", lineHeight: 0.98, letterSpacing: "-0.028em" }}
          >
            The team behind the day.
          </h1>
          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
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
          <section key={s.id} className="mt-12 border-t border-ink/10 bg-white">
            <div className="mx-auto max-w-[90rem] px-5 py-12 md:px-10 lg:px-16 md:py-16">
              <Reveal>
                <h2
                  className="font-display text-ink"
                  style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", lineHeight: 1.05, letterSpacing: "-0.015em" }}
                >
                  {s.label}
                </h2>
              </Reveal>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.vendors.map((v) => {
                  const n = counts.get(v.id) ?? 0;
                  return (
                    <li key={v.id}>
                      <Link
                        href={`/vendors/${v.slug}`}
                        className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-line bg-ivory px-4 py-3 transition-colors hover:border-wine"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-ink">{v.business || v.name}</span>
                          {v.ig_handle ? (
                            <span className="block truncate text-xs text-ink-faint">
                              @{v.ig_handle}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs text-ink-faint">
                          {n} photo{n === 1 ? "" : "s"}
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
