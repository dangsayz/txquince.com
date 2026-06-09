"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Channel = {
  label: string;
  href: (url: string, title: string) => string;
  bg: string;
  icon: React.ReactNode;
};

const CHANNELS: Channel[] = [
  {
    label: "Messages",
    bg: "bg-[#34c759]",
    href: (url, title) => `sms:?&body=${encodeURIComponent(`${title} ${url}`)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.76 1.45 5.22 3.72 6.84-.13 1.2-.62 2.3-1.42 3.18-.2.22-.06.58.24.56 1.78-.13 3.4-.72 4.74-1.66.86.2 1.78.32 2.72.32 5.52 0 10-3.94 10-8.84S17.52 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    bg: "bg-[#25d366]",
    href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M.06 24l1.69-6.16a11.9 11.9 0 01-1.6-5.96C.15 5.32 5.5 0 12.06 0a11.8 11.8 0 018.4 3.49 11.76 11.76 0 013.48 8.39c0 6.55-5.35 11.88-11.92 11.88a12 12 0 01-5.7-1.45L.06 24zM6.6 20.13c1.68 1 3.28 1.6 5.4 1.6 5.45 0 9.9-4.42 9.9-9.85a9.8 9.8 0 00-2.9-6.97 9.78 9.78 0 00-6.94-2.88c-5.46 0-9.9 4.43-9.9 9.86 0 2.06.6 3.6 1.62 5.26l-.99 3.6 3.7-.96zM17.5 14.7c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.2 1.87.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.29.17-1.42z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    bg: "bg-[#1877f2]",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" />
      </svg>
    ),
  },
  {
    label: "Email",
    bg: "bg-ink",
    href: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    label: "X",
    bg: "bg-black",
    href: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.3 19.5h2.04L6.5 3.24H4.32L17.6 20.65z" />
      </svg>
    ),
  },
];

/** Clean, branded share window (replaces the OS share sheet). */
export function ShareModal({
  open,
  url,
  title,
  onClose,
}: {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open || !mounted) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Share"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="share-fade absolute inset-0 bg-ink/45 backdrop-blur-sm"
      />

      {/* sheet */}
      <div className="share-pop relative w-full max-w-sm rounded-t-[1.75rem] border border-line bg-cream p-6 shadow-[0_-20px_60px_-20px_rgba(44,29,18,0.4)] sm:rounded-[1.75rem] sm:shadow-[0_30px_80px_-30px_rgba(44,29,18,0.5)]">
        {/* grab handle (mobile) */}
        <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl leading-tight text-ink">Share</p>
            <p className="mt-1 text-sm text-ink-soft">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-greige hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* channels */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => navigator.vibrate?.(6)}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-95 ${c.bg}`}
              >
                {c.icon}
              </span>
              <span className="text-[0.68rem] text-ink-soft">{c.label}</span>
            </a>
          ))}
        </div>

        {/* copy link */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-line bg-ivory py-1.5 pl-4 pr-1.5">
          <span className="flex-1 truncate text-sm text-ink-soft">{url}</span>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-full bg-ink px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-wine"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
