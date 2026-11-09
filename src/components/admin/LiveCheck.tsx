"use client";

import { useEffect, useState } from "react";
import { PUBLIC_TIER_IDS, usd, type PriceBook } from "@/lib/commission";
import { tierName } from "@/lib/price-text";

/**
 * After a save: load the main public pages and check each one shows the new
 * names and prices, not the old ones. Runs in the owner's browser, same
 * origin, no cache. A value that is on no page is simply not reported.
 */
const PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/es", label: "Home (Spanish)" },
  { path: "/budget", label: "Budget page" },
  { path: "/es/presupuesto", label: "Budget page (Spanish)" },
  { path: "/check-your-date", label: "Check your date form" },
  { path: "/quinceanera-photographer/dallas", label: "Dallas page" },
  { path: "/es/fotografo-de-quinceaneras/dallas", label: "Dallas page (Spanish)" },
  { path: "/quinceanera-guide", label: "Quinceañera guide" },
  { path: "/quinceanera-videographer", label: "Videographer page" },
];

type Fact = { label: string; before: string; after: string };

/** The names and prices that changed between two books (what to look for). */
export function changedFacts(before: PriceBook, after: PriceBook): Fact[] {
  const out: Fact[] = [];
  for (const id of PUBLIC_TIER_IDS) {
    for (const lang of ["en", "es"] as const) {
      const a = tierName(before, id, lang);
      const b = tierName(after, id, lang);
      if (a !== b) out.push({ label: `${b} name`, before: a, after: b });
    }
    const a = usd(before.packages[id].price);
    const b = usd(after.packages[id].price);
    if (a !== b) out.push({ label: `${tierName(after, id)} price`, before: a, after: b });
  }
  return out;
}

const decode = (html: string) =>
  html.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

type Result = { path: string; label: string; state: "ok" | "stale" | "error"; stale: string[] };

export function LiveCheck({ before, after }: { before: PriceBook; after: PriceBook }) {
  const [results, setResults] = useState<Result[] | null>(null);
  const facts = changedFacts(before, after);

  useEffect(() => {
    if (!facts.length) return;
    let alive = true;
    Promise.all(
      PAGES.map(async (p): Promise<Result> => {
        try {
          const res = await fetch(`${p.path}${p.path.includes("?") ? "&" : "?"}check=${Date.now()}`, { cache: "no-store" });
          if (!res.ok) return { ...p, state: "error", stale: [] };
          const html = decode(await res.text());
          // Stale = the old value is on the page and the new one is not.
          const stale = facts.filter((f) => html.includes(f.before) && !html.includes(f.after)).map((f) => `${f.label}: still ${f.before}`);
          return { ...p, state: stale.length ? "stale" : "ok", stale };
        } catch {
          return { ...p, state: "error", stale: [] };
        }
      }),
    ).then((r) => alive && setResults(r));
    return () => {
      alive = false;
    };
    // facts are derived from before/after, which identify the save
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [before, after]);

  if (!facts.length) return null;
  return (
    <div className="mt-3 rounded-xl border border-line bg-white p-4" aria-live="polite">
      <p className="text-[15px] font-medium text-ink">Where this shows</p>
      {!results ? (
        <p className="mt-1 text-sm text-ink-soft">Checking {PAGES.length} pages…</p>
      ) : (
        <ul className="mt-2 grid gap-1.5 text-[15px] sm:grid-cols-2">
          {results.map((r) => (
            <li key={r.path} className="flex min-w-0 items-start gap-2">
              <span aria-hidden="true" className={r.state === "ok" ? "text-green-800" : "text-red-800"}>
                {r.state === "ok" ? "✓" : "!"}
              </span>
              <span className="min-w-0">
                <a href={r.path} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--tq-surface-2)] underline-offset-4 hover:decoration-[var(--tq-ink)]">
                  {r.label}
                </a>
                <span className="text-ink-soft">
                  {r.state === "ok" ? " · up to date" : r.state === "error" ? " · couldn't load, open it to check" : ` · ${r.stale.join("; ")}`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
