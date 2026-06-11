"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const FIRST_TOUCH_KEY = "txq_first_touch";

/**
 * Record where the visitor FIRST arrived from — once, on their first page view,
 * and never overwritten. Forms read this so a booking/lead carries its true
 * acquisition source (Instagram bio vs directory vs Google), not the page the
 * form happens to live on.
 */
function captureFirstTouch(pathname: string, search: URLSearchParams) {
  try {
    if (localStorage.getItem(FIRST_TOUCH_KEY)) return;
    const utmSource = search.get("utm_source");
    let refHost = "";
    try {
      refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    } catch {
      refHost = "";
    }
    if (refHost && refHost === location.hostname.replace(/^www\./, "")) refHost = ""; // ignore self
    const source = utmSource || refHost || "direct";
    const ft = {
      source,
      medium: search.get("utm_medium") || (utmSource ? "campaign" : refHost ? "referral" : "none"),
      campaign: search.get("utm_campaign") || "",
      referrer: document.referrer || "",
      landing: pathname,
      ts: new Date().toISOString(),
    };
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(ft));
  } catch {
    /* never break the page */
  }
}

/** Read the stored first-touch attribution (for attaching to form submissions). */
export function getFirstTouch(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

/** A stable per-tab session id (sessionStorage, no cookies). */
function sessionId(): string {
  try {
    const k = "txq_sid";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

function post(body: Record<string, unknown>) {
  try {
    const json = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([json], { type: "application/json" }));
    } else {
      void fetch("/api/track", { method: "POST", body: json, keepalive: true, headers: { "content-type": "application/json" } });
    }
  } catch {
    /* never break the page */
  }
}

/** First-party page-view beacon. Fires on every route change (App Router). */
export function Tracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const last = useRef<string>("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    captureFirstTouch(pathname, new URLSearchParams(search.toString()));
    const key = `${pathname}?${search.toString()}`;
    if (last.current === key) return;
    last.current = key;

    post({
      t: "pv",
      path: pathname,
      ref: document.referrer || null,
      sid: sessionId(),
      us: search.get("utm_source"),
      um: search.get("utm_medium"),
      uc: search.get("utm_campaign"),
    });
  }, [pathname, search]);

  // Delegated CTA tracking: any click on a link to /reserve is booking intent.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href*="/reserve"]');
      if (a) trackEvent("cta_clicked", a.getAttribute("href") || "/reserve");
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

/** Fire-and-forget intent event (form starts, CTA clicks, shares). */
export function trackEvent(eventType: string, target?: string) {
  if (typeof window === "undefined") return;
  post({ t: "ev", et: eventType, path: window.location.pathname, tg: target ?? null, sid: sessionId() });
}
