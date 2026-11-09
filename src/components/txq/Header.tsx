"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAvailability, useSite } from "./state";
import { ContactButtons } from "@/components/ContactButtons";
import { CONTACT_COPY } from "@/lib/contact";
import { trackEvent } from "@/components/Tracker";
import { site } from "@/content/site";
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
  const { t, lang, homeHref } = useSite();
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
              {/* Families text more than they fill in forms: the phone, one tap away. */}
              <ContactButtons lang={lang} placement="menu" primary={false} note={false} />
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

/**
 * The phone dock: one round "contact" button and Reserve. The button opens a
 * small sheet with every way to reach the studio (text, WhatsApp, call, email,
 * Instagram), so nothing else has to float over the page.
 */
export function MobileDock({ hidden }: { hidden: boolean }) {
  const { t, lang, homeHref } = useSite();
  const [wantOpen, setOpen] = useState(false);
  const open = wantOpen && !hidden;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);
  const c = CONTACT_COPY[lang];
  return (
    <div ref={ref} className="tq-dock" data-hidden={hidden} aria-hidden={hidden || undefined}>
      {open && (
        <div id="tq-dock-contact" className="tq-dock__sheet" role="group" aria-label={c.groupLabel}>
          <ContactButtons lang={lang} placement="dock" primary={false} />
          <ul className="tq-dock__more">
            <li>
              <a href={`mailto:${site.contact.email}`} onClick={() => trackEvent("contact_email", "dock")}>
                {lang === "es" ? "Correo" : "Email"}
              </a>
            </li>
            <li>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      )}
      <button
        type="button"
        className="tq-dock__contact"
        aria-label={c.groupLabel}
        aria-expanded={open}
        aria-controls="tq-dock-contact"
        tabIndex={hidden ? -1 : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z" /><path d="M8 10.75h.01M12 10.75h.01M16 10.75h.01" strokeWidth="2.4" /></>}
        </svg>
      </button>
      <a href={homeHref("#intake")} className="tq-btn tq-btn--lg" tabIndex={hidden ? -1 : undefined}>
        {t.nav.cta} <span className="tq-arrow" aria-hidden>↗</span>
      </a>
    </div>
  );
}
