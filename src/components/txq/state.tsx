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
import { ADD_ON_IDS, TIER_IDS, normalizeCrew, type Crew } from "@/lib/commission";
import { usePriceBook } from "@/components/PriceBookProvider";
import { HREFLANG } from "@/lib/hreflang";

/* ------------------------------------------------------------------ */
/* Language + package selection + the booking panel's answers           */
/* ------------------------------------------------------------------ */

/** Steps of the booking panel: Package, Hours & extras, Date, Your details, Send request. */
export const BOOKING_STEPS = 5;

/** Everything the family typed into the booking panel (the package itself is tier/addOns/hours/crew). */
export type BookingDraft = {
  /** Step on screen (0-based). */
  step: number;
  /** Furthest step reached; steps up to here can be clicked. */
  reached: number;
  date: string | null;
  city: string;
  venue: string;
  /** "HH:MM" from the time picker ("" = not given). */
  startTime: string;
  name: string;
  honoree: string;
  email: string;
  phone: string;
  prefLang: Lang | null;
  note: string;
  share: boolean;
};

export const EMPTY_BOOKING: BookingDraft = {
  step: 0,
  reached: 0,
  date: null,
  city: "",
  venue: "",
  startTime: "",
  name: "",
  honoree: "",
  email: "",
  phone: "",
  prefLang: null,
  note: "",
  share: true,
};

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
  /** Hours on the day: the package's included hours until the family adds more. */
  hours: number;
  /** Set hours (for `forTier` when restoring a saved draft; defaults to the current package). */
  setHours: (h: number, forTier?: TierId) => void;
  /** The booking panel's answers; going back and forth between steps keeps them. */
  booking: BookingDraft;
  updateBooking: (patch: Partial<BookingDraft>) => void;
  /** Clear the booking answers and the package choice (after a request is sent). */
  resetBooking: () => void;
  /**
   * Choose a package from anywhere ("Book this", the comparison table, a
   * `#book-<package>` link): selects it and opens the panel at Hours & extras.
   */
  pickPackage: (tier: TierId) => void;
  /** Bumps on every pickPackage, so the panel can bring itself into view. */
  pickTick: number;
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
  const tag = HREFLANG[l];
  const link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${tag}"]`);
  if (!link?.href) return null;
  try {
    const u = new URL(link.href);
    return `${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

/* Booking draft (sessionStorage). Everything read back is re-checked: a draft
   is only ever a convenience, and the server re-validates the real request. */
const DRAFT_KEY = "txq:booking-draft";
type Draft = {
  tier: TierId;
  addOns: AddOnId[];
  crew: Crew | null;
  hours: { tier: TierId; h: number } | null;
  booking: BookingDraft;
};

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : "");
const isTier = (v: unknown): v is TierId => typeof v === "string" && (TIER_IDS as readonly string[]).includes(v);
const clampStep = (v: unknown) => (Number.isInteger(v) ? Math.max(0, Math.min(BOOKING_STEPS - 1, v as number)) : 0);

function readDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Record<string, unknown>;
    const b = (d.booking ?? {}) as Record<string, unknown>;
    if (!isTier(d.tier)) return null;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(str(b.date, 10)) && str(b.date, 10) > isoDate(new Date()) ? str(b.date, 10) : null;
    const reached = clampStep(b.reached);
    const crew = d.crew as Partial<Crew> | null;
    const hours = d.hours as { tier?: unknown; h?: unknown } | null;
    return {
      tier: d.tier,
      addOns: Array.isArray(d.addOns)
        ? d.addOns.filter((a): a is AddOnId => (ADD_ON_IDS as readonly unknown[]).includes(a))
        : [],
      crew: crew && Number.isFinite(crew.photo) && Number.isFinite(crew.motion) ? (crew as Crew) : null,
      hours: hours && isTier(hours.tier) && Number.isFinite(hours.h) ? { tier: hours.tier, h: hours.h as number } : null,
      booking: {
        step: Math.min(clampStep(b.step), reached),
        reached,
        date,
        city: str(b.city, 10),
        venue: str(b.venue, 160),
        startTime: /^\d{2}:\d{2}$/.test(str(b.startTime, 5)) ? str(b.startTime, 5) : "",
        name: str(b.name, 120),
        honoree: str(b.honoree, 80),
        email: str(b.email, 200),
        phone: str(b.phone, 40),
        prefLang: b.prefLang === "en" || b.prefLang === "es" ? b.prefLang : null,
        note: str(b.note, 2000),
        share: b.share !== false,
      },
    };
  } catch {
    return null;
  }
}

function writeDraft(d: Draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* storage full or blocked — the panel works without it */
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
  const prices = usePriceBook();
  const [tier, setTier] = useState<TierId>("cinema");
  const [addOns, setAddOnsRaw] = useState<AddOnId[]>([]);
  const [crewRaw, setCrewRaw] = useState<Crew | null>(null);
  // The mix always fits the chosen tier's included crew (default mix until chosen).
  const crew = useMemo(() => normalizeCrew(tier, crewRaw), [tier, crewRaw]);
  const setAddOns = useCallback((a: AddOnId[]) => setAddOnsRaw(a), []);
  const setCrew = useCallback((c: Crew) => setCrewRaw(c), []);
  // Hours belong to the package they were chosen on; switching packages starts
  // again from that package's included hours.
  const [hoursRaw, setHoursRaw] = useState<{ tier: TierId; h: number } | null>(null);
  const hours = prices.normalizeHours(tier, hoursRaw && hoursRaw.tier === tier ? hoursRaw.h : null);
  const setHours = useCallback((h: number, forTier?: TierId) => setHoursRaw({ tier: forTier ?? tier, h }), [tier]);

  const [booking, setBooking] = useState<BookingDraft>(EMPTY_BOOKING);
  const [pickTick, setPickTick] = useState(0);
  const updateBooking = useCallback((patch: Partial<BookingDraft>) => setBooking((b) => ({ ...b, ...patch })), []);
  const pickPackage = useCallback((next: TierId) => {
    setTier(next);
    setBooking((b) => ({ ...b, step: 1, reached: Math.max(b.reached, 1) }));
    setPickTick((n) => n + 1);
  }, []);
  const resetBooking = useCallback(() => {
    setBooking(EMPTY_BOOKING);
    setAddOnsRaw([]);
    setHoursRaw(null);
    setCrewRaw(null);
  }, []);

  // A draft of the booking survives a reload in this tab (sessionStorage — a
  // per-tab convenience; the request itself is the only thing that's saved).
  // Restored after mount so the server render (package step) never mismatches.
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    // A microtask: after this commit, but before any timer (a `#book-…` link
    // is applied on a timer, so it wins over an older draft).
    queueMicrotask(() => {
      const d = readDraft();
      if (d) {
        setTier(d.tier);
        setAddOnsRaw(d.addOns);
        setCrewRaw(d.crew);
        setHoursRaw(d.hours);
        setBooking(d.booking);
      }
      setDraftReady(true);
    });
  }, []);
  useEffect(() => {
    if (!draftReady) return;
    writeDraft({ tier, addOns, crew: crewRaw, hours: hoursRaw, booking });
  }, [draftReady, tier, addOns, crewRaw, hoursRaw, booking]);

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

  // Copy carries price tokens; fill them from the live book once per language/book.
  const t = useMemo(() => prices.fillDeep(COPY[lang]), [prices, lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      tier,
      setTier,
      addOns,
      toggleAddOn,
      setAddOns,
      crew,
      setCrew,
      hours,
      setHours,
      booking,
      updateBooking,
      resetBooking,
      pickPackage,
      pickTick,
      isHome,
      homeHref,
    }),
    [
      lang,
      setLang,
      t,
      tier,
      addOns,
      toggleAddOn,
      setAddOns,
      crew,
      setCrew,
      hours,
      setHours,
      booking,
      updateBooking,
      resetBooking,
      pickPackage,
      pickTick,
      isHome,
      homeHref,
    ],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

/**
 * The family's current selection priced with the live book (total, deposit,
 * rest, hours). UI-independent: any package/booking view can read it.
 */
export function useQuote() {
  const { tier, addOns, hours } = useSite();
  const { quote } = usePriceBook();
  return useMemo(() => quote(tier, addOns, hours), [quote, tier, addOns, hours]);
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
