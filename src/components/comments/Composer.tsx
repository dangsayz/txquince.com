"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/nextjs";
import type { ClerkSettings } from "@/lib/clerk-config";
import { COMMENT_MAX } from "@/lib/comments";
import { COPY, type CommentLang } from "./copy";
import { getRailMount, setQuote, subscribeRailMount, clearStarter, readStarter, useQuote } from "./quote-store";
import type { CommentPlace } from "./CommentBox";
import { ReviewNote } from "./ReviewNote";

/**
 * Loaded on demand (signed-in visitors only): Clerk + the comment form.
 * Mounted once, by the bottom box. On wide screens the rail shows a second
 * form: it is drawn into the rail's mount through a portal, so both forms
 * share this one Clerk provider.
 */
export function Composer({
  lang,
  slug,
  clerk,
  place,
  chip,
  railChip,
  starters,
}: {
  lang: CommentLang;
  slug: string;
  clerk: ClerkSettings;
  place: CommentPlace;
  /** The highlighted passage, with its remove button (rendered by CommentBox). */
  chip: React.ReactNode;
  /** The same passage chip for the rail form (wide screens show it there). */
  railChip: React.ReactNode;
  /** Ways to begin, shown in the bottom box (the rail stays compact). */
  starters?: Starter[];
}) {
  const rail = useSyncExternalStore(subscribeRailMount, getRailMount, () => null);
  return (
    <ClerkProvider publishableKey={clerk.publishableKey} signInUrl={clerk.signInUrl} signUpUrl={clerk.signUpUrl}>
      <Form lang={lang} slug={slug} place={place} chip={chip} starters={starters} />
      {rail ? createPortal(<Form lang={lang} slug={slug} place="rail" chip={railChip} />, rail) : null}
    </ClerkProvider>
  );
}

type Starter = { label: string; text: string };

function Form({ lang, slug, place, chip, starters }: { lang: CommentLang; slug: string; place: CommentPlace; chip: React.ReactNode; starters?: Starter[] }) {
  const field = useRef<HTMLTextAreaElement>(null);
  const c = COPY[lang];
  const quote = useQuote(slug);
  const id = useId();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  // A starter picked before logging in lands here once (bottom box only).
  const [body, setBody] = useState(() => (place === "bottom" ? readStarter(slug) : ""));
  const startedWith = useRef(body);
  const ready = isLoaded && authLoaded && isSignedIn;
  useEffect(() => {
    const el = field.current;
    const text = startedWith.current;
    if (!ready || !el || !text) return;
    startedWith.current = "";
    clearStarter(slug);
    el.focus({ preventScroll: true });
    el.setSelectionRange(text.length, text.length);
  }, [ready, slug]);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const back = `${lang === "es" ? "/es" : ""}/blog/${slug}#comments`;
  const login = `${lang === "es" ? "/es/entrar" : "/login"}?next=${encodeURIComponent(back)}`;

  if (clerk.status === "error") return <p className="tq-cmt__note" role="alert">{c.error}</p>;
  if (!isLoaded || !authLoaded) return <p className="tq-cmt__note" role="status">{c.loading}</p>;
  if (!isSignedIn) {
    return (
      <div className="tq-cmt__gate">
        <p className="tq-cmt__gate-lead">{c.gate}</p>
        <div className="tq-cmt__actions">
          <a className="tq-btn tq-btn--lg" href={login} rel="nofollow">
            {c.logIn} <span className="tq-arrow" aria-hidden>↗</span>
          </a>
        </div>
        <ReviewNote text={c.review} />
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="tq-cmt__gate tq-cmt__sent" role="status">
        <span className="tq-cmt__sent-mark" aria-hidden>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3.5 8.4 3 3 6-6.6" />
          </svg>
        </span>
        <p className="tq-cmt__gate-lead">{c.thanks}</p>
        <div className="tq-cmt__actions">
          <button type="button" className="tq-btn tq-btn--lg tq-btn--ghost" onClick={() => setStatus("idle")}>
            {c.another}
          </button>
        </div>
      </div>
    );
  }

  const name = user.firstName || user.username || "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ post_slug: slug, lang, body, website, quote: quote || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 401) {
        setError(c.expired);
        setStatus("error");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? c.error);
        setStatus("error");
        return;
      }
      setBody("");
      setQuote(slug, "");
      setStatus("done");
    } catch {
      setError(c.error);
      setStatus("error");
    }
  }

  return (
    <form className="tq-cmt__form" onSubmit={submit} noValidate data-open={body.length > 0 || error ? "true" : undefined}>
      {name ? (
        <p className="tq-cmt__as">
          <span className="tq-cmt__avatar tq-cmt__avatar--me" aria-hidden>
            {name.slice(0, 1).toUpperCase()}
          </span>
          <span>{c.postingAs(name)}</span>
        </p>
      ) : null}
      <label htmlFor={`${id}-body`} className="tq-cmt__label">
        {c.label}
      </label>
      {chip}
      {starters?.length && !body.trim() ? (
        <div className="tq-cmt__starters">
          <span className="tq-cmt__starters-label">{c.startWith}</span>
          {starters.map((st) => (
            <button
              key={st.label}
              type="button"
              className="tq-pill"
              onClick={() => {
                setBody(st.text);
                const el = field.current;
                if (!el) return;
                el.focus();
                requestAnimationFrame(() => el.setSelectionRange(st.text.length, st.text.length));
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      ) : null}
      <textarea
        ref={field}
        id={`${id}-body`}
        className="tq-cmt__input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={c.placeholder}
        rows={place === "rail" ? 3 : 4}
        maxLength={COMMENT_MAX}
        required
        aria-describedby={`${id}-help`}
      />
      {/* Honeypot: hidden from people and screen readers; bots fill it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="tq-cmt__hp"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      {/* In the rail this part opens when the field is in use (comments.css). */}
      <div className="tq-cmt__more">
        <div className="tq-cmt__more-in">
          {error ? (
            <p className="tq-cmt__error" role="alert">
              {error}
              {status === "error" && error === c.expired ? (
                <>
                  {" "}
                  <a href={login}>{c.logIn}</a>
                </>
              ) : null}
            </p>
          ) : null}
          <div className="tq-cmt__actions">
            <button type="submit" className="tq-btn tq-btn--lg" disabled={status === "sending" || body.trim().length < 2}>
              {status === "sending" ? c.sending : c.submit}
            </button>
            <span className="tq-cmt__count tq-nums" aria-hidden>
              {body.length} / {COMMENT_MAX}
            </span>
          </div>
        </div>
      </div>
      <ReviewNote id={`${id}-help`} text={c.review} />
    </form>
  );
}
