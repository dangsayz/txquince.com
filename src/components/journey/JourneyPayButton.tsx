"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Opens Stripe Checkout for the deposit or the balance. The server picks the amount. */
export function JourneyPayButton({
  token,
  kind,
  label,
  busyLabel,
  errorLabel,
}: {
  token: string;
  kind: "deposit" | "balance";
  label: string;
  busyLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/my/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kind }),
      });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
      if (j.code === "already_paid") return router.refresh();
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
    <div className="tq-jr-pay">
      <button type="button" className="tq-btn tq-btn--lg tq-btn--block" onClick={pay} disabled={busy}>
        {busy ? busyLabel : label} {!busy && <span className="tq-arrow" aria-hidden>→</span>}
      </button>
      {error && (
        <p className="tq-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
