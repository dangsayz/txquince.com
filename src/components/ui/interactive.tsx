"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

function Overlay({ open, onClose, title, description, children, drawer = false }: OverlayProps & { drawer?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,36rem)] overflow-y-auto rounded-xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/60 ${drawer ? "ml-auto mr-0 h-dvh max-h-dvh w-[min(100%,26rem)] rounded-none border-y-0 border-r-0" : ""}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line p-5">
        <div>
          <h2 id={titleId} className="font-display text-2xl leading-tight text-ink">{title}</h2>
          {description && <p id={descriptionId} className="mt-1 text-sm text-ink-soft">{description}</p>}
        </div>
        <button type="button" autoFocus aria-label="Close" onClick={() => dialogRef.current?.close()} className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-ivory hover:text-ink">×</button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

export function Modal(props: OverlayProps) {
  return <Overlay {...props} />;
}

export function Drawer(props: OverlayProps) {
  return <Overlay {...props} drawer />;
}

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  const id = useId();
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-describedby={id}>
      {children}
      <span id={id} role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 max-w-52 -translate-x-1/2 rounded-md bg-ink px-2.5 py-1.5 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}

export function Toast({ message, open, onClose }: { message: string; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-50 flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-3 rounded-xl border border-line bg-ink px-4 py-3 text-sm text-white shadow-xl">
      <span>{message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={onClose} className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/15">×</button>
    </div>
  );
}

export type TabItem = { id: string; label: string; content: ReactNode };

export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const baseId = useId();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === active));

  function select(index: number) {
    const next = items[index];
    if (!next) return;
    setActive(next.id);
    tabsRef.current[index]?.focus();
  }

  if (!items.length) return null;
  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabsRef.current[index] = node; }}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                select((index + (event.key === "ArrowRight" ? 1 : items.length - 1)) % items.length);
              }
              if (event.key === "Home") { event.preventDefault(); select(0); }
              if (event.key === "End") { event.preventDefault(); select(items.length - 1); }
            }}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${index === selectedIndex ? "border-accent text-accent-strong" : "border-transparent text-ink-soft hover:text-ink"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div key={item.id} id={`${baseId}-panel-${index}`} role="tabpanel" aria-labelledby={`${baseId}-tab-${index}`} hidden={index !== selectedIndex} tabIndex={0} className="pt-5">
          {item.content}
        </div>
      ))}
    </div>
  );
}

export function Lightbox({ open, onClose, src, alt, caption }: { open: boolean; onClose: () => void; src: string; alt: string; caption?: string }) {
  return (
    <Modal open={open} onClose={onClose} title="Photograph" description={caption}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-ivory">
        <Image src={src} alt={alt} fill unoptimized sizes="(max-width: 640px) 100vw, 560px" className="object-contain" />
      </div>
    </Modal>
  );
}
