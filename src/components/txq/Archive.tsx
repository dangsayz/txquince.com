"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { WORKS, pick, type Category, type Work } from "./data";
import { useSite } from "./state";

const EASE = [0.22, 1, 0.36, 1] as const;
const FILTERS: ("all" | Category)[] = ["all", "couture", "ceremony", "fiesta", "editorial"];

const pad = (n: number) => String(n).padStart(2, "0");

export function Archive() {
  const { t, lang } = useSite();
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [viewing, setViewing] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const works = useMemo(
    () => (filter === "all" ? WORKS : WORKS.filter((w) => w.category === filter)),
    [filter],
  );
  // Index numbers are stable to the archive, not the filtered view.
  const number = (w: Work) => pad(WORKS.indexOf(w) + 1);

  const open = (i: number, el: HTMLElement) => {
    opener.current = el;
    setViewing(i);
  };
  const close = useCallback(() => {
    setViewing(null);
    opener.current?.focus();
  }, []);

  return (
    <section id="archive" className="tq-section" aria-labelledby="tq-archive-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.archive.index}]
          </p>
          <h2 id="tq-archive-title" className="tq-display tq-head__title">
            {t.archive.title}
          </h2>
          <p className="tq-head__dek">{t.archive.dek}</p>
        </header>

        <div className="tq-toolbar">
          <div className="tq-filters" role="group" aria-label={t.archive.filterLabel}>
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className="tq-pill"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {t.archive.filters[f]}
              </button>
            ))}
          </div>
          <span className="tq-toolbar__count tq-mono" aria-live="polite">
            {t.archive.count(works.length)}
          </span>
          <div className="tq-seg" role="group" aria-label={t.archive.viewLabel}>
            <button
              type="button"
              aria-pressed={view === "grid"}
              aria-label={t.archive.views.grid}
              onClick={() => setView("grid")}
            >
              <GridIcon />
              <span className="tq-seg__label tq-mono">{t.archive.views.grid}</span>
            </button>
            <button
              type="button"
              aria-pressed={view === "list"}
              aria-label={t.archive.views.list}
              onClick={() => setView("list")}
            >
              <ListIcon />
              <span className="tq-seg__label tq-mono">{t.archive.views.list}</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {view === "grid" ? (
            <motion.div
              key={`grid-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <ul className="tq-egrid" style={{ listStyle: "none", margin: 0 }}>
                {works.map((w, i) => (
                  <li key={w.id} className="tq-card">
                    <button
                      type="button"
                      className="tq-card__btn"
                      onClick={(e) => open(i, e.currentTarget)}
                      aria-label={`${t.archive.open}: ${w.subject}, ${pick(lang, w.place)}`}
                    >
                      <motion.div
                        className="tq-card__media"
                        initial={{ clipPath: "inset(18% 0 0 0)", opacity: 0 }}
                        whileInView={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
                        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                        transition={{ duration: 1.1, ease: EASE }}
                      >
                        <Image
                          src={w.src}
                          alt={pick(lang, w.alt)}
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          style={{ objectPosition: w.focus }}
                        />
                      </motion.div>
                      <span className="tq-cap tq-mono">
                        <span>[{number(w)}]</span>
                        <span className="tq-cap__mid">
                          {w.subject} — {pick(lang, w.place)}
                        </span>
                        <span className="tq-cap__end">{pick(lang, w.medium)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key={`list-${filter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <IndexList works={works} number={number} onOpen={open} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {viewing !== null && works[viewing] && (
          <Viewer
            works={works}
            index={viewing}
            number={number}
            onIndex={setViewing}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function IndexList({
  works,
  number,
  onOpen,
}: {
  works: Work[];
  number: (w: Work) => string;
  onOpen: (i: number, el: HTMLElement) => void;
}) {
  const { t, lang } = useSite();
  const [hover, setHover] = useState<Work | null>(null);
  const [finePointer, setFinePointer] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    // Scrolling moves rows out from under a still cursor; drop the preview.
    const clear = () => setHover(null);
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("scroll", clear);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const w = Math.min(window.innerWidth * 0.22, 300);
    const h = w * 1.25;
    // Sit beside the cursor, flipping to the left near the right edge.
    const nx = e.clientX + 32 + w > window.innerWidth ? e.clientX - 32 - w : e.clientX + 32;
    x.set(nx);
    y.set(Math.min(Math.max(e.clientY - h / 2, 72), window.innerHeight - h - 16));
  };

  return (
    <div className="tq-list" onPointerMove={finePointer ? onMove : undefined} onPointerLeave={() => setHover(null)}>
      <div className="tq-list__head tq-mono" aria-hidden>
        <span>{t.archive.cols.n}</span>
        <span>{t.archive.cols.subject}</span>
        <span>{t.archive.cols.place}</span>
        <span>{t.archive.cols.medium}</span>
        <span style={{ textAlign: "right" }}>{t.archive.cols.year}</span>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {works.map((w, i) => (
          <li key={w.id}>
            <motion.button
              type="button"
              className="tq-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
              onPointerEnter={() => setHover(w)}
              onFocus={() => setHover(null)}
              onClick={(e) => onOpen(i, e.currentTarget)}
              aria-label={`${t.archive.open}: ${number(w)}, ${w.subject}, ${pick(lang, w.place)}, ${pick(lang, w.medium)}, ${w.year}`}
            >
              <span className="tq-mono">{number(w)} —</span>
              <span>
                <span className="tq-row__subject">{w.subject}</span>
                <span className="tq-row__sub tq-mono">
                  {pick(lang, w.place)} · {w.year}
                </span>
              </span>
              <span className="tq-row__place">{pick(lang, w.place)}</span>
              <span className="tq-row__medium tq-mono tq-muted">{pick(lang, w.medium)}</span>
              <span className="tq-row__year tq-mono">{w.year}</span>
              <span className="tq-row__thumb" aria-hidden>
                <Image src={w.src} alt="" fill unoptimized sizes="64px" style={{ objectPosition: w.focus }} />
              </span>
            </motion.button>
          </li>
        ))}
      </ul>

      {finePointer && (
        <motion.div className="tq-float" style={{ x: sx, y: sy }} aria-hidden>
          <AnimatePresence>
            {hover && (
              <motion.div
                key={hover.id}
                style={{ position: "absolute", inset: 0 }}
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Image src={hover.src} alt="" fill unoptimized sizes="300px" style={{ objectPosition: hover.focus }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Viewer({
  works,
  index,
  number,
  onIndex,
  onClose,
}: {
  works: Work[];
  index: number;
  number: (w: Work) => string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { t, lang } = useSite();
  const closeRef = useRef<HTMLButtonElement>(null);
  const w = works[index];
  const go = useCallback(
    (d: number) => onIndex((index + d + works.length) % works.length),
    [index, works.length, onIndex],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <motion.div
      className="tq-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={t.archive.viewer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="tq-viewer__bar">
        <span className="tq-mono">
          [{number(w)} / {pad(works.length)}]
        </span>
        <button ref={closeRef} type="button" className="tq-icon-btn tq-mono" onClick={onClose}>
          {t.archive.close}
        </button>
      </div>
      <div className="tq-viewer__stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={w.id}
            style={{ position: "absolute", inset: 0 }}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Image src={w.src} alt={pick(lang, w.alt)} fill unoptimized sizes="100vw" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="tq-viewer__foot">
        <button type="button" className="tq-icon-btn" aria-label={t.archive.prev} onClick={() => go(-1)}>
          ←
        </button>
        <p className="tq-mono" style={{ margin: 0, textAlign: "center" }}>
          {w.subject} — {pick(lang, w.place)}
          <span className="tq-muted">
            {" "}
            · {pick(lang, w.medium)} · {w.year}
          </span>
        </p>
        <button type="button" className="tq-icon-btn" aria-label={t.archive.next} onClick={() => go(1)}>
          →
        </button>
      </div>
    </motion.div>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor">
      <rect x="1.5" y="1.5" width="6" height="8" />
      <rect x="9.5" y="1.5" width="5" height="5" />
      <rect x="9.5" y="8.5" width="5" height="6" />
      <rect x="1.5" y="11.5" width="6" height="3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor">
      <path d="M1 3.5h14M1 8h14M1 12.5h14" />
    </svg>
  );
}
