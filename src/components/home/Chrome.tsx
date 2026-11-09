"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatusLabel } from "@/components/txq/Header";
import { FooterAdmin, useAdminLogout } from "@/components/txq/Editorial";
import { useIsAdmin } from "@/components/EditMode";
import { useSite } from "@/components/txq/state";
import type { Lang } from "@/components/txq/data";
import { trackEvent } from "@/components/Tracker";
import { CONTACT_EVENT, smsHref, telHref, whatsappHref } from "@/lib/contact";
import { site } from "@/content/site";
import { HOME } from "./home-copy";
import { ED } from "@/components/editorial/copy";
import "./chrome.css";
import { WhatsAppChatButton } from "@/components/WhatsAppChatButton";

/** Footer city links (each has a page in both languages; see content/locations.ts). */
const FOOTER_CITIES = [
  { slug: "dallas", city: "Dallas" },
  { slug: "fort-worth", city: "Fort Worth" },
  { slug: "arlington", city: "Arlington" },
  { slug: "irving", city: "Irving" },
  { slug: "grand-prairie", city: "Grand Prairie" },
];

function Lang2({ className }: { className?: string }) {
  const { lang, setLang, t } = useSite();
  return (
    <div className={className} role="group" aria-label={t.nav.language}>
      {(["en", "es"] as Lang[]).map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Small key-shaped admin icon (decorative; the link carries the text). */
function AdminIcon() {
  return (
    <svg className="sh-admin__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9.5 12l1.8 1.8L15 10"
      />
    </svg>
  );
}

/** A head-and-shoulders mark for the account link (decorative). */
function PersonIcon() {
  return (
    <svg className="sh-acct__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <circle cx="12" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.8 20c1-3.6 3.8-5.6 7.2-5.6s6.2 2 7.2 5.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Signed in to a TX Quince account? Clerk keeps a
 * small readable `__client_uat` cookie on this domain ("0" when signed out).
 * A display hint only; nothing is trusted from it. Visitors never load Clerk.
 */
function useSignedInHint(): boolean {
  const [inside, setInside] = useState(false);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)__client_uat(?:_[^=]+)?=(\d+)/);
    const yes = Boolean(m && m[1] !== "0");
    if (yes) queueMicrotask(() => setInside(true));
  }, []);
  return inside;
}

const ACCOUNT_COPY = {
  en: {
    in: "Log in", account: "Account", menu: "Log in / Create account", menuIn: "Your account", href: "/login",
    signup: "Create account", signupHref: "/signup", label: "Your TX Quince account", note: "Free. Comment and ask questions on the Journal.",
  },
  es: {
    in: "Entrar", account: "Mi cuenta", menu: "Entrar / Crear cuenta", menuIn: "Mi cuenta", href: "/es/entrar",
    signup: "Crear cuenta", signupHref: "/es/registro", label: "Tu cuenta de TX Quince", note: "Gratis. Comenta y haz preguntas en el Diario.",
  },
} as const;

/** Head-and-shoulders with a small plus: "make an account" (decorative). */
function PersonPlusIcon() {
  return (
    <svg className="sm-acct__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <circle cx="10" cy="8.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c1-3.6 3.6-5.6 7-5.6 1.6 0 3 .4 4.2 1.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18.5 13.5v6M15.5 16.5h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Log in / create account, as its own block in the open menu (two clear buttons, not a text line). */
function MenuAccount({ signedIn, onNavigate }: { signedIn: boolean; onNavigate: () => void }) {
  const { lang } = useSite();
  const a = ACCOUNT_COPY[lang];
  return (
    <div className="sm-acct">
      <p className="sm-acct__label">{a.label}</p>
      <div className="sm-acct__row">
        {signedIn ? (
          <a href={a.href} className="sm-acct__btn sm-acct__btn--solid" rel="nofollow" onClick={onNavigate}>
            <PersonIcon />
            {a.menuIn}
          </a>
        ) : (
          <>
            <a href={a.href} className="sm-acct__btn sm-acct__btn--solid" rel="nofollow" onClick={onNavigate}>
              <PersonIcon />
              {a.in}
            </a>
            <a href={a.signupHref} className="sm-acct__btn" rel="nofollow" onClick={onNavigate}>
              <PersonPlusIcon />
              {a.signup}
            </a>
          </>
        )}
      </div>
      {signedIn ? null : <p className="sm-acct__note">{a.note}</p>}
    </div>
  );
}

/** Owner controls in the open menu: shown only to a signed-in admin. */
function MenuAdmin({ onNavigate }: { onNavigate: () => void }) {
  const { lang } = useSite();
  const { busy, logOut } = useAdminLogout();
  const es = lang === "es";
  return (
    <div className="sm-admin">
      <p className="sm-admin__label">{es ? "Sesión de admin" : "Signed in as admin"}</p>
      <div className="sm-admin__row">
        <a href="/admin" className="sm-admin__btn sm-admin__btn--solid" rel="nofollow" onClick={onNavigate}>
          <AdminIcon />
          {es ? "Abrir admin" : "Open admin"}
        </a>
        <button type="button" className="sm-admin__btn" onClick={logOut} disabled={busy}>
          {busy ? (es ? "Cerrando…" : "Logging out…") : es ? "Cerrar sesión" : "Log out"}
        </button>
      </div>
    </div>
  );
}

/**
 * The global header: nothing but a menu button, the wordmark and one action,
 * floating over the page. It reads the section beneath it — over a photo or
 * the black band it turns white, over white it turns black — and only takes a
 * quiet white backing once the page has scrolled over plain content.
 */
export function SiteHeader() {
  const { t, lang, homeHref } = useSite();
  const e = ED[lang];
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isAdmin = useIsAdmin();
  const signedIn = useSignedInHint();
  const acct = ACCOUNT_COPY[lang];

  // Tone: is a dark section (data-header-tone="dark") under the header bar?
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const line = 32;
      // A light element (e.g. a white card) inside a dark section wins, so
      // white header text never lands on white.
      let dark = false;
      let light = false;
      document.querySelectorAll("[data-header-tone]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top > line || r.bottom < line) return;
        if (el.getAttribute("data-header-tone") === "light") light = true;
        else dark = true;
      });
      setTone(dark && !light ? "dark" : "light");
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const trigger = menuBtn.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const href = (l: { href: string }) => (l.href.startsWith("#") ? homeHref(l.href) : l.href);

  return (
    <>
      <header className="sh" data-tone={tone} data-scrolled={scrolled || undefined}>
        <div className="sh-in">
          <div className="sh-left">
            <button
              ref={menuBtn}
              type="button"
              className="sh-menu"
              aria-label={e.menu}
              aria-expanded={open}
              aria-controls="sh-menu"
              onClick={() => setOpen(true)}
            >
              <span className="sh-burger" aria-hidden>
                <i />
                <i />
              </span>
              <span className="sh-menu__label">{e.menu}</span>
            </button>
            <a href={acct.href} className="sh-acct sh-acct--phone" rel="nofollow" aria-label={signedIn ? acct.account : acct.menu}>
              <PersonIcon />
            </a>
          </div>
          <a href={homeHref("#top")} className="sh-mark" aria-label="TX Quince">
            TX QUINCE
          </a>
          <div className="sh-right">
            {isAdmin ? (
              <a href="/admin" className="sh-admin" rel="nofollow" aria-label="Admin">
                <span className="sh-admin__pill">
                  <AdminIcon />
                  <span className="sh-admin__text">Admin</span>
                </span>
              </a>
            ) : null}
            <Lang2 className="sh-lang" />
            <a href={acct.href} className="sh-acct sh-acct--wide" rel="nofollow" aria-label={signedIn ? acct.account : acct.menu}>
              <PersonIcon />
              <span className="sh-acct__text">{signedIn ? acct.account : acct.in}</span>
            </a>
            <a href={homeHref("#intake")} className="sh-reserve" aria-label={e.reserve}>
              <span className="sh-reserve__long">{e.reserve}</span>
              <span className="sh-reserve__short">{e.packages.book}</span>
            </a>
          </div>
        </div>
      </header>

      {open && (
        <div id="sh-menu" className="sm" role="dialog" aria-modal="true" aria-label={e.menu}>
          <div className="sh-in sm-top">
            <button ref={closeBtn} type="button" className="sh-menu" aria-label={e.close} onClick={() => setOpen(false)}>
              <span className="sh-burger sh-burger--x" aria-hidden>
                <i />
                <i />
              </span>
              <span className="sh-menu__label">{e.close}</span>
            </button>
            <a href={homeHref("#top")} className="sh-mark" aria-label="TX Quince" onClick={() => setOpen(false)}>
              TX QUINCE
            </a>
            <div className="sh-right">
              <Lang2 className="sh-lang sh-lang--always" />
            </div>
          </div>
          <div className="sm-body">
            <nav aria-label={t.nav.label}>
              <ul className="sm-links">
                {t.nav.links.map((l, i) => (
                  <li key={l.href} style={{ animationDelay: `${0.04 * i}s` }}>
                    <a href={href(l)} onClick={() => setOpen(false)}>
                      {l.label}
                    </a>
                  </li>
                ))}
                <li style={{ animationDelay: `${0.04 * t.nav.links.length}s` }}>
                  <a href={homeHref("#intake")} onClick={() => setOpen(false)}>
                    {e.reserve}
                  </a>
                </li>
              </ul>
            </nav>
            <div className="sm-side">
              <MenuAccount signedIn={signedIn} onNavigate={() => setOpen(false)} />
              <p className="sm-status">
                <StatusLabel />
              </p>
              <a href={smsHref()} onClick={() => trackEvent(CONTACT_EVENT.text, "menu")}>
                {ED[lang].text} {site.contact.phone}
              </a>
              <a href={whatsappHref(lang)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(CONTACT_EVENT.whatsapp, "menu")}>
                WhatsApp
              </a>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              {isAdmin ? <MenuAdmin onNavigate={() => setOpen(false)} /> : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** The global footer: big quiet links, how to reach us, and the fine print. */
export function SiteFooter() {
  const { t, lang, homeHref } = useSite();
  const f = HOME[lang].footer;
  const e = ED[lang];
  const handle = site.social.instagram.replace(/\/$/, "").split("/").pop();
  return (
    <footer className="sf">
      <div className="sf-in">
        <div className="sf-top">
          <nav className="sf-big" aria-label={f.explore}>
            {t.nav.links.map((l) => (
              <a key={l.href} href={l.href.startsWith("#") ? homeHref(l.href) : l.href}>
                {l.label}
              </a>
            ))}
            <a href={homeHref("#intake")}>{e.reserve}</a>
          </nav>
          <div className="sf-side">
            <div className="sf-wa-row">
              <WhatsAppChatButton lang={lang} placement="footer" />
            </div>
            <div id="contact" className="sf-col">
              <p className="sf-h">{f.hello}</p>
              <a href={smsHref()} onClick={() => trackEvent(CONTACT_EVENT.text, "footer")}>
                {e.text} {site.contact.phone}
              </a>
              <a href={telHref()} onClick={() => trackEvent(CONTACT_EVENT.call, "footer")}>
                {lang === "es" ? "Llamar" : "Call"}
              </a>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
                Instagram @{handle}
              </a>
              <a href={site.social.youtube} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
            <nav className="sf-col" aria-label={f.cities}>
              <p className="sf-h">{f.cities}</p>
              {FOOTER_CITIES.map((c) => (
                <Link key={c.slug} href={`${t.places.cityBase}/${c.slug}`}>
                  {c.city}
                </Link>
              ))}
            </nav>
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
