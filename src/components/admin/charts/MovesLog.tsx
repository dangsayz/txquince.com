"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PulseMove } from "@/lib/pulse-moves";
import { MOVE_METRICS } from "@/lib/pulse-intel";

/**
 * MovesLog — every "next move" the owner chose to try, re-measured against
 * the number it started from. Active moves show their live verdict; once
 * judged, Keep or Drop files them (with the result) so the track record
 * builds up: what was tried, for how long, and whether it moved the number.
 */
const TONE: Record<string, string> = { working: "#30d158", "not-working": "#ff453a", flat: "#ff9f0a", measuring: "#0a84ff" };
const STATE_LABEL: Record<string, string> = { working: "Working", "not-working": "Not working", flat: "No change", measuring: "Measuring" };

export function MovesLog({ moves, nextUp }: { moves: PulseMove[]; nextUp: { title: string; metric: string } | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const active = moves.filter((m) => m.status === "active");
  const done = moves.filter((m) => m.status !== "active");
  const kept = done.filter((m) => m.status === "reviewed");

  async function file(m: PulseMove, status: "reviewed" | "archived") {
    setBusy(m.id);
    const notes = `${status === "reviewed" ? "Kept" : "Dropped"} after ${m.days} days. ${m.metricLabel}: ${m.before ?? "?"} → ${m.now ?? "?"}${m.verdict?.change != null ? ` (${m.verdict.change >= 0 ? "+" : ""}${m.verdict.change}%)` : ""}.`;
    await fetch("/api/admin/changes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: m.id, status, notes }),
    }).catch(() => null);
    setBusy(null);
    router.refresh();
  }

  async function startNext() {
    if (!nextUp) return;
    setBusy("next");
    await fetch("/api/admin/changes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: nextUp.title.slice(0, 200), area: `pulse:${nextUp.metric}`, target_metric: nextUp.metric }),
    }).catch(() => null);
    setBusy(null);
    router.refresh();
  }

  return (
    <section aria-labelledby="moves-title" className="hud-card min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(255,255,255,0.14)] px-4 py-3.5 sm:px-5">
        <h2 id="moves-title" className="hud-label m-0" style={{ color: "#f5f5f7" }}>
          Moves log
        </h2>
        <p className="hud-mono m-0 text-[11px] text-[#8e8e93]">
          {moves.length ? `${active.length} RUNNING · ${done.length} FINISHED · ${kept.length} KEPT` : "NOTHING TRIED YET"}
        </p>
      </div>

      {nextUp && !active.some((m) => m.title === nextUp.title) ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[rgba(255,255,255,0.25)] px-4 py-3 sm:px-5">
          <p className="m-0 min-w-0 flex-1 text-sm leading-6 text-[#f5f5f7]">
            <span className="hud-mono mr-2 text-[11px] text-[#ff9f0a]">NEXT UP</span>
            {nextUp.title}
          </p>
          <button type="button" className="hud-move-btn hud-focus" disabled={busy === "next"} onClick={startNext}>
            {busy === "next" ? "Saving…" : "Try this →"}
          </button>
        </div>
      ) : null}

      {moves.length === 0 ? (
        <p className="m-0 px-4 py-4 text-sm leading-6 text-[#aeaeb2] sm:px-5">
          Hover any number, hold for Next moves, and press <span className="hud-mono text-[#0a84ff]">Try this</span>. It saves today&apos;s number, then this log
          tells you after 7 to 21 days whether the move worked.
        </p>
      ) : (
        <ol className="m-0 list-none divide-y divide-[rgba(255,255,255,0.1)] p-0">
          {[...active, ...done].slice(0, 8).map((m) => {
            const state = m.status === "active" ? m.verdict?.state ?? "measuring" : m.status === "reviewed" ? "working" : "not-working";
            const color = TONE[state];
            const u = MOVE_METRICS[m.metric]?.unit === "%" ? "%" : "/DAY";
            return (
              <li key={m.id} className="px-4 py-3.5 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <p className="m-0 min-w-0 flex-1 text-sm leading-6 text-[#f5f5f7]">{m.title}</p>
                  <span className="hud-pill" style={{ color }}>
                    {m.status === "active" ? STATE_LABEL[state] : m.status === "reviewed" ? "Kept" : "Dropped"}
                  </span>
                </div>
                <p className="hud-mono m-0 mt-1 text-[11px] text-[#8e8e93]">
                  {m.metricLabel.toUpperCase()} · DAY {m.days}
                  {m.before !== null ? ` · STARTED AT ${m.before}${u}` : ""}
                  {m.now !== null ? ` · NOW ${m.now}${u}` : ""}
                </p>
                <p className="m-0 mt-1 text-[13px] leading-5 text-[#aeaeb2]">{m.status === "active" ? m.verdict?.text ?? "Measuring." : m.notes}</p>
                {m.status === "active" && m.verdict && m.verdict.state !== "measuring" ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" className="hud-move-btn hud-focus" disabled={busy === m.id} onClick={() => file(m, "reviewed")}>
                      Keep it
                    </button>
                    <button type="button" className="hud-move-btn hud-focus" style={{ color: "#ff453a" }} disabled={busy === m.id} onClick={() => file(m, "archived")}>
                      Drop it
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
