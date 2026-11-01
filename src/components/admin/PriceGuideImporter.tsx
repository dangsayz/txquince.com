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
    <div className="grid gap-4 border border-[#e5e5e3] bg-white p-5">
      <label className="grid gap-2 text-sm font-medium">
        Paste rows from your lead sheet
        <span className="font-normal text-[#696965]">
          Columns in this order, or with a header row: category · category in Spanish · low · typical · high · sample count · last updated
        </span>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setRows(null); setSaved(false); }}
          rows={8}
          spellCheck={false}
          className="w-full rounded-sm border border-[#dcdcd9] p-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]"
          placeholder={"Category\tCategoría\tLow\tTypical\tHigh\tSamples\tUpdated\nPhotography\tFotografía\t$900\t$1,800\t$3,500\t42\t10/30/2026"}
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy || !text.trim()} onClick={() => send(true)} className="min-h-12 rounded-sm border border-[#252525] px-5 text-sm font-medium disabled:opacity-50">Preview</button>
        <button type="button" disabled={busy || !rows?.length || errors.length > 0} onClick={() => send(false)} className="min-h-12 rounded-sm bg-[#242424] px-5 text-sm font-medium text-white hover:bg-[#444] disabled:opacity-50">
          {busy ? "Working…" : "Replace the price guide"}
        </button>
      </div>
      {errors.length ? (
        <ul role="alert" className="grid gap-1 rounded-sm border border-[#f0c9c5] bg-[#f8e8e7] px-4 py-3 text-sm text-[#8f4039]">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      ) : null}
      {saved ? <p role="status" className="text-sm text-[#365c43]">Saved. The public pages now show these {rows?.length} rows.</p> : null}
      {rows?.length && !saved ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead><tr className="border-b border-[#e5e5e3] text-xs uppercase tracking-[0.1em] text-[#62625f]"><th className="py-2 pr-3">Category</th><th className="py-2 pr-3">Español</th><th className="py-2 pr-3">Low</th><th className="py-2 pr-3">Typical</th><th className="py-2 pr-3">High</th><th className="py-2 pr-3">Samples</th><th className="py-2">Updated</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sort_order} className="border-b border-[#ededeb]">
                  <td className="py-2 pr-3">{r.category}</td><td className="py-2 pr-3">{r.category_es ?? "—"}</td>
                  <td className="py-2 pr-3 tabular-nums">{guideUsd(r.low_usd)}</td><td className="py-2 pr-3 tabular-nums">{guideUsd(r.typical_usd)}</td><td className="py-2 pr-3 tabular-nums">{guideUsd(r.high_usd)}</td>
                  <td className="py-2 pr-3 tabular-nums">{r.sample_count}</td><td className="py-2 tabular-nums">{r.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
