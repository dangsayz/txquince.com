"use client";

/**
 * WhatsAppFloat — a small "WhatsApp" capsule pinned to the bottom corner of
 * the landing page, so a mom can reach us in one tap from anywhere on it.
 *
 * - Appears once she has scrolled past most of the hero (the hero has its own
 *   WhatsApp pill), and steps aside while the booking panel is on screen
 *   (`hidden`), which has its own bottom bar.
 * - On phones it sits above the "Reserve your date" dock, never on top of it.
 * - The × closes it for the rest of the visit (sessionStorage; if storage is
 *   blocked it simply closes for this page view).
 * - Each tap is tracked as contact_whatsapp ("float"), which the dashboard
 *   counts on its own "whatsapp" row.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { CONTACT_COPY, CONTACT_EVENT, whatsappHref, type ContactLang } from "@/lib/contact";
import { trackEvent } from "@/components/Tracker";
import { SocialIcon } from "@/components/owners/Owners";
import "./whatsapp-float.css";

const KEY = "txq_wa_float_closed";
const COPY = {
  en: { label: "WhatsApp", close: "Close the WhatsApp button" },
  es: { label: "WhatsApp", close: "Cerrar el botón de WhatsApp" },
} as const;

// "Closed for this visit", shared by every copy of the button on the page.
const listeners = new Set<() => void>();
let closedThisView = false;
function readClosed(): boolean {
  if (closedThisView) return true;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function closeForVisit() {
  closedThisView = true;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* closes for this page view */
  }
  listeners.forEach((fn) => fn());
}

export function WhatsAppFloat({ lang, hidden = false }: { lang: ContactLang; hidden?: boolean }) {
  // Server render: closed (renders nothing), so nothing flashes before we know.
  const closed = useSyncExternalStore(subscribe, readClosed, () => true);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.7);
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (closed) return null;
  const show = past && !hidden;
  const c = COPY[lang];

  return (
    <div className="tq-waf" data-show={show} aria-hidden={!show || undefined} inert={!show || undefined}>
      <a
        className="tq-waf__chat"
        href={whatsappHref(lang)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={CONTACT_COPY[lang].whatsappAria}
        onClick={() => trackEvent(CONTACT_EVENT.whatsapp, "float")}
      >
        <SocialIcon name="whatsapp" />
        <span>{c.label}</span>
      </a>
      <button
        type="button"
        className="tq-waf__x"
        aria-label={c.close}
        onClick={closeForVisit}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
