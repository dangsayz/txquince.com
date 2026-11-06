import { redirect } from "next/navigation";
import { StudioPage } from "@/components/admin/StudioPage";
import { getAdminEmail } from "@/lib/require-admin";
import { DEFAULT_PRICE_BOOK } from "@/lib/commission";
import { listPriceHistory, readPriceBook } from "@/lib/pricing";
import { PriceManager } from "@/components/admin/PriceManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prices · TX Quince Studio" };

/** /admin/prices — the owner edits every price, the deposit and the payment timing. */
export default async function AdminPrices() {
  // The middleware guards /admin, but this page also returns who changed what
  // (history), so it re-checks the session itself.
  if (!(await getAdminEmail())) redirect("/admin/login");
  const [current, history] = await Promise.all([readPriceBook(), listPriceHistory()]);

  return (
    <StudioPage title="Prices" intro="What families pay. Every page, the booking form, the FAQ and the agreement use these numbers.">
      <div className="min-w-0">
        <PriceManager
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
