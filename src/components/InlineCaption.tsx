"use client";

/**
 * InlineCaption — admin-only, edit-in-place caption for the PUBLIC site.
 *
 * Visitors just see the text (or nothing, if empty). A signed-in operator gets
 * a quiet hover affordance; double-click / double-tap turns it into a field,
 * Enter or blur saves via `onSave`, Esc cancels. Mirrors the EditMode probe so
 * it costs a visitor nothing.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/components/EditMode";
import "@/components/txq/pages/pages.css";

export function InlineCaption({
  value,
  onSave,
  className,
  placeholder = "Add caption",
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}) {
  const admin = useIsAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Visitors: plain text, nothing when empty.
  if (!admin) return value ? <span className={className}>{value}</span> : null;

  async function commit() {
    setEditing(false);
    const next = draft.trim();
    if (next === value) return;
    setSaving(true);
    try {
      await onSave(next);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        aria-label="Caption"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`tq-pg-icap-input ${className ?? ""}`}
      />
    );
  }

  return (
    <span
      onDoubleClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Double-click to edit (admin only)"
      data-empty={value ? undefined : "true"}
      className={`tq-pg-icap ${className ?? ""}`}
    >
      {value || placeholder}
      <span aria-hidden className="tq-pg-icap__pen">
        ✎
      </span>
      {saving ? <span className="tq-mono tq-muted">saving…</span> : null}
    </span>
  );
}
