"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Focus } from "@/lib/pulse-intel";
import { MOVE_METRICS } from "@/lib/pulse-intel";
import type { PulseMove } from "@/lib/pulse-moves";
import type { ConversionChange } from "@/lib/analytics-db";
import { useMoveStarter } from "@/components/admin/useMoveStarter";

/**
 * IdeasBoard — the Studio's place to think. One suggestion from the numbers,
 * a box to write your own idea (optionally tied to the number it should move,
 * so the site measures it), what you are trying now with a verdict, and the
 * ideas you saved. Everything is stored in conversion_changes via
 * /api/admin/changes: tracked ideas use area "pulse:<metric>" (judged in
 * pulse-moves.ts), plain ideas use area "idea".
 */
const STATE: Record<string, { label: string; tone?: "good" | "urgent" }> = {
  working: { label: "Working", tone: "good" },
  "not-working": { label: "Not working", tone: "urgent" },
  flat: { label: "No change" },
  measuring: { label: "Measuring" },
};
const TRACKABLE = ["leads", "visits", "booked", "step:1", "step:2", "step:3", "step:4", "bounce"] as const;

export function IdeasBoard({
  focus,
  focusDay,
  moves,
  ideas,
  suggestions,
}: {
  focus: Focus;
  focusDay: number | null;
  moves: PulseMove[];
  ideas: ConversionChange[];
  suggestions: string[];
}) {
  const router = useRouter();
  const { start, undo, saving, failed, started, undoable } = useMoveStarter<"focus">();
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = moves.filter((m) => m.status === "active");
  const finished = moves.filter((m) => m.status !== "active");
  const tracking = focusDay !== null || started.includes("focus");

  async function post(body: Record<string, string>, key: string) {
    setBusy(key);
    setError(null);
    const res = await fetch("/api/admin/changes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    setBusy(null);
    if (!res?.ok) {
      setError("Couldn't save that. Check your connection and try again.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function patch(id: string, status: "reviewed" | "archived", notes?: string) {
    setBusy(id);
    await fetch("/api/admin/changes", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status, notes }) }).catch(() => null);
    setBusy(null);
    router.refresh();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const ok = await post(metric ? { title: t.slice(0, 200), area: `pulse:${metric}`, target_metric: metric } : { title: t.slice(0, 200), area: "idea" }, "new");
    if (ok) {
      setTitle("");
      setMetric("");
    }
  }

  const fileMove = (m: PulseMove, status: "reviewed" | "archived") =>
    patch(m.id, status, `${status === "reviewed" ? "Kept" : "Dropped"} after ${m.days} days. ${m.metricLabel}: ${m.before ?? "?"} → ${m.now ?? "?"}${m.verdict?.change != null ? ` (${m.verdict.change >= 0 ? "+" : ""}${m.verdict.change}%)` : ""}.`);

  return (
    <section aria-labelledby="ideas-title" className="st-card">
      <div className="px-5 pt-5 sm:px-6">
        <h2 id="ideas-title" className="st-h2">Ideas</h2>
        <p className="st-note mt-1">Write down what you want to try. Pick the number it should move, and the site tells you in 1 to 3 weeks if it worked.</p>
      </div>

      {/* One suggestion from the numbers */}
      <div className="mx-5 mt-5 rounded-[var(--tq-radius-sm)] bg-[var(--tq-canvas)] px-5 py-4 sm:mx-6">
        <p className="m-0 text-[13px] font-medium text-[var(--tq-ink-mute)]">Suggested from your numbers</p>
        <p className="m-0 mt-1 text-lg font-medium leading-snug text-balance">{focus.headline}</p>
        <p className="st-note mt-1">{focus.why}</p>
        {focus.move ? (
          tracking ? (
            <p className="m-0 mt-3 flex flex-wrap items-center gap-x-4 text-[15px] font-medium text-[var(--tq-status-open)]" aria-live="polite">
              Trying this{focusDay !== null ? ` · day ${focusDay}` : ""}
              {undoable ? <button type="button" className="st-link" onClick={undo} disabled={saving === "focus"}>Undo</button> : null}
            </p>
          ) : (
            <button type="button" className="st-btn mt-3" disabled={saving === "focus"} onClick={() => start("focus", { title: focus.move!.title, area: `pulse:${focus.move!.metric}`, target_metric: focus.move!.metric })}>
              {saving === "focus" ? "Saving…" : "Try this"}
            </button>
          )
        ) : null}
        {failed ? <p role="alert" className="m-0 mt-2 text-sm text-[var(--tq-status-down)]">Couldn&apos;t save. Try again.</p> : null}
      </div>

      {/* Your own idea */}
      <form onSubmit={save} className="grid gap-3 px-5 pt-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-end">
        <label className="grid gap-1.5 text-[15px] font-medium">
          Your idea
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="e.g. Post the Garcia highlight film in 3 Facebook groups" className="st-input w-full font-normal" />
        </label>
        <label className="grid gap-1.5 text-[15px] font-medium">
          Should move
          <select value={metric} onChange={(e) => setMetric(e.target.value)} className="st-input w-full font-normal">
            <option value="">Just save it</option>
            {TRACKABLE.map((k) => <option key={k} value={k}>{MOVE_METRICS[k].label}</option>)}
          </select>
        </label>
        <button type="submit" className="st-btn" disabled={busy === "new" || !title.trim()}>{busy === "new" ? "Saving…" : metric ? "Start tracking" : "Save idea"}</button>
      </form>
      {error ? <p role="alert" className="m-0 px-5 pt-2 text-sm text-[var(--tq-status-down)] sm:px-6">{error}</p> : null}

      <div className="mt-6 grid border-t border-[var(--tq-surface-2)] lg:grid-cols-2">
        {/* Trying now */}
        <div className="min-w-0 px-5 py-5 sm:px-6 lg:border-r lg:border-[var(--tq-surface-2)]">
          <h3 className="m-0 text-[15px] font-semibold">Trying now {running.length ? <span className="font-normal text-[var(--tq-ink-mute)]">{running.length}</span> : null}</h3>
          {running.length === 0 ? (
            <p className="st-note mt-2">Nothing yet. Press Try this, or pick a number when you save an idea.</p>
          ) : (
            <ul className="m-0 mt-2 list-none divide-y divide-[var(--tq-surface-2)] p-0">
              {running.map((m) => {
                const state = STATE[m.verdict?.state ?? "measuring"];
                const unit = MOVE_METRICS[m.metric]?.unit === "%" ? "%" : "/day";
                return (
                  <li key={m.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="m-0 min-w-0 text-[15px] leading-6">{m.title}</p>
                      <span className="st-chip shrink-0" data-tone={state.tone}>{state.label}</span>
                    </div>
                    <p className="st-note mt-1">
                      {m.metricLabel} · day {m.days}
                      {m.before !== null ? ` · was ${m.before}${unit}` : ""}
                      {m.now !== null ? ` · now ${m.now}${unit}` : ""}
                    </p>
                    {m.verdict && m.verdict.state !== "measuring" ? (
                      <div className="mt-2 flex flex-wrap gap-3">
                        <button type="button" className="st-btn-ghost" disabled={busy === m.id} onClick={() => fileMove(m, "reviewed")}>Keep it</button>
                        <button type="button" className="st-btn-ghost" disabled={busy === m.id} onClick={() => fileMove(m, "archived")}>Drop it</button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          {finished.length ? (
            <details className="mt-3">
              <summary className="st-link cursor-pointer">Finished ({finished.length})</summary>
              <ul className="m-0 mt-1 list-none divide-y divide-[var(--tq-surface-2)] p-0">
                {finished.map((m) => (
                  <li key={m.id} className="py-3">
                    <p className="m-0 text-[15px]">{m.title} <span className="st-chip ml-1" data-tone={m.status === "reviewed" ? "good" : undefined}>{m.status === "reviewed" ? "Kept" : "Dropped"}</span></p>
                    {m.notes ? <p className="st-note mt-1">{m.notes}</p> : null}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>

        {/* Saved ideas + more suggestions */}
        <div className="min-w-0 border-t border-[var(--tq-surface-2)] px-5 py-5 sm:px-6 lg:border-t-0">
          <h3 className="m-0 text-[15px] font-semibold">Saved ideas {ideas.length ? <span className="font-normal text-[var(--tq-ink-mute)]">{ideas.length}</span> : null}</h3>
          {ideas.length === 0 ? (
            <p className="st-note mt-2">Ideas you save without a number show up here.</p>
          ) : (
            <ul className="m-0 mt-2 list-none divide-y divide-[var(--tq-surface-2)] p-0">
              {ideas.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 py-2">
                  <span className="min-w-0 py-2 text-[15px] leading-6">
                    {c.title}
                    <span className="block text-[13px] text-[var(--tq-ink-mute)]">{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })}</span>
                  </span>
                  <button type="button" className="st-link shrink-0" disabled={busy === c.id} onClick={() => patch(c.id, "archived", "Done")}>Done</button>
                </li>
              ))}
            </ul>
          )}
          {suggestions.length ? (
            <>
              <h3 className="m-0 mt-5 text-[15px] font-semibold">More from your numbers</h3>
              <ul className="m-0 mt-2 list-none divide-y divide-[var(--tq-surface-2)] p-0">
                {suggestions.map((text) => (
                  <li key={text} className="flex items-start justify-between gap-3 py-2">
                    <span className="min-w-0 py-2 text-[15px] leading-6 text-[var(--tq-ink-mute)]">{text}</span>
                    <button type="button" className="st-link shrink-0" disabled={busy === text} onClick={() => post({ title: text.slice(0, 200), area: "idea" }, text)}>Save</button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
