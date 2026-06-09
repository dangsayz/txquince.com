"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
