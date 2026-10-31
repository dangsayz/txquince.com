import { requireAdminPage } from "@/lib/require-admin";
import { listPriceGuide, type PriceGuideRow } from "@/lib/plan-db";
import { guideUsd } from "@/lib/price-guide";
import { PriceGuideImporter } from "@/components/admin/PriceGuideImporter";

export const dynamic = "force-dynamic";

export default async function AdminPriceGuide() {
  await requireAdminPage("/admin/price-guide");
  let rows: PriceGuideRow[] = [];
  let loadError: string | null = null;
  try {
    rows = await listPriceGuide();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load the price guide.";
  }
  return (
    <main className="mx-auto max-w-[64rem] px-5 pb-24 pt-8 text-[#252525] sm:px-8 lg:pt-11">
      <div className="border-b border-[#e5e5e3] pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Website / Price guide</p>
        <h1 className="mt-3 text-[clamp(1.7rem,2.5vw,2.25rem)] font-normal leading-tight tracking-[-0.035em]">DFW quince price guide</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-6 text-[#575753]">
          Shown at <a href="/precios-quince-dfw" target="_blank" className="underline">/precios-quince-dfw</a> and <a href="/quince-prices-dfw" target="_blank" className="underline">/quince-prices-dfw</a>. The FAQ on those pages is written from these numbers. While the guide is empty, both pages ask search engines not to index them.
        </p>
      </div>
      {loadError ? <p role="alert" className="mt-6 rounded-sm border border-[#f0c9c5] bg-[#f8e8e7] px-4 py-3 text-sm text-[#8f4039]">{loadError}</p> : null}
      <section className="mt-8 grid gap-3" aria-labelledby="import">
        <h2 id="import" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">Update from your lead sheet</h2>
        <PriceGuideImporter />
      </section>
      <section className="mt-10" aria-labelledby="current">
        <h2 id="current" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#62625f]">Live now ({rows.length})</h2>
        {rows.length ? (
          <div className="mt-3 overflow-x-auto border-y border-[#e5e5e3] bg-white">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead><tr className="border-b border-[#e5e5e3] text-xs uppercase tracking-[0.1em] text-[#62625f]"><th className="px-4 py-3">Category</th><th className="px-3 py-3">Español</th><th className="px-3 py-3">Low</th><th className="px-3 py-3">Typical</th><th className="px-3 py-3">High</th><th className="px-3 py-3">Samples</th><th className="px-3 py-3">Updated</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#ededeb] last:border-0">
                    <td className="px-4 py-3">{r.category}</td><td className="px-3 py-3">{r.category_es ?? "—"}</td>
                    <td className="px-3 py-3 tabular-nums">{guideUsd(r.low_usd)}</td><td className="px-3 py-3 tabular-nums">{guideUsd(r.typical_usd)}</td><td className="px-3 py-3 tabular-nums">{guideUsd(r.high_usd)}</td>
                    <td className="px-3 py-3 tabular-nums">{r.sample_count}</td><td className="px-3 py-3 tabular-nums">{r.last_updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loadError ? <p className="mt-3 text-sm text-[#696965]">Empty. Paste your first rows above.</p> : null}
      </section>
    </main>
  );
}
