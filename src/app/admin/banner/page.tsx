import { requireAdminPage } from "@/lib/require-admin";
import { StudioPage } from "@/components/admin/StudioPage";
import { BannerEditor } from "@/components/admin/BannerEditor";
import { readBannerSale } from "@/lib/site-banner";
import { todayInDallas } from "@/lib/plan";

export const metadata = { title: "Banner · TX Quince Studio" };
export const dynamic = "force-dynamic";

/** /admin/banner — the one line under the site's menu bar. */
export default async function AdminBanner() {
  await requireAdminPage("/admin/banner");
  return (
    <StudioPage
      title="Banner"
      intro="The thin line under the menu on every public page. It always says you accept payment plans. Add a sale line here and the two take turns."
      back={{ href: "/admin/website", label: "Website" }}
    >
      <BannerEditor initial={await readBannerSale()} today={todayInDallas()} />
    </StudioPage>
  );
}
