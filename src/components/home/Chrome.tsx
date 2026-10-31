"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LangSwitch, StatusLabel } from "@/components/txq/Header";
import { FooterAdmin } from "@/components/txq/Editorial";
import { COPY } from "@/components/txq/copy";
import { useSite } from "@/components/txq/state";
import { ContactButtons } from "@/components/ContactButtons";
import { trackEvent } from "@/components/Tracker";
import { CONTACT_COPY, CONTACT_EVENT, smsHref, whatsappHref } from "@/lib/contact";
import { site } from "@/content/site";
import { HOME } from "./home-copy";
import { ED } from "@/components/editorial/copy";
import "./chrome.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Footer city links (each has a page in both languages; see content/locations.ts). */
const FOOTER_CITIES = [
  { slug: "dallas", city: "Dallas" },
  { slug: "fort-worth", city: "Fort Worth" },
  { slug: "arlington", city: "Arlington" },
  { slug: "irving", city: "Irving" },
  { slug: "grand-prairie", city: "Grand Prairie" },
];

/**
 * The global header: a slim availability bar, then bilingual links either side
 * of a centered wordmark. On phones: wordmark, a round "text us" button and
 * the menu (the full index overlay).
 */
export function SiteHeader() {
  const { t, lang, homeHref } = useSite();
  const h = HOME[lang];
  const other = COPY[lang === "en" ? "es" : "en"].nav.links;
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

  const href = (l: { href: string }) => (l.href.startsWith("#") ? homeHref(l.href) : l.href);
  const links = t.nav.links.map((l, i) => ({ ...l, alt: other[i]?.label ?? "" }));
  const left = links.slice(0, 3);
  const right = links.slice(3);

  const NavLink = ({ l }: { l: (typeof links)[number] }) => (
    <a href={href(l)} className="sh-nl" lang={lang}>
      <span>{l.label}</span>
      {l.alt && l.alt !== l.label && <small lang={lang === "en" ? "es" : "en"}>{l.alt}</small>}
    </a>
  );

  return (
    <>
      <header className="sh">
        <div className="sh-top">
          <div className="sh-top__in">
            <span className="sh-top__status" aria-live="polite">
              <StatusLabel />
            </span>
            <a href={smsHref()} className="sh-top__phone" onClick={() => trackEvent(CONTACT_EVENT.text, "topbar")}>
              {h.topbarText} {site.contact.phone} <span className="sh-top__muted">· {h.topbarReply}</span>
            </a>
          </div>
        </div>
        <div className="sh-bar">
          <nav className="sh-nav sh-nav--left" aria-label={t.nav.label}>
            {left.map((l) => (
              <NavLink key={l.href} l={l} />
            ))}
          </nav>
          <a href={homeHref("#top")} className="sh-brand" aria-label="TX Quince">
            <span className="sh-brand__mark">TX QUINCE</span>
            <span className="sh-brand__sub">FOTO · VIDEO · DFW</span>
          </a>
          <div className="sh-right">
            <nav className="sh-nav" aria-label={t.nav.label}>
              {right.map((l) => (
                <NavLink key={l.href} l={l} />
              ))}
            </nav>
            <LangSwitch id="header" />
            <a href={homeHref("#intake")} className="sh-cta">
              {ED[lang].reserve}
            </a>
            <a
              href={smsHref()}
              className="sh-icon sh-sm"
              aria-label={CONTACT_COPY[lang].textAria}
              onClick={() => trackEvent(CONTACT_EVENT.text, "header")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 5h16v11H8l-4 4z" />
              </svg>
            </a>
            <button
              ref={menuBtn}
              type="button"
              className="sh-icon sh-sm"
              aria-label={t.nav.menu}
              aria-expanded={open}
              aria-controls="tq-menu"
              onClick={() => setOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 8h16M4 16h16" />
              </svg>
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
              <button ref={closeBtn} type="button" className="tq-icon-btn tq-mono" onClick={() => setOpen(false)}>
                {t.nav.close}
              </button>
            </div>
            <nav aria-label={t.nav.label}>
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                  >
                    <a href={href(l)} onClick={() => setOpen(false)}>
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
 * The global footer, made like a quince invitation: a "save the date" card
 * with the contact buttons, a big "¡Felices XV!" and gold-and-rose confetti.
 */
export function SiteFooter() {
  const { t, lang, homeHref } = useSite();
  const f = HOME[lang].footer;
  const handle = site.social.instagram.replace(/\/$/, "").split("/").pop();
  return (
    <footer className="sf">
      <div aria-hidden className="sf-confetti" />
      <div className="sf-in">
        <div id="contact" className="sf-invite">
          <svg className="sf-tiara" width="64" height="34" viewBox="0 0 64 34" fill="none" aria-hidden>
            <path d="M4 30h56M7 30 4 10l14 10L32 3l14 17 14-10-3 20" stroke="#b76e79" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="32" cy="3" r="2.4" fill="#b76e79" />
            <circle cx="4" cy="10" r="2" fill="#b76e79" />
            <circle cx="60" cy="10" r="2" fill="#b76e79" />
          </svg>
          <p className="sf-label">{f.invite}</p>
          <h2 className="sf-title">{f.title}</h2>
          <p className="sf-body">{f.body}</p>
          <ContactButtons lang={lang} placement="footer" note={false} className="sf-contact" />
        </div>

        <p className="sf-big" aria-hidden>
          {f.line}
        </p>

        <div className="sf-cols">
          <div className="sf-brand">
            <span className="sf-brand__mark">TX QUINCE</span>
            <p>{f.about}</p>
          </div>
          <nav className="sf-col" aria-label={f.explore}>
            <p className="sf-h">{f.explore}</p>
            {t.nav.links.map((l) => (
              <a key={l.href} href={l.href.startsWith("#") ? homeHref(l.href) : l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <nav className="sf-col" aria-label={f.cities}>
            <p className="sf-h">{f.cities}</p>
            {FOOTER_CITIES.map((c) => (
              <Link key={c.slug} href={`${t.places.cityBase}/${c.slug}`}>
                {c.city}
              </Link>
            ))}
          </nav>
          <div className="sf-col">
            <p className="sf-h">{f.hello}</p>
            <a href={smsHref()} onClick={() => trackEvent(CONTACT_EVENT.text, "footer-col")}>
              {site.contact.phone}
            </a>
            <a href={whatsappHref(lang)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(CONTACT_EVENT.whatsapp, "footer-col")}>
              WhatsApp
            </a>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
              @{handle}
            </a>
          </div>
        </div>

        <div className="sf-base">
          <span>
            © {new Date().getFullYear()} TX Quince · {f.made}
          </span>
          <FooterAdmin />
        </div>
      </div>
    </footer>
  );
}
