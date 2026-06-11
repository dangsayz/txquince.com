import { getPortfolioImages } from "@/lib/content-db";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const images = await getPortfolioImages();
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Portfolio</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Upload your best, release-cleared images. Add alt text (helps SEO &amp;
        accessibility), assign a section, mark a few as <em>Featured</em> to show on
        the homepage, and reorder with the arrows. Curate ruthlessly.
      </p>
      <div className="mt-8">
        <PortfolioManager initial={images} />
      </div>
    </main>
  );
}
