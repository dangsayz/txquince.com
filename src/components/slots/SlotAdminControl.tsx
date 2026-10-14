"use client";

/**
 * SlotAdminControl — the "Replace photo" button for one image slot, shown
 * only to a signed-in admin browsing the public site.
 *
 * How admin-ness is decided without making public pages dynamic:
 *  1. The server renders nothing here (pages stay static/ISR; no cookies read).
 *  2. After hydration, the island checks a localStorage hint that only
 *     visiting /admin sets (<AdminHint/>). Visitors have no hint, so they
 *     make no request and render nothing.
 *  3. With the hint, it asks /api/admin/session, which re-checks the Supabase
 *     session + ADMIN_EMAILS allowlist on the server. Only a `true` answer
 *     shows the button. (The upload/undo APIs check again on every call.)
 *  4. The editor is a separate chunk, `import()`ed on the first click, so
 *     visitors never download it.
 */
import { useEffect, useRef, useState, type ComponentType } from "react";

const HINT_KEY = "txq_admin";
let probe: Promise<boolean> | null = null;

function isAdmin(): Promise<boolean> {
  try {
    if (!window.localStorage.getItem(HINT_KEY)) return Promise.resolve(false);
  } catch {
    return Promise.resolve(false);
  }
  probe ??= fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : { admin: false }))
    .then((d: { admin?: boolean }) => d.admin === true)
    .catch(() => false);
  return probe;
}

type EditorProps = { slot: string; pageSrc?: string; onClose: () => void; onSaved: () => void };

export function SlotAdminControl({ slot }: { slot: string }) {
  const [admin, setAdmin] = useState(false);
  const [Editor, setEditor] = useState<ComponentType<EditorProps> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageSrc, setPageSrc] = useState<string | undefined>();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let alive = true;
    isAdmin().then((ok) => alive && setAdmin(ok));
    return () => {
      alive = false;
    };
  }, []);

  if (!admin) return null;

  async function open(e: React.SyntheticEvent) {
    // Frames often sit inside links/buttons: never navigate or open a viewer.
    e.preventDefault();
    e.stopPropagation();
    if (Editor || loading) return;
    // The photo this button sits on (what the visitor sees right now).
    const img = ref.current?.parentElement?.querySelector("img");
    setPageSrc(img?.currentSrc || img?.src || undefined);
    setLoading(true);
    try {
      const mod = await import("./SlotEditor");
      setEditor(() => mod.SlotEditor);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label="Replace photo"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") open(e);
        }}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 30,
          display: "inline-flex",
          alignItems: "center",
          minHeight: 44,
          padding: "0 14px",
          background: "#fff",
          color: "#111110",
          border: "1px solid #111110",
          font: "500 16px/1 system-ui, -apple-system, sans-serif",
          whiteSpace: "nowrap",
          cursor: "pointer",
          boxShadow: "0 1px 6px rgba(0,0,0,.18)",
        }}
      >
        {loading ? "Opening…" : "Replace photo"}
      </span>
      {Editor ? (
        <Editor slot={slot} pageSrc={pageSrc} onClose={() => setEditor(null)} onSaved={() => window.location.reload()} />
      ) : null}
    </>
  );
}
