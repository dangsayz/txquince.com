import { redirect } from "next/navigation";
import { StudioPage } from "@/components/admin/StudioPage";
import { getAdminEmail } from "@/lib/require-admin";
import { DEFAULT_PRICE_BOOK } from "@/lib/commission";
import { listPriceHistory, readPriceBook } from "@/lib/pricing";
import { PackageManager } from "@/components/admin/PackageManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Packages and prices · TX Quince Studio" };

/** /admin/packages — the one place packages are edited: names, prices, hours, wording, extras, deposit. */
export default async function AdminPackages({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  // The middleware guards /admin; this page also shows who changed what, so it re-checks.
  if (!(await getAdminEmail())) redirect("/admin/login");
  const [current, history] = await Promise.all([readPriceBook(), listPriceHistory()]);

  return (
    <StudioPage title="Packages and prices" intro="Names, prices, hours and what each package includes. One save changes every page, the booking form, emails and the agreement.">
      <div className="min-w-0">
        <PackageManager
          startTab={tab}
          initial={{
            book: current.book,
            defaults: DEFAULT_PRICE_BOOK,
            version: current.version,
            storage: current.storage,
            corrupt: current.corrupt,
            history,
          }}
        />
      </div>
    </StudioPage>
  );
}
