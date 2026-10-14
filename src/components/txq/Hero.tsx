"use client";

import Image from "next/image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { HERO_SLIDES, pick, workById, type Lang } from "./data";
import { useShell } from "./SiteShell";
import { useSite } from "./state";

/**
 * Homepage hero — a full-bleed slideshow of featured work. One accent color per
 * slide (see HERO_SLIDES) drives every colored thing on screen; the image is a
 * darkened, softly tinted mood behind a large title in the site face.
 */

const SLIDES = HERO_SLIDES.map((s) => ({ ...s, art: workById(s.work) }));
const N = SLIDES.length;
/** Time on each slide. The progress bar's fill IS the timer: its animationend advances. */
const DURATION_MS = 6500;
const wrap = (i: number) => (i + N) % N;

/* Saved looks (the heart) are a per-viewer convenience kept in localStorage,
   read through an external store so SSR and hydration agree. */
const SAVED_KEY = "txq:saved-looks";
let memorySaved: string | null = null;

function readSaved(): string {
  if (memorySaved !== null) return memorySaved;
  try {
    return localStorage.getItem(SAVED_KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribeSaved(cb: () => void) {
  window.addEventListener(SAVED_KEY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(SAVED_KEY, cb);
    window.removeEventListener("storage", cb);
  };
}
function toggleSaved(id: string) {
  const list = readSaved().split(",").filter(Boolean);
  memorySaved = (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]).join(",");
  try {
    localStorage.setItem(SAVED_KEY, memorySaved);
  } catch {
    /* storage unavailable — the in-memory copy still serves this visit */
  }
  window.dispatchEvent(new Event(SAVED_KEY));
}

const noopSubscribe = () => () => {};

export const Hero = forwardRef<HTMLElement, { live: boolean }>(function Hero({ live }, ref) {
  const { t, lang, setLang } = useSite();
  const { openMenu } = useShell();
  const reduced = useReducedMotion();
  // False through SSR + hydration, true after: the autoplay timer only starts
  // once React is listening for its end.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const saved = useSyncExternalStore(subscribeSaved, readSaved, () => "");

  const [index, setIndex] = useState(0);
  // Slides whose image may load: the first (preloaded), then current + next.
  const [warm, setWarm] = useState(() => new Set([0]));
  const [userPaused, setUserPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusHold, setFocusHold] = useState(false);
  const root = useRef<HTMLElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const slide = SLIDES[index];
  const paused = userPaused || hover || focusHold || !live;
  const other: Lang = lang === "en" ? "es" : "en";

  const setRoot = useCallback(
    (el: HTMLElement | null) => {
      root.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  const go = useCallback((i: number) => {
    const k = wrap(i);
    setIndex(k);
    setWarm((w) => (w.has(k) && w.has(wrap(k + 1)) ? w : new Set([...w, k, wrap(k + 1)])));
  }, []);

  // Warm the second slide only after the page has loaded, so it never competes
  // with the first image (the LCP).
  useEffect(() => {
    const warmNext = () => setWarm((w) => (w.has(1) ? w : new Set([...w, 1])));
    if (document.readyState === "complete") {
      const id = window.setTimeout(warmNext, 0);
      return () => window.clearTimeout(id);
    }
    window.addEventListener("load", warmNext, { once: true });
    return () => window.removeEventListener("load", warmNext);
  }, []);

  // Arrow keys step through slides while the hero holds the screen, unless
  // focus is somewhere else (a form field, the open menu).
  useEffect(() => {
    if (!live) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = document.activeElement;
      if (el && el !== document.body && !root.current?.contains(el)) return;
      e.preventDefault();
      go(index + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live, index, go]);

  const onTouchStart = (e: TouchEvent) => {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  };

  // Hovering the controls (not the whole full-screen hero, which a desktop
  // cursor almost always sits over) holds the slide.
  const onPointerOver = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setHover(!!(e.target as Element).closest("[data-hold]"));
  };
  // Keyboard focus anywhere inside holds the slide until focus leaves.
  const onFocus = (e: FocusEvent) => {
    if ((e.target as Element).matches(":focus-visible")) setFocusHold(true);
  };
  const onBlur = (e: FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusHold(false);
  };

  const style = { "--accent": slide.accent, "--pos": (index + 1) / N } as CSSProperties;
  const ctaLabel = pick(lang, slide.cta.label);
  const isSaved = saved.split(",").includes(slide.id);

  return (
    <section
      ref={setRoot}
      id="top"
      className="tq-cine"
      style={style}
      aria-roledescription="carousel"
      aria-label={t.hero.carousel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerOver={onPointerOver}
      onPointerLeave={() => setHover(false)}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <h1 className="tq-sr">
        {t.hero.headA} {t.hero.headB} {t.hero.headC}
      </h1>

      {/* Floating bar — fixed to the viewport while the hero holds the screen,
          standing in for the global header. */}
      <div className="tq-cine__bar" data-hidden={!live} inert={!live} data-hold>
        <div className="tq-cine__nav">
          <button
            type="button"
            className="tq-cine__menu"
            aria-label={t.nav.menu}
            aria-haspopup="dialog"
            onClick={openMenu}
          >
            <span aria-hidden />
          </button>
          <a href="#top" className="tq-cine__mark">
            TX QUINCE
          </a>
          <div className="tq-cine__tools">
            <a href="#archive" className="tq-cine__tool" aria-label={t.hero.archive}>
              <Icon>
                <rect x="4" y="4" width="6.5" height="6.5" />
                <rect x="13.5" y="4" width="6.5" height="6.5" />
                <rect x="4" y="13.5" width="6.5" height="6.5" />
                <rect x="13.5" y="13.5" width="6.5" height="6.5" />
              </Icon>
            </a>
            <a href="#intake" className="tq-cine__tool" aria-label={t.hero.date}>
              <Icon>
                <rect x="4" y="5.5" width="16" height="14.5" rx="1" />
                <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
              </Icon>
            </a>
            <button
              type="button"
              className="tq-cine__tool tq-cine__lang"
              lang={other}
              aria-label={other === "es" ? "Español" : "English"}
              onClick={() => setLang(other)}
            >
              {other.toUpperCase()}
            </button>
          </div>
        </div>
        <a href={slide.cta.href} className="tq-cine__strip">
          <span className="tq-cine__thumb" aria-hidden>
            <Image
              src={slide.art.src}
              alt=""
              width={30}
              height={38}
              unoptimized
              style={{ objectPosition: slide.art.focus }}
            />
          </span>
          <span className="tq-cine__cta">{ctaLabel}</span>
          <Icon className="tq-cine__go">
            <path d="M8 5.5v13l10.5-6.5z" />
          </Icon>
        </a>
      </div>

      {/* Mood: the work, darkened and tinted toward the accent. */}
      <div className="tq-cine__media" aria-hidden>
        {SLIDES.map((s, i) => (
          <div key={s.id} className="tq-cine__img" data-active={i === index}>
            {warm.has(i) && (
              <Image
                src={s.art.src}
                alt=""
                fill
                preload={i === 0}
                unoptimized
                sizes="100vw"
                style={{ objectPosition: s.art.focus }}
              />
            )}
          </div>
        ))}
        <div className="tq-cine__tint" />
        <div className="tq-cine__shade" />
      </div>

      <div className="tq-cine__body" data-hold>
        <div className="tq-cine__slides" aria-live={paused || reduced ? "polite" : "off"}>
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={t.hero.slide(i + 1, N)}
              aria-hidden={i !== index}
              className="tq-cine__slide"
              data-active={i === index}
            >
              <h2 className="tq-cine__title">{pick(lang, s.title)}</h2>
              <p className="tq-cine__label">{pick(lang, s.label)}</p>
            </div>
          ))}
        </div>
        <div className="tq-cine__actions">
          <a href={slide.cta.href} className="tq-cine__icon" aria-label={ctaLabel}>
            <Icon>
              <path d="M8 5.5v13l10.5-6.5z" />
            </Icon>
          </a>
          <button
            type="button"
            className="tq-cine__icon"
            aria-label={t.hero.save}
            aria-pressed={isSaved}
            onClick={() => toggleSaved(slide.id)}
          >
            <Icon>
              <path d="M12 19.5s-7.5-4.4-7.5-10A4.25 4.25 0 0 1 12 6.8a4.25 4.25 0 0 1 7.5 2.7c0 5.6-7.5 10-7.5 10z" />
            </Icon>
          </button>
        </div>
      </div>

      <div className="tq-cine__pager" data-hold>
        <div className="tq-cine__dots" role="group" aria-label={t.hero.carousel}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={t.hero.show(pick(lang, s.title))}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="tq-cine__pause"
          aria-label={userPaused ? t.hero.play : t.hero.pause}
          onClick={() => setUserPaused((p) => !p)}
        >
          <Icon>{userPaused ? <path d="M8 5.5v13l10.5-6.5z" /> : <path d="M9 6v12M15 6v12" />}</Icon>
        </button>
      </div>

      <span
        key={index}
        className="tq-cine__progress"
        data-run={hydrated || undefined}
        style={{ animationDuration: `${DURATION_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
        onAnimationEnd={() => go(index + 1)}
        aria-hidden
      />
    </section>
  );
});

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      {children}
    </svg>
  );
}
