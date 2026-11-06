"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Lightbox, type LightboxItem } from "@/components/editorial/Favorites";
import { trackEvent } from "@/components/Tracker";
import { gridSrcSet, sizedSrc } from "@/lib/favorites";
import type { VenueEvent, VenueEventPhoto } from "@/lib/venue-events";
import "./venue-events.css";

/**
 * VenueEvents — every quinceañera we shot at one venue, as a short shelf.
 *
 * Built for the mom deciding "do I want my party here?" (and "who took
 * these?"): each event is one compact block — its look (theme), the moments
 * it covers, who photographed it, and a 5-photo mosaic. "See all N photos"
 * opens the full set inline, in the order of the day, without making the page
 * endless. With several events an index ledger sits on top (refs: Nite Riot's
 * project ledger, Wise's 1+4 mosaic; see the PR).
 *
 * Names never appear: titles are a number + theme, anchors are "xv-01".
 */

export type VenueEventsProps = {
  venue: string;
  /** Booking link that keeps the venue (check-your-date?venue=…). */
  askHref: string;
  /** Where a pin of a photo without its own page links (the venue page). */
  pageHref: string;
  events: VenueEvent<VenueEventPhoto>[];
  brand: string;
  lang?: "en" | "es";
};

const COPY = {
  en: {
    index: "Quinceañeras photographed here",
    no: "No.",
    look: "The look",
    moments: "Moments",
    shotBy: "Photographed by",
    photos: (n: number) => `${n} photo${n === 1 ? "" : "s"}`,
    title: (n: number) => `Quinceañera ${String(n).padStart(2, "0")}`,
    untitled: "The celebration",
    seeAll: (n: number) => `See all ${n} photos`,
    fewer: "Show fewer",
    open: (alt: string) => `Open photo: ${alt}`,
    vendors: "Also on this quince",
    want: (venue: string) => `Want this look at ${venue}?`,
    ask: "Check your date",
    more: (n: number) => `Show ${n} more quinceañera${n === 1 ? "" : "s"}`,
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
  },
  es: {
    index: "Quinceañeras fotografiadas aquí",
    no: "No.",
    look: "El estilo",
    moments: "Momentos",
    shotBy: "Fotografía de",
    photos: (n: number) => `${n} foto${n === 1 ? "" : "s"}`,
    title: (n: number) => `Quinceañera ${String(n).padStart(2, "0")}`,
    untitled: "La celebración",
    seeAll: (n: number) => `Ver las ${n} fotos`,
    fewer: "Ver menos",
    open: (alt: string) => `Abrir foto: ${alt}`,
    vendors: "También en esta fiesta",
    want: (venue: string) => `¿Quieres este estilo en ${venue}?`,
    ask: "Consulta tu fecha",
    more: (n: number) => `Ver ${n} quinceañera${n === 1 ? "" : "s"} más`,
    close: "Cerrar",
    prev: "Foto anterior",
    next: "Foto siguiente",
  },
} as const;

/** Events shown before "Show N more". Each block is short, so a few fit easily. */
const FIRST_EVENTS = 4;

const noSave = {
  draggable: false,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
} as const;

const focus = (p: VenueEventPhoto) => `${Math.round((p.focus_x ?? 0.5) * 100)}% ${Math.round((p.focus_y ?? 0.5) * 100)}%`;
function toLightbox(p: VenueEventPhoto, fallback: string): LightboxItem {
  const href = p.slug ? `/photos/${p.section}/${p.slug}` : fallback;
  return { id: p.id, src: p.url, width: p.width ?? 1600, height: p.height ?? 2400, alt: p.alt, href };
}

function Thumb({ p, sizes, onOpen, label, eager = false }: { p: VenueEventPhoto; sizes: string; onOpen: () => void; label: string; eager?: boolean }) {
  return (
    <button type="button" className="vx-thumb" onClick={onOpen} aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sizedSrc(p.url, 640)}
        srcSet={gridSrcSet({ src: p.url, width: p.width ?? 1600 })}
        sizes={sizes}
        width={p.width ?? undefined}
        height={p.height ?? undefined}
        alt={p.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ objectPosition: focus(p) }}
        {...noSave}
      />
    </button>
  );
}

