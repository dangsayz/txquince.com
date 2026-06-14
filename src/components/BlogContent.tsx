import Link from "next/link";
import type { ReactNode } from "react";
import type { BlogBlock } from "@/content/blog";
import { slugifyHeading } from "@/content/blog";

/**
 * Renders structured blog blocks. Inline `[label](/href)` in prose becomes a
 * link — internal hrefs use next/link (contextual internal linking, LAW 5),
 * external hrefs open safely in a new tab.
 */
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

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
        <Link key={i++} href={href} className="text-wine underline underline-offset-2 hover:text-wine-deep">
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a key={i++} href={href} target="_blank" rel="noopener noreferrer" className="text-wine underline underline-offset-2 hover:text-wine-deep">
          {label}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={slugifyHeading(b.text)}
                className="mt-6 scroll-mt-28 font-display text-3xl text-ink"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-2 font-display text-2xl text-ink">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-base leading-relaxed text-ink-soft">
                {renderInline(b.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="flex flex-col gap-2.5 pl-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-base leading-relaxed text-ink-soft">
                    <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-wine" />
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="flex flex-col gap-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-base leading-relaxed text-ink-soft">
                    <span className="font-display text-lg leading-none text-wine">{j + 1}.</span>
                    <span>{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-l-2 border-wine pl-5 font-display text-2xl italic leading-snug text-ink">
                {renderInline(b.text)}
              </blockquote>
            );
          case "callout":
            return (
              <div key={i} className="border border-line bg-greige p-5 text-sm leading-relaxed text-ink">
                {renderInline(b.text)}
              </div>
            );
          case "cta":
            return (
              <div key={i} className="card-apple my-2 p-6 text-center md:p-8">
                <p className="font-display text-2xl text-ink text-balance">{b.heading}</p>
                {b.body ? <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{b.body}</p> : null}
                <Link href={b.href} className="btn-espresso mt-5 inline-flex">
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
