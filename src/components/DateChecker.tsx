"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { trackEvent } from "@/components/Tracker";
import "@/components/txq/pages/pages.css";

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
    <div className="tq-pg-datecheck">
      <p className="tq-mono" style={{ margin: 0 }}>
        [Availability]
      </p>
      <h2 className="tq-display tq-pg-row__title">{heading}</h2>
      <p className="tq-muted" style={{ margin: 0, maxWidth: "52ch" }}>
        {body}
      </p>
      <div className="tq-pg-datecheck__row">
        <div className="tq-field">
          <label htmlFor={inputId} className="tq-mono tq-muted">
            Her quinceañera date
          </label>
          <input
            id={inputId}
            type="date"
            value={date}
            min={min}
            max={max}
            onChange={(event) => setDate(event.target.value)}
            className="tq-input"
          />
        </div>
        <Link
          href={href}
          onClick={() => trackEvent("date_checked", date ? `${date}:requested` : "unspecified:requested")}
          className="tq-btn tq-btn--lg"
        >
          Check her date <span className="tq-arrow" aria-hidden>→</span>
        </Link>
      </div>
      <p className="tq-hint" style={{ margin: 0 }}>
        Still deciding on a date? You can ask us anyway. No payment to inquire.
      </p>
    </div>
  );
}
