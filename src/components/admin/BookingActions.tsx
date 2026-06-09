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

  const holdsDate = status === "requested" || status === "pending_payment";
  if (!holdsDate) return null;

  async function patch(next: "cancelled" | "paid", confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not update.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          patch("cancelled", "Release this date? It frees the calendar so others can book it.")
        }
        className="rounded-full border border-line px-4 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-50"
      >
        Release date
      </button>
      {status === "requested" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            patch("paid", "Mark this booking as paid? Do this once the deposit has cleared.")
          }
          className="rounded-full bg-ink px-4 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-wine disabled:opacity-50"
        >
          Mark paid
        </button>
      ) : null}
      {error ? <span className="text-xs text-wine">{error}</span> : null}
    </div>
  );
}
