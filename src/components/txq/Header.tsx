"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAvailability, useSite } from "./state";
import type { Lang } from "./data";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LangSwitch({ id }: { id: string }) {
  const { lang, setLang, t } = useSite();
  return (
    <div className="tq-lang" role="group" aria-label={t.nav.language}>
      {(["en", "es"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          className="tq-mono"
          aria-pressed={lang === l}
          lang={l}
          onClick={() => setLang(l)}
        >
          {lang === l && (
            <motion.span
              layoutId={`lang-thumb-${id}`}
              className="tq-lang__thumb"
              transition={{ duration: 0.5, ease: EASE }}
            />
          )}
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function StatusLabel() {
  const { t } = useSite();
  const a = useAvailability();
  return (
    <>
      <span className="tq-dot" data-pending={!a.ready} data-limited={a.limited} aria-hidden />
      <span>{!a.ready ? t.status.loading : a.limited ? t.status.limited : t.status.open(a.openSaturdays)}</span>
    </>
  );
}

export function Header() {
  const { t, homeHref } = useSite();
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = menuBtn.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="tq-header">
        <div className="tq-header__inner">
          <a href={homeHref("#top")} className="tq-brand" aria-label="TX Quince">
            <span className="tq-brand__mark">TX QUINCE</span>
            <span className="tq-brand__sub tq-mono">{t.meta.est}</span>
          </a>

          <nav className="tq-nav" aria-label={t.nav.label}>
            <ul>
              {t.nav.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href.startsWith("#") ? homeHref(l.href) : l.href}>
                    <span className="tq-mono">{l.n}</span>
                    <span>{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="tq-header__right">
            <LangSwitch id="header" />
            <a href={homeHref("#intake")} className="tq-btn tq-header__cta">
              {t.nav.cta} <span className="tq-arrow" aria-hidden>↗</span>
            </a>
            <button
              ref={menuBtn}
              type="button"
              className="tq-menu-btn"
              aria-label={t.nav.menu}
              aria-expanded={open}
              aria-controls="tq-menu"
              onClick={() => setOpen(true)}
            >
              <span aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="tq-menu"
            className="tq-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="tq-menu__top">
              <span className="tq-brand__mark">TX QUINCE</span>
              <button
                ref={closeBtn}
                type="button"
                className="tq-icon-btn tq-mono"
                onClick={() => setOpen(false)}
              >
                {t.nav.close}
              </button>
            </div>
            <nav aria-label={t.nav.label}>
              <ul>
                {t.nav.links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                  >
                    <a href={l.href.startsWith("#") ? homeHref(l.href) : l.href} onClick={() => setOpen(false)}>
                      <span className="tq-mono tq-muted">{l.n}</span>
                      <span className="tq-display">{l.label}</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="tq-menu__foot">
              <div className="tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusLabel />
              </div>
              <LangSwitch id="menu" />
              <a href={homeHref("#intake")} className="tq-btn tq-btn--lg tq-btn--block" onClick={() => setOpen(false)}>
                {t.nav.cta} <span className="tq-arrow" aria-hidden>↗</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileDock({ hidden }: { hidden: boolean }) {
  const { t, homeHref } = useSite();
  return (
    <div className="tq-dock" data-hidden={hidden} aria-hidden={hidden || undefined}>
      <span className="tq-dock__status tq-mono">
        <StatusDot />
      </span>
      <a href={homeHref("#intake")} className="tq-btn tq-btn--lg" tabIndex={hidden ? -1 : undefined}>
        {t.nav.cta} <span className="tq-arrow" aria-hidden>↗</span>
      </a>
    </div>
  );
}

function StatusDot() {
  const { t } = useSite();
  const a = useAvailability();
  return (
    <>
      <span className="tq-dot" data-pending={!a.ready} data-limited={a.limited} aria-hidden />
      <span>{a.limited ? t.status.limited : t.status.available}</span>
    </>
  );
}
