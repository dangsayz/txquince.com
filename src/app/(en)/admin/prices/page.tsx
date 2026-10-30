import { redirect } from "next/navigation";
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
    <main className="mx-auto max-w-[72rem] px-5 pb-20 pt-8 sm:px-8 md:pt-12 lg:px-12">
      <div className="border-b border-neutral-200 pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Website / Prices</p>
        <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-neutral-950">Prices</h1>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-neutral-600">
          Change what families pay. Every page, the booking form, the FAQ and the agreement use these numbers.
        </p>
      </div>
      <div className="mt-8">
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
    </main>
  );
}
