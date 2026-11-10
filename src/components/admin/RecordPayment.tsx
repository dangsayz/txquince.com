"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { METHOD_LABEL, OFFLINE_METHODS, type OfflineMethod } from "@/lib/offline-payment";

export type OfflineRow = { id: string; amountCents: number; method: string; paidAt: string | null; note: string | null };

const usd = (c: number) => (c / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: c % 100 ? 2 : 0 });
const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function toCents(text: string): number | null {
  const t = text.replace(/[$,\s]/g, "");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(t)) return null;
  const [whole, frac = ""] = t.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

/**
 * Record money taken outside Stripe (cash, Zelle, check) toward a booked
 * date's balance, and list what was recorded. Rules: lib/offline-payment.ts.
 */
export function RecordPayment({ bookingId, name, today, leftCents, recorded }: { bookingId: string; name: string; today: string; leftCents: number | null; recorded: OfflineRow[] }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<OfflineMethod>("zelle");
  const [paidOn, setPaidOn] = useState(today);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const field = "st-input mt-1 w-full";

  async function send(method_: "POST" | "DELETE", body: object) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings/payments", { method: method_, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Could not save.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Could not reach the site. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(null);
    const cents = toCents(amount);
    if (cents === null || cents < 100) return setError("Enter an amount, like 250 or 250.00.");
    if (await send("POST", { bookingId, amountCents: cents, method, paidOn, note: note.trim() || undefined })) {
      setSaved(`Recorded ${usd(cents)} by ${METHOD_LABEL[method]}. ${name} sees it in her account.`);
      setAmount("");
      setNote("");
    }
  }

  return (
    <details className="bk-more">
      <summary>
        <span className="font-medium">Record a payment</span>
        <span className="min-w-0 truncate text-[var(--tq-ink-mute)]">
          {recorded.length ? `${recorded.length} recorded · ` : ""}Cash, Zelle or check{leftCents !== null ? ` · ${usd(leftCents)} still due` : ""}
        </span>
      </summary>

      {recorded.length > 0 && (
        <ul className="m-0 mt-2 list-none p-0">
          {recorded.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--tq-surface-2)] py-2 text-[15px]">
              <span className="min-w-0">
                <span className="st-num font-medium">{usd(r.amountCents)}</span> · {METHOD_LABEL[r.method] ?? r.method}
                {r.paidAt ? ` · ${day(r.paidAt)}` : ""}
                {r.note ? <span className="text-[var(--tq-ink-mute)]"> · {r.note}</span> : null}
              </span>
              <button
                type="button"
                disabled={busy}
                className="st-link min-h-11 text-[var(--tq-status-down)]"
                onClick={() => {
                  if (confirm(`Remove this ${usd(r.amountCents)} ${METHOD_LABEL[r.method] ?? ""} payment? The balance goes back up.`)) void send("DELETE", { paymentId: r.id });
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {leftCents === 0 ? (
        <p className="m-0 mt-3 text-base">Paid in full. Nothing is left to record.</p>
      ) : (
        <form onSubmit={submit} className="mt-3 grid max-w-2xl gap-3 sm:grid-cols-3">
          <label className="block text-[15px] font-medium">
            Amount
            <input className={field} inputMode="decimal" autoComplete="off" placeholder="250.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </label>
          <label className="block text-[15px] font-medium">
            How they paid
            <select className={field} value={method} onChange={(e) => setMethod(e.target.value as OfflineMethod)}>
              {OFFLINE_METHODS.map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
            </select>
          </label>
          <label className="block text-[15px] font-medium">
            Day you got it
            <input className={field} type="date" max={today} value={paidOn} onChange={(e) => setPaidOn(e.target.value)} required />
          </label>
          <label className="block text-[15px] font-medium sm:col-span-3">
            Note <span className="font-normal text-[var(--tq-ink-mute)]">(optional, only you see it)</span>
            <input className={field} maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="sm:col-span-3">
            <button type="submit" disabled={busy} className="st-btn">{busy ? "Saving…" : "Record payment"}</button>
          </div>
        </form>
      )}
      {saved ? <p role="status" className="m-0 mt-3 text-base text-[var(--tq-status-open)]">{saved}</p> : null}
      {error ? <p role="alert" className="m-0 mt-3 text-base text-[var(--tq-status-down)]">{error}</p> : null}
    </details>
  );
}
