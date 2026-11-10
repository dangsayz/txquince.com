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

/**
 * Where the rail's form goes. The rail box registers its mount element here
 * and the one Composer (bottom box) draws the rail form into it through a
 * portal, so both forms live under a single Clerk provider (Clerk allows one).
 */
let railMount: HTMLElement | null = null;
const railListeners = new Set<() => void>();
export function setRailMount(el: HTMLElement | null) {
  if (railMount === el) return;
  railMount = el;
  railListeners.forEach((fn) => fn());
}
export function subscribeRailMount(fn: () => void) {
  railListeners.add(fn);
  return () => {
    railListeners.delete(fn);
  };
}
export const getRailMount = () => railMount;

/**
 * A starter picked before logging in. It waits in this tab (sessionStorage)
 * while the visitor logs in, then lands in the bottom comment field once.
 */
const draftKey = (slug: string) => `tq-cmt-start:${slug}`;
export function saveStarter(slug: string, text: string) {
  try {
    window.sessionStorage.setItem(draftKey(slug), text);
  } catch {
    /* private mode: the visitor just starts with an empty field */
  }
}
/** Read it (it stays until clearStarter, so a double render cannot lose it). */
export function readStarter(slug: string): string {
  try {
    return (window.sessionStorage.getItem(draftKey(slug)) ?? "").slice(0, 200);
  } catch {
    return "";
  }
}
export function clearStarter(slug: string) {
  try {
    window.sessionStorage.removeItem(draftKey(slug));
  } catch {
    /* nothing to clear */
  }
}
