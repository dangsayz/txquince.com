import { venues } from "@/content/venues";
import { getAllVenueCopy, getImagesByVenue } from "@/lib/content-db";
import { VenueManager, type VenueRow } from "@/components/admin/VenueManager";

export const dynamic = "force-dynamic";

export default async function AdminVenuesPage() {
  const copy = await getAllVenueCopy();
  // Photo counts per venue (getPortfolioImages is request-cached, so these
  // per-venue calls are cheap).
  const counts = await Promise.all(venues.map((v) => getImagesByVenue(v.slug)));
  const rows: VenueRow[] = venues.map((v, i) => ({
    slug: v.slug,
    name: v.venue,
    venueFull: v.venueFull,
    city: v.city,
    citySlug: v.citySlug,
    section: v.section,
    count: counts[i].length,
  }));

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-14">
      <h1 className="font-display text-[clamp(1.75rem,2.8vw,2.25rem)] leading-tight text-ink">Venues</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">
        Each venue you shoot at gets its own landing page at{" "}
        <code className="text-ink">/venues/&hellip;</code> — built to rank when families search
        that venue&apos;s name. Photos fill in automatically from the weekly ingest. Write (or
        AI-draft) a short intro + a few FAQs so Google has unique text to rank, then Save.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
        To add a venue, add it to <code>src/content/venues.json</code> (same list the photo
        ingest uses) — it appears here automatically.
      </p>
      <div className="mt-8">
        <VenueManager venues={rows} copy={copy} />
      </div>
    </main>
  );
}
