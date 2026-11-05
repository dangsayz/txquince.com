"use client";

import { useState } from "react";

/**
 * RankedTabs — one card, several ranked lists behind tabs (after Seline's
 * Pages / Sources cards on Mobbin). Each row carries a faint bar sized to its
 * share of the top row, so the ranking reads at a glance.
 */
export type RankedRow = { label: string; value: number; note?: string };
export type RankedTab = { id: string; label: string; unit: string; rows: RankedRow[]; empty: string };

export function RankedTabs({ tabs, title }: { tabs: RankedTab[]; title: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!tab) return null;
  const max = Math.max(...tab.rows.map((r) => r.value), 1);

  return (
    <section aria-label={title} className="min-w-0 border border-[#e6e6e4] bg-white">
      <div role="tablist" aria-label={title} className="flex gap-1 overflow-x-auto border-b border-[#e6e6e4] px-2 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={t.id === tab.id}
            onClick={() => setActive(t.id)}
            className={`min-h-12 shrink-0 whitespace-nowrap border-b-2 px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black ${t.id === tab.id ? "border-[#111110] font-medium text-[#111110]" : "border-transparent text-[#62625f] hover:text-[#111110]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[11px] uppercase tracking-[0.12em] text-[#8a8a86] sm:px-5">
        <span>{tab.label}</span>
        <span>{tab.unit}</span>
      </div>
      {tab.rows.length === 0 ? (
        <p className="px-4 pb-5 pt-2 text-sm text-[#8a8a86] sm:px-5">{tab.empty}</p>
      ) : (
        <ol className="px-2 pb-3 sm:px-3">
          {tab.rows.map((r) => (
            <li key={r.label} className="relative isolate flex min-h-10 items-center justify-between gap-3 px-2 text-sm">
              <span aria-hidden className="absolute inset-y-1 left-0 -z-10 rounded-[4px] bg-[#f1f1ef]" style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }} />
              <span className="min-w-0 truncate text-[#111110]">{r.label}</span>
              <span className="shrink-0 tabular-nums text-[#4d4d49]">
                {r.note ? <span className="mr-2 text-xs text-[#8a8a86]">{r.note}</span> : null}
                {r.value.toLocaleString("en-US")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
