"use client";

import { useEffect, useRef, useState } from "react";
import { QUOTE_MAX, QUOTE_MIN, cleanQuote } from "@/lib/comments";
import { COPY, type CommentLang } from "./copy";
import { PROSE_SELECTOR, findPassage, paint, scrollToRange } from "./passages";
import { focusCommentBox, setQuote } from "./quote-store";

/**
 * Two small behaviors on a post, one component:
 *  1. Select words in the article → a "Comment on this" button appears by the
 *     selection. It hands the passage to the comment box.
 *  2. Passages that approved comments are about get a soft mark in the
 *     article; tapping a comment's quote jumps to its passage.
 */
export function QuoteTools({ lang, slug, quotes }: { lang: CommentLang; slug: string; quotes: string[] }) {
  const c = COPY[lang];
  const [pick, setPick] = useState<{ text: string; x: number; y: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);

  // 1. Selection → floating button.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const sel = window.getSelection();
      const prose = document.querySelector(PROSE_SELECTOR);
      if (!sel || sel.isCollapsed || !sel.rangeCount || !prose) return setPick(null);
      const range = sel.getRangeAt(0);
      if (!prose.contains(range.commonAncestorContainer)) return setPick(null);
      const text = cleanQuote(sel.toString());
      if (text.length < QUOTE_MIN) return setPick(null);
      const rect = range.getBoundingClientRect();
      const x = Math.min(Math.max(rect.left + rect.width / 2, 110), window.innerWidth - 110);
      // Below the selection: phones put their own copy menu above it.
      const y = Math.min(rect.bottom + 10, window.innerHeight - 64);
      setPick({ text: text.slice(0, QUOTE_MAX), x, y });
    };
    const onChange = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    document.addEventListener("selectionchange", onChange);
    window.addEventListener("scroll", onChange, { passive: true });
    return () => {
      document.removeEventListener("selectionchange", onChange);
      window.removeEventListener("scroll", onChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 2. Marks for passages with approved comments + jump from a quote.
  useEffect(() => {
    const prose = document.querySelector(PROSE_SELECTOR);
    if (!prose) return;
    const ranges = new Map<string, Range>();
    for (const q of quotes) {
      const r = findPassage(prose, q);
      if (r) ranges.set(q, r);
    }
    paint("tq-quoted", [...ranges.values()]);
    let timer = 0;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-tq-quote]");
      if (!el) return;
      const r = ranges.get(el.dataset.tqQuote ?? "");
      if (!r) return;
      scrollToRange(r);
      paint("tq-quoted-active", [r]);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => paint("tq-quoted-active", []), 2600);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      window.clearTimeout(timer);
      paint("tq-quoted", []);
      paint("tq-quoted-active", []);
    };
  }, [quotes]);

  if (!pick) return null;
  return (
    <button
      ref={btn}
      type="button"
      className="tq-cmt-pick"
      style={{ left: pick.x, top: pick.y }}
      // Keep the selection alive while the button is pressed.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        setQuote(slug, pick.text);
        window.getSelection()?.removeAllRanges();
        setPick(null);
        focusCommentBox();
      }}
    >
      <QuoteIcon />
      {c.pick}
    </button>
  );
}

export function QuoteIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden focusable="false">
      <path d="M4 5.5h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9.5L6 16.5v-3H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 8.5h6M7 10.8h3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
