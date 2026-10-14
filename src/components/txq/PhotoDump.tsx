"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  pickL,
  srcSetFor,
  srcFor,
  TAG_LABELS,
  type DumpTag,
  type FeedPage,
  type FeedPhoto,
  type L,
  type Lang,
} from "@/lib/photo-dump-shared";
import { useSite } from "./state";
import "./pages/photos.css";

const pad = (n: number) => String(n).padStart(2, "0");

const T = {
  en: {
    index: "Latest",
    title: "Latest photos",
    dek: "Fresh from recent quinces. New photos are added every week.",
    all: "All",
    filter: "Show photos of",
    more: "View more",
    loading: "Loading…",
    seeAll: "See all photos",
    open: "Open photo",
    viewer: "Photo viewer",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    photo: "Photo",
    star: "Favorite",
  },
  es: {
    index: "Recientes",
    title: "Fotos recientes",
    dek: "Recién salidas de quinces recientes. Agregamos fotos nuevas cada semana.",
    all: "Todas",
    filter: "Ver fotos de",
    more: "Ver más",
    loading: "Cargando…",
    seeAll: "Ver todas las fotos",
    open: "Abrir foto",
    viewer: "Visor de fotos",
    close: "Cerrar",
    prev: "Foto anterior",
    next: "Foto siguiente",
    photo: "Foto",
    star: "Favorita",
  },
} as const;

export function photoAlt(lang: Lang, p: { alt: L }, albumTitle: L | undefined, n: number): string {
  const own = pickL(lang, p.alt);
  if (own) return own;
  const album = pickL(lang, albumTitle);
  return lang === "es"
    ? `${album || "Quinceañera"} — foto ${n} por TX Quince`
    : `${album || "Quinceañera"} — photo ${n} by TX Quince`;
}

/* ------------------------------------------------------------------ */
/* Homepage section                                                    */
/* ------------------------------------------------------------------ */

/**
 * "Latest photos" — the newest Photo dump uploads (starred first), 12 at a
 * time. `initial` is the server-rendered first page; null means the server
 * couldn't reach storage (e.g. a cached build), so the browser asks once.
 * Hides itself entirely when there are no photos.
 */
