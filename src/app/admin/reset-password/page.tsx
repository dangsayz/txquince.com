"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center text-sm text-ink-soft" role="status">Loading password reset…</div>}>
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
    "mt-2 min-h-11 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-wine focus:ring-2 focus:ring-wine/20";

  return (
    <div className="flex min-h-svh items-center justify-center bg-ivory px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-6 shadow-[0_20px_60px_-32px_rgba(44,29,18,0.3)] sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-wine-deep">TX Quince · Studio</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink">Set a new password.</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">Choose a new password for your studio account.</p>

        {linkError ? (
          <>
            <p role="alert" className="mt-8 rounded-lg border border-wine/30 bg-wine-tint px-4 py-3 text-sm text-wine-deep">{linkError}</p>
            <a
              href="/admin/login"
              className="mt-5 inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-wine-deep hover:text-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
            >
              ← Back to login
            </a>
          </>
        ) : !ready ? (
          <p role="status" className="mt-8 text-sm text-ink-soft">Opening your reset link…</p>
        ) : (
          <form onSubmit={onSubmit} aria-busy={busy}>
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
                  className="absolute right-1 top-1/2 flex min-h-11 -translate-y-1/2 items-center rounded-md px-3 text-xs font-semibold text-ink-soft hover:text-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
                  aria-label={show ? "Hide passwords" : "Show passwords"}
                  aria-pressed={show}
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

            {error ? <p role="alert" className="mt-5 rounded-lg border border-wine/30 bg-wine-tint px-4 py-3 text-sm text-wine-deep">{error}</p> : null}

            <button type="submit" disabled={busy} className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-wine px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wine-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
