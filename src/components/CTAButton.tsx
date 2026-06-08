import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The ONE primary CTA, site-wide (CONVERSION MECHANICS LAW): "Check Your Date".
 * - primary: filled wine accent
 * - ghost: outlined, for on-image or secondary placement (still the same label)
 * - text: inline arrow link ("See full galleries →")
 */
type Variant = "primary" | "ghost" | "text" | "onDark";

const base =
  "inline-flex items-center justify-center gap-2 font-body text-sm tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-wine text-cream px-8 py-4 hover:bg-wine-deep hover:-translate-y-0.5",
  onDark:
    "bg-cream text-ink px-8 py-4 hover:bg-ivory hover:-translate-y-0.5",
  ghost:
    "border border-ink/25 text-ink px-8 py-4 hover:border-ink hover:bg-ink hover:text-cream",
  text: "text-ink underline-offset-4 hover:underline px-0 py-1 text-[0.95rem]",
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
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {variant === "text" ? <span aria-hidden>→</span> : null}
    </Link>
  );
}