export function PhotoDump({ initial }: { initial: FeedPage | null }) {
  const { lang } = useSite();
  const t = T[lang];
  const [page, setPage] = useState<FeedPage | null>(initial);
  const [photos, setPhotos] = useState<FeedPhoto[]>(initial?.photos ?? []);
  const [tag, setTag] = useState<DumpTag | null>(null);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const grid = useRef<HTMLUListElement>(null);

  const load = useCallback(async (cursor: number, nextTag: DumpTag | null) => {
    const q = new URLSearchParams({ cursor: String(cursor) });
    if (nextTag) q.set("tag", nextTag);
    const res = await fetch(`/api/photos?${q}`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as FeedPage;
  }, []);

  // Server had no data (cached build without storage): fetch once.
  useEffect(() => {
    if (initial) return;
    let alive = true;
    load(0, null)
      .then((p) => {
        if (!alive) return;
        setPage(p);
        setPhotos(p.photos);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [initial, load]);

  async function more() {
    if (!page || page.next === null || busy) return;
    setBusy(true);
    try {
      const p = await load(page.next, tag);
      const firstNew = photos.length;
      setPhotos((list) => [...list, ...p.photos.filter((x) => !list.some((y) => y.id === x.id))]);
      setPage(p);
      // Keyboard users land on the first new photo.
      requestAnimationFrame(() => {
        grid.current?.querySelectorAll<HTMLButtonElement>(".tq-card__btn")[firstNew]?.focus({ preventScroll: true });
      });
    } catch {
      /* the button stays, so they can tap again */
    } finally {
      setBusy(false);
    }
  }

  async function filter(next: DumpTag | null) {
    if (next === tag || busy) return;
    setBusy(true);
    try {
      const p = await load(0, next);
      setTag(next);
      setPage((prev) => ({ ...p, tags: prev?.tags ?? p.tags }));
      setPhotos(p.photos);
    } catch {
      /* keep the current view */
    } finally {
      setBusy(false);
    }
  }

  const close = useCallback(() => {
    setViewing(null);
    opener.current?.focus();
  }, []);

  if (!page || (!photos.length && !tag)) return null;

  const tags = page.tags;
  const allHref = lang === "es" ? "/es/fotos-recientes" : "/photos/latest";

  return (
    <section id="latest-photos" className="tq-section" aria-labelledby="tq-dump-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.index}]
          </p>
          <h2 id="tq-dump-title" className="tq-display tq-head__title">
            {t.title}
          </h2>
          <p className="tq-head__dek">{t.dek}</p>
        </header>

        {tags.length > 1 && (
          <div className="tq-dump-tags" role="group" aria-label={t.filter}>
            <button type="button" className="tq-pill" aria-pressed={tag === null} onClick={() => filter(null)}>
              {t.all}
            </button>
            {tags.map((x) => (
              <button key={x} type="button" className="tq-pill" aria-pressed={tag === x} onClick={() => filter(x)}>
                {TAG_LABELS[x][lang]}
              </button>
            ))}
          </div>
        )}

        <PhotoGrid
          ref={grid}
          photos={photos}
          lang={lang}
          openLabel={t.open}
          starLabel={t.star}
          onOpen={(i, el) => {
            opener.current = el;
            setViewing(i);
          }}
        />

        <div className="tq-dump-foot">
          {page.next !== null ? (
            <button type="button" className="tq-btn tq-btn--ghost tq-btn--lg" onClick={more} disabled={busy} aria-busy={busy}>
              {busy ? t.loading : t.more}
            </button>
          ) : (
            <span />
          )}
          <Link href={allHref} className="tq-dump-all">
            <span>{t.seeAll}</span>
            <span className="tq-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>

      {viewing !== null && photos[viewing] && (
        <PhotoViewer photos={photos} index={viewing} lang={lang} onIndex={setViewing} onClose={close} />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */

export function PhotoGrid({
  ref,
  photos,
  lang,
  openLabel,
  starLabel,
  showAlbum = true,
  onOpen,
}: {
  ref?: React.Ref<HTMLUListElement>;
  photos: FeedPhoto[];
  lang: Lang;
  openLabel: string;
  starLabel: string;
  showAlbum?: boolean;
  onOpen: (index: number, el: HTMLElement) => void;
}) {
  return (
    <ul ref={ref} className="tq-egrid tq-dump-grid" style={{ listStyle: "none", margin: 0 }}>
      {photos.map((p, i) => {
        const alt = photoAlt(lang, p, p.album.title, i + 1);
        const album = pickL(lang, p.album.title);
        return (
          <li key={p.id} className="tq-card">
            <button type="button" className="tq-card__btn" onClick={(e) => onOpen(i, e.currentTarget)} aria-label={`${openLabel}: ${alt}${p.featured ? ` (${starLabel})` : ""}`}>
              {/* The cell never grows past the photo's own width (no upscaling). */}
              <span className="tq-card__media" style={{ display: "block", maxWidth: p.w }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- R2 media route with our own srcset (next/image loader is reserved for /api/img) */}
                <img
                  className="tq-dump-img"
                  src={srcFor(p, 640)}
                  srcSet={srcSetFor(p)}
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 48vw"
                  width={p.w}
                  height={p.h}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                />
                {p.featured && (
                  <span className="tq-dump-star tq-mono" aria-hidden>
                    ★
                  </span>
                )}
              </span>
              <span className="tq-cap tq-mono">
                <span>[{pad(i + 1)}]</span>
                <span className="tq-cap__mid">{showAlbum ? album || "Quinceañera" : alt}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Full-screen viewer: prev/next, arrow keys, swipe                    */
/* ------------------------------------------------------------------ */

export function PhotoViewer({
  photos,
  index,
  lang,
  onIndex,
  onClose,
}: {
  photos: FeedPhoto[];
  index: number;
  lang: Lang;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const t = T[lang];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const p = photos[index];
  const go = useCallback((d: number) => onIndex((index + d + photos.length) % photos.length), [index, photos.length, onIndex]);

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

  // Warm the neighbours so swiping feels instant.
  useEffect(() => {
    for (const d of [1, -1]) {
      const n = photos[(index + d + photos.length) % photos.length];
      if (n && n.id !== p.id) {
        const img = new Image();
        img.sizes = "100vw";
        img.srcset = srcSetFor(n);
      }
    }
  }, [index, photos, p.id]);

  const alt = photoAlt(lang, p, p.album.title, index + 1);
  const album = pickL(lang, p.album.title);

  return (
    <div className="tq-viewer tq-dump-viewer" role="dialog" aria-modal="true" aria-label={t.viewer}>
      <div className="tq-viewer__bar">
        <span className="tq-mono">
          [{pad(index + 1)} / {pad(photos.length)}]
        </span>
        <button ref={closeRef} type="button" className="tq-icon-btn tq-mono" onClick={onClose}>
          {t.close}
        </button>
      </div>
      <div
        className="tq-viewer__stage"
        onTouchStart={(e) => {
          const f = e.touches[0];
          touch.current = e.touches.length === 1 ? { x: f.clientX, y: f.clientY } : null;
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const f = e.changedTouches[0];
          const dx = f.clientX - start.x;
          const dy = f.clientY - start.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- natural-size cap via CSS; R2 media route */}
        <img
          key={p.id}
          className="tq-dump-viewer__img"
          src={srcFor(p, 1440)}
          srcSet={srcSetFor(p)}
          sizes="100vw"
          width={p.w}
          height={p.h}
          style={{ maxWidth: `min(100%, ${p.w}px)`, maxHeight: `min(100%, ${p.h}px)` }}
          alt={alt}
          draggable={false}
        />
      </div>
      <div className="tq-viewer__foot">
        <button type="button" className="tq-icon-btn" aria-label={t.prev} onClick={() => go(-1)}>
          ←
        </button>
        <p className="tq-mono tq-dump-viewer__cap">{album || alt}</p>
        <button type="button" className="tq-icon-btn" aria-label={t.next} onClick={() => go(1)}>
          →
        </button>
      </div>
    </div>
  );
}
