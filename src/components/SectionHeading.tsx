import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

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
