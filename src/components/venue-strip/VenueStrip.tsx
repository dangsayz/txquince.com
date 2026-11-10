"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import type { HomeGallery } from "@/lib/home-galleries";
import { CONTACT_EVENT, whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/components/Tracker";
import { SocialIcon } from "@/components/SocialIcon";
import "./venue-strip.css";

/**
 * "From the dress session to the dance floor": a sideways strip of real venue galleries (the
 * portfolio grouped by venue, see home-locations.ts), each card linking to
 * that venue's gallery. Shown on /, /es and /about. Renders nothing when the
 * portfolio can't be read.
 *
 * - Find your venue: a search box and one chip per city narrow the cards.
 * - Each card carries its name, city and photo count on the photo.
 * - Swipe on a phone; drag with the mouse or use ← → on desktop.
 * - Cards rise in one after another the first time the strip is seen, and a
 *   hovered card fades through two more photos from its gallery (loaded only
 *   on that first hover). Neither runs under reduced motion.
 * - The last card is always "Don't see your venue?": a WhatsApp message.
 *
 * Refs (Mobbin): Assembly Coffee "Served At" strip, Mews "How to find us"
 * heading + arrows, Podia card carousel.
 */
const COPY = {
  en: {
    title: "From the dress session to the dance floor",
    lede: "The ballrooms, halls and outdoor spots across DFW where we’ve photographed real quinceañeras.",
    find: "Find your venue",
    all: "All",
    cities: "Filter by city",
    none: "No venue by that name yet.",
    prev: "Previous locations",
    next: "More locations",
    photos: (n: number) => `${n} photos`,
    seeAll: "See all locations",
    allHref: "/venues",
    askTitle: "Don’t see your venue?",
    askBody: "We photograph quinceañeras anywhere in Dallas–Fort Worth. Tell us where yours is.",
    ask: "Ask on WhatsApp",
  },
  es: {
    title: "De la sesión del vestido a la pista de baile",
    lede: "Los salones y lugares al aire libre en DFW donde hemos fotografiado quinceañeras reales.",
    find: "Busca tu salón",
    all: "Todos",
    cities: "Filtrar por ciudad",
    none: "Todavía no hay un salón con ese nombre.",
    prev: "Lugares anteriores",
    next: "Más lugares",
    photos: (n: number) => `${n} fotos`,
    seeAll: "Ver todos los lugares",
    allHref: "/es/salones",
    askTitle: "¿No ves tu salón?",
    askBody: "Fotografiamos quinceañeras en todo Dallas–Fort Worth. Dinos dónde es la tuya.",
    ask: "Pregunta por WhatsApp",
  },
} as const;

const titleCase = (s: string) => (/[A-Z]/.test(s) ? s : s.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase()));
const pad = (n: number) => String(n).padStart(2, "0");
/** "Dallas Arborétum " → "dallas arboretum": search ignores case and accents. */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export function VenueStrip({ lang, galleries: all }: { lang: "en" | "es"; galleries: HomeGallery[] }) {
  const c = COPY[lang];
  // Registry venues and named places only (see lib/home-locations.ts). Bare
  // places the portfolio carries ("irving", "country") are never shown.
  const galleries = useMemo(() => all.filter((g) => /^(venue|place):/.test(g.key)), [all]);
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ first: 1, last: 1, start: true, end: false });
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [seen, setSeen] = useState(false);
  /** Cards whose preview photos have been asked for (first hover or focus). */
  const [warm, setWarm] = useState<ReadonlySet<string>>(new Set());

  // Cities with the most venues first; a chip row is only worth showing for two or more.
  const cities = useMemo(() => {
    const count = new Map<string, number>();
    for (const g of galleries) if (g.city) count.set(g.city, (count.get(g.city) ?? 0) + 1);
    return [...count].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).map(([name]) => name);
  }, [galleries]);

  const shown = useMemo(() => {
    const q = fold(query);
    return galleries.filter((g) => (!city || g.city === city) && (!q || fold(`${g.title} ${g.city ?? ""}`).includes(q)));
  }, [galleries, query, city]);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 1;
    const first = Math.round(el.scrollLeft / step) + 1;
    setPos({
      first,
      last: first + Math.max(0, Math.floor((el.clientWidth - step * 0.2) / step) - 1),
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

  // A new filter starts the row from its first card.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    update();
  }, [query, city, update]);

  // The cards rise in once, the first time the strip is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Page by whole cards (card + gap), so Next and Prev land on the same
  // snap points and no card is skipped.
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    const perView = Math.max(1, Math.floor((el.clientWidth - step * 0.2) / step));
    // From a partial position (the end stop), Prev rounds up so it mirrors Next.
    const at = dir < 0 ? Math.ceil(el.scrollLeft / step - 0.05) : Math.round(el.scrollLeft / step);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, (at + dir * perView) * step), behavior: reduce ? "auto" : "smooth" });
  };

  // Keyboard: bring a focused card fully into view.
  const reveal = (e: FocusEvent<HTMLElement>) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    e.currentTarget.closest("li")?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  // Mouse only: drag the row sideways. A drag longer than a few pixels is not a click.
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });
  const onPointerDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { on: true, x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.on) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      e.currentTarget.dataset.dragging = "";
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    e.currentTarget.scrollLeft = d.left - dx;
  };
  const endDrag = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    if (!d.moved) return;
    delete e.currentTarget.dataset.dragging;
    // Let the click that follows the release be swallowed, then forget the drag.
    setTimeout(() => (drag.current.moved = false), 0);
  };

  const warmUp = (key: string) => setWarm((w) => (w.has(key) ? w : new Set(w).add(key)));

  if (!galleries.length) return null;
  const n = shown.length + 1; // + the "ask us" card
  const last = pos.end ? n : Math.min(pos.last, n);
  const first = Math.min(pos.first, last);

  return (
    <section ref={rootRef} id="venues-strip" className="vs" aria-labelledby="vs-title" data-seen={seen || undefined}>
      <div className="vs-head">
        <div className="vs-intro">
          <h2 id="vs-title" className="vs-title">
            {c.title}
          </h2>
          <p className="vs-lede">{c.lede}</p>
        </div>
        <div className="vs-controls">
          <span className="vs-count" aria-hidden>
            {first === last ? pad(first) : `${pad(first)}–${pad(last)}`} / {pad(n)}
          </span>
          <button type="button" className="vs-btn" onClick={() => page(-1)} disabled={pos.start} aria-label={c.prev}>
            <Arrow dir="left" />
          </button>
          <button type="button" className="vs-btn" onClick={() => page(1)} disabled={pos.end} aria-label={c.next}>
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <div className="vs-find">
        <label className="vs-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden focusable="false">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="vs-sr">{c.find}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.find} autoComplete="off" enterKeyHint="search" />
        </label>
        {cities.length > 1 && (
          <ul className="vs-chips" aria-label={c.cities}>
            {[null, ...cities].map((name) => (
              <li key={name ?? "all"}>
                <button type="button" className="vs-chip" aria-pressed={city === name} onClick={() => setCity(name)}>
                  {name ?? c.all}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="vs-sr" role="status">
        {shown.length ? "" : c.none}
      </p>

      <ul
        ref={trackRef}
        className="vs-track"
        onScroll={update}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        aria-label={c.title}
      >
        {shown.map((g, i) => (
          <li key={g.key} className="vs-item" style={{ ["--i" as string]: Math.min(i, 5) }}>
            <Link
              href={g.href}
              className="vs-card"
              draggable={false}
              onFocus={(e) => {
                reveal(e);
                warmUp(g.key);
              }}
              onPointerEnter={(e) => e.pointerType === "mouse" && warmUp(g.key)}
            >
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
                  draggable={false}
                />
                {warm.has(g.key) &&
                  g.previews?.map((p, k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.src} className="vs-peek" data-k={k} src={p.src} alt="" style={{ objectPosition: p.focus }} decoding="async" draggable={false} />
                  ))}
              </span>
              <span className="vs-label">
                <span className="vs-name">{titleCase(g.title)}</span>
                <span className="vs-meta">{[g.city, c.photos(g.count)].filter(Boolean).join(" · ")}</span>
              </span>
            </Link>
          </li>
        ))}
        <li className="vs-item" style={{ ["--i" as string]: Math.min(shown.length, 5) }}>
          <div className="vs-ask">
            <p className="vs-ask__title">{shown.length ? c.askTitle : c.none}</p>
            <p className="vs-ask__body">{c.askBody}</p>
            <a
              href={whatsappHref(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="vs-ask__btn"
              draggable={false}
              onClick={() => trackEvent(CONTACT_EVENT.whatsapp, "venue-strip")}
            >
              <SocialIcon name="whatsapp" /> {c.ask}
            </a>
          </div>
        </li>
      </ul>

      <div className="vs-foot">
        <Link href={c.allHref} className="vs-all">
          {c.seeAll}
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
