"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { signedInHint } from "@/lib/signed-in-hint";
import type { ClerkSettings } from "@/lib/clerk-config";
import { COPY, startersFor, type CommentLang, type CommentTopic } from "./copy";
import { ReviewNote } from "./ReviewNote";
import { COMMENT_FOCUS_EVENT, saveStarter, setQuote, setRailMount, useQuote } from "./quote-store";

// Clerk's script (and the editor) load only for a visitor who is signed in.
const Composer = dynamic(() => import("./Composer").then((m) => m.Composer), { ssr: false });

/** A failed comment form shows a short note; it never takes the post down with it. */
class FormGuard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Wide screens also get a box in the left rail (it follows the scroll); every screen has one under the comments. */
const WIDE = "(min-width: 960px)";

export type CommentPlace = "rail" | "bottom";

/**
 * The comment box. It is placed twice in the page: under the comments (every
 * screen) and in the left rail (wide screens). Clerk still loads once: the
 * bottom box owns the Composer, and the rail only offers a mount for it.
 */
export function CommentBox({ lang, slug, clerk, place, topic }: { lang: CommentLang; slug: string; clerk: ClerkSettings | null; place: CommentPlace; topic?: CommentTopic }) {
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

  // Shown: the rail on wide screens, the bottom box always.
  const shown = wide === null ? false : place === "rail" ? wide : true;
  // "Comment on this" lands in one box: the rail on wide screens, else the bottom.
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

  if (!shown) return null;

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
      {place === "rail" ? <p className="tq-cmt__box-title">{c.railTitle}</p> : null}
      {!clerk ? (
        <p className="tq-cmt__note">{c.soon}</p>
      ) : state === "in" ? (
        place === "rail" ? (
          // The bottom box's Composer draws the rail form in here.
          <div ref={setRailMount} />
        ) : (
          <FormGuard fallback={<p className="tq-cmt__note" role="alert">{c.error}</p>}>
            <Composer lang={lang} slug={slug} clerk={clerk} place={place} chip={active ? chip : null} railChip={chip} starters={startersFor(lang, topic)} />
          </FormGuard>
        )
      ) : (
        <div className="tq-cmt__gate" aria-busy={state === "unknown" || undefined}>
          {active ? chip : null}
          {place === "bottom" ? <p className="tq-cmt__label">{c.label}</p> : null}
          <p className="tq-cmt__gate-lead">{c.gate}</p>
          {place === "bottom" && state === "out" ? (
            // Pick how to begin, log in, and the words are waiting in the field.
            <div className="tq-cmt__starters">
              <span className="tq-cmt__starters-label">{c.startWith}</span>
              {startersFor(lang, topic).map((st) => (
                <a key={st.label} className="tq-pill" href={login} rel="nofollow" onClick={() => saveStarter(slug, st.text)}>
                  {st.label}
                </a>
              ))}
            </div>
          ) : null}
          <div className="tq-cmt__actions">
            <a className="tq-btn tq-btn--lg" href={login} rel="nofollow">
              {c.logIn} <span className="tq-arrow" aria-hidden>↗</span>
            </a>
            <a className="tq-btn tq-btn--lg tq-btn--ghost" href={signup} rel="nofollow">
              {c.signUp}
            </a>
          </div>
          <ReviewNote text={c.review} />
        </div>
      )}
    </div>
  );
}
