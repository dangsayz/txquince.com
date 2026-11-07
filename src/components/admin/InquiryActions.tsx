"use client";

/**
 * InquiryActions — the "⋯" menu on each inquiry row (Today's priority queue
 * and /admin/inquiries): mark booked, mark lost (with why), reopen, or delete
 * for good. Every action goes to /api/admin/inquiries, which re-checks the
 * admin session itself; the page refreshes when it's done.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "new" | "won" | "lost" | "unsubscribed";
const REASONS = [
  { id: "price", label: "Price" },
  { id: "availability", label: "Date not available" },
  { id: "booked_competitor", label: "Booked someone else" },
  { id: "ghosted", label: "Stopped replying" },
  { id: "other", label: "Other" },
] as const;

const item =
  "flex min-h-11 w-full items-center whitespace-nowrap rounded-md px-3 text-left text-[15px] text-[var(--tq-ink)] hover:bg-[var(--tq-surface)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--tq-ink)] disabled:opacity-40";

export function InquiryActions({ id, name, status }: { id: string; name: string; status: Status }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"menu" | "lost" | "delete">("menu");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  /** Open upward when the row sits near the bottom of the window. */
  const [up, setUp] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Focus the first item so the keyboard lands inside the menu; arrows move between items.
    menu.current?.querySelector<HTMLElement>("[role=menuitem]:not(:disabled)")?.focus();
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = [...(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not(:disabled)") ?? [])];
        if (!items.length) return;
        e.preventDefault();
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function send(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error || "Couldn't save. Try again.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={root} className="relative inline-flex">
      <button
        ref={button}
        type="button"
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          const r = button.current?.getBoundingClientRect();
          setUp(r ? window.innerHeight - r.bottom < 260 && r.top > 260 : false);
          setOpen((o) => !o);
          setStep("menu");
          setError(null);
        }}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-xl leading-none text-[#555] hover:bg-[#f2f2f0] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]"
      >
        <span aria-hidden>⋯</span>
      </button>
      {open ? (
        <div
          ref={menu}
          role="menu"
          aria-label={`Actions for ${name}`}
          className={`absolute right-0 z-30 ${up ? "bottom-full mb-1" : "top-full mt-1"} w-64 max-w-[calc(100vw-2rem)] rounded-[var(--tq-radius-md)] border border-[var(--tq-surface-2)] bg-white p-1.5 text-left shadow-[var(--tq-shadow-overlay)]`}
        >
          {step === "menu" ? (
            <>
              {status !== "won" ? (
                <button type="button" role="menuitem" className={item} disabled={busy} onClick={() => send("PATCH", { status: "won" })}>
                  Mark booked
                </button>
              ) : null}
              {status !== "lost" ? (
                <button type="button" role="menuitem" className={item} disabled={busy} onClick={() => setStep("lost")}>
                  Mark lost…
                </button>
              ) : null}
              {status !== "new" ? (
                <button type="button" role="menuitem" className={item} disabled={busy} onClick={() => send("PATCH", { status: "new" })}>
                  Reopen
                </button>
              ) : null}
              <div className="my-1 border-t border-[#ededeb]" role="separator" />
              <button type="button" role="menuitem" className={`${item} text-[#8d2f2f]`} disabled={busy} onClick={() => setStep("delete")}>
                Delete…
              </button>
            </>
          ) : step === "lost" ? (
            <>
              <p className="px-3 pb-1 pt-2 text-[13px] font-semibold text-[var(--tq-ink-mute)]">Why was it lost?</p>
              {REASONS.map((r) => (
                <button key={r.id} type="button" role="menuitem" className={item} disabled={busy} onClick={() => send("PATCH", { status: "lost", lost_reason: r.id })}>
                  {r.label}
                </button>
              ))}
              <button type="button" role="menuitem" className={`${item} text-[#62625f]`} onClick={() => setStep("menu")}>
                ← Back
              </button>
            </>
          ) : (
            <div className="p-2">
              <p className="text-[15px] leading-snug text-[#252525]">
                Delete <strong className="font-semibold">{name}</strong> for good? Use this for spam, tests or duplicates. It can&apos;t be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => send("DELETE", {})}
                  className="min-h-11 flex-1 whitespace-nowrap rounded-md bg-[#8d2f2f] px-3 text-[15px] font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Deleting…" : "Delete"}
                </button>
                <button type="button" onClick={() => setStep("menu")} className="min-h-11 flex-1 whitespace-nowrap rounded-md border border-[#c9cac7] px-3 text-[15px]">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {error ? (
            <p role="alert" className="px-3 pb-2 pt-1 text-sm font-medium text-[#8d2f2f]">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
