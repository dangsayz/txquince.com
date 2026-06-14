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
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
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
    "mt-1.5 w-full border-b border-line bg-transparent py-2 text-ink focus:border-wine focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-line bg-ivory p-8 shadow-[0_24px_70px_-30px_rgba(28,26,23,0.3)]">
        <p className="font-display text-3xl text-ink">TX Quince</p>
        <p className="mt-1 text-sm text-ink-soft">
          {mode === "signin" ? "Studio admin" : "Reset your password"}
        </p>

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
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wider text-ink-faint hover:text-wine"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="mt-5 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-wine)]"
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
                className="text-sm text-wine hover:text-wine-deep"
              >
                Forgot password?
              </button>
            </div>

            {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}

            <button type="submit" disabled={busy} className="btn-espresso mt-8 w-full">
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

            {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}
            {notice ? <p className="mt-4 text-sm text-ink">{notice}</p> : null}

            <button type="submit" disabled={busy} className="btn-espresso mt-8 w-full">
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setNotice(null);
              }}
              className="mt-4 w-full text-center text-sm text-ink-soft hover:text-ink"
            >
              ← Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
