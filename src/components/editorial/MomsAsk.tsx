"use client";

import Link from "next/link";
import { useSite } from "@/components/txq/state";
import { trackEvent } from "@/components/Tracker";
import { FAQ_GROUPS, FAQ_GROUP_OF } from "@/components/home/home-copy";
import { CONTACT_EVENT, smsHref } from "@/lib/contact";
import { site } from "@/content/site";
import "./moms-ask.css";

/**
 * "What moms ask before booking" — the homepage questions, grouped by where
 * a family is in planning (prices & booking → your team → the day → after).
 *
 * Every answer is visible (no accordions): easier to scan on a phone, and the
 * text Google and answer engines read is the text families see. The answers
 * are the FAQ in src/components/txq/copy.ts (price tokens already filled by
 * SiteProvider), so the FAQPage JSON-LD in HomeJsonLd always matches.
 * Layout after Ploy's editorial Q&A rows; the ending after Fiasco's "ask a
 * person" close.
 */
const COPY = {
  en: {
    label: "What moms ask",
    title: "Before you book, the questions every family asks.",
    jump: "Jump to",
    askTitle: "Didn’t see yours?",
    askBody: "Text it to us. We reply within a day, in English or Spanish.",
    text: "Text us",
    guide: "How to hire any quince vendor without getting burned",
    guideHref: "/blog/hire-quinceanera-vendors-without-getting-burned-texas",
  },
  es: {
    label: "Lo que preguntan las mamás",
    title: "Antes de reservar, las preguntas que hace cada familia.",
    jump: "Ir a",
    askTitle: "¿No viste la tuya?",
    askBody: "Mándanosla por texto. Respondemos en un día, en español o inglés.",
    text: "Escríbenos",
    guide: "Cómo contratar proveedores de quinceañera sin que le estafen",
    guideHref: "/es/blog/como-contratar-proveedores-de-quinceanera-sin-que-le-estafen",
  },
} as const;

export function MomsAsk() {
  const { t, lang } = useSite();
  const c = COPY[lang];
  const items = t.faq.items.map((item, i) => ({ ...item, group: FAQ_GROUP_OF[i] ?? "booking" }));
  const groups = FAQ_GROUPS.filter((g) => items.some((i) => i.group === g.id));

  return (
    <section id="questions" className="ma" aria-labelledby="ma-title">
      <div className="ed-wrap">
        <header className="ma-head">
          <p className="ed-label">{c.label}</p>
          <h2 id="ma-title" className="ma-title">{c.title}</h2>
          <nav className="ma-jump" aria-label={c.jump}>
            {groups.map((g) => (
              <a key={g.id} href={`#ma-${g.id}`} className="ma-jump__link">
                {g.label[lang]}
              </a>
            ))}
          </nav>
        </header>

        {groups.map((g) => (
          <section key={g.id} id={`ma-${g.id}`} className="ma-group" aria-labelledby={`ma-${g.id}-h`}>
            <h3 id={`ma-${g.id}-h`} className="ed-label ma-group__label">
              {g.label[lang]}
            </h3>
            <dl className="ma-rows">
              {items
                .filter((i) => i.group === g.id)
                .map((i) => (
                  <div key={i.q} className="ma-row">
                    <dt className="ma-q">{i.q}</dt>
                    <dd className="ma-a">{i.a}</dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}

        <div className="ma-ask">
          <div>
            <p className="ma-ask__t">{c.askTitle}</p>
            <p className="ma-ask__b">{c.askBody}</p>
          </div>
          <div className="ma-ask__actions">
            <a href={smsHref()} className="ed-btn" onClick={() => trackEvent(CONTACT_EVENT.text, "moms-ask")}>
              {c.text} {site.contact.phone}
            </a>
            <Link href={c.guideHref} className="ed-textlink ma-guide">
              {c.guide} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
