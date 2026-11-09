"use client";

import { signedInHint } from "@/lib/signed-in-hint";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ClerkSettings } from "@/lib/clerk-config";
import { COPY, type CommentLang } from "./copy";

// Clerk's script (and the editor) load only for a visitor who is signed in.
const Composer = dynamic(() => import("./Composer").then((m) => m.Composer), { ssr: false });

export function CommentBox({ lang, slug, clerk }: { lang: CommentLang; slug: string; clerk: ClerkSettings | null }) {
  const c = COPY[lang];
  const [state, setState] = useState<"unknown" | "out" | "in">("unknown");
  useEffect(() => {
    queueMicrotask(() => setState(signedInHint() ? "in" : "out"));
  }, []);

  if (!clerk) return <p className="tq-cmt__note">{c.soon}</p>;
  if (state === "in") return <Composer lang={lang} slug={slug} clerk={clerk} />;

  const back = `${lang === "es" ? "/es" : ""}/blog/${slug}#comments`;
  const q = `?next=${encodeURIComponent(back)}`;
  const login = `${lang === "es" ? "/es/entrar" : "/login"}${q}`;
  const signup = `${lang === "es" ? "/es/registro" : "/signup"}${q}`;
  return (
    <div className="tq-cmt__gate" aria-busy={state === "unknown" || undefined}>
      <p className="tq-cmt__gate-lead">{c.gate}</p>
      <div className="tq-cmt__actions">
        <a className="tq-btn tq-btn--lg" href={login} rel="nofollow">
          {c.logIn} <span className="tq-arrow" aria-hidden>↗</span>
        </a>
        <a className="tq-btn tq-btn--lg tq-btn--ghost" href={signup} rel="nofollow">
          {c.signUp}
        </a>
      </div>
      <p className="tq-cmt__note">{c.shared}</p>
    </div>
  );
}
