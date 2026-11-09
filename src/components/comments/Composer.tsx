"use client";

import { useId, useState } from "react";
import { ClerkProvider, useAuth, useClerk, useUser } from "@clerk/nextjs";
import type { ClerkSettings } from "@/lib/clerk-config";
import { COMMENT_MAX } from "@/lib/comments";
import { COPY, type CommentLang } from "./copy";
import { setQuote, useQuote } from "./quote-store";
import type { CommentPlace } from "./CommentBox";

/** Loaded on demand (signed-in visitors only): Clerk + the comment form. */
export function Composer({
  lang,
  slug,
  clerk,
  place,
  chip,
}: {
  lang: CommentLang;
  slug: string;
  clerk: ClerkSettings;
  place: CommentPlace;
  /** The highlighted passage, with its remove button (rendered by CommentBox). */
  chip: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={clerk.publishableKey} signInUrl={clerk.signInUrl} signUpUrl={clerk.signUpUrl}>
      <Form lang={lang} slug={slug} place={place} chip={chip} />
    </ClerkProvider>
  );
}

function Form({ lang, slug, place, chip }: { lang: CommentLang; slug: string; place: CommentPlace; chip: React.ReactNode }) {
  const c = COPY[lang];
  const quote = useQuote(slug);
  const id = useId();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [body, setBody] = useState("");
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
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="tq-cmt__gate" role="status">
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
    <form className="tq-cmt__form" onSubmit={submit} noValidate>
      <label htmlFor={`${id}-body`} className="tq-cmt__label">
        {c.label}
      </label>
      {chip}
      <textarea
        id={`${id}-body`}
        className="tq-cmt__input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={c.placeholder}
        rows={place === "rail" ? 3 : 5}
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
      <p id={`${id}-help`} className="tq-cmt__note">
        {name ? `${c.postingAs(name)} · ` : ""}
        {c.review}
      </p>
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
      </div>
    </form>
  );
}
