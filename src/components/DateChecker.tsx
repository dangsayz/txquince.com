"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { trackEvent } from "@/components/Tracker";

function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A date request is confirmed by the studio; this never guesses at availability. */
export function DateChecker({ heading, body }: { heading: string; body: string }) {
  const inputId = useId();
  const [date, setDate] = useState("");
  const { min, max } = useMemo(() => {
    const today = new Date();
    const threeYearsOut = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    return { min: isoDate(today), max: isoDate(threeYearsOut) };
  }, []);
  const href = date ? `/check-your-date?date=${encodeURIComponent(date)}` : "/check-your-date";

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">Availability</p>
      <h2 className="mt-5 font-serif text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] text-ink text-balance">
        {heading}
      </h2>
      <p className="mx-auto mt-5 max-w-[52ch] text-base leading-7 text-ink-soft">
        {body}
      </p>
      <div className="mx-auto mt-9 flex max-w-xl flex-col items-stretch gap-4 text-left sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="block text-base font-medium text-ink">Her quinceañera date</label>
          <input
            id={inputId}
            type="date"
            value={date}
            min={min}
            max={max}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 min-h-12 w-full border border-[#8c8377] bg-white px-4 py-3 text-base text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <Link href={href} onClick={() => trackEvent("date_checked", date ? `${date}:requested` : "unspecified:requested")} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-ink px-6 text-base font-semibold text-white hover:bg-ink/85">
          Check her date <span aria-hidden className="ml-2">→</span>
        </Link>
      </div>
      <p className="mt-5 text-sm text-ink-soft">Still deciding on a date? You can ask us anyway. No payment to inquire.</p>
    </div>
  );
}
