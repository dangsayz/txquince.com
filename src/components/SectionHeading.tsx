import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import "@/components/txq/pages/pages.css";

/** Mono index label over an Inter display h2 — the homepage section head. */
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
    <Reveal className={`tq-pg-sh ${align === "center" ? "tq-pg-sh--center" : ""} ${className}`}>
      {eyebrow ? <p className="tq-mono tq-pg-sh__eyebrow">[{eyebrow}]</p> : null}
      <h2 className="tq-display tq-pg-sh__title">{children}</h2>
    </Reveal>
  );
}
