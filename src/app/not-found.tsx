import Link from "next/link";
import "@/components/txq/pages/pages.css";

export default function NotFound() {
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" style={{ minHeight: "calc(70svh - var(--header-h))", alignContent: "center" }}>
        <p className="tq-pg-mast__index tq-mono">[404 / Page not found]</p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title">
            This page isn&apos;t here. <em>The link may have moved.</em>
          </h1>
          <p className="tq-pg-mast__dek">You can return home, browse the galleries, or check her date.</p>
          <div className="tq-pg-actions">
            <Link href="/" className="tq-btn tq-btn--lg">
              Return home <span className="tq-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/portfolio" className="tq-btn tq-btn--lg tq-btn--ghost">
              View galleries
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
