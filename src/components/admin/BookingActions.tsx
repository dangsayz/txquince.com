"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Operator actions on a booking. The key one is Release: it frees a held date
 * (requested / pending_payment) so a ghosted request can't block a real Saturday
 * forever. Marking a request Paid is offered once you've collected the deposit.
 */
export function BookingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ url: string; emailed: boolean } | null>(null);

  const holdsDate = status === "requested" || status === "pending_payment";
  if (!holdsDate) return null;

  async function sendDepositLink() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings/deposit-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error ?? "Could not create the deposit link.");
        return;
      }
      setSent({ url: d.url, emailed: Boolean(d.emailed) });
      router.refresh();
    } catch {
      setError("Could not create the deposit link. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(next: "cancelled" | "paid", confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Could not update.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={sendDepositLink}
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-5 text-base font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
        >
          {busy ? "Working…" : status === "pending_payment" ? "Resend deposit link" : "Send deposit link"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            patch("cancelled", "Release this date? It frees the calendar so others can book it.")
          }
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-4 text-base font-medium text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          Release date
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            patch("paid", "Mark this booking as paid? Do this once the deposit has cleared.")
          }
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-4 text-base font-medium text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          Mark paid
        </button>
      </div>

      {sent ? (
        <div role="status" className="mt-4 rounded-lg border border-line bg-ivory p-4 text-base text-ink-soft">
          {sent.emailed ? "✓ Emailed the deposit link to the family." : "Link created (email not sent — check Resend config)."}
          <a href={sent.url} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-ink underline underline-offset-4">
            {sent.url}
          </a>
        </div>
      ) : null}
      {error ? <p role="alert" className="mt-3 text-base text-red-700">{error}</p> : null}
    </div>
  );
}
