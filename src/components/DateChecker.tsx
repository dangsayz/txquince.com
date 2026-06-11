"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { trackEvent } from "@/components/Tracker";

/**
 * DateChecker — the homepage "is her date still open?" moment.
 *
 * Not a lonely form field: a live board of the next sixteen Saturdays (the
 * quinceañera day), each one tappable, taken dates struck through — so the
 * scarcity is VISIBLE, not claimed. An exact-date input handles non-Saturday
 * celebrations. Honest by design: an open date is "looks open — hold it" (the
 * operator confirms; the atomic hold is the real guard), and if the
 * availability API is unreachable we fall back to the personal-reply path.
 */

type Sat = { iso: string; day: number; mon: string };

function isoOf(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function DateChecker({ heading, body }: { heading: string; body: string }) {
  const inputId = useId();
  const [taken, setTaken] = useState<Set<string> | null>(null);
  const [failed, setFailed] = useState(false);
  const [date, setDate] = useState("");
  // Defer the Saturday board to the client so SSR markup never disagrees
  // with the visitor's clock.
  const [saturdays, setSaturdays] = useState<Sat[] | null>(null);

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

    const next: Sat[] = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + (((6 - d.getDay() + 7) % 7) || 7)); // next Saturday
    for (let i = 0; i < 16; i++) {
      next.push({
        iso: isoOf(d),
        day: d.getDate(),
        mon: d.toLocaleDateString("en-US", { month: "short" }),
      });
      d.setDate(d.getDate() + 7);
    }
    setSaturdays(next);

    return () => {
      alive = false;
    };
  }, []);

  const { min, max } = useMemo(() => {
    const today = new Date();
    const maxD = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    return { min: isoOf(today), max: isoOf(maxD) };
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

  const openCount =
    saturdays && taken ? saturdays.filter((s) => !taken.has(s.iso)).length : null;

  function onPick(next: string) {
    setDate(next);
    if (next) {
      const verdict =
        failed || taken === null ? "unknown" : taken.has(next) ? "taken" : "open";
      trackEvent("date_checked", `${next}:${verdict}`);
    }
  }

  const boardReady = !failed && taken !== null && saturdays !== null;

  return (
    // Chrome-free: the surrounding section provides the composition. One
    // centered concierge moment — statement, the living board, one quiet field.
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[0.66rem] uppercase tracking-[0.3em] text-ink-faint">Availability</p>
      <h2
        className="mt-5 font-display text-ink text-balance"
        style={{ fontSize: "clamp(2rem,4.2vw,3.4rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
      >
        {heading}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">{body}</p>

      {/* ---- The Saturday board — live, tappable, struck-through when gone ---- */}
      {boardReady ? (
        <div className="fade-in-soft mt-10">
          <p className="text-[0.62rem] uppercase tracking-[0.26em] text-ink-faint">
            The next sixteen Saturdays
            {openCount !== null ? (
              <>
                {" "}
                — <span className="text-wine-deep">{openCount} still open</span>
              </>
            ) : null}
          </p>
          <div
            className="mt-5 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible"
            style={{ scrollbarWidth: "none" }}
            role="listbox"
            aria-label="Upcoming Saturdays"
          >
            {saturdays.map((s) => {
              const isTaken = taken.has(s.iso);
              const selected = date === s.iso;
              return (
                <button
                  key={s.iso}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onPick(s.iso)}
                  aria-label={`Saturday ${s.mon} ${s.day} — ${isTaken ? "already reserved" : "open"}`}
                  className={`group/sat flex min-w-[3.6rem] shrink-0 flex-col items-center border px-2.5 pb-2.5 pt-2 transition-colors duration-300 ${
                    selected
                      ? "border-ink bg-ink text-cream"
                      : isTaken
                        ? "border-ink/10 text-ink/35 hover:border-ink/20"
                        : "border-ink/15 text-ink hover:border-wine hover:text-wine"
                  }`}
                >
                  <span className={`text-[0.52rem] uppercase tracking-[0.2em] ${selected ? "text-cream/70" : "text-ink-faint"}`}>
                    {s.mon}
                  </span>
                  <span className="relative mt-1 font-display text-[1.45rem] leading-none">
                    {s.day}
                    {isTaken ? (
                      <span
                        aria-hidden
                        className="absolute -left-[18%] -right-[18%] top-1/2 h-px -rotate-12 bg-wine/70"
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Exact date — for the families celebrating off-Saturday. */}
      <div className="mx-auto mt-9 max-w-sm">
        <label htmlFor={inputId} className="block text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
          {boardReady ? "Or enter her exact date" : "Her quinceañera date"}
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
      <div aria-live="polite" className="mt-8 min-h-[7rem]">
        {state === "open" ? (
          <div className="fade-in-soft">
            <p
              className="font-display italic text-ink text-balance"
              style={{ fontSize: "clamp(1.5rem,3vw,2.3rem)", lineHeight: 1.15 }}
            >
              {pretty} <span className="not-italic text-emerald-800">is open.</span>
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
              One celebration per day — it goes to whoever holds it first.
            </p>
            <div className="mt-6 flex justify-center">
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
            <p
              className="font-display italic text-ink text-balance"
              style={{ fontSize: "clamp(1.5rem,3vw,2.3rem)", lineHeight: 1.15 }}
            >
              {pretty} <span className="not-italic text-wine-deep">is already reserved.</span>
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
              Join the cancellation waitlist, or tap an open Saturday above.
            </p>
            <div className="mt-6 flex justify-center">
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
