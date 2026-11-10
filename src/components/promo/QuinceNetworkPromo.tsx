"use client";

/**
 * QuinceNetworkPromo — a soft pop-out on the landing page that points families
 * to QuinceNetwork (our sister shop) for invitations, posters and shirts.
 *
 * Not a modal: it never traps focus or dims the page. It slides in once the
 * visitor has had time to look (a few seconds or a third of the page), closes
 * with the X, "Not now" or Esc, and stays away for two weeks after that.
 * No code or price is printed here; families ask TX Quince for the code.
 */
import { useEffect, useState } from "react";
import "./promo.css";

const KEY = "txq_qn_promo_closed";
const QUIET_DAYS = 14;
const SHOP_URL = "https://quincenetwork.com/shop?utm_source=txquince&utm_medium=promo&utm_campaign=landing";

const COPY = {
  en: {
    label: "A note from TX Quince about QuinceNetwork",
    eyebrow: "Our sister shop",
    title: "Invitations, posters and shirts for her quince",
    body: "QuinceNetwork is where we send every family for the designs. Ask us for the TX Quince discount code.",
    cta: "Shop QuinceNetwork",
    later: "Not now",
    close: "Close",
  },
  es: {
    label: "Un aviso de TX Quince sobre QuinceNetwork",
    eyebrow: "Nuestra tienda hermana",
    title: "Invitaciones, pósters y playeras para sus quince",
    body: "QuinceNetwork es a donde mandamos a todas las familias por los diseños. Pídanos el código de descuento de TX Quince.",
    cta: "Ver QuinceNetwork",
    later: "Ahora no",
    close: "Cerrar",
  },
} as const;

function closedRecently(): boolean {
  try {
    const at = Number(window.localStorage.getItem(KEY) ?? 0);
    return at > 0 && Date.now() - at < QUIET_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

export function QuinceNetworkPromo({ lang }: { lang: "en" | "es" }) {
  const t = COPY[lang];
  const [show, setShow] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (closedRecently()) {
      setGone(true);
      return;
    }
    const open = () => setShow(true);
    const timer = window.setTimeout(open, 9000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.3) open();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = () => {
    setShow(false);
    setGone(true);
    try {
      window.localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* private mode: it simply shows again next visit */
    }
  };

  useEffect(() => {
    if (!show || gone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, gone]);

  if (gone) return null;

  return (
    <aside className="tq-qn" data-show={show} aria-label={t.label} aria-hidden={!show} inert={!show}>
      <button type="button" className="tq-qn__x" onClick={close} aria-label={t.close}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <p className="tq-qn__eyebrow">{t.eyebrow}</p>
      <p className="tq-qn__title">{t.title}</p>
      <p className="tq-qn__body">{t.body}</p>
      <div className="tq-qn__row">
        <a className="tq-qn__cta" href={SHOP_URL} target="_blank" rel="noopener" onClick={close}>
          {t.cta} <span aria-hidden="true">↗</span>
        </a>
        <button type="button" className="tq-qn__later" onClick={close}>
          {t.later}
        </button>
      </div>
    </aside>
  );
}
