import { redirect } from "next/navigation";
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
    <main className="mx-auto max-w-[80rem] px-5 pb-20 pt-8 sm:px-8 md:pt-12 lg:px-12">
      <div className="border-b border-neutral-200 pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Website / Packages</p>
        <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-neutral-950">Packages</h1>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-neutral-600">
          What each package includes: who comes, photo counts, cameras, the film, the album, the card points. Every page that describes a package uses these words.
        </p>
      </div>
      <div className="mt-8">
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
    </main>
  );
}
