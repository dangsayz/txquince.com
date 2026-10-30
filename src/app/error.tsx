"use client";

import Link from "next/link";
import "@/components/txq/pages/pages.css";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" style={{ minHeight: "calc(65svh - var(--header-h))", alignContent: "center" }}>
        <p className="tq-pg-mast__index tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="tq-dot" data-limited="true" aria-hidden /> [Something went wrong]
        </p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">We couldn&apos;t load this page.</h1>
          <p className="tq-pg-mast__dek">
            Please try again. If it still doesn&apos;t work, you can return home and check your date from there.
          </p>
          <div className="tq-pg-actions">
            <button type="button" onClick={reset} className="tq-btn tq-btn--lg">
              Try again
            </button>
            <Link href="/" className="tq-btn tq-btn--lg tq-btn--ghost">
              Return home
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
