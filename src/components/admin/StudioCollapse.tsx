"use client";

/**
 * StudioCollapse — a Studio card the owner can fold away. The heading row is
 * the button; the choice is remembered on this device (localStorage), so a
 * section folded today is still folded tomorrow. Open by default.
 */
import { useEffect, useId, useState, type ReactNode } from "react";

export function StudioCollapse({ id, title, note, children, className = "" }: { id: string; title: string; note?: ReactNode; children: ReactNode; className?: string }) {
  const key = `txq_fold:${id}`;
  const body = useId();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    try {
      // Read after mount: the server cannot know this device's choice.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(key) === "closed") setOpen(false);
    } catch {
      /* private mode: stay open */
    }
  }, [key]);

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      window.localStorage.setItem(key, next ? "open" : "closed");
    } catch {
      /* ignore */
    }
  }

  return (
    <section aria-labelledby={`${id}-title`} className={`st-card st-fold overflow-hidden ${className}`} data-open={open}>
      <h2 id={`${id}-title`} className="m-0">
        <button type="button" className="st-fold__head" aria-expanded={open} aria-controls={body} onClick={toggle}>
          <span className="st-h2">{title}</span>
          <span className="st-fold__hint">
            {open ? "Hide" : "Show"}
            <svg aria-hidden="true" className="st-fold__chev" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </button>
      </h2>
      <div id={body} hidden={!open}>
        {note ? <p className="st-note px-5 sm:px-6">{note}</p> : null}
        {children}
      </div>
    </section>
  );
}
