"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Studio sign-in: email → one-time 6-digit code → in. No passwords.
 * The server (src/lib/admin-session.ts) decides who is an admin and sets an
 * HttpOnly session cookie; this page only collects the two inputs.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const REMEMBER_KEY = "txq_admin_email";

function LoginForm() {
  const params = useSearchParams();
  // Only ever return to an /admin page on this site (no open redirect).
  const asked = params.get("next") ?? "";
  const next = /^\/admin(?:[/?#]|$)/.test(asked) && !asked.startsWith("//") ? asked : "/admin";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) queueMicrotask(() => setEmail(saved));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: res.ok, error: j.error };
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await post("/api/login/code", { email: email.trim() });
      if (!r.ok) return setError(r.error ?? "Could not send a code. Please try again.");
      try {
        localStorage.setItem(REMEMBER_KEY, email.trim());
      } catch {
        /* ignore */
      }
      setStep("code");
    } catch {
      setError("Could not send a code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await post("/api/login/verify", { email: email.trim(), code: code.trim() });
      if (!r.ok) {
        setBusy(false);
        return setError(r.error ?? "That code isn't right.");
      }
      try {
        window.localStorage.setItem("txq_admin", "1");
      } catch {
        /* ignore */
      }
      window.location.assign(next);
    } catch {
      setBusy(false);
      setError("Could not sign in. Please try again.");
    }
  }

  const inputBase =
    "mt-2 min-h-12 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/15";
  const primary =
    "mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-ink px-5 py-2.5 text-base font-medium text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50";

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 sm:p-9">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">TX Quince · Studio</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,3.4vw,2.5rem)] font-medium leading-tight tracking-[-0.03em] text-ink">
          {step === "email" ? "Welcome back." : "Check your email."}
        </h1>
        <p className="mt-3 text-base leading-7 text-ink-soft">
          {step === "email"
            ? "We'll email you a one-time code. No password needed."
            : `If ${email.trim()} is a Studio account, a 6-digit code is on its way. It expires in 10 minutes.`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode}>
            <label className="mt-8 block text-base font-medium text-ink">
              Email
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </label>
            {error ? <p role="alert" className="mt-4 text-base text-danger">{error}</p> : null}
            <button type="submit" disabled={busy} className={primary}>
              {busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <label className="mt-8 block text-base font-medium text-ink">
              Code
              <input
                ref={codeRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${inputBase} tracking-[0.3em]`}
              />
            </label>
            {error ? <p role="alert" className="mt-4 text-base text-danger">{error}</p> : null}
            <button type="submit" disabled={busy || code.length !== 6} className={primary}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="mt-4 min-h-11 w-full text-center text-base text-ink-soft hover:text-ink"
            >
              ← Use a different email or send a new code
            </button>
          </form>
        )}

        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center text-base text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          ← Back to the website
        </Link>
      </div>
    </div>
  );
}
