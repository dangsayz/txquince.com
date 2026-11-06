"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** How long the Undo link stays after "Try this". */
export const UNDO_MS = 10_000;

type Body = { title: string; area: string; target_metric: string; reason?: string };

/**
 * Start a "next move" (POST /api/admin/changes) with a short Undo window.
 * Undo archives the move it just created, with a note, so the Moves log never
 * judges a move that was started by mistake. `key` tells callers with several
 * buttons (HudIntel's numbered moves) which one is saving / undoable / failed.
 */
export function useMoveStarter<K extends string | number>() {
  const router = useRouter();
  const [saving, setSaving] = useState<K | null>(null);
  const [failed, setFailed] = useState<{ key: K; what: "start" | "undo" } | null>(null);
  const [undoable, setUndoable] = useState<{ key: K; id: string } | null>(null);
  const [started, setStarted] = useState<K[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function start(key: K, body: Body) {
    setSaving(key);
    setFailed(null);
    const res = await fetch("/api/admin/changes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, title: body.title.slice(0, 200) }),
    }).catch(() => null);
    const id: string | undefined = res?.ok ? (await res.json().catch(() => null))?.change?.id : undefined;
    setSaving(null);
    if (!res?.ok) {
      setFailed({ key, what: "start" });
      return;
    }
    setStarted((s) => [...s, key]);
    if (id) {
      setUndoable({ key, id });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setUndoable(null), UNDO_MS);
    }
    router.refresh();
  }

  async function undo() {
    if (!undoable) return;
    const { key, id } = undoable;
    window.clearTimeout(timer.current);
    setSaving(key);
    setFailed(null);
    const res = await fetch("/api/admin/changes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: "archived", notes: "Undone right after starting." }),
    }).catch(() => null);
    setSaving(null);
    if (!res?.ok) {
      setFailed({ key, what: "undo" });
      return;
    }
    setUndoable(null);
    setStarted((s) => s.filter((k) => k !== key));
    router.refresh();
  }

  return { start, undo, saving, failed, started, undoable };
}
