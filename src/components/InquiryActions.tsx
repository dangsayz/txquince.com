"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Inline lead-status control for /admin/inquiries. New/Won fire an immediate
 * PATCH; choosing Lost reveals a reason picker (+ optional competitor) so a dead
 * deal becomes data instead of a black box. Server-only write path:
 * /api/admin/inquiries (requireAdmin + service role).
 */

const STATUSES: { value: "new" | "won" | "lost"; label: string }[] = [
  { value: "new", label: "New" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const LOST_REASONS: { value: string; label: string }[] = [
  { value: "price", label: "Price" },
  { value: "availability", label: "Availability / date taken" },
  { value: "ghosted", label: "Ghosted" },
  { value: "booked_competitor", label: "Booked a competitor" },
  { value: "other", label: "Other" },
];

export function InquiryActions({
  id,
  status,
  lostReason,
  competitorName,
}: {
  id: string;
  status: string | null;
  lostReason?: string | null;
  competitorName?: string | null;
}) {
  const router = useRouter();
  const current = status ?? "new";
  const [showLost, setShowLost] = useState(false);
  const [reason, setReason] = useState(lostReason ?? "");
  const [competitor, setCompetitor] = useState(competitorName ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Update failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  function choose(next: "new" | "won" | "lost") {
    if (next === "lost") {
      setShowLost(true);
      return;
    }
    setShowLost(false);
    void patch({ status: next });
  }

  function saveLost() {
    void patch({
      status: "lost",
      lost_reason: reason || null,
      competitor_name: reason === "booked_competitor" ? competitor || null : null,
    });
    setShowLost(false);
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex items-center gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
          Status
        </span>
        <div className="flex gap-1.5">
          {STATUSES.map((s) => {
            const active = current === s.value;
            return (
              <button
                key={s.value}
                type="button"
                disabled={pending}
                onClick={() => choose(s.value)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 transition-colors disabled:opacity-50 ${
                  active
                    ? "bg-ink text-cream ring-ink"
                    : "bg-ivory text-ink-soft ring-line hover:text-ink"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {(showLost || current === "lost") && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={pending}
            aria-label="Reason lost"
            className="rounded border border-line bg-white px-2 py-1 text-sm text-ink"
          >
            <option value="">Why lost…</option>
            {LOST_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {reason === "booked_competitor" && (
            <input
              type="text"
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
              disabled={pending}
              placeholder="Competitor (optional)"
              maxLength={120}
              className="rounded border border-line bg-white px-2 py-1 text-sm text-ink placeholder:text-ink-faint"
            />
          )}

          <button
            type="button"
            disabled={pending || !reason}
            onClick={saveLost}
            className="rounded-full bg-wine px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-wine-deep disabled:opacity-50"
          >
            Save
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
