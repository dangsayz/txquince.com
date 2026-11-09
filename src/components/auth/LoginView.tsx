"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { AccountPanel, type AuthLang } from "./AccountPanel";

const COPY = {
  en: { hi: (n: string) => `Welcome back, ${n}.`, journal: "Go to the Journal", sending: "Taking you back…" },
  es: { hi: (n: string) => `Qué gusto verte, ${n}.`, journal: "Ir al Diario", sending: "Regresándote…" },
} as const;

/** The public log in / create account page body. */
export function LoginView({ lang, enabled, next }: { lang: AuthLang; enabled: boolean; next: string | null }) {
  const self = lang === "es" ? "/es/entrar" : "/login";
  const returnPath = next ? `${self}?next=${encodeURIComponent(next)}` : self;
  return (
    <AccountPanel
      lang={lang}
      enabled={enabled}
      returnPath={returnPath}
      signedIn={({ name, signOut }) => <SignedIn lang={lang} name={name} next={next} signOut={signOut} />}
    />
  );
}

function SignedIn({ lang, name, next, signOut }: { lang: AuthLang; name: string; next: string | null; signOut: React.ReactNode }) {
  const c = COPY[lang];
  const { isSignedIn } = useUser();
  // Came here from a "log in to comment" link: go straight back to the post.
  useEffect(() => {
    if (isSignedIn && next) window.location.replace(next);
  }, [isSignedIn, next]);
  if (next) return <p className="tq-auth__note" role="status">{c.sending}</p>;
  return (
    <div className="tq-auth">
      <p className="tq-auth__lead">{c.hi(name)}</p>
      <div className="tq-auth__actions">
        <a className="tq-btn tq-btn--lg" href={lang === "es" ? "/es/blog" : "/blog"}>
          {c.journal} <span className="tq-arrow" aria-hidden>↗</span>
        </a>
        {signOut}
      </div>
    </div>
  );
}
