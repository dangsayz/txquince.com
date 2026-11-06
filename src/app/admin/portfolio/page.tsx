import { getPortfolioImages, getVendors } from "@/lib/content-db";
import { StudioPage } from "@/components/admin/StudioPage";
import { locations } from "@/content/locations";
import { PortfolioManager } from "@/components/admin/PortfolioManager";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  await requireAdminPage("/admin/portfolio"); // server-side gate; middleware is not enough
  const [images, vendors] = await Promise.all([getPortfolioImages(), getVendors()]);
  const cities = locations.map((l) => ({ slug: l.slug, label: l.city }));
  return (
    <StudioPage wide title="Portfolio" intro={`The photographs families see across your site. ${images.length} in the library.`}>
      <div className="min-w-0">
        <PortfolioManager initial={images} cities={cities} vendors={vendors} />
      </div>
    </StudioPage>
  );
}
