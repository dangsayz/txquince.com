"use client";

import { useEffect, useId, useRef, useState } from "react";
import "@/components/txq/pages/pages.css";

export type SelectOption = { value: string; label: string };

/**
 * Custom styled dropdown — replaces the native <select> so the open menu matches
 * the palette. Implements the APG select-only combobox pattern: fully keyboard
 * operable (ArrowUp/Down, Home/End, Enter/Space, Escape) with
 * aria-activedescendant, so screen-reader and keyboard users can pick a
 * collection on the booking form.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Choose…",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const ref = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optId = (i: number) => `${baseId}-opt-${i}`;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function openList() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function commit(i: number) {
    const o = options[i];
    if (o) onChange(o.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.min(a + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openList();
        else commit(active);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={ref} className="tq-pg-sel">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? optId(active) : undefined}
        aria-label={ariaLabel ?? (selected?.label ? undefined : placeholder)}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="tq-pg-sel__btn"
      >
        <span className={selected ? undefined : "tq-muted"}>{selected?.label ?? placeholder}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>

      {open ? (
        <ul id={listboxId} role="listbox" aria-label={ariaLabel} className="tq-pg-sel__list">
          {options.map((o, i) => {
            const isSelected = o.value === value;
            const isActive = i === active;
            return (
              <li key={o.value} id={optId(i)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep focus on the combobox
                    commit(i);
                  }}
                  data-active={isActive || undefined}
                  data-selected={isSelected || undefined}
                  className="tq-pg-sel__opt"
                >
                  <span>{o.label}</span>
                  {isSelected ? (
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden>
                      <path d="M1 5.5L5 9.5L13 1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
