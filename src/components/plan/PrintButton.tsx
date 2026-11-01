"use client";

/** Opens the browser's print sheet ("Save as PDF" on phones and desktops). */
export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="tq-btn tq-btn--lg qp-cta qp-noprint">
      {label}
    </button>
  );
}
