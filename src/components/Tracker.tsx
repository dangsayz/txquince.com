"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { attributedSearch } from "@/lib/bio-utm";
import { normalizeSrc } from "@/lib/src-tag";

const FIRST_TOUCH_KEY = "txq_first_touch";
const SRC_KEY = "txq_src";

/**
 * Remember the latest `?src=` tag this browser arrived with (overwritten by
 * each new tagged link), so it rides along with the form she fills in later,
 * on any page (the budget form included, across all its steps).
 */
function captureSrc(pathname: string, search: URLSearchParams) {
  try {
    const src = normalizeSrc(search.get("src"));
    if (!src) return;
    localStorage.setItem(SRC_KEY, JSON.stringify({ src, srcLanding: pathname, srcTs: new Date().toISOString() }));
  } catch {
    /* never break the page */
  }
}

function storedSrc(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(SRC_KEY);
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
    const srcTag = normalizeSrc(search.get("src"));
    const source = utmSource || srcTag || refHost || "direct";
    const ft = {
      source,
      medium: search.get("utm_medium") || (utmSource ? "campaign" : srcTag ? "src" : refHost ? "referral" : "none"),
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
 * latest ?src= tag (src, srcLanding, srcTs) when there is one, plus the page the
 * form was sent from (`page`) and this browser's anonymous visitor id (`vid`),
 * which lets the admin show the pages she looked at before inquiring.
 */
export function getFirstTouch(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    const ft = raw ? (JSON.parse(raw) as Record<string, string>) : null;
    const src = storedSrc();
    const vid = visitorId();
    return { ...(ft ?? {}), ...(src ?? {}), page: window.location.pathname, ...(vid ? { vid } : {}) };
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

/** A browser driven by a test tool (Playwright, Selenium, the secret shopper) is not a family. */
function isAutomated(): boolean {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

function post(body: Record<string, unknown>) {
  if (isOwnerBrowser() || isAutomated()) return;
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
    captureSrc(pathname, params);
    const key = `${pathname}?${search.toString()}`;
    if (last.current === key) return;
    last.current = key;

    post({
      t: "pv",
      path: pathname,
      ref: document.referrer || null,
      sid: sessionId(),
      vid: visitorId(),
      // A ?src= tag counts as the visit's source when there is no utm_source.
      us: params.get("utm_source") || normalizeSrc(params.get("src")),
      um: params.get("utm_medium") || (!params.get("utm_source") && normalizeSrc(params.get("src")) ? "src" : null),
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

  // How each page is used: active seconds (tab visible, someone moved, scrolled,
  // tapped or typed in the last 30 s) and the deepest scroll (% of the page).
  // Sent once per page view, when she leaves the page or hides the tab, as an
  // "engaged" event: "t=<seconds>;d=<percent>". Plus up to 25 taps per page
  // view ("click", the link or button's own words). Feeds /admin "What visitors do".
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const page = pathname;
    // A family's own pages (plan, booking, review, saved) can show names in
    // link text: count time and scroll there, never what was tapped.
    const personal = /^\/(es\/)?(plan\/|booking\/|review\/|saved)/.test(page);
    const IDLE_MS = 30_000;
    let active = 0;
    let lastInput = Date.now();
    let depth = 0;
    let clicks = 0;
    let sent = false;
    const measure = () => {
      const doc = document.documentElement;
      const total = Math.max(doc.scrollHeight, 1);
      depth = Math.max(depth, Math.min(100, ((window.scrollY + window.innerHeight) / total) * 100));
    };
    const touch = () => {
      lastInput = Date.now();
    };
    const onScroll = () => {
      touch();
      measure();
    };
    const onClick = (e: MouseEvent) => {
      touch();
      if (personal || clicks >= 25) return;
      const el = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("a, button, summary, [role='button']");
      if (!el || el.closest("input, textarea, select")) return;
      const label = clickLabel(el);
      if (!label) return;
      clicks += 1;
      trackEvent("click", label, page);
    };
    const flush = () => {
      if (sent || active < 1) return;
      sent = true;
      trackEvent("engaged", `t=${Math.min(active, 1800)};d=${Math.round(depth)}`, page);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastInput < IDLE_MS) active += 1;
    }, 1000);
    const first = window.setTimeout(measure, 800); // short pages count as read once they render
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", touch, { passive: true });
    window.addEventListener("mousemove", touch, { passive: true });
    window.addEventListener("keydown", touch);
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.clearInterval(timer);
      window.clearTimeout(first);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", touch);
      window.removeEventListener("mousemove", touch);
      window.removeEventListener("keydown", touch);
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
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

/** Fire-and-forget intent event (form starts, CTA clicks, shares). `path` defaults to the current page. */
export function trackEvent(eventType: string, target?: string, path?: string) {
  if (typeof window === "undefined") return;
  post({ t: "ev", et: eventType, path: path ?? window.location.pathname, tg: target ?? null, sid: sessionId(), vid: visitorId() });
}

/** What a tap was on, in the page's own words (never a form value). */
function clickLabel(el: HTMLElement): string | null {
  const own = el.dataset.trackLabel || el.getAttribute("aria-label");
  const text = (own || el.innerText || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 60);
  const href = el.getAttribute("href");
  return href ? href.slice(0, 60) : null;
}
