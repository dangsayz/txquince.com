import { getPortfolioImages, getVendors } from "@/lib/content-db";
import { locations } from "@/content/locations";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const [images, vendors] = await Promise.all([getPortfolioImages(), getVendors()]);
  // Lightweight {slug,label} list for the per-photo City picker (keeps the heavy
  // locations content out of the client bundle).
  const cities = locations.map((l) => ({ slug: l.slug, label: l.city }));
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Portfolio</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Dump a whole shoot here, then sort it. Pick a category (the full quince-day
        timeline + vendors), add a title/hook/description/tags, tag any vendors you
        snapped (they autocomplete after the first time), set the <em>City</em>, and
        mark a few as <em>Featured</em>. AI can draft every field — you edit after.
      </p>
      <div className="mt-8">
        <PortfolioManager initial={images} cities={cities} vendors={vendors} />
      </div>
    </main>
  );
}
