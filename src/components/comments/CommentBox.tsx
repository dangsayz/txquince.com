"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ClerkSettings } from "@/lib/clerk-config";
import { COPY, type CommentLang } from "./copy";

// Clerk's script (and the editor) load only for a visitor who is signed in.
const Composer = dynamic(() => import("./Composer").then((m) => m.Composer), { ssr: false });

/**
 * Clerk keeps a small, readable `__client_uat` cookie on this domain: "0" (or
 * missing) when signed out, a timestamp when signed in. Reading it is a hint
 * only — the API checks the real session.
 */
function signedInHint(): boolean {
  const m = document.cookie.match(/(?:^|;\s*)__client_uat(?:_[^=]+)?=(\d+)/);
  return Boolean(m && m[1] !== "0");
}

export function CommentBox({ lang, slug, clerk }: { lang: CommentLang; slug: string; clerk: ClerkSettings | null }) {
  const c = COPY[lang];
  const [state, setState] = useState<"unknown" | "out" | "in">("unknown");
  useEffect(() => {
    queueMicrotask(() => setState(signedInHint() ? "in" : "out"));
  }, []);

  if (!clerk) return <p className="tq-cmt__note">{c.soon}</p>;
  if (state === "in") return <Composer lang={lang} slug={slug} clerk={clerk} />;

  const back = `${lang === "es" ? "/es" : ""}/blog/${slug}#comments`;
  const login = `${lang === "es" ? "/es/entrar" : "/login"}?next=${encodeURIComponent(back)}`;
  return (
    <div className="tq-cmt__gate" aria-busy={state === "unknown" || undefined}>
      <p className="tq-cmt__gate-lead">{c.gate}</p>
      <div className="tq-cmt__actions">
        <a className="tq-btn tq-btn--lg" href={login} rel="nofollow">
          {c.logIn} <span className="tq-arrow" aria-hidden>↗</span>
        </a>
        <a className="tq-btn tq-btn--lg tq-btn--ghost" href={login} rel="nofollow">
          {c.signUp}
        </a>
      </div>
      <p className="tq-cmt__note">{c.shared}</p>
    </div>
  );
}
