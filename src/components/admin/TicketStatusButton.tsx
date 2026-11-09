"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Mark a support ticket done, or open it again. */
export function TicketStatusButton({ id, status }: { id: string; status: "open" | "closed" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const next = status === "open" ? "closed" : "open";
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="st-btn-ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          try {
            const res = await fetch("/api/admin/support", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: next }) });
            if (!res.ok) throw new Error();
            router.refresh();
          } catch {
            setFailed(true);
          }
          setBusy(false);
        }}
      >
        {busy ? "Saving…" : status === "open" ? "Mark done" : "Open again"}
      </button>
      {failed ? <span role="alert" className="text-[15px] text-[var(--tq-status-down)]">Could not save. Try again.</span> : null}
    </span>
  );
}
