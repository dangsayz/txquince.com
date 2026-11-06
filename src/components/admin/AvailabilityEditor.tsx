"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DateStatus } from "@/lib/plan";

const STATUS: { id: DateStatus; label: string; hint: string }[] = [
  { id: "available", label: "Available", hint: "Clears the date back to the default." },
  { id: "limited", label: "Limited", hint: "Shows “Limited” with a nudge to hold it." },
  { id: "booked", label: "Booked", hint: "Hides the deposit button; offers the waitlist." },
];

/** Every date from `from` to `to` (inclusive), optionally Saturdays only. Max 60. */
function datesBetween(from: string, to: string, saturdaysOnly: boolean): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${(to || from)}T12:00:00Z`);
  while (d <= end && out.length < 60) {
    if (!saturdaysOnly || d.getUTCDay() === 6) out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function AvailabilityEditor({ minDate }: { minDate: string }) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [saturdays, setSaturdays] = useState(true);
  const [status, setStatus] = useState<DateStatus>("limited");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const dates = from ? datesBetween(from, to, Boolean(to) && saturdays) : [];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!dates.length) return setMsg({ ok: false, text: "Choose a date (or a range with at least one Saturday)." });
    setBusy(true);
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dates, status, note }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      const data = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
      return setMsg({ ok: false, text: data?.error ?? "Not saved. Try again." });
    }
    setMsg({ ok: true, text: `Saved ${dates.length} ${dates.length === 1 ? "date" : "dates"} as ${status}.` });
    setNote("");
    router.refresh();
  }

  const field = "st-input w-full";
  return (
    <form onSubmit={save} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Date (or start of a range)
          <input type="date" min={minDate} value={from} onChange={(e) => setFrom(e.target.value)} className={field} required />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Through <span className="font-normal text-[var(--tq-ink-mute)]">— optional, for a range</span>
          <input type="date" min={from || minDate} value={to} onChange={(e) => setTo(e.target.value)} className={field} />
        </label>
      </div>
      {to ? (
        <label className="inline-flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={saturdays} onChange={(e) => setSaturdays(e.target.checked)} className="h-5 w-5" />
          Saturdays only
        </label>
      ) : null}
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Status</legend>
        <div className="flex flex-wrap gap-2">
          {STATUS.map((s) => (
            <label key={s.id} data-on={status === s.id || undefined} className="st-filter cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--tq-ink)]">
              <input type="radio" name="status" value={s.id} checked={status === s.id} onChange={() => setStatus(s.id)} className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        <p className="text-[13px] text-[var(--tq-ink-mute)]">{STATUS.find((s) => s.id === status)?.hint}</p>
      </fieldset>
      <label className="grid gap-1.5 text-sm font-medium">Private note <span className="font-normal text-[var(--tq-ink-mute)]">— optional, never shown to families</span>
        <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} className={field} placeholder="e.g. second shooter only" />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="st-btn">
          {busy ? "Saving…" : dates.length > 1 ? `Save ${dates.length} dates` : "Save"}
        </button>
        {msg ? <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-[var(--tq-status-open)]" : "text-[var(--tq-status-down)]"}`}>{msg.text}</p> : null}
      </div>
    </form>
  );
}

/** "Clear" on one row of the list. */
export function ClearDateButton({ date }: { date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/admin/availability", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ date, status: "available" }),
        }).catch(() => null);
        router.refresh();
      }}
      aria-label={`Clear ${date} back to available`}
      className="st-btn-ghost"
    >
      {busy ? "…" : "Clear"}
    </button>
  );
}
