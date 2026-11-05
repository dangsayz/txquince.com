"use client";

import { useState } from "react";

/**
 * RankedTabs — several ranked lists behind tabs, HUD style. Each row carries
 * a glowing bar sized to its share of the top row (grows in on tab switch),
 * a rank index, and the value. `tip` under the tabs says what to do with it.
 */
export type RankedRow = { label: string; value: number; note?: string };
export type RankedTab = { id: string; label: string; unit: string; rows: RankedRow[]; empty: string; tip?: string };

export function RankedTabs({ tabs, title }: { tabs: RankedTab[]; title: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  if (!tab) return null;
  const max = Math.max(...tab.rows.map((r) => r.value), 1);
  const total = tab.rows.reduce((s, r) => s + r.value, 0) || 1;

  return (
    <section aria-label={title} className="hud-card min-w-0">
      <div role="tablist" aria-label={title} className="flex gap-1 overflow-x-auto border-b border-[rgba(255,255,255,0.14)] px-2 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={t.id === tab.id}
            onClick={() => setActive(t.id)}
            className={`hud-focus hud-mono min-h-12 shrink-0 whitespace-nowrap border-b-2 px-3 text-[12px] uppercase tracking-[0.12em] transition-colors ${t.id === tab.id ? "border-[#0a84ff] text-[#f5f5f7] [text-shadow:0_0_12px_rgba(255,255,255,0.6)]" : "border-transparent text-[#8e8e93] hover:text-[#f5f5f7]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="hud-label flex items-center justify-between px-4 pb-1 pt-3 sm:px-5">
        <span>{tab.label}</span>
        <span>{tab.unit} · Share</span>
      </div>
      {tab.rows.length === 0 ? (
        <p className="px-4 pb-5 pt-2 text-sm text-[#8e8e93] sm:px-5">{tab.empty}</p>
      ) : (
        <ol key={tab.id} className="m-0 list-none px-2 pb-3 sm:px-3">
          {tab.rows.map((r, i) => (
            <li key={r.label} className="relative isolate flex min-h-10 items-center justify-between gap-3 px-2 text-sm">
              <span
                aria-hidden
                className="hud-bar hud-grow absolute inset-y-1 left-0 -z-10 rounded-[4px]"
                style={{ width: `${Math.max((r.value / max) * 100, 2)}%`, animationDelay: `${i * 45}ms` }}
              />
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="hud-mono w-5 shrink-0 text-[11px] text-[#0a84ff]">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 truncate text-[#f5f5f7]">{r.label}</span>
              </span>
              <span className="hud-mono shrink-0 text-[13px] text-[#e5e5ea]">
                {r.note ? <span className="mr-2 text-[11px] text-[#30d158]">{r.note}</span> : null}
                {r.value.toLocaleString("en-US")}
                <span className="ml-2 inline-block w-9 text-right text-[11px] text-[#8e8e93]">{Math.round((r.value / total) * 100)}%</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      {tab.tip ? (
        <p className="m-0 border-t border-dashed border-[rgba(255,255,255,0.25)] px-4 py-3 text-[13px] leading-5 text-[#aeaeb2] sm:px-5">
          <span className="hud-mono mr-1.5 text-[11px] text-[#0a84ff]">› NEXT</span>
          {tab.tip}
        </p>
      ) : null}
    </section>
  );
}
