"use client";

import { useState } from "react";
import type { CommentRecord, CommentStatus } from "@/lib/comments";

export type AdminComment = CommentRecord & { postTitle: string; postPath: string };

const VIEWS: { id: CommentStatus; label: string }[] = [
  { id: "pending", label: "New" },
  { id: "approved", label: "On the site" },
  { id: "hidden", label: "Hidden" },
];

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });

async function send(method: "PATCH" | "DELETE", body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch("/api/admin/comments", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = ((await res?.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  return { ok: !!res?.ok, data };
}

/** What just happened, shown at the top with a link to check it on the site. */
type Notice = { text: string; href?: string; linkLabel?: string };
const onSite = (c: AdminComment) => `${c.postPath}#comments`;

function Row({ c, onChange, onDelete, onNotice }: { c: AdminComment; onChange: (next: CommentRecord) => void; onDelete: (id: string) => void; onNotice: (n: Notice) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState(c.reply ?? "");
  const [editing, setEditing] = useState(false);

  async function patch(body: { status?: CommentStatus; reply?: string }) {
    setBusy(true);
    setError(null);
    const { ok, data } = await send("PATCH", { id: c.id, ...body });
    setBusy(false);
    if (!ok) return setError(String(data.error ?? "Could not save."));
    onChange(data.comment as CommentRecord);
    setEditing(false);
    const live = (body.status ?? c.status) === "approved";
    const see = live ? { href: onSite(c), linkLabel: "See it on the post" } : {};
    if (body.status === "approved") onNotice({ text: `Approved. ${c.author_name}'s comment is now on the site.`, ...see });
    else if (body.status === "hidden") onNotice({ text: `Hidden. ${c.author_name}'s comment is off the site. Find it under Hidden.` });
    else if (body.reply) onNotice({ text: live ? "Your answer is saved and shows under the comment." : "Your answer is saved. It shows once you approve the comment.", ...see });
    else onNotice({ text: "Your answer was removed.", ...see });
  }

  return (
    <li className="grid gap-3 border-t border-[var(--tq-surface-2)] px-5 py-5 sm:px-6">
      <p className="m-0 text-[15px]">
        <strong>{c.author_name}</strong>
        <span className="text-[var(--tq-ink-mute)]">
          {` · ${day(c.created_at)} · on `}
          <a className="st-link" href={c.postPath} target="_blank" rel="noopener noreferrer">
            {c.postTitle}
          </a>
          {c.lang === "es" ? " · Spanish" : ""}
        </span>
      </p>
      {c.quote ? (
        <blockquote className="m-0 border-l-2 border-[var(--tq-stone)] pl-3 text-[15px] leading-6 text-[var(--tq-ink-mute)]">
          About: “{c.quote}”
        </blockquote>
      ) : null}
      <p className="m-0 whitespace-pre-line break-words text-base leading-7">{c.body}</p>

      {c.reply && !editing ? (
        <div className="rounded-[var(--tq-radius-sm)] border-l-2 border-[var(--tq-ink)] bg-[var(--tq-surface)] px-4 py-3">
          <p className="m-0 text-sm text-[var(--tq-ink-mute)]">Your answer</p>
          <p className="m-0 whitespace-pre-line break-words text-base leading-7">{c.reply}</p>
        </div>
      ) : null}

      {editing ? (
        <form
          className="grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void patch({ reply });
          }}
        >
          <label className="text-[15px] font-medium" htmlFor={`reply-${c.id}`}>
            Your answer (shows under the comment as “TX Quince”)
          </label>
          <textarea id={`reply-${c.id}`} className="st-input min-h-28" value={reply} onChange={(e) => setReply(e.target.value)} maxLength={2000} rows={4} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="st-btn" disabled={busy || !reply.trim()}>
              Save answer
            </button>
            {c.reply ? (
              <button type="button" className="st-btn-ghost" disabled={busy} onClick={() => void patch({ reply: "" })}>
                Remove answer
              </button>
            ) : null}
            <button type="button" className="st-btn-ghost" disabled={busy} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {!editing ? (
        <div className="flex flex-wrap gap-2">
          {c.status !== "approved" ? (
            <button type="button" className="st-btn" disabled={busy} onClick={() => void patch({ status: "approved" })}>
              {busy ? "Saving…" : "Approve"}
            </button>
          ) : (
            <a className="st-btn" href={onSite(c)} target="_blank" rel="noopener noreferrer">
              See it on the site <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" className="st-btn-ghost" disabled={busy} onClick={() => setEditing(true)}>
            {c.reply ? "Edit answer" : "Answer"}
          </button>
          {c.status !== "hidden" ? (
            <button type="button" className="st-btn-ghost" disabled={busy} onClick={() => void patch({ status: "hidden" })}>
              Hide
            </button>
          ) : null}
          <button
            type="button"
            className="st-btn-ghost"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm(`Delete this comment from ${c.author_name} for good?`)) return;
              setBusy(true);
              const { ok, data } = await send("DELETE", { id: c.id });
              setBusy(false);
              if (ok) {
                onDelete(c.id);
                onNotice({ text: `Deleted ${c.author_name}'s comment for good.` });
              } else setError(String(data.error ?? "Could not delete."));
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="m-0 text-[15px] text-[var(--tq-status-down)]">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function CommentsManager({ initial }: { initial: AdminComment[] }) {
  const [rows, setRows] = useState(initial);
  const counts = Object.fromEntries(VIEWS.map((v) => [v.id, rows.filter((r) => r.status === v.id).length])) as Record<CommentStatus, number>;
  const [view, setView] = useState<CommentStatus>(counts.pending || !counts.approved ? "pending" : "approved");
  const shown = rows.filter((r) => r.status === view);
  const [notice, setNotice] = useState<Notice | null>(null);

  return (
    <>
    <div role="status" aria-live="polite">
      {notice ? (
        <p className="st-card m-0 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-l-4 border-l-[var(--tq-status-open)] px-5 py-4 text-base">
          <span className="font-medium">{notice.text}</span>
          {notice.href ? (
            <a className="st-btn-ghost" href={notice.href} target="_blank" rel="noopener noreferrer">
              {notice.linkLabel} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
    <section aria-label="Comments" className="st-card overflow-hidden">
      <nav className="st-tabs flex gap-4 overflow-x-auto px-5 sm:px-6" aria-label="Comment status">
        {VIEWS.map((v) => (
          <button key={v.id} type="button" className="st-tab" aria-current={view === v.id ? "page" : undefined} onClick={() => setView(v.id)}>
            {v.label} <span className="text-[var(--tq-ink-mute)]">{counts[v.id]}</span>
          </button>
        ))}
      </nav>
      {shown.length ? (
        <ol className="m-0 list-none p-0">
          {shown.map((c) => (
            <Row
              key={c.id}
              c={c}
              onChange={(next) => setRows((cur) => cur.map((r) => (r.id === next.id ? { ...r, ...next } : r)))}
              onDelete={(id) => setRows((cur) => cur.filter((r) => r.id !== id))}
              onNotice={setNotice}
            />
          ))}
        </ol>
      ) : (
        <p className="m-0 border-t border-[var(--tq-surface-2)] px-5 py-6 text-base text-[var(--tq-ink-mute)] sm:px-6">
          {view === "pending" ? "Nothing waiting. New comments show up here, and you get an email for each one." : "None yet."}
        </p>
      )}
    </section>
    </>
  );
}
