"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/txq/state";
import { usePriceBook } from "@/components/PriceBookProvider";
import { bookingSteps } from "@/content/commissions";
import { fillDeep } from "@/lib/price-text";
import { ED } from "./copy";
import { DETAILS } from "./media";
import "./story.css";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const pad2 = (n: number) => String(n).padStart(2, "0");
/** Slow start, slow stop: a wipe that holds on each photo, then moves. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Calls `onProgress` with 0–1 as `el` crosses the viewport: 0 when its top
 * reaches `startAt` (a fraction of the viewport height), 1 when its bottom
 * reaches `endAt`. One passive scroll listener, one frame per scroll.
 * Returns false (and does nothing) for visitors who ask for reduced motion.
 */
function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  onProgress: (p: number, el: HTMLElement) => void,
  { startAt = 0, endAt = 1 }: { startAt?: number; endAt?: number } = {},
) {
  const [live, setLive] = useState(false);
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLive(true);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = r.height - vh * (endAt - startAt);
      cb.current(span > 0 ? clamp01((vh * startAt - r.top) / span) : 0, el);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    // The layout changes when `live` flips the section into its pinned form.
    raf = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, startAt, endAt]);
  return live;
}

/** The day in order: portraits before the day, then the day itself. */
const ORDER = ["portraits", "ready", "portrait", "roots", "folklorico", "gifts"];
const MOMENTS = ORDER.map((id) => DETAILS.find((d) => d.id === id)).filter((d): d is (typeof DETAILS)[number] => !!d);

/**
 * "Fifteen, forever." told by scrolling: the studio's promise in short lines,
 * then her day one moment at a time. While the section is pinned, each photo
 * wipes up over the last and its caption takes the place of the one before;
 * a hairline counts the day down.
 *
 * Without JavaScript, and for visitors who ask for reduced motion, the same
 * six moments are a plain two-column grid: nothing is hidden and nothing pins.
 */
export function Story() {
  const { t, lang } = useSite();
  const s = ED[lang].statement;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const n = MOMENTS.length;

  const live = useScrollProgress(trackRef, (p, el) => {
    const f = p * (n - 1);
    el.style.setProperty("--p", p.toFixed(4));
    el.querySelectorAll<HTMLElement>("[data-shot]").forEach((shot, i) => {
      // Photo i is covered until the scroll reaches it, then wipes in over
      // the back half of its step (so every photo also gets time to be seen).
      const r = i === 0 ? 1 : ease(clamp01((f - (i - 1) - 0.35) / 0.65));
      shot.style.setProperty("--r", r.toFixed(4));
    });
    setActive(Math.min(n - 1, Math.max(0, Math.round(f + 0.18))));
  });

  // The studio's promise, one sentence per line (they brighten as she scrolls).
  const lines = t.editorial.manifesto.split(/(?<=[.!?])\s+/);

  return (
    <section id="editorial" className="ed-story" aria-labelledby="ed-statement-title">
      <div className="ed-wrap ed-story__intro">
        <h2 id="ed-statement-title" className="ed-display ed-display--lg">
          {s.title}
        </h2>
        <p className="ed-story__lede" data-ed="lines">
          {lines.map((line) => (
            <span key={line} data-line>
              {line}{" "}
            </span>
          ))}
        </p>
      </div>

      <div ref={trackRef} className="ed-story__track" data-live={live || undefined} style={{ ["--n" as string]: n }}>
        <div className="ed-story__stage">
          <div className="ed-wrap ed-story__grid">
            <div className="ed-story__meta" aria-hidden>
              <p className="ed-story__count">
                <span className="ed-story__num" key={active}>
                  {pad2(active + 1)}
                </span>
                <span className="ed-story__of">/ {pad2(n)}</span>
              </p>
              <span className="ed-story__rail">
                <span className="ed-story__fill" />
              </span>
            </div>
            <ol className="ed-story__list">
              {MOMENTS.map((m, i) => {
                const [head, ...rest] = m.lines[lang];
                return (
                  <li key={m.id} className="ed-moment" data-active={i === active || undefined}>
                    <figure className="ed-moment__shot" data-shot style={{ ["--i" as string]: i }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.still.src}
                        width={m.still.width}
                        height={m.still.height}
                        alt={m.still.alt[lang]}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                    <div className="ed-moment__words">
                      <h3 className="ed-moment__head">{head}</h3>
                      <p className="ed-moment__body">{rest.join(" ")}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * "How booking works": the four steps (content/commissions.ts, the same words
 * as every other page) on a rail that fills as she reads down it.
 */
export function Steps() {
  const { lang } = useSite();
  const { book } = usePriceBook();
  const ref = useRef<HTMLDivElement>(null);
  const steps = fillDeep(bookingSteps[lang], book);
  const [done, setDone] = useState(0);
  const live = useScrollProgress(
    ref,
    (p) => {
      setDone(Math.min(steps.length, Math.floor(p * steps.length + 0.5)));
    },
    { startAt: 0.72, endAt: 0.62 },
  );
  return (
    <div ref={ref} className="ed-steps" role="group" aria-labelledby="ed-steps-title">
      <h3 id="ed-steps-title" className="ed-display ed-display--sm">
        {ED[lang].steps.title}
      </h3>
      <ol className="ed-steps__list">
        {steps.map((step, i) => (
          <li key={step.title} className="ed-step" data-done={!live || i < done || undefined}>
            <span className="ed-step__n" aria-hidden>
              {pad2(i + 1)}
            </span>
            <div className="ed-step__words">
              <h4 className="ed-step__title">{step.title}</h4>
              <p className="ed-step__body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
