"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guideUsd, type GuideRowInput } from "@/lib/price-guide";

/**
 * Paste rows straight from the lead sheet (Google Sheets copies them
 * tab-separated), preview, then save. Saving replaces the whole guide.
 */
export function PriceGuideImporter() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<GuideRowInput[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function send(dryRun: boolean) {
    setBusy(true);
    setSaved(false);
    const res = await fetch("/api/admin/price-guide", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, dryRun }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { rows?: GuideRowInput[]; errors?: string[]; saved?: boolean } | undefined;
    setBusy(false);
    setRows(data?.rows ?? null);
    setErrors(data?.errors ?? (res?.ok ? [] : ["Something went wrong. Try again."]));
    if (data?.saved) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Paste rows from your lead sheet
        <span className="font-normal text-[var(--tq-ink-mute)]">
          Columns in this order, or with a header row: category · category in Spanish · low · typical · high · sample count · last updated
        </span>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setRows(null); setSaved(false); }}
          rows={8}
          spellCheck={false}
          className="st-input w-full py-3 font-[family-name:var(--tq-font-mono)]"
          placeholder={"Category\tCategoría\tLow\tTypical\tHigh\tSamples\tUpdated\nPhotography\tFotografía\t$900\t$1,800\t$3,500\t42\t10/30/2026"}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy || !text.trim()} onClick={() => send(true)} className="st-btn-ghost">Preview</button>
        <button type="button" disabled={busy || !rows?.length || errors.length > 0} onClick={() => send(false)} className="st-btn">
          {busy ? "Working…" : "Replace the price guide"}
        </button>
      </div>
      {errors.length ? (
        <ul role="alert" className="m-0 grid gap-1 rounded-[var(--tq-radius-sm)] bg-[var(--st-tint-warn)] px-4 py-3 text-[15px] text-[var(--tq-status-down)]">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      ) : null}
      {saved ? <p role="status" className="text-sm text-[var(--tq-status-open)]">Saved. The public pages now show these {rows?.length} rows.</p> : null}
      {rows?.length && !saved ? (
        <div className="overflow-x-auto">
          <table className="st-table min-w-[36rem] text-[15px]">
            <thead><tr><th scope="col">Category</th><th scope="col">Español</th><th scope="col">Low</th><th scope="col">Typical</th><th scope="col">High</th><th scope="col">Samples</th><th scope="col">Updated</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sort_order}>
                  <td>{r.category}</td><td>{r.category_es ?? "—"}</td>
                  <td className="st-num">{guideUsd(r.low_usd)}</td><td className="st-num">{guideUsd(r.typical_usd)}</td><td className="st-num">{guideUsd(r.high_usd)}</td>
                  <td className="st-num">{r.sample_count}</td><td className="st-num">{r.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
