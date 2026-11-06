import { venues } from "@/content/venues";
import { StudioPage } from "@/components/admin/StudioPage";
import { getAllVenueCopy, getImagesByVenue } from "@/lib/content-db";
import { VenueManager, type VenueRow } from "@/components/admin/VenueManager";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminVenuesPage() {
  await requireAdminPage("/admin/venues"); // server-side gate; middleware is not enough
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
    <StudioPage wide title="Venues" intro={`The stories and details on your ${rows.length} venue pages.`}>
      <div className="min-w-0">
        <VenueManager venues={rows} copy={copy} />
      </div>
    </StudioPage>
  );
}
