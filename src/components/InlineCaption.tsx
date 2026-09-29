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
        className={`${className ?? ""} w-full max-w-full border-b border-wine bg-transparent outline-none`}
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
      className={`${className ?? ""} group/cap inline-flex cursor-text items-center gap-1.5 rounded-sm px-0.5 transition-colors hover:bg-wine/10 ${
        value ? "" : "italic text-ink-faint"
      }`}
    >
      {value || placeholder}
      <span
        aria-hidden
        className="opacity-0 transition-opacity group-hover/cap:opacity-100"
      >
        ✎
      </span>
      {saving ? <span className="text-[0.85em] not-italic text-ink-faint">saving…</span> : null}
    </span>
  );
}
