import { venues } from "@/content/venues";
import { getAllVenueCopy, getImagesByVenue } from "@/lib/content-db";
import { VenueManager, type VenueRow } from "@/components/admin/VenueManager";

export const dynamic = "force-dynamic";

export default async function AdminVenuesPage() {
  const copy = await getAllVenueCopy();
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
    <main className="mx-auto max-w-[90rem] px-5 pb-20 pt-8 md:px-10 md:pt-12 lg:px-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Website / Locations</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-neutral-950">Venues</h1>
          <p className="mt-2 text-sm text-neutral-600">Edit the stories and details on your venue pages.</p>
        </div>
        <p className="text-sm tabular-nums text-neutral-500">{rows.length} venues</p>
      </div>
      <div className="mt-8">
        <VenueManager venues={rows} copy={copy} />
      </div>
    </main>
  );
}
