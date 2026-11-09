"use client";

/**
 * AdminQuick — the owner's quick controls on the PUBLIC site. Visitors never
 * see them (useIsAdmin), and every action is checked again on the server
 * (/api/admin/*). They show when the owner points at a review or a comment
 * (always shown on touch screens, which have no hover).
 *   review:  Remove  → hides it from the site; it stays in Studio › Reviews
 *   comment: Remove  → hides it; it stays in Studio › Comments
 *            Block   → hides all of that person's comments and stops new ones
 */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/components/EditMode";
import "./admin-quick.css";

type Props = { kind: "review" | "comment"; id: string; name: string };

async function send(url: string, method: "PATCH" | "POST", body: unknown): Promise<string | null> {
  const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (res?.ok) return null;
  const data = ((await res?.json().catch(() => ({}))) ?? {}) as { error?: string };
  return data.error ?? "Could not save. Try again.";
}

export function AdminQuick({ kind, id, name }: Props) {
  const admin = useIsAdmin();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!admin) return null;

  async function run(question: string, call: () => Promise<string | null>) {
    if (!window.confirm(question)) return;
    setBusy(true);
    setError(null);
    const err = await call();
    setBusy(false);
    if (err) return setError(err);
    // Gone at once here; the server already refreshed the page for everyone else.
    const row = ref.current?.closest("li");
    if (row) row.hidden = true;
    router.refresh();
  }

  const remove = () =>
    kind === "review"
      ? run(`Remove ${name}'s review from the site? It stays in Studio, under Reviews › Hidden, and you can show it again.`, () =>
          send("/api/admin/reviews", "PATCH", { id, status: "hidden" }),
        )
      : run(`Remove ${name}'s comment from the site? It stays in Studio, under Comments › Hidden.`, () =>
          send("/api/admin/comments", "PATCH", { id, status: "hidden" }),
        );
  const block = () =>
    run(`Block ${name}? All of their comments come off the site and they can't comment again. You can unblock them in Studio, under Comments.`, () =>
      send("/api/admin/comments/block", "POST", { id }),
    );

  return (
    <div ref={ref} className="tq-adminq" role="group" aria-label={`Owner controls for ${name}`}>
      <button type="button" className="tq-adminq__btn" disabled={busy} onClick={remove}>
        {busy ? "Saving…" : "Remove"}
      </button>
      {kind === "comment" ? (
        <button type="button" className="tq-adminq__btn" data-tone="danger" disabled={busy} onClick={block}>
          Block person
        </button>
      ) : null}
      {error ? (
        <span role="alert" className="tq-adminq__error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
