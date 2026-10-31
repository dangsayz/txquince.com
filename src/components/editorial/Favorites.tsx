"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSite } from "@/components/txq/state";
import { trackEvent } from "@/components/Tracker";
import type { GroupId } from "@/content/portfolio-taxonomy";
import {
  FAVORITES_MAX,
  FAVORITES_STEP,
  LIGHTBOX_WIDTH,
  favoriteGroups,
  gridSrcSet,
  sizedSrc,
  type Favorite,
} from "@/lib/favorites";
import "./favorites.css";

/**
 * Favorites — the homepage contact sheet (after MOUTHWASH Studio's index).
 *
 * Every photo sits in an identical 4:5 cell and is shown WHOLE (contain,
 * never cropped), so portraits and landscapes keep their true shape while
 * every row still lines up. 24 to start, "View more" adds 24 at a time up to
 * 100, then the button becomes a link to every gallery: no endless scroll.
 * Tapping a photo opens it full-screen (swipe, arrows, Esc).
 *
 * Theft deterrent (the real protection is upstream: /api/img serves capped,
 * hotlink-checked derivatives, never the original): grid images top out at
 * 828px, the lightbox at 1440px, right-click/drag/long-press save is off, and
 * the lightbox carries a small credit.
 */

const COPY = {
  en: {
    label: "Our favorites",
    title: "Real quinceañeras, the frames we love most.",
    all: "All",
    more: "View more",
    everything: "See every gallery",
    showing: (n: number, total: number) => `${n} of ${total} photos`,
    open: (alt: string) => `Open photo: ${alt}`,
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    filters: "Filter photos",
    groups: { before: "Before the day", misa: "La misa", portraits: "Portraits", celebration: "Celebration", details: "Details", vendors: "Décor", films: "Films" },
  },
  es: {
    label: "Nuestras favoritas",
    title: "Quinceañeras reales, las fotos que más amamos.",
    all: "Todas",
    more: "Ver más",
    everything: "Ver todas las galerías",
    showing: (n: number, total: number) => `${n} de ${total} fotos`,
    open: (alt: string) => `Abrir foto: ${alt}`,
    close: "Cerrar",
    prev: "Foto anterior",
    next: "Foto siguiente",
    filters: "Filtrar fotos",
    groups: { before: "Antes del día", misa: "La misa", portraits: "Retratos", celebration: "Celebración", details: "Detalles", vendors: "Decoración", films: "Videos" },
  },
} as const;

const GRID_SIZES = "(min-width: 1280px) 20vw, (min-width: 960px) 25vw, (min-width: 640px) 33vw, 50vw";
const noSave = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
} as const;

export function Favorites({ favorites }: { favorites: Favorite[] }) {
  const { lang } = useSite();
  const t = COPY[lang];
  const all = useMemo(() => favorites.slice(0, FAVORITES_MAX), [favorites]);
  const groups = useMemo(() => favoriteGroups(all), [all]);
  const [group, setGroup] = useState<GroupId | null>(null);
  const [shown, setShown] = useState(FAVORITES_STEP);
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => (group ? all.filter((f) => f.group === group) : all), [all, group]);
  const visible = list.slice(0, shown);
  const more = shown < list.length;

  if (!all.length) return null;

  return (
    <section className="fv" aria-labelledby="fv-title">
      <div className="ed-wrap">
        <header className="fv-head">
          <p className="ed-label">{t.label}</p>
          <h2 id="fv-title" className="fv-title">{t.title}</h2>
          {groups.length > 1 ? (
            <div className="fv-filters" role="group" aria-label={t.filters}>
              {[null, ...groups].map((g) => (
                <button
                  key={g ?? "all"}
                  type="button"
                  className="fv-filter"
                  aria-pressed={group === g}
                  onClick={() => {
                    setGroup(g);
                    setShown(FAVORITES_STEP);
                  }}
                >
                  {g ? t.groups[g] : t.all}
                </button>
              ))}
            </div>
          ) : null}
        </header>

        <ul className="fv-grid">
          {visible.map((f, i) => {
            const img = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sizedSrc(f.src, 640)}
                srcSet={gridSrcSet(f)}
                sizes={GRID_SIZES}
                width={f.width}
                height={f.height}
                alt={f.alt}
                loading="lazy"
                decoding="async"
                {...noSave}
              />
            );
            const onOpen = (e: React.MouseEvent) => {
              e.preventDefault();
              setOpen(i);
              trackEvent("favorite_opened", f.id);
            };
            return (
              <li key={f.id} className="fv-cell">
                {f.href ? (
                  <a href={f.href} className="fv-hit" aria-label={t.open(f.alt)} onClick={onOpen}>
                    {img}
                  </a>
                ) : (
                  <button type="button" className="fv-hit" aria-label={t.open(f.alt)} onClick={onOpen}>
                    {img}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="fv-foot">
          <p className="fv-count" aria-live="polite">{t.showing(visible.length, list.length)}</p>
          {more ? (
            <button type="button" className="fv-more" onClick={() => setShown((n) => n + FAVORITES_STEP)}>
              {t.more}
            </button>
          ) : (
            <Link href="/portfolio" className="fv-more">
              {t.everything} <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>

      {open !== null ? (
        <Lightbox
          items={visible}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          labels={{ close: t.close, prev: t.prev, next: t.next }}
        />
      ) : null}
    </section>
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
  labels,
}: {
  items: Favorite[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  labels: { close: string; prev: string; next: string };
}) {
  const f = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Warm the next photo so swiping feels instant.
  useEffect(() => {
    const next = items[(index + 1) % items.length];
    if (next) new Image().src = sizedSrc(next.src, LIGHTBOX_WIDTH);
  }, [index, items]);

  return (
    <div
      className="fv-lb"
      role="dialog"
      aria-modal="true"
      aria-label={f.alt}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      <figure className="fv-lb__fig">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={f.id} src={sizedSrc(f.src, LIGHTBOX_WIDTH)} width={f.width} height={f.height} alt={f.alt} {...noSave} />
        <span className="fv-lb__mark" aria-hidden>© TX Quince</span>
      </figure>
      <p className="fv-lb__count" aria-live="polite">
        {index + 1} / {items.length}
      </p>
      <button ref={closeRef} type="button" className="fv-lb__btn fv-lb__close" aria-label={labels.close} onClick={onClose}>
        ×
      </button>
      {items.length > 1 ? (
        <>
          <button type="button" className="fv-lb__btn fv-lb__prev" aria-label={labels.prev} onClick={() => go(-1)}>
            ‹
          </button>
          <button type="button" className="fv-lb__btn fv-lb__next" aria-label={labels.next} onClick={() => go(1)}>
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
