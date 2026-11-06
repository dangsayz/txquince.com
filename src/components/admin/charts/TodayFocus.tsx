"use client";

import { useMoveStarter } from "./useMoveStarter";
import type { Focus } from "@/lib/pulse-intel";

/**
 * TodayFocus — the top of the panel: one sentence saying what to do today,
 * why, and a "Try this" that starts tracking it in the Moves log.
 */
export function TodayFocus({ focus, trying }: { focus: Focus; trying: number | null }) {
  const { start, undo, saving, failed, started, undoable } = useMoveStarter<"focus">();
  const busy = saving === "focus";
  const move = focus.move;
  const tracking = trying !== null || started.includes("focus");

  return (
    <section aria-labelledby="today-title" className="hud-card px-5 py-5 sm:px-6">
      <h2 id="today-title" className="hud-label m-0">
        Do this today
      </h2>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-3xl flex-1 basis-[22rem]">
          <p className="m-0 text-[22px] font-medium leading-snug tracking-[-0.02em] text-balance text-[#111110] sm:text-[24px]">{focus.headline}</p>
          <p className="m-0 mt-2 text-[15px] leading-6 text-[#4d4b48]">{focus.why}</p>
        </div>
        {move ? (
          tracking ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-live="polite">
              <p className="hud-move-on m-0">Tracking{trying !== null ? ` · day ${trying}` : ""} in the Moves log</p>
              {undoable ? (
                <button type="button" className="hud-move-btn hud-move-btn--quiet hud-focus" disabled={busy} onClick={undo}>
                  {busy ? "Undoing…" : "Undo"}
                </button>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              className="hud-move-btn hud-focus shrink-0 justify-center max-sm:w-full"
              style={{ minHeight: "var(--tq-tap-primary)" }}
              disabled={busy}
              onClick={() => start("focus", { title: move.title, area: `pulse:${move.metric}`, target_metric: move.metric })}
            >
              {busy ? "Saving…" : "Try this"}
            </button>
          )
        ) : null}
      </div>
      {failed ? (
        <p role="alert" className="m-0 mt-3 text-sm text-[#a14f12]">
          {failed.what === "undo" ? "Couldn't undo. Press Drop it on this move in the Moves log instead." : "Couldn't save that move. Check your connection and press Try this again."}
        </p>
      ) : null}
    </section>
  );
}
