"use client";

/**
 * The passage a reader picked to comment on. One per post, kept in
 * sessionStorage so it survives the trip through log in. Tiny external store
 * (useSyncExternalStore) so the picker and the comment box stay in step.
 */
import { useSyncExternalStore } from "react";

const KEY = (slug: string) => `txq_quote:${slug}`;
const listeners = new Set<() => void>();
/** Fired to bring the comment box into view and focus it. */
export const COMMENT_FOCUS_EVENT = "txq:comment-focus";

function read(slug: string): string {
  try {
    return window.sessionStorage.getItem(KEY(slug)) ?? "";
  } catch {
    return "";
  }
}

export function setQuote(slug: string, quote: string): void {
  try {
    if (quote) window.sessionStorage.setItem(KEY(slug), quote);
    else window.sessionStorage.removeItem(KEY(slug));
  } catch {
    /* private mode: the quote just won't survive a reload */
  }
  listeners.forEach((l) => l());
}

export function useQuote(slug: string): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(slug),
    () => "",
  );
}

export function focusCommentBox(): void {
  window.dispatchEvent(new Event(COMMENT_FOCUS_EVENT));
}
