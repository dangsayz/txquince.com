import { requireAdminPage } from "@/lib/require-admin";
import { StudioPage, StudioSection } from "@/components/admin/StudioPage";
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
    <StudioPage title="DFW price guide" intro={<>Shown at <a href="/quince-prices-dfw" target="_blank" rel="noreferrer" className="underline underline-offset-4">/quince-prices-dfw</a> and <a href="/precios-quince-dfw" target="_blank" rel="noreferrer" className="underline underline-offset-4">/precios-quince-dfw</a>. While it is empty, both pages stay out of Google.</>}>
      {loadError ? <p role="alert" className="st-card m-0 px-5 py-4 text-[15px] text-[var(--tq-status-down)]">{loadError}</p> : null}
      <StudioSection title="Update from your lead sheet" id="import">
        <PriceGuideImporter />
      </StudioSection>
      <StudioSection title={`Live now (${rows.length})`} id="current" flush>
        {rows.length ? (
          <div className="overflow-x-auto border-t border-[var(--tq-surface-2)]">
            <table className="st-table min-w-[36rem] text-[15px]">
              <thead><tr><th scope="col">Category</th><th scope="col">Español</th><th scope="col">Low</th><th scope="col">Typical</th><th scope="col">High</th><th scope="col">Samples</th><th scope="col">Updated</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.category}</td><td>{r.category_es ?? "—"}</td>
                    <td className="st-num">{guideUsd(r.low_usd)}</td><td className="st-num">{guideUsd(r.typical_usd)}</td><td className="st-num">{guideUsd(r.high_usd)}</td>
                    <td className="st-num">{r.sample_count}</td><td className="st-num">{r.last_updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loadError ? <p className="st-note px-5 pb-5 sm:px-6">Empty. Paste your first rows above.</p> : null}
      </StudioSection>
    </StudioPage>
  );
}
