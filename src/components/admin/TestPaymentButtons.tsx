"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function post(body: unknown) {
  const res = await fetch("/api/admin/test-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  return { ok: res.ok, ...j };
}

/** Opens the $1 Stripe Checkout. */
export function StartTestPayment() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="st-btn"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const r = await post({}).catch(() => ({ ok: false, error: "Could not reach the site.", url: undefined }));
          if (r.ok && r.url) return window.location.assign(r.url);
          setError(r.error ?? "Could not open checkout.");
          setBusy(false);
        }}
      >
        {busy ? "Opening checkout…" : "Pay $1 to test"}
      </button>
      {error ? <span role="alert" className="text-[15px] text-[var(--tq-status-down)]">{error}</span> : null}
    </span>
  );
}

/** Refunds a finished test. */
export function RefundTestPayment({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="st-btn-ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          const r = await post({ refund: id }).catch(() => ({ ok: false, error: "Could not reach the site." }));
          if (r.ok) router.refresh();
          else setError(r.error ?? "Could not refund.");
          setBusy(false);
        }}
      >
        {busy ? "Refunding…" : "Refund the $1"}
      </button>
      {error ? <span role="alert" className="text-[15px] text-[var(--tq-status-down)]">{error}</span> : null}
    </span>
  );
}

/** While the site waits for Stripe's message, look again every 3 seconds (up to 1 minute). */
export function WaitForStripe({ waiting }: { waiting: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!waiting) return;
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 20) window.clearInterval(t);
    }, 3000);
    return () => window.clearInterval(t);
  }, [waiting, router]);
  return null;
}
