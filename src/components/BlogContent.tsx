import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { BlogBlock } from "@/content/blog";
import { slugifyHeading } from "@/content/blog";

/** A resolved photo for an `image` block — built by the post page from the slug. */
export type BlogImage = {
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
  caption?: string | null;
};

/**
 * Renders structured blog blocks in the site's editorial voice — generous
 * reading type, hairline ornament only, no cards. Inline `[label](/href)` in
 * prose becomes a link: internal hrefs use next/link (contextual internal
 * linking, LAW 5), external hrefs open safely in a new tab.
 */
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const linkClass =
  "text-wine underline decoration-wine/40 underline-offset-[3px] transition-colors hover:text-wine-deep hover:decoration-wine-deep";

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  let i = 0;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const [, label, href] = m;
    if (href.startsWith("/")) {
      nodes.push(
        <Link key={i++} href={href} className={linkClass}>
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a key={i++} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const proseText = "text-[1.0625rem] leading-[1.85] text-ink-soft";

export function BlogContent({
  blocks,
  images,
}: {
  blocks: BlogBlock[];
  images?: Record<string, BlogImage>;
}) {
  return (
    <div className="flex flex-col gap-7">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={slugifyHeading(b.text)}
                className="mt-8 scroll-mt-28 font-display text-ink"
                style={{ fontSize: "clamp(1.9rem,3.4vw,2.5rem)", lineHeight: 1.08, letterSpacing: "-0.015em" }}
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-3 font-display text-2xl leading-snug text-ink">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className={proseText}>
                {renderInline(b.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="flex flex-col gap-3">
                {b.items.map((it, j) => (
                  <li key={j} className={`flex gap-3.5 ${proseText}`}>
                    <span aria-hidden className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-wine" />
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="flex flex-col gap-3">
                {b.items.map((it, j) => (
                  <li key={j} className={`flex gap-3.5 ${proseText}`}>
                    <span className="shrink-0 font-display text-lg leading-[1.4] text-wine tabular-nums">
                      {j + 1}.
                    </span>
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-2 border-l-2 border-wine pl-6 font-display italic leading-snug text-ink"
                style={{ fontSize: "clamp(1.4rem,2.6vw,1.9rem)", letterSpacing: "-0.01em" }}
              >
                {renderInline(b.text)}
              </blockquote>
            );
          case "callout":
            return (
              <aside
                key={i}
                className="my-2 border-l-2 border-wine/40 py-1 pl-6 text-[1.0625rem] leading-[1.75] text-ink"
              >
                {renderInline(b.text)}
              </aside>
            );
          case "image": {
            const img = images?.[b.slug];
            if (!img?.url) return null; // missing photo → render nothing, never a placeholder
            const caption = b.caption ?? img.caption ?? null;
            return (
              <figure key={i} className="my-4">
                <div className="overflow-hidden bg-greige">
                  <Image
                    src={img.url}
                    alt={b.alt || img.alt || "Quinceañera in Dallas–Fort Worth"}
                    width={img.width ?? 1600}
                    height={img.height ?? 1067}
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="block h-auto w-full"
                  />
                </div>
                {caption ? (
                  <figcaption className="mt-2.5 text-[0.8rem] leading-relaxed text-ink-faint">
                    {caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case "cta":
            return (
              <div
                key={i}
                className="my-6 border-y border-ink/10 py-10 text-center md:py-12"
              >
                <p className="mx-auto max-w-lg font-display text-2xl text-ink text-balance md:text-[1.8rem]">
                  {b.heading}
                </p>
                {b.body ? (
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{b.body}</p>
                ) : null}
                <Link href={b.href} className="btn-espresso mt-6 inline-flex">
                  {b.label}
                </Link>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
