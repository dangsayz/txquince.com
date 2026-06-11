"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ConversionChange = {
  id: string;
  created_at: string;
  title: string;
  area: string | null;
  reason: string | null;
  target_metric: string | null;
  baseline: Record<string, number> | null;
  status: string;
  notes: string | null;
};

const METRIC_OPTIONS: { value: string; label: string }[] = [
  { value: "booked_value", label: "Booked value" },
  { value: "pipeline", label: "Pipeline" },
  { value: "open_leads", label: "Open leads" },
  { value: "inquiry_to_paid", label: "Inquiry → paid" },
  { value: "bounce_rate", label: "Bounce rate" },
  { value: "visitors", label: "Visitors" },
];

const METRIC_LABELS: Record<string, string> = Object.fromEntries(
  METRIC_OPTIONS.map((o) => [o.value, o.label]),
);

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function relativeDays(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

function baselineSummary(b: Record<string, number> | null): string | null {
  if (!b) return null;
  const parts: string[] = [];
  if (typeof b.bookedValue === "number") parts.push(`booked ${usd.format(b.bookedValue)}`);
  if (typeof b.bounceRate === "number") parts.push(`bounce ${b.bounceRate}%`);
  if (typeof b.uniqueSessions === "number") parts.push(`visitors ${b.uniqueSessions.toLocaleString()}`);
  return parts.length ? `baseline: ${parts.join(" · ")}` : null;
}

export function ChangeLog({ initial }: { initial: ConversionChange[] }) {
  const router = useRouter();
  const [changes, setChanges] = useState<ConversionChange[]>(initial);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [reason, setReason] = useState("");
  const [targetMetric, setTargetMetric] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/changes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        area: area || undefined,
        reason: reason || undefined,
        target_metric: targetMetric || undefined,
        notes: notes || undefined,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not log the change.");
      setBusy(false);
      return;
    }
    const { change } = (await res.json()) as { change: ConversionChange };
    setChanges((p) => [change, ...p]);
    setTitle("");
    setArea("");
    setReason("");
    setTargetMetric("");
    setNotes("");
    setBusy(false);
    router.refresh();
  }

  async function archive(id: string) {
    setChanges((p) => p.map((c) => (c.id === id ? { ...c, status: "archived" } : c)));
    const res = await fetch("/api/admin/changes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: "archived" }),
    });
    if (!res.ok) {
      // revert on failure
      setChanges((p) => p.map((c) => (c.id === id ? { ...c, status: "active" } : c)));
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not archive.");
      return;
    }
    router.refresh();
  }

  const visible = changes.filter((c) => c.status !== "archived");

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">Improvement log</p>
      <p className="mt-1 text-sm text-ink-soft">
        Log what you changed and why — the baseline is captured now so you can measure the lift later.
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm text-ink">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Shortened the inquiry form"
              className="mt-1 w-full border-b border-line bg-transparent py-1.5 text-sm focus:border-wine focus:outline-none"
            />
          </label>
          <label className="text-sm text-ink sm:w-48">
            Area
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Homepage hero"
              className="mt-1 w-full border-b border-line bg-transparent py-1.5 text-sm focus:border-wine focus:outline-none"
            />
          </label>
        </div>

        <label className="text-sm text-ink">
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Why you made the change and what you expect to move"
            className="mt-1 w-full resize-none border-b border-line bg-transparent py-1.5 text-sm focus:border-wine focus:outline-none"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm text-ink">
            Target metric
            <select
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="mt-1 w-full border-b border-line bg-transparent py-1.5 text-sm focus:border-wine focus:outline-none"
            >
              <option value="">No specific metric</option>
              {METRIC_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 text-sm text-ink">
            Notes (optional)
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else worth remembering"
              className="mt-1 w-full border-b border-line bg-transparent py-1.5 text-sm focus:border-wine focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !title}
            className="rounded-full bg-ink px-6 py-2.5 text-[0.66rem] uppercase tracking-[0.16em] text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Logging…" : "Log change"}
          </button>
          {error ? <p className="text-xs text-wine">{error}</p> : null}
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {visible.length === 0 ? (
          <p className="text-sm text-ink-faint">No changes logged yet. Record your first tweak above.</p>
        ) : (
          visible.map((c) => {
            const summary = baselineSummary(c.baseline);
            const metricLabel = c.target_metric
              ? METRIC_LABELS[c.target_metric] ?? c.target_metric
              : null;
            return (
              <div key={c.id} className="border border-line bg-ivory p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{c.title}</p>
                    <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
                      {[c.area, metricLabel].filter(Boolean).join(" · ") || "—"}
                      <span className="text-ink-faint"> · {relativeDays(c.created_at)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => archive(c.id)}
                    className="shrink-0 rounded-full border border-line px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-wine hover:text-wine"
                  >
                    Archive
                  </button>
                </div>
                {c.reason ? <p className="mt-2 text-sm text-ink-soft">{c.reason}</p> : null}
                {summary ? (
                  <p className="mt-2 text-xs text-ink-faint">{summary}</p>
                ) : null}
                {c.notes ? <p className="mt-1 text-xs text-ink-faint italic">{c.notes}</p> : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
