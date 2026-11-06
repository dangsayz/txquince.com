import { redirect } from "next/navigation";
import { StudioPage } from "@/components/admin/StudioPage";
import { getAdminEmail } from "@/lib/require-admin";
import { DEFAULT_PRICE_BOOK } from "@/lib/commission";
import { listPriceHistory, readPriceBook } from "@/lib/pricing";
import { PackageManager } from "@/components/admin/PackageManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Packages · TX Quince Studio" };

/** /admin/packages — what each package includes, in words; one save changes every page. */
export default async function AdminPackages() {
  // The middleware guards /admin; this page also shows who changed what, so it re-checks.
  if (!(await getAdminEmail())) redirect("/admin/login");
  const [current, history] = await Promise.all([readPriceBook(), listPriceHistory()]);

  return (
    <StudioPage title="Packages" intro="What each package includes, in words. Every page that describes a package uses them.">
      <div className="min-w-0">
        <PackageManager
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
