"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Tidy a closed booking: Archive (hide, can be restored) and Remove (delete
 * for good, only when nothing was ever paid). Rules: src/lib/booking-tidy.ts.
 */
export function BookingTidy({ id, name, archived, removable }: { id: string; name: string; archived: boolean; removable: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(method: "PATCH" | "DELETE", body: object, ask?: string) {
    if (ask && !confirm(ask)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Could not do that.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the site. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {archived ? (
          <button type="button" disabled={busy} className="st-btn-ghost bg-white" onClick={() => send("PATCH", { id, action: "restore" })}>
            Restore
          </button>
        ) : (
          <button type="button" disabled={busy} className="st-btn-ghost bg-white" onClick={() => send("PATCH", { id, action: "archive" })}>
            Archive
          </button>
        )}
        {removable ? (
          <button
            type="button"
            disabled={busy}
            className="st-btn-ghost bg-white text-[var(--tq-status-down)]"
            onClick={() => send("DELETE", { id }, `Remove ${name}’s booking for good? This cannot be undone.`)}
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p role="alert" className="mt-3 text-base text-[var(--tq-status-down)]">{error}</p> : null}
    </div>
  );
}
