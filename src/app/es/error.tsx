"use client";

import Link from "next/link";
import "@/components/txq/pages/pages.css";

/** Error boundary for the Spanish subtree (mirrors app/error.tsx). */
export default function ErrorPageEs({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" style={{ minHeight: "calc(65svh - var(--header-h))", alignContent: "center" }}>
        <p className="tq-pg-mast__index tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="tq-dot" data-limited="true" aria-hidden /> [Algo salió mal]
        </p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">No pudimos cargar esta página.</h1>
          <p className="tq-pg-mast__dek">
            Inténtalo de nuevo. Si sigue sin funcionar, vuelve al inicio y consulta tu fecha desde ahí.
          </p>
          <div className="tq-pg-actions">
            <button type="button" onClick={reset} className="tq-btn tq-btn--lg">
              Intentar de nuevo
            </button>
            <Link href="/es" className="tq-btn tq-btn--lg tq-btn--ghost">
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
