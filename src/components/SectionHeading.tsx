import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

/**
 * Editorial heading: small uppercase tracked eyebrow over an oversized serif
 * heading. Dramatic scale contrast is the premium signal (LAYOUT DISCIPLINE).
 */
export function SectionHeading({
  eyebrow,
  children,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  children: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={`${align === "center" ? "text-center" : ""} ${className}`}
    >
      {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
      <h2 className="font-display text-balance text-3xl leading-[1.08] text-ink sm:text-4xl md:text-5xl">
        {children}
      </h2>
    </Reveal>
  );
}
