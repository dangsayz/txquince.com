"use client";

import { useState } from "react";

export type HeroPageRow = {
  key: string;
  label: string;
  current: { slug: string; url: string; alt: string } | null;
};

export type HeroLibraryItem = {
  slug: string;
  url: string;
  alt: string;
  section: string;
  landscape: boolean;
};

/**
 * Per-page hero picker. Each marketing page (Blog, Investment, About, Areas
 * Served) leads with a full-bleed photo; here the operator picks exactly which
 * one — chosen from photos already in the portfolio library — or leaves it on
 * "Automatic" (the top featured frame). Stored via /api/admin/page-hero.
 */
export function PageHeroManager({
  pages,
  library,
}: {
  pages: HeroPageRow[];
  library: HeroLibraryItem[];
}) {
  const [rows, setRows] = useState<HeroPageRow[]>(pages);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setCurrent = (key: string, current: HeroPageRow["current"]) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, current } : row)));

  async function choose(key: string, item: HeroLibraryItem) {
    setBusyKey(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/page-hero", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ page: key, slug: item.slug }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Could not save.");
      setCurrent(key, { slug: item.slug, url: item.url, alt: item.alt });
      setOpenKey(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusyKey(null);
    }
  }

  async function reset(key: string) {
    setBusyKey(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/page-hero", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ page: key }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Could not reset.");
      }
      setCurrent(key, null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const open = openKey === row.key;
        const busy = busyKey === row.key;
        return (
          <div key={row.key} className="border border-line bg-ivory p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-greige">
                {row.current?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.current.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
                    Automatic
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-ink">{row.label}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {row.current ? "A photo you chose." : "Your top featured photo (default)."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : row.key)}
                  disabled={busy}
                  className="min-h-11 rounded-full border border-wine/40 px-5 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-wine transition-colors hover:bg-wine hover:text-cream disabled:opacity-50"
                >
                  {open ? "Close" : "Choose photo"}
                </button>
                {row.current ? (
                  <button
                    type="button"
                    onClick={() => reset(row.key)}
                    disabled={busy}
                    className="min-h-11 px-3 text-[0.66rem] uppercase tracking-[0.16em] text-ink-faint transition-colors hover:text-wine disabled:opacity-50"
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            {open ? (
              <div className="mt-5 border-t border-line pt-5">
                {library.length === 0 ? (
                  <p className="text-sm text-ink-faint">
                    No photos in your library yet — upload in Portfolio first.
                  </p>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-ink-faint">
                      Pick a frame. Landscape photos (marked ▭) crop cleanest for the wide hero.
                    </p>
                    <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
                      {library.map((item) => {
                        const selected = row.current?.slug === item.slug;
                        return (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => choose(row.key, item)}
                            disabled={busy}
                            title={item.alt}
                            className={`group relative aspect-[4/3] overflow-hidden rounded-md ring-2 transition disabled:opacity-50 ${
                              selected ? "ring-wine" : "ring-transparent hover:ring-wine/40"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
                            {item.landscape ? (
                              <span className="absolute left-1 top-1 rounded bg-ink/70 px-1 text-[0.55rem] text-cream">
                                ▭
                              </span>
                            ) : null}
                            {selected ? (
                              <span className="absolute inset-0 flex items-center justify-center bg-ink/35 text-[0.6rem] uppercase tracking-[0.16em] text-cream">
                                In use
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
      {error ? <p className="text-sm text-wine">{error}</p> : null}
    </div>
  );
}
