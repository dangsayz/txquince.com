"use client";

import { motion } from "motion/react";
import { site } from "@/content/site";
import { useSite } from "./state";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Editorial() {
  const { t } = useSite();
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
          <h3 className="tq-mono" style={{ margin: 0 }}>
            {t.editorial.journal}
          </h3>
          <ol>
            {t.editorial.entries.map((e) => (
              <li key={e.title}>
                <span className="tq-mono tq-muted">{e.kind}</span>
                <span className="tq-display tq-journal__title">{e.title}</span>
                <span className="tq-mono tq-muted">{e.read}</span>
                <span className="tq-mono tq-journal__soon">{t.editorial.soon}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useSite();
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
                  <a href={l.href}>
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
            <a href="#intake">
              {t.nav.cta} <span className="tq-arrow" aria-hidden>↗</span>
            </a>
            <a href="#top">{t.footer.top} ↑</a>
          </div>
        </div>
        <div className="tq-footer__base tq-mono">
          <span>
            © {new Date().getFullYear()} TX Quince. {t.footer.rights}
          </span>
          <span>{t.footer.colophon}</span>
        </div>
      </div>
    </footer>
  );
}
