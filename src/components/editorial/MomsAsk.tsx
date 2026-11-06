"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useSite } from "@/components/txq/state";
import { trackEvent } from "@/components/Tracker";
import { FAQ_GROUPS, FAQ_GROUP_OF, type FaqGroup } from "@/components/home/home-copy";
import { SlotPicture } from "@/components/slots/SlotPicture";
import { SlotAdminControl } from "@/components/slots/SlotAdminControl";
import { useSlot, type ClientFallback } from "@/components/slots/SlotProvider";
import { CONTACT_EVENT, smsHref } from "@/lib/contact";
import { site } from "@/content/site";
import "./moms-ask.css";

/**
 * "What moms ask before booking" — the homepage questions, grouped by where
 * a family is in planning (prices & booking → your team → the day → after).
 *
 * One group shows at a time (tabs), each question folds open on tap (native
 * <details>, one open per group), and a real photo sits beside the group
 * (slots home.faq.*, replaceable from the admin). Every answer stays in the
 * HTML, so answer engines read what families can open; the FAQPage JSON-LD
 * in HomeJsonLd uses the same FAQ (src/components/txq/copy.ts).
 * Layout after YLLW's and Maxima Therapy's FAQs (group beside the questions)
 * and Zendesk's grouped accordion; the ending after Fiasco's "ask a person".
 */
const COPY = {
  en: {
    title: "Before you book, the questions every family asks.",
    groups: "Question topics",
    askTitle: "Didn’t see yours?",
    askBody: "Text it to us. We reply within a day, in English or Spanish.",
    text: "Text us",
    guide: "How to hire any quince vendor without getting burned",
    guideHref: "/blog/hire-quinceanera-vendors-without-getting-burned-texas",
  },
  es: {
    title: "Antes de reservar, las preguntas que hace cada familia.",
    groups: "Temas de preguntas",
    askTitle: "¿No viste la tuya?",
    askBody: "Mándanosla por texto. Respondemos en un día, en español o inglés.",
    text: "Escríbenos",
    guide: "Cómo contratar proveedores de quinceañera sin que le estafen",
    guideHref: "/es/blog/como-contratar-proveedores-de-quinceanera-sin-que-le-estafen",
  },
} as const;

/** The photo each group shows until the owner replaces it (same as the slot defaults). */
const PHOTOS: Record<FaqGroup, ClientFallback> = {
  booking: { src: "/portfolio/canal.webp", width: 720, height: 1080, alt: { en: "Quinceañera in a pink gown by a stone railing on the Mandalay Canal in Irving", es: "Quinceañera con vestido rosa junto a un barandal de piedra en el Mandalay Canal de Irving" } },
  team: { src: "/portfolio/reception.webp", width: 719, height: 1080, alt: { en: "Quinceañera portrait in a pink gown at her reception", es: "Retrato de quinceañera con vestido rosa en su recepción" } },
  day: { src: "/portfolio/dance.webp", width: 719, height: 1080, alt: { en: "Dancers in bright folklórico skirts spinning at a quinceañera reception", es: "Bailarinas con faldas folklóricas de colores girando en una recepción de quinceañera" } },
  after: { src: "/portfolio/gown-overhead.webp", width: 1600, height: 1066, alt: { en: "A quinceañera gown seen from above", es: "Vestido de quinceañera visto desde arriba" } },
};
const SIZES = "(max-width: 959px) 100vw, 36vw";

function GroupPhoto({ group, active, lang }: { group: FaqGroup; active: boolean; lang: "en" | "es" }) {
  const image = useSlot(`home.faq.${group}`, PHOTOS[group], SIZES);
  return (
    <div className="ma-photo__layer" data-active={active || undefined} aria-hidden={!active}>
      <SlotPicture image={image} lang={lang} fill sizes={SIZES} alt={active ? undefined : ""} />
      {active && <SlotAdminControl slot={`home.faq.${group}`} />}
    </div>
  );
}

export function MomsAsk() {
  const { t, lang } = useSite();
  const c = COPY[lang];
  const items = t.faq.items.map((item, i) => ({ ...item, group: FAQ_GROUP_OF[i] ?? "booking" }));
  const groups = FAQ_GROUPS.filter((g) => items.some((i) => i.group === g.id));
  const [active, setActive] = useState<FaqGroup>(groups[0]?.id ?? "booking");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  function onKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = groups.length - 1;
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(groups[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <section id="questions" className="ma" aria-labelledby="ma-title">
      <div className="ed-wrap ma-grid">
        <div className="ma-side">
          <h2 id="ma-title" className="ma-title">{c.title}</h2>
          <div className="ma-photo">
            {groups.map((g) => <GroupPhoto key={g.id} group={g.id} active={g.id === active} lang={lang} />)}
          </div>
        </div>

        <div className="ma-main">
          <div role="tablist" aria-label={c.groups} className="ma-tabs">
            {groups.map((g, i) => {
              const n = items.filter((it) => it.group === g.id).length;
              const on = g.id === active;
              return (
                <button
                  key={g.id}
                  ref={(el) => { tabs.current[i] = el; }}
                  type="button"
                  role="tab"
                  id={`ma-tab-${g.id}`}
                  aria-selected={on}
                  aria-controls={`ma-${g.id}`}
                  tabIndex={on ? 0 : -1}
                  className="ma-tab"
                  onClick={() => setActive(g.id)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  {g.label[lang]}
                  <span className="ma-tab__n">{n}</span>
                </button>
              );
            })}
          </div>

          {groups.map((g) => (
            <div
              key={g.id}
              id={`ma-${g.id}`}
              role="tabpanel"
              aria-labelledby={`ma-tab-${g.id}`}
              hidden={g.id !== active}
              className="ma-panel"
            >
              {items
                .filter((i) => i.group === g.id)
                .map((i) => (
                  <details key={i.q} className="ma-item" name={`ma-${g.id}`}>
                    <summary className="ma-q">
                      <span>{i.q}</span>
                      <span className="ma-q__icon" aria-hidden="true" />
                    </summary>
                    <p className="ma-a">{i.a}</p>
                  </details>
                ))}
            </div>
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
      </div>
    </section>
  );
}
