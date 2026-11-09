"use client";

import { useId, useState } from "react";
import { MIN_PART_CENTS, parseDollarsToCents } from "@/lib/balance";

export type BalancePayCopy = {
  payAll: string;
  payPart: string;
  amountLabel: string;
  amountHint: string;
  payThis: string;
  cancel: string;
  opening: string;
  error: string;
  tooSmall: string;
  tooBig: string;
  invalid: string;
};

/**
 * Pay the rest of a booking: everything left (primary), or a part the family
 * chooses. The server re-checks every number; this only keeps the form honest.
 */
export function BalancePay({ id, token, remainingCents, copy }: {
  id: string;
  token: string;
  remainingCents: number;
  copy: BalancePayCopy;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partOpen, setPartOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const minCents = Math.min(MIN_PART_CENTS, remainingCents);

  const go = async (amountCents?: number) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(amountCents === undefined ? { id, t: token } : { id, t: token, amountCents }),
      });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string; paidInFull?: boolean };
      if (j.paidInFull) return window.location.reload();
      // Only follow an https URL (the server builds it from Stripe's response).
      if (res.ok && j.url && new URL(j.url).protocol === "https:") {
        window.location.assign(j.url);
        return;
      }
      setError(j.error || copy.error);
    } catch {
      setError(copy.error);
    }
    setBusy(false);
  };

  const payPart = () => {
    const cents = parseDollarsToCents(amount);
    if (cents === null || cents <= 0) return setError(copy.invalid);
    if (cents > remainingCents) return setError(copy.tooBig);
    if (cents < minCents) return setError(copy.tooSmall);
    void go(cents === remainingCents ? undefined : cents);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!partOpen ? (
        <>
          <button type="button" className="tq-btn tq-btn--lg tq-btn--block" onClick={() => go()} disabled={busy}>
            {busy ? copy.opening : copy.payAll} {!busy && <span className="tq-arrow" aria-hidden>→</span>}
          </button>
          <button
            type="button"
            className="tq-btn tq-btn--ghost tq-btn--block"
            onClick={() => {
              setPartOpen(true);
              setError(null);
            }}
            disabled={busy}
          >
            {copy.payPart}
          </button>
        </>
      ) : (
        <form
          style={{ display: "grid", gap: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            payPart();
          }}
        >
          <div className="tq-field">
            <label htmlFor={inputId} className="tq-mono">
              {copy.amountLabel}
            </label>
            <input
              id={inputId}
              className="tq-input tq-nums"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="go"
              placeholder="$"
              maxLength={12}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
              aria-invalid={error ? true : undefined}
              disabled={busy}
            />
            <p id={hintId} className="tq-hint" style={{ margin: 0 }}>
              {copy.amountHint}
            </p>
          </div>
          <button type="submit" className="tq-btn tq-btn--lg tq-btn--block" disabled={busy}>
            {busy ? copy.opening : copy.payThis} {!busy && <span className="tq-arrow" aria-hidden>→</span>}
          </button>
          <button
            type="button"
            className="tq-btn tq-btn--ghost tq-btn--block"
            onClick={() => {
              setPartOpen(false);
              setError(null);
            }}
            disabled={busy}
          >
            {copy.cancel}
          </button>
        </form>
      )}
      {error && (
        <p id={errorId} className="tq-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
