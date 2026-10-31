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

  const field = "min-h-11 w-full rounded-sm border border-[#dcdcd9] bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]";
  return (
    <form onSubmit={save} className="grid gap-5 border border-[#e5e5e3] bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Date (or start of a range)
          <input type="date" min={minDate} value={from} onChange={(e) => setFrom(e.target.value)} className={field} required />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Through <span className="font-normal text-[#696965]">— optional, for a range</span>
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
            <label key={s.id} className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm ${status === s.id ? "border-[#252525] bg-[#252525] text-white" : "border-[#dcdcd9]"}`}>
              <input type="radio" name="status" value={s.id} checked={status === s.id} onChange={() => setStatus(s.id)} className="sr-only" />
              {s.label}
            </label>
          ))}
        </div>
        <p className="text-xs text-[#696965]">{STATUS.find((s) => s.id === status)?.hint}</p>
      </fieldset>
      <label className="grid gap-1.5 text-sm font-medium">Private note <span className="font-normal text-[#696965]">— optional, never shown to families</span>
        <input type="text" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} className={field} placeholder="e.g. second shooter only" />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="min-h-12 rounded-sm bg-[#242424] px-5 text-sm font-medium text-white hover:bg-[#444] disabled:opacity-50">
          {busy ? "Saving…" : dates.length > 1 ? `Save ${dates.length} dates` : "Save"}
        </button>
        {msg ? <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-[#365c43]" : "text-[#8f4039]"}`}>{msg.text}</p> : null}
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
      className="min-h-11 rounded-sm border border-[#dcdcd9] px-3 text-sm hover:border-[#252525] disabled:opacity-50"
    >
      {busy ? "…" : "Clear"}
    </button>
  );
}
