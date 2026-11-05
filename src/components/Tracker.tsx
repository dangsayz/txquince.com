"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { attributedSearch } from "@/lib/bio-utm";
import { normalizeRef } from "@/lib/ref-tag";

const FIRST_TOUCH_KEY = "txq_first_touch";
const REF_KEY = "txq_ref";

/**
 * Remember the latest `?ref=` link tag this browser arrived with (overwritten
 * by each new tagged link), so it rides along with the form she fills in
 * later, on any page.
 */
function captureRef(pathname: string, search: URLSearchParams) {
  try {
    const ref = normalizeRef(search.get("ref"));
    if (!ref) return;
    localStorage.setItem(REF_KEY, JSON.stringify({ ref, refLanding: pathname, refTs: new Date().toISOString() }));
  } catch {
    /* never break the page */
  }
}

function storedRef(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(REF_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}

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
    const refTag = normalizeRef(search.get("ref"));
    const source = utmSource || refTag || refHost || "direct";
    const ft = {
      source,
      medium: search.get("utm_medium") || (utmSource ? "campaign" : refTag ? "ref" : refHost ? "referral" : "none"),
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

/**
 * Read the stored attribution for a form submission: the first touch, plus the
 * latest ?ref= tag (ref, refLanding, refTs) when there is one.
 */
export function getFirstTouch(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    const ft = raw ? (JSON.parse(raw) as Record<string, string>) : null;
    const ref = storedRef();
    if (!ft && !ref) return null;
    return { ...(ft ?? {}), ...(ref ?? {}) };
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

/**
 * A stable, anonymous id for this browser (localStorage, no cookie, no PII),
 * so the dashboard can count unique visitors, not just visits (a visit is one
 * tab's session; one family opening the link three times is 3 visits, 1 visitor).
 */
function visitorId(): string | null {
  try {
    const k = "txq_vid";
    let v = localStorage.getItem(k);
    if (!v) {
      v = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return null;
  }
}

/** The owner's own browsing never counts: /admin marks this browser (EditMode). */
function isOwnerBrowser(): boolean {
  try {
    return Boolean(localStorage.getItem("txq_admin"));
  } catch {
    return false;
  }
}

function post(body: Record<string, unknown>) {
  if (isOwnerBrowser()) return;
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
    // A campaign landing page (the Instagram bio, /links) implies its UTM when
    // the visit arrives without one — Instagram often strips the referrer.
    const params = attributedSearch(pathname, new URLSearchParams(search.toString()));
    captureFirstTouch(pathname, params);
    captureRef(pathname, params);
    const key = `${pathname}?${search.toString()}`;
    if (last.current === key) return;
    last.current = key;

    post({
      t: "pv",
      path: pathname,
      ref: document.referrer || null,
      sid: sessionId(),
      vid: visitorId(),
      // A ?ref= tag counts as the visit's source when there is no utm_source.
      us: params.get("utm_source") || normalizeRef(params.get("ref")),
      um: params.get("utm_medium") || (!params.get("utm_source") && normalizeRef(params.get("ref")) ? "ref" : null),
      uc: params.get("utm_campaign"),
    });
  }, [pathname, search]);

  // "Saw the work" on pages that show it inline (homepage galleries, films,
  // packages): once per section per session, when it reaches the middle of the screen.
  useEffect(() => {
    if (pathname.startsWith("/admin") || typeof IntersectionObserver === "undefined") return;
    let io: IntersectionObserver | null = null;
    const t = window.setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>(".fv, #archive, #cinema, #commissions, [data-track-view]");
      if (!els.length) return;
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (!en.isIntersecting) continue;
            const el = en.target as HTMLElement;
            const label = el.dataset.trackView || el.id || "favorites";
            const key = `txq_wv:${pathname}:${label}`;
            io?.unobserve(el);
            try {
              if (sessionStorage.getItem(key)) continue;
              sessionStorage.setItem(key, "1");
            } catch {
              /* still count it */
            }
            trackEvent("work_viewed", label);
          }
        },
        { rootMargin: "-35% 0px -35% 0px" },
      );
      els.forEach((el) => io!.observe(el));
    }, 600);
    return () => {
      window.clearTimeout(t);
      io?.disconnect();
    };
  }, [pathname]);

  // Delegated CTA tracking: any click on a link to the intake is booking intent.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href*="#intake"]');
      if (a) trackEvent("cta_clicked", a.getAttribute("href") || "/#intake");
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

/** Fire-and-forget intent event (form starts, CTA clicks, shares). */
export function trackEvent(eventType: string, target?: string) {
  if (typeof window === "undefined") return;
  post({ t: "ev", et: eventType, path: window.location.pathname, tg: target ?? null, sid: sessionId(), vid: visitorId() });
}
