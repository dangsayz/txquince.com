import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Site-wide CTA, in the Claura pill language (rounded, sentence-case).
 * - primary / ink: solid espresso pill (the main action)
 * - onDark:        soft light pill that reads on dark sections
 * - text:          inline arrow link
 */
type Variant = "primary" | "onDark" | "ink" | "text";

const variants: Record<Variant, string> = {
  primary: "btn-espresso",
  onDark: "btn-soft",
  ink: "btn-espresso",
  text: "inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-wine",
};

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
  return (
    <Link href={href} className={`${variants[variant]} ${className}`}>
      {children}
      {variant === "text" ? <span aria-hidden>→</span> : null}
    </Link>
  );
}
