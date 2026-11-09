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
  const linkError = params.get("error");
  const [error, setError] = useState<string | null>(
    linkError === "not-admin"
      ? "That Google account isn't a Studio account. Use the email on your admin list."
      : linkError === "google"
        ? "Google sign-in didn't finish. Please try again."
        : null,
  );
  // Google: through the site's Clerk log in, back to /api/login/clerk, which
  // only lets in a VERIFIED email on ADMIN_EMAILS.
  const googleHref = `/login?next=${encodeURIComponent(`/api/login/clerk?next=${encodeURIComponent(next)}`)}`;
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
            ? "Sign in with Google, or get a one-time code by email."
            : `If ${email.trim()} is a Studio account, a 6-digit code is on its way. It expires in 10 minutes.`}
        </p>

        {step === "email" ? (
          <>
          <a
            href={googleHref}
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 py-2.5 text-base font-medium text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </a>
          <p className="mt-6 text-center text-sm uppercase tracking-[0.16em] text-ink-soft">or</p>
          <form onSubmit={sendCode}>
            <label className="mt-4 block text-base font-medium text-ink">
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
          </>
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
