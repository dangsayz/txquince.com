"use client";

/**
 * CollectionsEditor — admin-only inline CRUD for pricing collections.
 *
 * Renders nothing for visitors. For the signed-in operator it adds a "Manage
 * collections" button above the pricing cards; the panel edits name, price,
 * hours, deposit, blurbs, inclusions, the "most reserved" flag and photo/film,
 * adds new collections, and removes them by DOUBLE-TAPPING a row (then confirm,
 * with one-tap undo). Saving PUTs the whole ordered set to /api/admin/collections
 * and refreshes the server-rendered cards.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Package } from "@/content/packages";

type Row = {
  id: string;
  name: string;
  price: number;
  hours: number;
  depositDollars: number;
  tagline: string;
  teaser: string;
  includes: string; // newline-separated in the textarea
  highlight: boolean;
  badge: string;
  singleCraft: boolean;
};

function toRow(p: Package): Row {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    hours: p.hours,
    depositDollars: Math.round(p.depositCents / 100),
    tagline: p.tagline,
    teaser: p.teaser,
    includes: p.includes.join("\n"),
    highlight: Boolean(p.highlight),
    badge: p.badge ?? "",
    singleCraft: Boolean(p.singleCraft),
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function CollectionsEditor({ initial }: { initial: Package[] }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>(() => initial.map(toRow));
  const [armed, setArmed] = useState<string | null>(null); // row id arming delete
  const [undo, setUndo] = useState<{ row: Row; index: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem("txq_admin")) return;
    } catch {
      return;
    }
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d: { admin?: boolean }) => setAdmin(!!d.admin))
      .catch(() => {});
  }, []);

  if (!admin) return null;

  function patch(id: string, field: keyof Row, value: Row[keyof Row]) {
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== id) {
          // Only one tier may be highlighted.
          if (field === "highlight" && value === true) return { ...r, highlight: false };
          return r;
        }
        return { ...r, [field]: value };
      }),
    );
  }

  function removeRow(id: string) {
    setRows((rs) => {
      const index = rs.findIndex((r) => r.id === id);
      if (index === -1) return rs;
      setUndo({ row: rs[index], index });
      return rs.filter((r) => r.id !== id);
    });
    setArmed(null);
  }

  function restore() {
    if (!undo) return;
    setRows((rs) => {
      const next = [...rs];
      next.splice(Math.min(undo.index, next.length), 0, undo.row);
      return next;
    });
    setUndo(null);
  }

  function addRow() {
    const base = "new-collection";
    let id = base;
    let n = 1;
    while (rows.some((r) => r.id === id)) id = `${base}-${++n}`;
    setRows((rs) => [
      ...rs,
      {
        id,
        name: "New collection",
        price: 2000,
        hours: 5,
        depositDollars: 500,
        tagline: "",
        teaser: "",
        includes: "",
        highlight: false,
        badge: "",
        singleCraft: true,
      },
    ]);
  }

  function move(id: string, dir: -1 | 1) {
    setRows((rs) => {
      const i = rs.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i === -1 || j < 0 || j >= rs.length) return rs;
      const next = [...rs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    // Re-slug any rows whose id still looks like a placeholder from the name.
    const items = rows.map((r) => ({
      id: /^new-collection/.test(r.id) ? slugify(r.name) || r.id : r.id,
      name: r.name.trim(),
      price: Math.max(0, Math.round(Number(r.price) || 0)),
      hours: Math.max(0, Math.round(Number(r.hours) || 0)),
      depositCents: Math.max(0, Math.round((Number(r.depositDollars) || 0) * 100)),
      tagline: r.tagline.trim(),
      teaser: r.teaser.trim(),
      includes: r.includes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      highlight: r.highlight,
      badge: r.badge.trim(),
      singleCraft: r.singleCraft,
    }));
    try {
      const res = await fetch("/api/admin/collections", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Could not save.");
      setOpen(false);
      setUndo(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setRows(initial.map(toRow));
    setUndo(null);
    setArmed(null);
    setError(null);
    setOpen(false);
  }

  const field =
    "w-full border border-line bg-white px-3 py-2 text-sm text-ink focus:border-wine focus:outline-none rounded-md";
  const lbl = "block text-[0.58rem] uppercase tracking-[0.18em] text-ink-faint mb-1";

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-wine"
      >
        <span aria-hidden>✎</span> Manage collections
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-ink/85 p-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label="Manage collections"
        >
          <div className="w-full max-w-3xl bg-cream p-5 shadow-2xl md:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl text-ink">Collections</h2>
              <button onClick={cancel} className="text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft hover:text-wine">
                Close ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Double-tap a collection&apos;s title bar to remove it. Changes go live when you Save.
            </p>

            <div className="mt-5 flex flex-col gap-5">
              {rows.map((r, i) => (
                <div key={r.id} className="border border-line bg-ivory">
                  {/* Title bar — double-tap to arm delete */}
                  <div
                    onDoubleClick={() => setArmed(r.id)}
                    title="Double-tap to remove"
                    className="flex select-none items-center justify-between gap-3 border-b border-line bg-white px-3 py-2"
                  >
                    <span className="font-display text-lg text-ink">{r.name || "Untitled"}</span>
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() => move(r.id, -1)}
                        disabled={i === 0}
                        title="Move up"
                        className="px-1.5 text-ink-soft hover:text-wine disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(r.id, 1)}
                        disabled={i === rows.length - 1}
                        title="Move down"
                        className="px-1.5 text-ink-soft hover:text-wine disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setArmed(r.id)}
                        title="Remove"
                        className="px-1.5 text-ink-soft hover:text-wine"
                      >
                        ✕
                      </button>
                    </span>
                  </div>

                  {armed === r.id ? (
                    <div className="flex items-center justify-between gap-3 bg-wine/10 px-3 py-2 text-sm text-wine-deep">
                      <span>Remove “{r.name}”?</span>
                      <span className="flex gap-3">
                        <button onClick={() => removeRow(r.id)} className="font-medium underline">
                          Confirm
                        </button>
                        <button onClick={() => setArmed(null)} className="text-ink-soft underline">
                          Cancel
                        </button>
                      </span>
                    </div>
                  ) : null}

                  <div className="grid gap-3 p-3 sm:grid-cols-2">
                    <label>
                      <span className={lbl}>Name</span>
                      <input className={field} value={r.name} onChange={(e) => patch(r.id, "name", e.target.value)} />
                    </label>
                    <label>
                      <span className={lbl}>Price (USD)</span>
                      <input type="number" className={field} value={r.price} onChange={(e) => patch(r.id, "price", Number(e.target.value))} />
                    </label>
                    <label>
                      <span className={lbl}>Hours of coverage</span>
                      <input type="number" className={field} value={r.hours} onChange={(e) => patch(r.id, "hours", Number(e.target.value))} />
                    </label>
                    <label>
                      <span className={lbl}>Deposit (USD)</span>
                      <input type="number" className={field} value={r.depositDollars} onChange={(e) => patch(r.id, "depositDollars", Number(e.target.value))} />
                    </label>
                    <label className="sm:col-span-2">
                      <span className={lbl}>Tagline</span>
                      <input className={field} value={r.tagline} onChange={(e) => patch(r.id, "tagline", e.target.value)} />
                    </label>
                    <label className="sm:col-span-2">
                      <span className={lbl}>Teaser (home + listings)</span>
                      <input className={field} value={r.teaser} onChange={(e) => patch(r.id, "teaser", e.target.value)} />
                    </label>
                    <label className="sm:col-span-2">
                      <span className={lbl}>Included — one per line</span>
                      <textarea rows={4} className={`${field} resize-none`} value={r.includes} onChange={(e) => patch(r.id, "includes", e.target.value)} />
                    </label>
                    <label>
                      <span className={lbl}>Badge (e.g. Most Popular)</span>
                      <input className={field} value={r.badge} onChange={(e) => patch(r.id, "badge", e.target.value)} />
                    </label>
                    <div className="flex items-end gap-5 pb-1">
                      <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" checked={r.highlight} onChange={(e) => patch(r.id, "highlight", e.target.checked)} />
                        Most reserved
                      </label>
                      <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" checked={r.singleCraft} onChange={(e) => patch(r.id, "singleCraft", e.target.checked)} />
                        Photo OR film
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="mt-5 w-full border border-dashed border-ink/30 py-3 text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:border-wine hover:text-wine"
            >
              + Add collection
            </button>

            {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                onClick={save}
                disabled={busy || rows.length === 0}
                className="bg-ink px-6 py-2.5 text-[0.66rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-wine disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button onClick={cancel} className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft underline underline-offset-4 hover:text-wine">
                Cancel
              </button>
              {undo ? (
                <button onClick={restore} className="ml-auto text-[0.66rem] uppercase tracking-[0.18em] text-wine-deep underline underline-offset-4 hover:text-wine">
                  ↩ Undo remove “{undo.row.name}”
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
