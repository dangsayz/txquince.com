"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { trackEvent } from "@/components/Tracker";

/**
 * DateChecker — the homepage "is her date still open?" micro-commitment.
 * Pulls the live taken-dates list (same API the reserve form uses) and answers
 * instantly. Honest by design: an open date is "looks open — request it" (the
 * operator still confirms; the atomic hold is the real guard), and if the
 * availability API is unreachable we fall back to the personal-reply path
 * instead of guessing.
 */
export function DateChecker({ heading, body }: { heading: string; body: string }) {
  const inputId = useId();
  const [taken, setTaken] = useState<Set<string> | null>(null);
  const [failed, setFailed] = useState(false);
  const [date, setDate] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d: { takenDates?: string[] }) => {
        if (!alive) return;
        if (Array.isArray(d.takenDates)) setTaken(new Set(d.takenDates));
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const { min, max } = useMemo(() => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const maxD = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    return { min: iso(today), max: iso(maxD) };
  }, []);

  const state: "idle" | "open" | "taken" | "unknown" = !date
    ? "idle"
    : failed || taken === null
      ? "unknown"
      : taken.has(date)
        ? "taken"
        : "open";

  const pretty = useMemo(() => {
    if (!date) return "";
    const d = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }, [date]);

  function onPick(next: string) {
    setDate(next);
    if (next) {
      const verdict =
        failed || taken === null ? "unknown" : taken.has(next) ? "taken" : "open";
      trackEvent("date_checked", `${next}:${verdict}`);
    }
  }

  return (
    // Chrome-free: the surrounding section provides the composition. One quiet
    // concierge moment — small label, statement, a single underlined field.
    <div className="mx-auto max-w-xl text-center">
      <p className="text-[0.66rem] uppercase tracking-[0.3em] text-ink-faint">Availability</p>
      <h2
        className="mt-5 font-display text-ink text-balance"
        style={{ fontSize: "clamp(2rem,4.2vw,3.4rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
      >
        {heading}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">{body}</p>

      <div className="mx-auto mt-9 max-w-sm">
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          Her quinceañera date
        </label>
        <input
          id={inputId}
          type="date"
          value={date}
          min={min}
          max={max}
          onChange={(e) => onPick(e.target.value)}
          className="mt-2 w-full border-b border-line bg-transparent px-0 py-3 text-center text-lg text-ink transition-colors focus:border-wine focus:outline-none"
        />
      </div>

      {/* instant verdict */}
      <div aria-live="polite" className="mt-7 min-h-[5.5rem]">
        {state === "open" ? (
          <div className="fade-in-soft">
            <p className="text-base text-ink">
              <span className="font-medium text-emerald-800">✓ {pretty} looks open</span> — one
              celebration per day, so it goes to whoever holds it first.
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href={`/reserve?date=${date}`}
                className="rounded-full bg-ink px-7 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-cream transition-colors hover:bg-wine"
              >
                Hold this date
              </Link>
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              No payment now — I confirm personally and send a secure deposit link.
            </p>
          </div>
        ) : state === "taken" ? (
          <div className="fade-in-soft">
            <p className="text-base text-ink">
              <span className="font-medium text-wine-deep">{pretty} is already reserved.</span>{" "}
              Join the cancellation waitlist or tell me about a nearby date.
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href="/check-your-date"
                className="rounded-full border border-ink px-7 py-3.5 text-[0.72rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-wine hover:text-wine"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        ) : state === "unknown" ? (
          <div className="fade-in-soft">
            <p className="text-base text-ink-soft">
              Tell me your date and I&apos;ll check it personally — replies within 24 hours.
            </p>
            <div className="mt-5 flex justify-center">
              <Link
                href="/check-your-date"
                className="rounded-full bg-ink px-7 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-cream transition-colors hover:bg-wine"
              >
                Check my date
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
