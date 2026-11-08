"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeGallery } from "@/lib/home-galleries";

/**
 * "Some of our work": a sideways strip of real venue galleries (the same
 * portfolio-grouped cards as the homepage collage), one card per venue we
 * have photographed, each linking to its venue page. Swipe or scroll it;
 * the ← → buttons page it on desktop. Native scroll-snap, no library.
 */
const COPY = {
  en: {
    label: "Some of our work",
    prev: "Previous venues",
    next: "More venues",
    photos: (n: number) => `${n} photos`,
    all: "See all our work",
    allHref: "/portfolio",
  },
  es: {
    label: "Parte de nuestro trabajo",
    prev: "Salones anteriores",
    next: "Más salones",
    photos: (n: number) => `${n} fotos`,
    all: "Ver todo nuestro trabajo",
    allHref: "/portfolio",
  },
} as const;

const titleCase = (s: string) => (/[A-Z]/.test(s) ? s : s.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase()));

export function WorkSlider({ lang, galleries }: { lang: "en" | "es"; galleries: HomeGallery[] }) {
  const c = COPY[lang];
  const trackRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
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
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  if (!galleries.length) return null;

  return (
    <div className="ow-work" role="region" aria-roledescription="carousel" aria-label={c.label}>
      <div className="ow-work__head">
        <p className="ow-label">{c.label}</p>
        <div className="ow-work__nav">
          <button type="button" className="ow-work__btn" onClick={() => page(-1)} disabled={edge.start} aria-label={c.prev}>
            <Arrow dir="left" />
          </button>
          <button type="button" className="ow-work__btn" onClick={() => page(1)} disabled={edge.end} aria-label={c.next}>
            <Arrow dir="right" />
          </button>
        </div>
      </div>
      <ul ref={trackRef} className="ow-work__track" onScroll={update}>
        {galleries.map((g) => {
          const title = titleCase(g.title);
          return (
            <li key={g.key} className="ow-work__item">
              <Link href={g.href} className="ow-card">
                <span className="ow-card__media">
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
                <span className="ow-card__name">{title}</span>
                <span className="ow-card__meta">{[g.city, c.photos(g.count)].filter(Boolean).join(" · ")}</span>
              </Link>
            </li>
          );
        })}
        <li className="ow-work__item ow-work__item--end">
          <Link href={c.allHref} className="ow-card ow-card--all">
            <span>{c.all}</span>
            <Arrow dir="right" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {dir === "left" ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}
