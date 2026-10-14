"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Same rule as the intake: Turnstile is locked to production hostnames.
const SHOW_TURNSTILE = Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const T = {
  en: {
    label: "Your email",
    send: "Email me my link",
    sending: "Sending…",
    verify: "Please complete the check above.",
    failed: "Something went wrong. Please try again.",
  },
  es: {
    label: "Tu correo",
    send: "Envíame mi enlace",
    sending: "Enviando…",
    verify: "Completa la verificación de arriba.",
    failed: "Algo salió mal. Inténtalo de nuevo.",
  },
};

/** "Email me my link" — the answer is the same whether or not the email has a booking. */
export function MagicLinkForm({ lang }: { lang: "en" | "es" }) {
  const t = T[lang];
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (SHOW_TURNSTILE && !token) {
      setMessage(t.verify);
      setState("error");
      return;
    }
    setState("busy");
    try {
      const res = await fetch("/api/my/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), lang, "cf-turnstile-response": token }),
      });
      const j = (await res.json().catch(() => ({}))) as { message?: string; message_es?: string; error?: string };
      if (!res.ok) {
        setMessage(j.error || t.failed);
        setState("error");
        return;
      }
      setMessage((lang === "es" ? j.message_es : j.message) ?? "");
      setState("done");
    } catch {
      setMessage(t.failed);
      setState("error");
    }
  };

  return (
    <form className="tq-jr-form" onSubmit={submit}>
      <div className="tq-field">
        <label className="tq-mono" htmlFor="ml-email">
          {t.label}
        </label>
        <input
          id="ml-email"
          className="tq-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {SHOW_TURNSTILE && SITE_KEY ? (
        <Turnstile siteKey={SITE_KEY} onSuccess={setToken} onExpire={() => setToken("")} onError={() => setToken("")} options={{ language: lang }} />
      ) : null}
      <div className="tq-pg-actions">
        <button type="submit" className="tq-btn tq-btn--lg" disabled={state === "busy"}>
          {state === "busy" ? t.sending : t.send}
        </button>
      </div>
      {state === "done" && <p role="status">{message}</p>}
      {state === "error" && (
        <p className="tq-error" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
