"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeGallery } from "@/lib/home-galleries";
import "./venue-strip.css";

/**
 * "Venues we've worked at": a sideways strip of real venue galleries (the
 * portfolio grouped by venue, see home-galleries.ts), each card linking to
 * that venue's gallery. Swipe on a phone; ← → page it on desktop, with a
 * "01 / 12" position counter. Native scroll-snap, no library. Shown on /,
 * /es and /about. Renders nothing when the portfolio can't be read.
 *
 * Refs (Mobbin): Assembly Coffee "Served At" strip, Mews "How to find us"
 * heading + arrows, Podia card carousel.
 */
const COPY = {
  en: {
    title: "Venues we’ve worked at",
    lede: "Real quinceañeras we photographed, by venue. Open one to see the gallery.",
    prev: "Previous venues",
    next: "More venues",
    photos: (n: number) => `${n} photos`,
    all: "See all venues",
    allHref: "/venues",
  },
  es: {
    title: "Salones donde hemos trabajado",
    lede: "Quinceañeras reales que fotografiamos, por salón. Abre uno para ver la galería.",
    prev: "Salones anteriores",
    next: "Más salones",
    photos: (n: number) => `${n} fotos`,
    all: "Ver todos los salones",
    allHref: "/es/salones",
  },
} as const;

const titleCase = (s: string) => (/[A-Z]/.test(s) ? s : s.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase()));
const pad = (n: number) => String(n).padStart(2, "0");

export function VenueStrip({ lang, galleries }: { lang: "en" | "es"; galleries: HomeGallery[] }) {
  const c = COPY[lang];
  const trackRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ index: 0, start: true, end: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 1;
    setPos({
      index: Math.round(el.scrollLeft / step),
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  };

  if (!galleries.length) return null;
  const shown = pos.end ? galleries.length : Math.min(pos.index + 1, galleries.length);

  return (
    <section id="venues-strip" className="vs" aria-labelledby="vs-title">
      <div className="vs-head">
        <div className="vs-intro">
          <h2 id="vs-title" className="vs-title">
            {c.title}
          </h2>
          <p className="vs-lede">{c.lede}</p>
        </div>
        <div className="vs-controls">
          <span className="vs-count" aria-hidden>
            {pad(shown)} / {pad(galleries.length)}
          </span>
          <button type="button" className="vs-btn" onClick={() => page(-1)} disabled={pos.start} aria-label={c.prev}>
            <Arrow dir="left" />
          </button>
          <button type="button" className="vs-btn" onClick={() => page(1)} disabled={pos.end} aria-label={c.next}>
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <ul ref={trackRef} className="vs-track" onScroll={update}>
        {galleries.map((g) => (
          <li key={g.key} className="vs-item">
            <Link href={g.href} className="vs-card">
              <span className="vs-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.cover.src}
                  alt={g.cover.alt}
                  width={g.cover.width ?? 800}
                  height={g.cover.height ?? 1000}
                  style={{ objectPosition: g.cover.focus }}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="vs-name">{titleCase(g.title)}</span>
              <span className="vs-meta">{[g.city, c.photos(g.count)].filter(Boolean).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="vs-foot">
        <Link href={c.allHref} className="vs-all">
          {c.all}
          <Arrow dir="right" />
        </Link>
      </div>
    </section>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {dir === "left" ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}
