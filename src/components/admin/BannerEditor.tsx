"use client";

import { useId, useState } from "react";
import type { BannerSale } from "@/lib/site-banner-shared";

/** Studio → Website → Banner: write, change or remove the sale line. */
export function BannerEditor({ initial, today }: { initial: BannerSale | null; today: string }) {
  const uid = useId();
  const [saved, setSaved] = useState<BannerSale | null>(initial);
  const [en, setEn] = useState(initial?.en ?? "");
  const [es, setEs] = useState(initial?.es ?? "");
  const [ends, setEnds] = useState(initial?.ends ?? "");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: "good" | "urgent"; text: string } | null>(null);

  const ended = Boolean(saved?.ends && saved.ends < today);
  const call = async (method: "PUT" | "DELETE") => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/banner", {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "PUT" ? JSON.stringify({ en, es, ends }) : undefined,
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; sale?: BannerSale | null };
      if (!res.ok || !j.ok) {
        setNote({ tone: "urgent", text: j.error || "That did not save. Try again." });
        return;
      }
      setSaved(j.sale ?? null);
      if (!j.sale) {
        setEn("");
        setEs("");
        setEnds("");
      }
      setNote({ tone: "good", text: j.sale ? "Saved. The sale line is on the site now." : "Removed. The banner shows the payment line only." });
    } catch {
      setNote({ tone: "urgent", text: "That did not save. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="st-card p-5 sm:p-6" aria-labelledby={`${uid}-t`}>
      <h2 id={`${uid}-t`} className="st-h2">Sale line</h2>
      <p className="m-0 mt-2 max-w-[44rem] text-base leading-6 text-[var(--tq-ink-mute)]">
        {saved
          ? ended
            ? `Your sale line ended on ${saved.ends}, so the site is not showing it.`
            : `On the site now${saved.ends ? `, through ${saved.ends}` : ""}.`
          : "No sale line. The banner shows the payment line only."}{" "}
        Write only an offer you will honor: families will ask for it.
      </p>
      <form
        className="mt-5 grid max-w-[44rem] gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void call("PUT");
        }}
      >
        <div>
          <label htmlFor={`${uid}-en`} className="mb-1.5 block text-[15px] font-semibold">English</label>
          <input id={`${uid}-en`} className="st-input w-full" maxLength={90} required value={en} onChange={(e) => setEn(e.target.value)} autoComplete="off" />
        </div>
        <div>
          <label htmlFor={`${uid}-es`} className="mb-1.5 block text-[15px] font-semibold">Spanish</label>
          <input id={`${uid}-es`} className="st-input w-full" maxLength={90} required lang="es" value={es} onChange={(e) => setEs(e.target.value)} autoComplete="off" />
        </div>
        <div>
          <label htmlFor={`${uid}-ends`} className="mb-1.5 block text-[15px] font-semibold">Last day it shows (optional)</label>
          <input id={`${uid}-ends`} type="date" className="st-input" min={today} value={ends} onChange={(e) => setEnds(e.target.value)} aria-describedby={`${uid}-ends-h`} />
          <p id={`${uid}-ends-h`} className="m-0 mt-1.5 text-sm text-[var(--tq-ink-mute)]">After this day the line turns itself off. Leave it empty to keep it until you remove it.</p>
        </div>
        {note ? (
          <p role="status" className="m-0 text-[15px] font-semibold" style={{ color: note.tone === "good" ? "var(--tq-status-open)" : "var(--tq-status-down)" }}>
            {note.text}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="st-btn" disabled={busy}>
            {busy ? "Saving…" : "Save sale line"}
          </button>
          {saved ? (
            <button type="button" className="st-btn-ghost" disabled={busy} onClick={() => void call("DELETE")}>
              Remove sale line
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
