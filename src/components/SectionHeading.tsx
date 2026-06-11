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
      {eyebrow ? (
        <div className="mb-5">
          <span className="tag">{eyebrow}</span>
        </div>
      ) : null}
      <h2 className="display-2 text-balance text-ink">{children}</h2>
    </Reveal>
  );
}
