"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePriceBook } from "@/components/PriceBookProvider";
import { useSite } from "@/components/txq/state";
import { tierNameL } from "@/components/txq/data";
import { coverageForBudget } from "@/lib/budget-options";
import { usd } from "@/lib/commission";
import { trackEvent } from "@/components/Tracker";
import "./budget-cta.css";

/**
 * The budget-page call to action: a black band with a live demo. A budget
 * types itself into the field, then the coverage it buys rises in below it,
 * computed from the live price book (the same function as the budget page).
 * The demo budgets are example inputs, not claims; every result is a real
 * package at a real price. Static under prefers-reduced-motion, paused off
 * screen.
 */
const DEMO_BUDGETS = [700, 1500, 2800];

const COPY = {
  en: {
    title: "Tell us your budget. We'll show you what it covers.",
    dek: "Type any number. See the coverage it buys in seconds, or make us an offer. Free, no sign-up.",
    cta: "Try it with your budget",
    field: "Your budget",
    covers: "covers",
    hours: (h: number) => `${h} hours`,
    film: "with film",
  },
  es: {
    title: "Dinos tu presupuesto. Te mostramos qué alcanza.",
    dek: "Escribe cualquier número. Mira en segundos qué cobertura alcanza, o haznos una oferta. Gratis, sin registro.",
    cta: "Pruébalo con tu presupuesto",
    field: "Tu presupuesto",
    covers: "alcanza para",
    hours: (h: number) => `${h} horas`,
    film: "con video",
  },
} as const;

export function BudgetCta({ placement = "home" }: { placement?: string }) {
  const { lang } = useSite();
  const { book } = usePriceBook();
  const c = COPY[lang];
  const href = lang === "es" ? "/es/presupuesto" : "/budget";

  const demos = useMemo(
    () =>
      DEMO_BUDGETS.map((b) => {
        const best = coverageForBudget(book, b, false).fits[0];
        return best ? { budget: b, name: tierNameL(book, best.tier)[lang], hours: best.hours, film: best.addOns.length > 0, total: best.totalUsd } : null;
      }).filter((d): d is NonNullable<typeof d> => Boolean(d)),
    [book, lang],
  );

  const [i, setI] = useState(0);
  const [typed, setTyped] = useState(0); // characters of the budget shown
  const [showResult, setShowResult] = useState(false);
  const [still, setStill] = useState(false);
  const [tick, setTick] = useState(0); // re-checks visibility while idle off screen
  const rootRef = useRef<HTMLElement>(null);
  const visible = useRef(false);

  const demo = demos[i % Math.max(demos.length, 1)];
  const text = demo ? usd(demo.budget) : "";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setStill(mq.matches);
    set();
    mq.addEventListener("change", set);
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    return () => {
      mq.removeEventListener("change", set);
      io.disconnect();
    };
  }, []);

  // Type → reveal → hold → next. One timer at a time; idles while off screen.
  useEffect(() => {
    if (!demo) return;
    if (still) return; // reduced motion: the first demo, shown complete (below)
    let id: number;
    if (!visible.current) id = window.setTimeout(() => setTick((n) => n + 1), 600);
    else if (typed < text.length) id = window.setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 500 : 110);
    else if (!showResult) id = window.setTimeout(() => setShowResult(true), 350);
    else
      id = window.setTimeout(() => {
        setShowResult(false);
        setTyped(0);
        setI((n) => n + 1);
      }, 2800);
    return () => window.clearTimeout(id);
  }, [demo, text, typed, showResult, still, tick]);

  if (!demo) return null;
  const shown = still ? text.length : typed;
  const result = still || showResult;

  return (
    <section ref={rootRef} className="bc" data-header-tone="dark" aria-labelledby={`bc-title-${placement}`}>
      <div className="bc-in">
        <div className="bc-copy">
          <h2 id={`bc-title-${placement}`} className="bc-title">
            {c.title}
          </h2>
          <p className="bc-dek">{c.dek}</p>
          <a href={href} className="bc-btn" onClick={() => trackEvent("budget_cta", placement)}>
            {c.cta} <span className="bc-arrow" aria-hidden>→</span>
          </a>
        </div>

        {/* The demo is decoration for sighted visitors; the copy above says the same thing. */}
        <div className="bc-demo" aria-hidden>
          <div className="bc-field">
            <span className="bc-field__label">{c.field}</span>
            <span className="bc-field__value">
              {text.slice(0, shown)}
              <i className="bc-caret" data-on={!result || undefined} />
            </span>
          </div>
          <div className="bc-result" data-show={result || undefined} key={i}>
            <span className="bc-result__covers">{c.covers}</span>
            <span className="bc-result__name">{demo.name}</span>
            <span className="bc-result__meta">
              {c.hours(demo.hours)}
              {demo.film ? ` · ${c.film}` : ""} · {usd(demo.total)}
            </span>
          </div>
          <div className="bc-dots">
            {demos.map((d, n) => (
              <i key={d.budget} data-on={n === i % demos.length || undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
