"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewRecord, ReviewStatus } from "@/lib/review";

export type AdminReview = ReviewRecord & { url: string; message: string };

type View = "pending" | "approved" | "invited" | "hidden";
const VIEWS: { id: View; label: string }[] = [
  { id: "pending", label: "New" },
  { id: "approved", label: "On the site" },
  { id: "invited", label: "Waiting for mom" },
  { id: "hidden", label: "Hidden" },
];

const day = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }) : "—";

async function send(method: "POST" | "PATCH" | "DELETE", body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch("/api/admin/reviews", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = ((await res?.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  return { ok: !!res?.ok, data };
}

function CopyButton({ text, label, primary = false }: { text: string; label: string; primary?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={primary ? "st-btn" : "st-btn-ghost"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          window.prompt("Copy this:", text);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

function ShareActions({ r }: { r: Pick<AdminReview, "url" | "message"> }) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton text={r.message} label="Copy message" primary />
      <CopyButton text={r.url} label="Copy link" />
      <a className="st-btn-ghost" href={`sms:?&body=${encodeURIComponent(r.message)}`}>Text it</a>
    </div>
  );
}

function NewLink({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<{ name: string; url: string; message: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const invite_name = String(fd.get("invite_name") ?? "").trim();
    if (!invite_name) {
      setError("Add the mom's name.");
      return;
    }
    setBusy(true);
    setError(null);
    const { ok, data } = await send("POST", {
      invite_name,
      daughter_name: String(fd.get("daughter_name") ?? ""),
      event_date: String(fd.get("event_date") ?? ""),
    });
    setBusy(false);
    if (!ok) {
      setError(String(data.error ?? "Could not make the link."));
      return;
    }
    setMade({ name: invite_name, url: String(data.url), message: String(data.message) });
    form.reset();
    onCreated();
  }

  return (
    <section aria-labelledby="rv-new" className="st-card px-5 py-5 sm:px-6">
      <h2 id="rv-new" className="st-h2">New review link</h2>
      <p className="m-0 mt-1 text-[15px] leading-6 text-[var(--tq-ink-mute)]">One link per mom. It works once, so a forwarded link can&apos;t be reused.</p>
      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[2fr_1.5fr_1.2fr_auto] sm:items-end">
        <label className="grid gap-1 text-sm">
          Mom&apos;s name
          <input name="invite_name" required maxLength={120} placeholder="Maria Garcia" className="st-input" autoComplete="off" />
        </label>
        <label className="grid gap-1 text-sm">
          Daughter <span className="text-[var(--tq-ink-mute)]">(optional)</span>
          <input name="daughter_name" maxLength={80} placeholder="Ana" className="st-input" autoComplete="off" />
        </label>
        <label className="grid gap-1 text-sm">
          Event date <span className="text-[var(--tq-ink-mute)]">(optional)</span>
          <input name="event_date" type="date" className="st-input" />
        </label>
        <button type="submit" className="st-btn" disabled={busy} aria-busy={busy || undefined}>
          {busy ? "Making…" : "Make link"}
        </button>
      </form>
      {error ? <p role="alert" className="m-0 mt-3 text-[15px] text-[var(--tq-status-down)]">{error}</p> : null}
      {made ? (
        <div className="mt-4 grid gap-3 rounded-[var(--tq-radius-sm)] bg-[var(--tq-canvas)] p-4" role="status">
          <p className="m-0 text-[15px]">
            Link for <strong>{made.name}</strong> is ready. Send her the message:
          </p>
          <p className="m-0 whitespace-pre-line break-words text-[15px] text-[var(--tq-ink-mute)]">{made.message}</p>
          <ShareActions r={made} />
        </div>
      ) : null}
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span role="img" aria-label={`${n} out of 5 stars`} className="tracking-[0.1em]">
      {"★".repeat(n)}
      <span className="text-[var(--tq-ink-mute)]">{"☆".repeat(5 - n)}</span>
    </span>
  );
}

function ReviewCard({ r, onChange }: { r: AdminReview; onChange: (id: string, patch: Partial<AdminReview>) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(fields: { status?: ReviewStatus; featured?: boolean; show_photos?: boolean }) {
    setBusy(true);
    setError(null);
    const { ok, data } = await send("PATCH", { id: r.id, ...fields });
    setBusy(false);
    if (!ok) return setError(String(data.error ?? "Not saved."));
    onChange(r.id, fields);
  }

  return (
    <li className="grid gap-3 border-t border-[var(--tq-surface-2)] px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="m-0 text-[15px]">
          <strong>{r.display_name || r.invite_name}</strong>
          <span className="text-[var(--tq-ink-mute)]">
            {r.display_name && r.display_name !== r.invite_name ? ` (${r.invite_name})` : ""}
            {r.daughter_name ? ` · ${r.daughter_name}’s quince` : ""}
            {r.city ? ` · ${r.city}` : ""}
            {` · sent ${day(r.submitted_at)}`}
          </span>
        </p>
        {r.rating ? <Stars n={r.rating} /> : null}
      </div>
      <p className="m-0 whitespace-pre-line break-words text-base leading-7">{r.body}</p>
      {r.photo_paths.length ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 p-0">
          {r.photo_paths.map((_, n) => (
            <li key={n} className="aspect-square overflow-hidden rounded-[var(--tq-radius-sm)] bg-[var(--tq-canvas)]">
              <a href={`/api/reviews/photo/${r.id}/${n}?w=1920`} target="_blank" rel="noopener noreferrer" className="block h-full">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img src={`/api/reviews/photo/${r.id}/${n}?w=384`} alt={`Photo ${n + 1} from ${r.invite_name}`} className="h-full w-full object-cover" loading="lazy" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="m-0 text-sm text-[var(--tq-ink-mute)]">
        {r.consent_publish ? "OK to show the review." : "Did not agree to show the review."}
        {r.photo_paths.length ? (r.consent_photos ? " OK to show the photos." : " Did not agree to show the photos.") : ""}
        {r.language === "es" ? " Wrote in Spanish." : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {r.status !== "approved" ? (
          <button type="button" className="st-btn" disabled={busy || !r.consent_publish} onClick={() => patch({ status: "approved" })}>
            Approve
          </button>
        ) : null}
        {r.status !== "hidden" ? (
          <button type="button" className="st-btn-ghost" disabled={busy} onClick={() => patch({ status: "hidden" })}>
            Hide
          </button>
        ) : null}
        {r.status === "approved" ? (
          <button type="button" className="st-filter" aria-pressed={r.featured} disabled={busy} onClick={() => patch({ featured: !r.featured })}>
            {r.featured ? "★ On the homepage" : "Put on the homepage"}
          </button>
        ) : null}
        {r.photo_paths.length && r.consent_photos ? (
          <button type="button" className="st-filter" aria-pressed={r.show_photos} disabled={busy} onClick={() => patch({ show_photos: !r.show_photos })}>
            {r.show_photos ? "Photos shown" : "Photos hidden"}
          </button>
        ) : null}
      </div>
      {error ? <p role="alert" className="m-0 text-[15px] text-[var(--tq-status-down)]">{error}</p> : null}
    </li>
  );
}

function WaitingRow({ r, onDelete }: { r: AdminReview; onDelete: (id: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <li className="grid gap-3 border-t border-[var(--tq-surface-2)] px-5 py-4 sm:px-6">
      <p className="m-0 text-[15px]">
        <strong>{r.invite_name}</strong>
        <span className="text-[var(--tq-ink-mute)]">
          {r.daughter_name ? ` · ${r.daughter_name}’s quince` : ""}
          {r.event_date ? ` · ${day(r.event_date)}` : ""}
          {` · link made ${day(r.created_at)}`}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <ShareActions r={r} />
        <button
          type="button"
          className="st-btn-ghost"
          disabled={busy}
          onClick={async () => {
            if (!window.confirm(`Delete the link for ${r.invite_name}? It will stop working.`)) return;
            setBusy(true);
            const { ok } = await send("DELETE", { id: r.id });
            setBusy(false);
            if (ok) onDelete(r.id);
          }}
        >
          Delete link
        </button>
      </div>
    </li>
  );
}

export function ReviewsManager({ initial }: { initial: AdminReview[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const counts = Object.fromEntries(VIEWS.map((v) => [v.id, rows.filter((r) => r.status === v.id).length])) as Record<View, number>;
  const [view, setView] = useState<View>(counts.pending ? "pending" : counts.approved ? "approved" : "invited");
  const shown = rows.filter((r) => r.status === view);

  const change = (id: string, patch: Partial<AdminReview>) => setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((cur) => cur.filter((r) => r.id !== id));

  return (
    <>
      <NewLink
        onCreated={() => {
          setView("invited");
          router.refresh();
        }}
      />
      {/* The server list arrives after router.refresh(); keep local state in step with it. */}
      <SyncRows initial={initial} onSync={setRows} />
      <section aria-label="Reviews" className="st-card overflow-hidden">
        <nav className="st-tabs flex gap-4 overflow-x-auto px-5 sm:px-6" aria-label="Review status">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" className="st-tab" aria-current={view === v.id ? "page" : undefined} onClick={() => setView(v.id)}>
              {v.label} <span className="st-count">{counts[v.id]}</span>
            </button>
          ))}
        </nav>
        {shown.length ? (
          <ul className="m-0 list-none p-0">
            {shown.map((r) => (r.status === "invited" ? <WaitingRow key={r.id} r={r} onDelete={remove} /> : <ReviewCard key={r.id} r={r} onChange={change} />))}
          </ul>
        ) : (
          <p className="st-empty m-0 border-t border-[var(--tq-surface-2)] px-5 py-8 text-[15px] text-[var(--tq-ink-mute)] sm:px-6">
            {view === "pending"
              ? "No new reviews. When a mom sends hers, it shows up here and you get an email."
              : view === "approved"
                ? "Nothing on the site yet. Approve a review to show it on the homepage and /reviews."
                : view === "invited"
                  ? "No open links. Make one above."
                  : "Nothing hidden."}
          </p>
        )}
      </section>
      <p className="m-0 text-sm leading-6 text-[var(--tq-ink-mute)]">
        The public page says these are reviews you chose to show. Hide a review instead of editing it; the words are always the mom&apos;s own.
      </p>
    </>
  );
}

/** Replaces local rows when the server sends a fresh list (after router.refresh). */
function SyncRows({ initial, onSync }: { initial: AdminReview[]; onSync: (rows: AdminReview[]) => void }) {
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    onSync(initial);
  }
  return null;
}
