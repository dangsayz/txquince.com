"use client";

/**
 * HomePricing — the landing page's interactive collection picker.
 *
 * Not a flat list: tap a collection, a coverage meter slides from 5→8 hours,
 * the featured panel (price, inclusions, deposit) updates, and a single tap
 * reserves it — with a live "check your date" nudge right beside the CTA.
 * Reads entirely from packages.ts, so it tracks the source of truth.
 */

import { useState } from "react";
import Link from "next/link";
import { type Package } from "@/content/packages";

export function HomePricing({ collections }: { collections: Package[] }) {
  const hours = collections.map((c) => c.hours);
  const MIN_H = Math.min(...hours);
  const MAX_H = Math.max(...hours);
  const defaultId = (collections.find((c) => c.highlight) ?? collections[0])?.id ?? "";
  const [sel, setSel] = useState<string>(defaultId);
  const p = collections.find((x) => x.id === sel) ?? collections[0];
  const pct = MAX_H === MIN_H ? 100 : ((p.hours - MIN_H) / (MAX_H - MIN_H)) * 100;

  return (
    <div>
      {/* Selector — the four collections as a segmented control */}
      <div role="tablist" aria-label="Collections" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {collections.map((x) => {
          const active = x.id === sel;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSel(x.id)}
              className={`relative rounded-lg border px-4 py-3.5 text-left transition-all duration-300 ${
                active
                  ? "border-ink bg-ink text-cream shadow-lg shadow-ink/15"
                  : "border-line bg-ivory text-ink hover:-translate-y-0.5 hover:border-ink/40"
              }`}
            >
              {x.highlight ? (
                <span aria-hidden className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-wine" />
              ) : null}
              <span className="block font-display text-lg leading-none">{x.name}</span>
              <span className={`mt-1.5 block text-xs ${active ? "text-cream/70" : "text-ink-faint"}`}>
                {x.priceLabel} · {x.hours}h
              </span>
            </button>
          );
        })}
      </div>

      {/* Coverage meter — slides as you choose; communicates "more day filmed" */}
      <div className="mt-9">
        <div className="flex items-baseline justify-between text-[0.58rem] uppercase tracking-[0.24em] text-ink-faint">
          <span>{MIN_H} hrs</span>
          <span className="text-wine-deep">{p.hours} hours of coverage</span>
          <span>{MAX_H} hrs</span>
        </div>
        <div className="relative mt-2.5 h-1 rounded-full bg-line">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-wine transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${pct}%` }}
          />
          <div
            aria-hidden
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-wine bg-cream shadow-sm transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>

      {/* Featured panel — re-animates on change via the keyed fade */}
      <div key={sel} className="fade-only mt-8 rounded-lg border border-ink/15 bg-white p-7 md:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h3 className="font-display text-3xl leading-none text-ink">{p.name}</h3>
              {p.highlight ? (
                <span className="rounded-full bg-wine px-2.5 py-1 text-[0.52rem] uppercase tracking-[0.2em] text-cream">
                  Most reserved
                </span>
              ) : null}
            </div>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-ink-soft">{p.tagline}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-[2.6rem] leading-none text-ink">{p.priceLabel}</p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.18em] text-ink-faint">{p.hours} hours</p>
          </div>
        </div>

        <ul className="mt-6 grid gap-2.5 border-t border-ink/10 pt-6 sm:grid-cols-2">
          {p.includes.slice(0, 4).map((it) => (
            <li key={it} className="flex gap-2.5 text-sm leading-snug text-ink-soft">
              <span aria-hidden className="mt-0.5 text-wine">✦</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href={`/reserve?collection=${p.id}`} className="btn-espresso">
            Reserve {p.name} →
          </Link>
          <Link
            href="/check-your-date"
            className="group inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-ink underline decoration-ink/30 underline-offset-[6px] transition-colors hover:text-wine hover:decoration-wine"
          >
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
            Check if your date&apos;s open
          </Link>
        </div>
        <p className="mt-5 text-xs text-ink-faint">
          Reserve with a {p.depositLabel} deposit · interest-free installments · applies to your balance
        </p>
      </div>
    </div>
  );
}
