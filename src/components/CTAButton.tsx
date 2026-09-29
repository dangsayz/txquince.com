import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui";

type Variant = "primary" | "onDark" | "ink" | "text";

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
    return <Link href={href} className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-wine transition-colors hover:text-wine-deep ${className}`}>{children}<span aria-hidden="true">↗</span></Link>;
  }
  if (variant === "onDark") {
    return <Link href={href} className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-white bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ivory ${className}`}>{children}</Link>;
  }
  return <ButtonLink href={href} tone="primary" className={className}>{children}</ButtonLink>;
}