export function VenueEvents({ venue, askHref, pageHref, events, brand, lang = "en" }: VenueEventsProps) {
  const t = COPY[lang];
  const [openSets, setOpenSets] = useState<Set<number>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  const [box, setBox] = useState<{ event: number; index: number } | null>(null);
  const heads = useRef<Map<number, HTMLElement>>(new Map());
  const visible = showAll ? events : events.slice(0, FIRST_EVENTS);
  const lightItems = useMemo(() => (box ? events[box.event].photos.map((p) => toLightbox(p, `${pageHref}#${events[box.event].anchor}`)) : []), [box, events, pageHref]);

  const toggle = (i: number) => {
    setOpenSets((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
        // Collapsing a long set: bring its header back into view.
        heads.current.get(i)?.scrollIntoView({ block: "start", behavior: "smooth" });
      } else {
        next.add(i);
        trackEvent("venue_event_opened", `${venue} #${i + 1}`);
      }
      return next;
    });
  };
  const openPhoto = (event: number, p: VenueEventPhoto) => {
    setBox({ event, index: events[event].photos.indexOf(p) });
    trackEvent("venue_photo_opened", `${venue} #${event + 1}`);
  };

  return (
    <div className="vx">
      {events.length > 1 ? (
        <nav className="vx-index" aria-label={t.index}>
          <p className="vx-index__label tq-mono">{t.index}</p>
          <ol className="vx-index__rows">
            {events.map((e) => (
              <li key={e.anchor}>
                <a href={`#${e.anchor}`} onClick={() => setShowAll(true)}>
                  <span className="tq-mono vx-index__no">{String(e.number).padStart(2, "0")}</span>
                  <span className="vx-index__look">{e.theme?.[lang] ?? t.untitled}</span>
                  <span className="tq-mono vx-index__by">{brand}</span>
                  <span className="tq-mono vx-index__count">{t.photos(e.photos.length)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {visible.map((e, i) => {
        const open = openSets.has(i);
        const rest = e.photos.length - e.preview.length;
        const setId = `${e.anchor}-all`;
        return (
          <article
            key={e.anchor}
            id={e.anchor}
            className="vx-event"
            aria-labelledby={`${e.anchor}-title`}
            ref={(el) => {
              if (el) heads.current.set(i, el);
              else heads.current.delete(i);
            }}
          >
            <header className="vx-event__meta">
              <p className="tq-mono vx-event__no">{t.title(e.number)}</p>
              <h3 id={`${e.anchor}-title`} className="tq-display vx-event__title">
                {e.theme?.[lang] ?? t.untitled}
              </h3>
              <dl className="vx-facts">
                {e.moments.length ? (
                  <div>
                    <dt className="tq-mono">{t.moments}</dt>
                    <dd>
                      <ul className="vx-chips">
                        {lang === "en" && e.highlights.length
                          ? e.highlights.map((h) => <li key={h.id}>{h.label}</li>)
                          : e.moments.map((m) => <li key={m.id}>{m.label[lang]}</li>)}
                      </ul>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="tq-mono">{t.shotBy}</dt>
                  <dd>
                    <Link href="/about">{brand}</Link> · {t.photos(e.photos.length)}
                  </dd>
                </div>
                {e.vendors.length ? (
                  <div>
                    <dt className="tq-mono">{t.vendors}</dt>
                    <dd>
                      {e.vendors.map((v, j) => (
                        <span key={v.slug}>
                          {j ? ", " : ""}
                          <Link href={`/vendors/${v.slug}`}>{v.name}</Link>
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {e.photos.length > e.preview.length ? (
                <button type="button" className="vx-toggle" aria-expanded={open} aria-controls={setId} onClick={() => toggle(i)}>
                  {open ? t.fewer : t.seeAll(e.photos.length)}
                </button>
              ) : null}
            </header>

            {/* Open: the full set below replaces the preview (no repeated photos). */}
            <div className={`vx-mosaic vx-mosaic--${Math.min(e.preview.length, 5)}`} hidden={open}>
              {e.preview.map((p, k) => (
                <Thumb
                  key={p.id}
                  p={p}
                  eager={i === 0 && k === 0}
                  sizes={k === 0 ? "(min-width: 960px) 30vw, 60vw" : "(min-width: 960px) 15vw, 30vw"}
                  label={t.open(p.alt)}
                  onOpen={() => openPhoto(i, p)}
                />
              ))}
              {rest > 0 && !open ? (
                <button type="button" className="vx-more tq-mono" onClick={() => toggle(i)} aria-label={t.seeAll(e.photos.length)}>
                  +{rest}
                </button>
              ) : null}
            </div>

            {open ? (
              <div id={setId} className="vx-all">
                {e.moments.map((m) => (
                  <section key={m.id} className="vx-all__moment" aria-label={m.label[lang]}>
                    <h4 className="tq-mono vx-all__label">
                      {m.label[lang]} <span className="vx-all__n">{m.count}</span>
                    </h4>
                    <ul className="vx-all__grid">
                      {e.photos
                        .filter((p) => e.momentOf[p.id] === m.id)
                        .map((p) => (
                          <li key={p.id}>
                            <Thumb p={p} sizes="(min-width: 960px) 18vw, 33vw" label={t.open(p.alt)} onOpen={() => openPhoto(i, p)} />
                          </li>
                        ))}
                    </ul>
                  </section>
                ))}
                <div className="vx-all__foot">
                  <Link href={askHref} className="vx-ask">
                    {t.want(venue)} <span>{t.ask} →</span>
                  </Link>
                  <button type="button" className="vx-toggle" aria-expanded={open} aria-controls={setId} onClick={() => toggle(i)}>
                    {t.fewer}
                  </button>
                </div>
              </div>
            ) : null}

            {i === 0 && !open ? (
              <Link href={askHref} className="vx-ask vx-ask--inline">
                {t.want(venue)} <span>{t.ask} →</span>
              </Link>
            ) : null}
          </article>
        );
      })}

      {!showAll && events.length > FIRST_EVENTS ? (
        <button type="button" className="vx-toggle vx-showall" onClick={() => setShowAll(true)}>
          {t.more(events.length - FIRST_EVENTS)}
        </button>
      ) : null}

      {box ? (
        <Lightbox
          items={lightItems}
          index={box.index}
          onIndex={(index) => setBox((b) => (b ? { ...b, index } : b))}
          onClose={() => setBox(null)}
          lang={lang}
          labels={{ close: t.close, prev: t.prev, next: t.next }}
        />
      ) : null}
    </div>
  );
}
