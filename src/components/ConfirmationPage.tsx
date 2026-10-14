import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { getFeaturedImages } from "@/lib/content-db";
import { selectFullBleedPhoto } from "@/lib/quality-photo";
import "@/components/txq/pages/pages.css";

type ConfirmationPageProps = {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  primaryLabel: string;
  homeLabel: string;
  homeHref: string;
  contactLabel: string;
};

export async function ConfirmationPage({
  eyebrow,
  title,
  children,
  primaryLabel,
  homeLabel,
  homeHref,
  contactLabel,
}: ConfirmationPageProps) {
  const photo = selectFullBleedPhoto(await getFeaturedImages(12), 2);
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="tq-dot" aria-hidden /> [{eyebrow}]
        </p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{title}</h1>
          <div className="tq-pg-mast__dek">{children}</div>
          <div className="tq-pg-actions">
            <Link href="/portfolio" className="tq-btn tq-btn--lg">
              {primaryLabel} <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
            <Link href={homeHref} className="tq-btn tq-btn--lg tq-btn--ghost">
              {homeLabel}
            </Link>
          </div>
        </div>
      </header>
      <figure className="tq-pg-plate tq-pg-plate--short">
        <Image src={photo?.url ?? "/portfolio/hero.webp"} alt="" fill priority unoptimized={!photo} sizes="100vw" style={{ objectPosition: "center 46%" }} />
      </figure>
      <div className="tq-pg-row" style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <p className="tq-pg-row__index tq-mono">[TX Quince]</p>
        <div className="tq-pg-row__body">
          <p className="tq-muted" style={{ margin: 0 }}>
            {contactLabel}{" "}
            <a href={`mailto:${site.contact.email}`} className="tq-pg-inline">
              {site.contact.email}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
