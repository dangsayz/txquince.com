"use client";

import { useState, useSyncExternalStore } from "react";
import { useSite } from "@/components/txq/state";
import { trackEvent } from "@/components/Tracker";
import { site } from "@/content/site";

/** Share the budget page with family and friends: the phone's share sheet, or direct links. */
const COPY = {
  en: {
    title: "Planning with family? Share this page.",
    share: "Share",
    facebook: "Facebook",
    text: "Text",
    email: "Email",
    copy: "Copy link",
    copied: "Link copied",
    message: "Look, you type your quince budget and it shows you what photos and video it covers:",
    subject: "What our quince budget covers",
  },
  es: {
    title: "¿Lo planean en familia? Comparte esta página.",
    share: "Compartir",
    facebook: "Facebook",
    text: "Mensaje",
    email: "Correo",
    copy: "Copiar enlace",
    copied: "Enlace copiado",
    message: "Mira, escribes el presupuesto de la quince y te dice qué fotos y video alcanzan:",
    subject: "Lo que alcanza con el presupuesto de la quince",
  },
} as const;

const ICON: Record<string, string> = {
  share: "M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
  facebook: "M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3h-3V6.8c0-.6.4-.8.9-.8H15z",
  text: "M21 12a8 8 0 0 1-11.6 7.14L4 20l.9-4.5A8 8 0 1 1 21 12",
  whatsapp: "M20 11.5A8.5 8.5 0 0 1 7.6 19L3.5 20.5 5 16.5A8.5 8.5 0 1 1 20 11.5M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2z",
  email: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1M3.5 6l8.5 7 8.5-7",
  copy: "M9 9h10v12H9zM5 15V3h10",
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d={ICON[name]} />
    </svg>
  );
}

export function ShareBar({ placement }: { placement: string }) {
  const { lang } = useSite();
  const c = COPY[lang];
  const url = `${site.url}${lang === "es" ? "/es/presupuesto" : "/budget"}`;
  const body = `${c.message} ${url}`;
  const [copied, setCopied] = useState(false);
  // The phone's own share sheet, where it exists (decided after hydration).
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const track = (how: string) => trackEvent("budget_share", `${placement}:${how}`);

  const native = async () => {
    track("native");
    try {
      await navigator.share({ title: c.subject, text: c.message, url });
    } catch {
      /* dismissed */
    }
  };
  const copy = async () => {
    track("copy");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(c.copy, url);
    }
  };

  const links = [
    { k: "facebook", label: c.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, external: true },
    { k: "text", label: c.text, href: `sms:?&body=${encodeURIComponent(body)}` },
    { k: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(body)}`, external: true },
    { k: "email", label: c.email, href: `mailto:?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(body)}` },
  ];

  return (
    <div className="bp-share" id={`share-${placement}`}>
      <p className="bp-share__title">{c.title}</p>
      {canShare ? (
        <button type="button" className="bp-btn bp-share__native" onClick={native}>
          <Icon name="share" /> {c.share}
        </button>
      ) : null}
      <ul className="bp-share__row">
        {links.map((l) => (
          <li key={l.k}>
            <a href={l.href} onClick={() => track(l.k)} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className="bp-share__ico"><Icon name={l.k} /></span>
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <button type="button" onClick={copy}>
            <span className="bp-share__ico"><Icon name="copy" /></span>
            <span aria-live="polite">{copied ? c.copied : c.copy}</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
