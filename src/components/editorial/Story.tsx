"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSite } from "@/components/txq/state";
import { usePriceBook } from "@/components/PriceBookProvider";
import { ED } from "./copy";
import "./story.css";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** True once the element has scrolled into view (and from the start under reduced motion or without IntersectionObserver). */
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only now may the CSS hold the drawing back: without the script it stays drawn.
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/** One line drawing per step: calendar, signature, lock, camera. Every stroke has pathLength 1 so CSS can draw it. */
const ICONS: ReactNode[] = [
  <>
    <rect x="8" y="12" width="48" height="42" rx="4" pathLength={1} />
    <path d="M8 24h48M20 6v12M44 6v12" pathLength={1} />
    <path d="M25 40l6 6 10-12" pathLength={1} />
  </>,
  <>
    <path d="M14 8h28l10 10v38H14z" pathLength={1} />
    <path d="M42 8v10h10" pathLength={1} />
    <path d="M21 44c4-9 7-9 8-2s4 6 6 0 4-5 5 0 3 3 6 1" pathLength={1} />
  </>,
  <>
    <rect x="12" y="28" width="40" height="28" rx="4" pathLength={1} />
    <path d="M20 28v-8a12 12 0 0 1 24 0v8" pathLength={1} />
    <path d="M32 38v8" pathLength={1} />
  </>,
  <>
    <path d="M8 20h12l4-7h16l4 7h12v34H8z" pathLength={1} />
    <circle cx="32" cy="36" r="10" pathLength={1} />
    <path d="M48 27h2" pathLength={1} />
  </>,
];

/**
 * "How booking works": four drawings that sketch themselves in, one after the
 * other, as the row scrolls into view; a title and one short line under each.
 * The full wording stays in the questions block and on the booking pages.
 */
export function Steps() {
  const { lang } = useSite();
  const { book } = usePriceBook();
  const s = ED[lang].steps;
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="ed-steps" role="group" aria-labelledby="ed-steps-title" data-seen={seen || undefined}>
      <h3 id="ed-steps-title" className="ed-display ed-display--sm">
        {s.title}
      </h3>
      <ol className="ed-steps__list">
        {s.items.map((step, i) => (
          <li key={step.title} className="ed-step" style={{ ["--i" as string]: i }}>
            <span className="ed-step__art" aria-hidden>
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[i]}
              </svg>
              <span className="ed-step__n">{pad2(i + 1)}</span>
            </span>
            <h4 className="ed-step__title">{step.title}</h4>
            <p className="ed-step__body">{step.line(book.depositPercent, book.balanceDueDays)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Three short promises with a drawn check; the six full terms open on tap. */
export function Promises() {
  const { lang } = useSite();
  const p = ED[lang].promises;
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className="ed-promises" role="group" aria-label={p.title} data-seen={seen || undefined}>
      <ul className="ed-promises__short">
        {p.short.map((line, i) => (
          <li key={line} style={{ ["--i" as string]: i }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" pathLength={1} />
              <path d="M7.5 12.5l3 3 6-7" pathLength={1} />
            </svg>
            {line}
          </li>
        ))}
      </ul>
      <details className="ed-promises__more">
        <summary>
          {p.more} <span className="ed-toggle" aria-hidden />
        </summary>
        <ul className="ed-promises__list">
          {p.items.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
