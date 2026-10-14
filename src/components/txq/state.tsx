"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { COPY, type Copy } from "./copy";
import type { AddOnId, Lang, TierId } from "./data";
import { normalizeCrew, type Crew } from "@/lib/commission";

/* ------------------------------------------------------------------ */
/* Language + commission selection (shared by Commissions and Intake)  */
/* ------------------------------------------------------------------ */

type SiteState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Copy;
  tier: TierId;
  setTier: (t: TierId) => void;
  addOns: AddOnId[];
  toggleAddOn: (a: AddOnId) => void;
  setAddOns: (a: AddOnId[]) => void;
  /** Photographer / videographer mix of the tier's included crew. */
  crew: Crew;
  setCrew: (c: Crew) => void;
  /** True on the homepages (/ and /es), where every section lives on one page. */
  isHome: boolean;
  /** Link to a homepage section from anywhere: "#intake" on home, "/#intake" or "/es#intake" elsewhere. */
  homeHref: (hash: string) => string;
};

const SiteCtx = createContext<SiteState | null>(null);
const LANG_KEY = "txq:lang";
const LANG_EVENT = "txq:lang";

/* The visitor's language lives in localStorage (a per-viewer convenience),
   read through an external store so SSR renders the URL's language and the
   client switches without a hydration mismatch. A Spanish URL (/es) always
   opens in Spanish; the root URL follows the visitor's saved choice. */
let memoryLang: Lang | null = null;

function readLang(urlLang: Lang): Lang {
  if (memoryLang) return memoryLang;
  if (urlLang === "es") return "es";
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "es") return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}
function subscribeLang(cb: () => void) {
  window.addEventListener(LANG_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(LANG_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The other language's version of this page, from the hreflang links Next renders in <head>. */
function alternateHref(l: Lang): string | null {
  const tag = l === "es" ? "es-MX" : "en-US";
  const link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${tag}"]`);
  if (!link?.href) return null;
  try {
    const u = new URL(link.href);
    return `${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

export function SiteProvider({
  children,
  urlLang = "en",
  isHome = false,
}: {
  children: ReactNode;
  urlLang?: Lang;
  isHome?: boolean;
}) {
  // Homepages switch language in place and remember it; every other page's
  // language is its URL (content is rendered per language on the server).
  const stored = useSyncExternalStore(
    subscribeLang,
    () => readLang(urlLang),
    () => urlLang,
  );
  const lang = isHome ? stored : urlLang;
  const [tier, setTier] = useState<TierId>("cinema");
  const [addOns, setAddOnsRaw] = useState<AddOnId[]>([]);
  const [crewRaw, setCrewRaw] = useState<Crew | null>(null);
  // The mix always fits the chosen tier's included crew (default mix until chosen).
  const crew = useMemo(() => normalizeCrew(tier, crewRaw), [tier, crewRaw]);
  const setAddOns = useCallback((a: AddOnId[]) => setAddOnsRaw(a), []);
  const setCrew = useCallback((c: Crew) => setCrewRaw(c), []);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore — the event below still switches this tab */
    }
    // Without storage, readLang falls back; keep an in-memory override.
    memoryLang = l;
    if (!isHome && l !== urlLang) {
      // Jump to this page's translation, or that language's homepage.
      window.location.assign(alternateHref(l) ?? (l === "es" ? "/es" : "/"));
      return;
    }
    window.dispatchEvent(new Event(LANG_EVENT));
  }, [isHome, urlLang]);

  const homeHref = useCallback(
    (hash: string) => (isHome ? hash : `${lang === "es" ? "/es" : "/"}${hash}`),
    [isHome, lang],
  );

  const toggleAddOn = useCallback((a: AddOnId) => {
    setAddOnsRaw((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: COPY[lang],
      tier,
      setTier,
      addOns,
      toggleAddOn,
      setAddOns,
      crew,
      setCrew,
      isHome,
      homeHref,
    }),
    [lang, setLang, tier, addOns, toggleAddOn, setAddOns, crew, setCrew, isHome, homeHref],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Availability — read from the studio calendar (/api/availability)    */
/* ------------------------------------------------------------------ */

export type Availability = {
  ready: boolean;
  taken: Set<string>;
  openSaturdays: number;
  limited: boolean;
  /** Re-read the studio calendar now (e.g. right before checkout). */
  refresh: () => void;
  /** The server just reported this date as reserved — reflect it immediately. */
  markTaken: (iso: string) => void;
};

const AvailCtx = createContext<Availability>({
  ready: false,
  taken: new Set(),
  openSaturdays: 0,
  limited: false,
  refresh: () => {},
  markTaken: () => {},
});

/** Below this many open Saturdays in the next year, the status reads "Limited". */
const LIMITED_THRESHOLD = 12;
/** Re-poll the calendar this often while the tab is visible. */
const POLL_MS = 60_000;

export function isoDate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function countOpenSaturdays(taken: Set<string>) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setFullYear(end.getFullYear() + 1);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  let n = 0;
  for (; d <= end; d.setDate(d.getDate() + 7)) if (!taken.has(isoDate(d))) n++;
  return n;
}

type Calendar = { ready: boolean; taken: Set<string>; local: Set<string> };

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  // `local` keeps dates the server just refused, so a stale poll can't re-open them.
  const [cal, setCal] = useState<Calendar>({ ready: false, taken: new Set(), local: new Set() });

  const load = useCallback(() => {
    fetch("/api/availability", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { takenDates: [] }))
      .then((j: { takenDates?: unknown }) => {
        const dates = Array.isArray(j.takenDates)
          ? j.takenDates.filter((x): x is string => typeof x === "string")
          : [];
        setCal((c) => ({ ...c, ready: true, taken: new Set(dates) }));
      })
      // Never block the page: an unreachable calendar reads as open, and the
      // atomic hold in /api/commission is the real guard against double-booking.
      .catch(() => setCal((c) => ({ ...c, ready: true })));
  }, []);

  // Live-ish calendar: on mount, every minute while visible, and on return to the tab.
  useEffect(() => {
    load();
    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const markTaken = useCallback((iso: string) => {
    setCal((c) => ({ ...c, local: new Set(c.local).add(iso) }));
  }, []);

  const value = useMemo<Availability>(() => {
    const taken = cal.local.size ? new Set([...cal.taken, ...cal.local]) : cal.taken;
    const openSaturdays = countOpenSaturdays(taken);
    return {
      ready: cal.ready,
      taken,
      openSaturdays,
      limited: openSaturdays < LIMITED_THRESHOLD,
      refresh: load,
      markTaken,
    };
  }, [cal, load, markTaken]);

  return <AvailCtx.Provider value={value}>{children}</AvailCtx.Provider>;
}

export const useAvailability = () => useContext(AvailCtx);
