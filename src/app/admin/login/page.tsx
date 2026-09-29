"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const REMEMBER_KEY = "txq_admin_email";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Remember-me: prefill the saved email on return visits.
  useEffect(() => {
    let active = true;
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        queueMicrotask(() => {
          if (!active) return;
          setEmail(saved);
          setRemember(true);
        });
      }
    } catch {
      /* ignore */
    }
    return () => { active = false; };
  }, []);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createBrowserSupabaseClient();

    // Safety net: never leave the button frozen on "Signing in…".
    const timeout = setTimeout(() => {
      setError("This is taking longer than expected — please try again.");
      setBusy(false);
    }, 10_000);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      clearTimeout(timeout);
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* ignore */
      }
      router.replace(next);
      router.refresh();
    } catch {
      clearTimeout(timeout);
      setError("Something went wrong signing in. Please try again.");
      setBusy(false);
    }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Enter your email first, then send the reset link.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createBrowserSupabaseClient();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setNotice(
          "Check your email for a reset link. It expires in an hour — open it on this device.",
        );
      }
    } catch {
      setError("Could not send the reset link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputBase =
    "mt-2 min-h-12 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-base text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <div className="flex min-h-svh items-center justify-center bg-ivory px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.2)] sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">TX Quince · Studio</p>
        <h1 className="mt-3 font-display text-3xl text-ink">{mode === "signin" ? "Welcome back." : "Reset your password."}</h1>
        <p className="mt-2 text-sm text-ink-soft">{mode === "signin" ? "Sign in to manage your studio." : "We will send a secure reset link to your email."}</p>

        {mode === "signin" ? (
          <form onSubmit={onSignIn}>
            <label className="mt-8 block text-sm font-medium text-ink">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </label>

            <label className="mt-5 block text-sm font-medium text-ink">
              Password
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 inline-flex min-h-11 -translate-y-1/2 items-center rounded-md px-3 text-xs font-medium text-ink-soft hover:text-accent"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="mt-5 flex items-center justify-between">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setError(null);
                  setNotice(null);
                }}
                className="min-h-11 rounded-md px-1 text-sm text-accent-strong hover:text-accent"
              >
                Forgot password?
              </button>
            </div>

            {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}

            <button type="submit" disabled={busy} className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={onReset}>
            <label className="mt-8 block text-sm font-medium text-ink">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
              />
            </label>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              We&apos;ll email you a secure link to set a new password.
            </p>

            {error ? <p role="alert" className="mt-4 text-sm text-danger">{error}</p> : null}
            {notice ? <p role="status" className="mt-4 text-sm text-ink">{notice}</p> : null}

            <button type="submit" disabled={busy} className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50">
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setNotice(null);
              }}
              className="mt-4 min-h-11 w-full text-center text-sm text-ink-soft hover:text-ink"
            >
              ← Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
