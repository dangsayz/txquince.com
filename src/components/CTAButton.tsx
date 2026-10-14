import Link from "next/link";
import type { ReactNode } from "react";
import "@/components/txq/pages/pages.css";

type Variant = "primary" | "onDark" | "ink" | "text";

/** Homepage button system: tq-btn (48px primary), a light fill for dark media, or an underlined text link. */
export function CTAButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  if (variant === "text") {
    return (
      <Link href={href} className={`tq-pg-link ${className}`}>
        <span>{children}</span>
        <span className="tq-arrow" aria-hidden>↗</span>
      </Link>
    );
  }
  const tone = variant === "onDark" ? " tq-pg-btn--light" : "";
  return (
    <Link href={href} className={`tq-btn tq-btn--lg${tone} ${className}`}>
      {children} <span className="tq-arrow" aria-hidden>→</span>
    </Link>
  );
}
