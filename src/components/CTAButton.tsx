import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The ONE primary CTA, site-wide: "Check Your Date". Couture button language —
 * thin outlined pills that fill on hover (not heavy filled blocks).
 * - primary: wine outline on light, fills wine on hover
 * - onDark:  cream outline over photos/dark, fills cream on hover
 * - ink:     charcoal outline on light
 * - text:    inline arrow link
 */
type Variant = "primary" | "onDark" | "ink" | "text";

const variants: Record<Variant, string> = {
  primary:
    "btn-pill text-wine hover:bg-wine hover:text-cream",
  onDark:
    "btn-pill text-cream hover:bg-cream hover:text-ink",
  ink: "btn-pill text-ink hover:bg-ink hover:text-cream",
  text:
    "inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-ink hover:text-wine transition-colors",
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
