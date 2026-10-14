import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You've been unsubscribed from follow-up emails.",
  alternates: { canonical: "/unsubscribed" },
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono">[TX Quince / Email preferences]</p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title">You&apos;re unsubscribed.</h1>
          <p className="tq-pg-mast__dek">
            I won&apos;t send any more follow-ups. If you change your mind or your plans change, you&apos;re always welcome to reach back out.
          </p>
          <div className="tq-pg-actions">
            <Link href="/" className="tq-btn tq-btn--lg">
              Back home <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
            <a href={`mailto:${site.contact.email}`} className="tq-pg-link">
              <span>{site.contact.email}</span>
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}
