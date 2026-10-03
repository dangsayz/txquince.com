"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InquiryActivityRow } from "@/lib/clients-db";

type Kind = "note" | "contact" | "reminder";
const labels: Record<Kind, string> = { note: "Internal note", contact: "Contacted client", reminder: "Plan follow-up" };

export function InquiryActivityPanel({ inquiryId, activity, canSchedule }: { inquiryId: string; activity: InquiryActivityRow[]; canSchedule: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("note");
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const openReminders = activity.filter((row) => row.kind === "reminder" && !row.completed_at).sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""));
  const history = activity.filter((row) => row.kind !== "reminder" || row.completed_at);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError("");
    try {
      const payload = { inquiry_id: inquiryId, kind, note: note.trim(), ...(kind === "reminder" ? { due_at: new Date(due).toISOString() } : {}) };
      const response = await fetch("/api/admin/inquiries/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) { const result = await response.json().catch(() => ({})) as { error?: string }; throw new Error(result.error ?? "Could not save. Please retry."); }
      setNote(""); setDue(""); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save. Please retry."); }
    finally { setPending(false); }
  }

  async function complete(id: string) {
    if (pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/admin/inquiries/activity", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inquiry_id: inquiryId, id }) });
      if (!response.ok) { const result = await response.json().catch(() => ({})) as { error?: string }; throw new Error(result.error ?? "Could not complete. Please retry."); }
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not complete. Please retry."); }
    finally { setPending(false); }
  }

  return (
    <div className="space-y-7">
      {error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <section className="border border-line bg-white" aria-labelledby="follow-ups-title">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="follow-ups-title" className="text-base font-medium text-ink">Follow-ups</h2>
          <span className="text-xs tabular-nums text-ink-faint">{openReminders.length} planned</span>
        </div>
        {openReminders.length ? (
          <ul className="divide-y divide-line">
            {openReminders.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-medium text-ink">{row.note || "Follow up with client"}</p>
                  <p className="mt-1 text-xs text-ink-soft">{row.due_at ? `Due ${new Date(row.due_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })}` : "Date to set"}</p>
                </div>
                <button type="button" disabled={pending} onClick={() => void complete(row.id)} className="min-h-11 border border-line px-4 text-sm font-medium text-ink hover:border-ink disabled:opacity-50">Mark complete</button>
              </li>
            ))}
          </ul>
        ) : <p className="px-5 py-5 text-sm text-ink-soft sm:px-6">No follow-up planned yet.</p>}
      </section>

      <section className="border border-line bg-white px-5 py-5 sm:px-6" aria-labelledby="record-title">
        <h2 id="record-title" className="text-base font-medium text-ink">Record activity</h2>
        <p className="mt-1 text-sm text-ink-soft">This is an internal record. It does not send a message to the client.</p>
        <form onSubmit={(event) => void save(event)} className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-5 border-b border-line">
            {(["note", "contact", "reminder"] as Kind[]).filter((value) => value !== "reminder" || canSchedule).map((value) => (
              <button key={value} type="button" onClick={() => setKind(value)} aria-pressed={kind === value} className={`min-h-11 border-b-2 text-sm ${kind === value ? "border-ink font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}>{labels[value]}</button>
            ))}
          </div>
          <div>
            <label htmlFor="activity-note" className="block text-sm font-medium text-ink">{kind === "contact" ? "What happened? (optional)" : kind === "reminder" ? "What should happen next? (optional)" : "Note"}</label>
            <textarea id="activity-note" value={note} onChange={(event) => setNote(event.target.value)} required={kind === "note"} maxLength={2000} rows={4} className="mt-2 w-full border border-line bg-white p-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" placeholder={kind === "contact" ? "Called, emailed, or spoke in person…" : "Add helpful context for next time…"} />
          </div>
          {kind === "reminder" && <div><label htmlFor="activity-due" className="block text-sm font-medium text-ink">Follow-up date and time</label><input id="activity-due" type="datetime-local" value={due} onChange={(event) => setDue(event.target.value)} required className="mt-2 min-h-11 w-full border border-line bg-white px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto" /></div>}
          <button type="submit" disabled={pending || (kind === "reminder" && !due) || (kind === "note" && !note.trim())} className="min-h-11 bg-ink px-5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-50">{pending ? "Saving…" : "Save activity"}</button>
        </form>
      </section>

      <section className="border border-line bg-white px-5 py-5 sm:px-6" aria-labelledby="activity-title">
        <div className="flex items-center justify-between">
          <h2 id="activity-title" className="text-base font-medium text-ink">Activity</h2>
          <span className="text-xs tabular-nums text-ink-faint">{history.length} entries</span>
        </div>
        {history.length ? (
          <ol className="mt-5 divide-y divide-line border-t border-line">
            {history.map((row) => <li key={row.id} className="py-4"><div className="flex flex-wrap justify-between gap-2"><p className="text-sm font-medium text-ink">{row.kind === "contact" ? "Client contacted" : row.kind === "reminder" ? "Follow-up completed" : "Internal note"}</p><time dateTime={row.created_at} className="text-xs text-ink-soft">{new Date(row.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })}</time></div>{row.note && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{row.note}</p>}</li>)}
          </ol>
        ) : <p className="mt-5 border-t border-line pt-5 text-sm text-ink-soft">No activity recorded yet.</p>}
      </section>
    </div>
  );
}
