import { getPortfolioImages, getVendors } from "@/lib/content-db";
import { locations } from "@/content/locations";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const [images, vendors] = await Promise.all([getPortfolioImages(), getVendors()]);
  const cities = locations.map((l) => ({ slug: l.slug, label: l.city }));
  return (
    <main className="mx-auto max-w-[90rem] px-5 pb-20 pt-8 md:px-10 md:pt-12 lg:px-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Website / Library</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-neutral-950">Portfolio</h1>
          <p className="mt-2 text-sm text-neutral-600">Curate the photographs families see across your site.</p>
        </div>
        <p className="text-sm tabular-nums text-neutral-500">{images.length} photographs</p>
      </div>
      <div className="mt-8">
        <PortfolioManager initial={images} cities={cities} vendors={vendors} />
      </div>
    </main>
  );
}
