import { getPortfolioImages } from "@/lib/content-db";
import { locations } from "@/content/locations";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const images = await getPortfolioImages();
  // Lightweight {slug,label} list for the per-photo City picker (keeps the heavy
  // locations content out of the client bundle).
  const cities = locations.map((l) => ({ slug: l.slug, label: l.city }));
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Portfolio</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Upload your best, release-cleared images. Add alt text (helps SEO &amp;
        accessibility), assign a section, tag the <em>City</em> so it shows on that
        city&apos;s page, mark a few as <em>Featured</em> for the homepage, and
        reorder with the arrows. Curate ruthlessly.
      </p>
      <div className="mt-8">
        <PortfolioManager initial={images} cities={cities} />
      </div>
    </main>
  );
}
