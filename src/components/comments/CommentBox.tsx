"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { signedInHint } from "@/lib/signed-in-hint";
import type { ClerkSettings } from "@/lib/clerk-config";
import { COPY, type CommentLang } from "./copy";
import { COMMENT_FOCUS_EVENT, setQuote, useQuote } from "./quote-store";

// Clerk's script (and the editor) load only for a visitor who is signed in.
const Composer = dynamic(() => import("./Composer").then((m) => m.Composer), { ssr: false });

/** Wide screens write in the left rail (it follows the scroll); phones write under the comments. */
const WIDE = "(min-width: 960px)";

export type CommentPlace = "rail" | "bottom";

/**
 * The comment box. It is placed twice in the page (rail and bottom) and shows
 * in exactly one, by screen width, so Clerk loads once.
 */
export function CommentBox({ lang, slug, clerk, place }: { lang: CommentLang; slug: string; clerk: ClerkSettings | null; place: CommentPlace }) {
  const c = COPY[lang];
  const quote = useQuote(slug);
  const root = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState<boolean | null>(null);
  const [state, setState] = useState<"unknown" | "out" | "in">("unknown");

  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const sync = () => setWide(mq.matches);
    queueMicrotask(() => {
      sync();
      setState(signedInHint() ? "in" : "out");
    });
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const active = wide === null ? false : place === "rail" ? wide : !wide;

  // "Comment on this" (or any focus request): bring this box into view.
  useEffect(() => {
    if (!active) return;
    const onFocus = () => {
      const el = root.current;
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (place === "bottom") el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      window.setTimeout(() => el.querySelector<HTMLElement>("textarea, a.tq-btn")?.focus({ preventScroll: place === "bottom" }), 60);
    };
    window.addEventListener(COMMENT_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(COMMENT_FOCUS_EVENT, onFocus);
  }, [active, place]);

  if (!active) return null;

  const chip = quote ? (
    <p className="tq-cmt__quote">
      <span className="tq-cmt__quote-text">
        <span className="tq-mono tq-muted">{c.about}</span> “{quote}”
      </span>
      <button type="button" className="tq-cmt__quote-x" aria-label={c.removeQuote} onClick={() => setQuote(slug, "")}>
        <span aria-hidden>×</span>
      </button>
    </p>
  ) : null;

  const back = `${lang === "es" ? "/es" : ""}/blog/${slug}#comments`;
  const q = `?next=${encodeURIComponent(back)}`;
  const login = `${lang === "es" ? "/es/entrar" : "/login"}${q}`;
  const signup = `${lang === "es" ? "/es/registro" : "/signup"}${q}`;

  return (
    <div ref={root} className="tq-cmt__box" data-place={place}>
      {place === "rail" ? <p className="tq-cmt__box-title tq-mono tq-muted">{c.railTitle}</p> : null}
      {!clerk ? (
        <p className="tq-cmt__note">{c.soon}</p>
      ) : state === "in" ? (
        <Composer lang={lang} slug={slug} clerk={clerk} place={place} chip={chip} />
      ) : (
        <div className="tq-cmt__gate" aria-busy={state === "unknown" || undefined}>
          {chip}
          <p className="tq-cmt__gate-lead">{c.gate}</p>
          <div className="tq-cmt__actions">
            <a className="tq-btn tq-btn--lg" href={login} rel="nofollow">
              {c.logIn} <span className="tq-arrow" aria-hidden>↗</span>
            </a>
            <a className="tq-btn tq-btn--lg tq-btn--ghost" href={signup} rel="nofollow">
              {c.signUp}
            </a>
          </div>
        </div>
      )}
      <p className="tq-cmt__note tq-cmt__tip">{c.tip}</p>
    </div>
  );
}
