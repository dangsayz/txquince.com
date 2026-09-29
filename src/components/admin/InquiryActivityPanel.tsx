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

  return <div className="space-y-6">
    <section className="rounded-lg border border-line bg-white p-5 sm:p-7"><p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Next action</p><h2 className="mt-1 font-display text-2xl font-normal text-ink">Follow-ups</h2>{openReminders.length ? <ul className="mt-5 space-y-3">{openReminders.map((row) => <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-line bg-ivory p-4"><div><p className="font-medium text-ink">{row.note || "Follow up with client"}</p><p className="mt-1 text-base text-ink-soft">Due {new Date(row.due_at!).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })}</p></div><button type="button" disabled={pending} onClick={() => void complete(row.id)} className="min-h-11 rounded-md border border-line bg-white px-4 text-base font-medium text-ink hover:border-ink disabled:opacity-50">Mark complete</button></li>)}</ul> : <p className="mt-5 text-base text-ink-soft">No follow-up planned yet.</p>}</section>
    <section className="rounded-lg border border-line bg-white p-5 sm:p-7"><p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Keep the relationship moving</p><h2 className="mt-1 font-display text-2xl font-normal text-ink">Record a touchpoint</h2><p className="mt-2 text-base text-ink-soft">This is an internal record. It does not send a message to the client.</p><form onSubmit={(event) => void save(event)} className="mt-6 space-y-4"><div className="flex flex-wrap gap-2">{(["note", "contact", "reminder"] as Kind[]).filter((value) => value !== "reminder" || canSchedule).map((value) => <button key={value} type="button" onClick={() => setKind(value)} className={`min-h-11 rounded-md border px-4 text-base ${kind === value ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink hover:border-ink"}`}>{labels[value]}</button>)}</div><label htmlFor="activity-note" className="block text-base font-medium text-ink">{kind === "contact" ? "What happened? (optional)" : kind === "reminder" ? "What should happen next? (optional)" : "Note"}</label><textarea id="activity-note" value={note} onChange={(event) => setNote(event.target.value)} required={kind === "note"} maxLength={2000} rows={4} className="w-full rounded-md border border-line bg-white p-4 text-base text-ink" placeholder={kind === "contact" ? "Called, emailed, or spoke in person…" : "Add helpful context for next time…"}/>{kind === "reminder" && <div><label htmlFor="activity-due" className="mb-2 block text-base font-medium text-ink">Follow-up date and time</label><input id="activity-due" type="datetime-local" value={due} onChange={(event) => setDue(event.target.value)} required className="min-h-12 w-full rounded-md border border-line bg-white px-4 text-base text-ink sm:w-auto"/></div>}<button type="submit" disabled={pending || (kind === "reminder" && !due) || (kind === "note" && !note.trim())} className="min-h-12 rounded-md bg-ink px-6 text-base font-medium text-cream hover:bg-ink/85 disabled:opacity-50">{pending ? "Saving…" : "Save touchpoint"}</button>{error && <p role="alert" className="text-base text-red-700">{error}</p>}</form></section>
    <section className="rounded-lg border border-line bg-white p-5 sm:p-7"><p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Relationship history</p><h2 className="mt-1 font-display text-2xl font-normal text-ink">Activity</h2>{history.length ? <ol className="mt-5 space-y-4">{history.map((row) => <li key={row.id} className="border-t border-line pt-4"><div className="flex flex-wrap justify-between gap-2"><p className="text-base font-medium text-ink">{row.kind === "contact" ? "Client contacted" : row.kind === "reminder" ? "Follow-up completed" : "Internal note"}</p><time dateTime={row.created_at} className="text-base text-ink-soft">{new Date(row.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })}</time></div>{row.note && <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink-soft">{row.note}</p>}</li>)}</ol> : <p className="mt-5 text-base text-ink-soft">No activity recorded yet.</p>}</section>
  </div>;
}
