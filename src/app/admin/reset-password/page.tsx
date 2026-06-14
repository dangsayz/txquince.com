"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Establish the recovery session from the email link, then allow a new password.
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let active = true;

    async function init() {
      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (active) setLinkError("This reset link is invalid or has expired.");
            return;
          }
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!active) return;
        if (session) setReady(true);
        else
          setLinkError(
            "This reset link is invalid or has expired. Request a new one from the login page.",
          );
      } catch {
        if (active) setLinkError("Something went wrong opening the reset link.");
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not update your password. Please try again.");
      setBusy(false);
    }
  }

  const inputBase =
    "mt-1.5 w-full border-b border-line bg-transparent py-2 text-ink focus:border-wine focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-line bg-ivory p-8 shadow-[0_24px_70px_-30px_rgba(28,26,23,0.3)]">
        <p className="font-display text-3xl text-ink">TX Quince</p>
        <p className="mt-1 text-sm text-ink-soft">Set a new password</p>

        {linkError ? (
          <>
            <p className="mt-8 text-sm text-wine">{linkError}</p>
            <a
              href="/admin/login"
              className="mt-6 inline-block text-sm text-wine hover:text-wine-deep"
            >
              ← Back to login
            </a>
          </>
        ) : !ready ? (
          <p className="mt-8 text-sm text-ink-soft">Opening your reset link…</p>
        ) : (
          <form onSubmit={onSubmit}>
            <label className="mt-8 block text-sm font-medium text-ink">
              New password
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wider text-ink-faint hover:text-wine"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            <label className="mt-5 block text-sm font-medium text-ink">
              Confirm password
              <input
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputBase}
              />
            </label>

            {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}

            <button type="submit" disabled={busy} className="btn-espresso mt-8 w-full">
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
