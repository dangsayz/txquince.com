"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { site } from "@/content/site";
import { useIsAdmin } from "@/components/EditMode";
import { useSite } from "./state";
import "./footer-admin.css";

/** Latest blog posts, passed in from the server page (keeps post bodies out of the client bundle). */
export type JournalItem = { href: string; title: string; category: string; readMinutes: number };
export type Journal = { en: JournalItem[]; es: JournalItem[] };

const EASE = [0.22, 1, 0.36, 1] as const;

export function Editorial({ journal }: { journal: Journal }) {
  const { t, lang } = useSite();
  const items = journal[lang];
  return (
    <section id="editorial" className="tq-section" aria-labelledby="tq-ed-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.editorial.index}]
          </p>
          <h2 id="tq-ed-title" className="tq-display tq-head__title">
            {t.editorial.title}
          </h2>
        </header>

        <div className="tq-manifesto">
          <motion.p
            key={t.editorial.manifesto}
            className="tq-display"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1, ease: EASE }}
          >
            {t.editorial.manifesto}
          </motion.p>
        </div>

        <ol className="tq-principles">
          {t.editorial.principles.map((p, i) => (
            <li key={p.title}>
              <span className="tq-mono tq-muted">[{String(i + 1).padStart(2, "0")}]</span>
              <h3 className="tq-display">{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>

        <div className="tq-journal">
          <div className="tq-journal__head">
            <h3 className="tq-mono" style={{ margin: 0 }}>
              {t.editorial.journal}
            </h3>
            <p className="tq-muted" style={{ margin: 0 }}>
              {t.editorial.journalDek}
            </p>
          </div>
          <ol>
            {items.map((e) => (
              <li key={e.href}>
                <span className="tq-mono tq-muted">{e.category}</span>
                <Link href={e.href} className="tq-display tq-journal__title">
                  {e.title}
                </Link>
                <span className="tq-mono tq-muted">{t.editorial.read(e.readMinutes)}</span>
                <span className="tq-mono tq-journal__soon" aria-hidden>
                  ↗
                </span>
              </li>
            ))}
          </ol>
          <Link href={lang === "es" ? "/es/blog" : "/blog"} className="tq-btn tq-btn--ghost tq-journal__all">
            {t.editorial.allPosts} <span className="tq-arrow" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Discreet owner entry in the footer base row. Visitors see "Admin login"; once
 * /api/admin/me confirms a signed-in admin (useIsAdmin — free for visitors), it
 * becomes "Admin" (→ /admin) + "Log out" (signs out, returns to the homepage).
 */
function FooterAdmin() {
  const { lang } = useSite();
  const isAdmin = useIsAdmin();
  const [busy, setBusy] = useState(false);
  const es = lang === "es";

  async function logOut() {
    if (busy) return;
    setBusy(true);
    try {
      // Server route clears the auth cookies; the browser client clears its own
      // copy (loaded on demand so visitors never download the auth library).
      await fetch("/api/admin/signout", { method: "POST" }).catch(() => undefined);
      const { createBrowserSupabaseClient } = await import("@/lib/supabase/client");
      const supabase = await createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      /* cookies are already cleared server-side */
    }
    try {
      window.localStorage.removeItem("txq_admin");
    } catch {
      /* ignore */
    }
    window.location.assign(es ? "/es" : "/");
  }

  if (!isAdmin) {
    return (
      <a href="/admin/login" className="tq-footer-admin__link" rel="nofollow">
        {es ? "Acceso admin" : "Admin login"}
      </a>
    );
  }
  return (
    <span className="tq-footer-admin">
      <a href="/admin" className="tq-footer-admin__link" rel="nofollow">
        Admin
      </a>
      <button type="button" className="tq-footer-admin__link" onClick={logOut} disabled={busy}>
        {busy ? (es ? "Cerrando…" : "Logging out…") : es ? "Cerrar sesión" : "Log out"}
      </button>
    </span>
  );
}

export function Footer() {
  const { t, homeHref } = useSite();
  const handle = site.social.instagram.replace(/\/$/, "").split("/").pop();
  return (
    <footer className="tq-footer">
      <div className="tq-wrap">
        <p className="tq-display tq-footer__mark" aria-hidden>
          TX Quince
        </p>
        <div className="tq-footer__cols">
          <div>
            <span className="tq-mono tq-muted">{t.footer.studio}</span>
            <span>{t.footer.regions}</span>
          </div>
          <div>
            <span className="tq-mono tq-muted">{t.footer.contact}</span>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
              Instagram — @{handle}
            </a>
          </div>
          <div>
            <span className="tq-mono tq-muted">{t.footer.index}</span>
            <ul className="tq-footer__links">
              {t.nav.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href.startsWith("#") ? homeHref(l.href) : l.href}>
                    <span className="tq-mono tq-muted" style={{ marginRight: 10 }}>
                      {l.n}
                    </span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="tq-mono tq-muted">TX Quince</span>
            <a href={homeHref("#intake")}>
              {t.nav.cta} <span className="tq-arrow" aria-hidden>↗</span>
            </a>
            <a href="#content">{t.footer.top} ↑</a>
          </div>
        </div>
        <div className="tq-footer__base tq-mono">
          <span>
            © {new Date().getFullYear()} TX Quince. {t.footer.rights}
          </span>
          <span>{t.footer.colophon}</span>
          <FooterAdmin />
        </div>
      </div>
    </footer>
  );
}

/** Answer-first Q&A — mirrors the FAQPage structured data on the homepage. */
export function Faq() {
  const { t } = useSite();
  return (
    <section id="questions" className="tq-section" aria-labelledby="tq-faq-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.faq.index}]
          </p>
          <h2 id="tq-faq-title" className="tq-display tq-head__title">
            {t.faq.title}
          </h2>
        </header>
        <div className="tq-faq">
          {t.faq.items.map((item, i) => (
            <details key={item.q} className="tq-faq__item" open={i === 0}>
              <summary>
                <span className="tq-mono tq-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="tq-faq__q">{item.q}</h3>
                <span className="tq-faq__icon" aria-hidden />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
