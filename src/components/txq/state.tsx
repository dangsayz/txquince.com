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
};

const SiteCtx = createContext<SiteState | null>(null);
const LANG_KEY = "txq:lang";
const LANG_EVENT = "txq:lang";

/* The visitor's language lives in localStorage (a per-viewer convenience),
   read through an external store so SSR renders English and the client
   switches without a hydration mismatch. */
let memoryLang: Lang | null = null;

function readLang(): Lang {
  if (memoryLang) return memoryLang;
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

export function SiteProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, readLang, () => "en" as Lang);
  const [tier, setTier] = useState<TierId>("cinema");
  const [addOns, setAddOns] = useState<AddOnId[]>([]);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore — the event below still switches this tab */
    }
    // Without storage, readLang falls back; keep an in-memory override.
    memoryLang = l;
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  const toggleAddOn = useCallback((a: AddOnId) => {
    setAddOns((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: COPY[lang], tier, setTier, addOns, toggleAddOn }),
    [lang, setLang, tier, addOns, toggleAddOn],
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
};

const AvailCtx = createContext<Availability>({
  ready: false,
  taken: new Set(),
  openSaturdays: 0,
  limited: false,
});

/** Below this many open Saturdays in the next year, the status reads "Limited". */
const LIMITED_THRESHOLD = 12;

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

export function AvailabilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Availability>({
    ready: false,
    taken: new Set(),
    openSaturdays: 0,
    limited: false,
  });

  useEffect(() => {
    let alive = true;
    const settle = (dates: string[]) => {
      if (!alive) return;
      const taken = new Set(dates);
      const openSaturdays = countOpenSaturdays(taken);
      setState({ ready: true, taken, openSaturdays, limited: openSaturdays < LIMITED_THRESHOLD });
    };
    fetch("/api/availability")
      .then((r) => (r.ok ? r.json() : { takenDates: [] }))
      .then((j: { takenDates?: unknown }) =>
        settle(Array.isArray(j.takenDates) ? j.takenDates.filter((x): x is string => typeof x === "string") : []),
      )
      // Never block the page: an unreachable calendar reads as open, and the
      // studio confirms every date by hand before anything is held.
      .catch(() => settle([]));
    return () => {
      alive = false;
    };
  }, []);

  return <AvailCtx.Provider value={state}>{children}</AvailCtx.Provider>;
}

export const useAvailability = () => useContext(AvailCtx);
