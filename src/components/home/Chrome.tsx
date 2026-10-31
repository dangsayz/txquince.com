"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatusLabel } from "@/components/txq/Header";
import { FooterAdmin } from "@/components/txq/Editorial";
import { useSite } from "@/components/txq/state";
import type { Lang } from "@/components/txq/data";
import { trackEvent } from "@/components/Tracker";
import { CONTACT_EVENT, smsHref, telHref, whatsappHref } from "@/lib/contact";
import { site } from "@/content/site";
import { HOME } from "./home-copy";
import { ED } from "@/components/editorial/copy";
import "./chrome.css";

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

  // Tone: is a dark section (data-header-tone="dark") under the header bar?
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const line = 32;
      let dark = false;
      document.querySelectorAll('[data-header-tone="dark"]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom >= line) dark = true;
      });
      setTone(dark ? "dark" : "light");
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
          <a href={homeHref("#top")} className="sh-mark" aria-label="TX Quince">
            TX QUINCE
          </a>
          <div className="sh-right">
            <Lang2 className="sh-lang" />
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
            <div id="contact" className="sf-col">
              <p className="sf-h">{f.hello}</p>
              <a href={smsHref()} onClick={() => trackEvent(CONTACT_EVENT.text, "footer")}>
                {e.text} {site.contact.phone}
              </a>
              <a href={whatsappHref(lang)} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(CONTACT_EVENT.whatsapp, "footer")}>
                WhatsApp
              </a>
              <a href={telHref()} onClick={() => trackEvent(CONTACT_EVENT.call, "footer")}>
                {lang === "es" ? "Llamar" : "Call"}
              </a>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
                Instagram @{handle}
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
