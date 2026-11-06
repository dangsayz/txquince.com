import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one page frame for every Studio (admin) page, matching Today:
 * one width, one title size, one plain sentence under it, actions on the right.
 * No label above the title; use `back` for a parent page instead.
 */
export function StudioPage({
  title,
  intro,
  actions,
  back,
  wide = false,
  children,
}: {
  title: ReactNode;
  /** One sentence: what this page is for. */
  intro?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  /** Photo and film libraries need more room for their grids. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className={`mx-auto px-4 pb-20 pt-8 sm:px-8 lg:pt-12 ${wide ? "max-w-[88rem]" : "max-w-[72rem]"}`}>
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0 max-w-[44rem]">
          {back && (
            <Link href={back.href} className="st-link -mt-2 mb-1 text-[var(--tq-ink-mute)]">
              <span aria-hidden="true">←</span> {back.label}
            </Link>
          )}
          <h1 className="st-h1">{title}</h1>
          {intro && <p className="m-0 mt-2 text-base leading-6 text-[var(--tq-ink-mute)]">{intro}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </header>
      <div className="mt-8 grid min-w-0 gap-6">{children}</div>
    </main>
  );
}

/** A titled card section. The only section style on Studio pages. */
export function StudioSection({
  title,
  intro,
  action,
  children,
  flush = false,
  id,
}: {
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** true = content runs edge to edge (tables, lists with their own padding). */
  flush?: boolean;
  id?: string;
}) {
  const headingId = id ?? `s-${typeof title === "string" ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "section"}`;
  return (
    <section aria-labelledby={headingId} className={`st-card ${flush ? "overflow-hidden" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="st-h2">{title}</h2>
          {intro && <p className="m-0 mt-1 text-[15px] leading-6 text-[var(--tq-ink-mute)]">{intro}</p>}
        </div>
        {action}
      </div>
      <div className={flush ? "mt-4" : "px-5 pb-5 pt-4 sm:px-6"}>{children}</div>
    </section>
  );
}
