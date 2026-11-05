"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Focus } from "@/lib/pulse-intel";

/**
 * TodayFocus — the top of the panel: one sentence saying what to do today,
 * why, and a "Try this" that starts tracking it in the Moves log.
 */
export function TodayFocus({ focus, trying }: { focus: Focus; trying: number | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function start() {
    if (!focus.move) return;
    setBusy(true);
    const res = await fetch("/api/admin/changes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: focus.move.title.slice(0, 200), area: `pulse:${focus.move.metric}`, target_metric: focus.move.metric }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setDone(true);
      router.refresh();
    }
  }

  return (
    <section aria-labelledby="today-title" className="hud-card px-5 py-5 sm:px-6">
      <h2 id="today-title" className="hud-label m-0" style={{ color: "#0071e3", fontWeight: 600 }}>
        Do this today
      </h2>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-3xl flex-1">
          <p className="m-0 text-[22px] font-semibold leading-snug tracking-[-0.01em] text-[#1d1d1f] sm:text-[24px]">{focus.headline}</p>
          <p className="m-0 mt-2 text-[15px] leading-6 text-[#6e6e73]">{focus.why}</p>
        </div>
        {focus.move ? (
          trying !== null || done ? (
            <p className="hud-move-on m-0">● Tracking{trying !== null ? ` · day ${trying}` : ""} in the Moves log</p>
          ) : (
            <button type="button" className="hud-move-btn hud-focus shrink-0" style={{ minHeight: 48 }} disabled={busy} onClick={start}>
              {busy ? "Saving…" : "Try this →"}
            </button>
          )
        ) : null}
      </div>
    </section>
  );
}
