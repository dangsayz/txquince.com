"use client";

import { useState } from "react";

/** Opens Stripe Checkout for an approved booking's deposit. */
export function PayButton({ id, token, label, busyLabel, errorLabel }: {
  id: string;
  token: string;
  label: string;
  busyLabel: string;
  errorLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, t: token }),
      });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string; paid?: boolean };
      if (j.paid) return window.location.reload();
      if (!res.ok || !j.url) {
        setError(j.error || errorLabel);
        setBusy(false);
        return;
      }
      window.location.assign(j.url);
    } catch {
      setError(errorLabel);
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button type="button" className="tq-btn tq-btn--lg tq-btn--block" onClick={pay} disabled={busy}>
        {busy ? busyLabel : label} {!busy && <span className="tq-arrow" aria-hidden>→</span>}
      </button>
      {error && (
        <p className="tq-error" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
