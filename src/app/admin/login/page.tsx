"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    // Safety net: never leave the button frozen on "Signing in…". If the auth
    // call hangs (network, misconfig), surface an error instead of a dead spinner.
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
      router.replace(next);
      router.refresh();
    } catch {
      clearTimeout(timeout);
      setError("Something went wrong signing in. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-line bg-ivory p-8"
      >
        <p className="font-display text-2xl text-ink">TX Quince</p>
        <p className="mt-1 text-sm text-ink-soft">Studio admin</p>

        <label className="mt-8 block text-sm font-medium text-ink">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full border-b border-line bg-transparent py-2 focus:border-wine focus:outline-none"
          />
        </label>
        <label className="mt-5 block text-sm font-medium text-ink">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full border-b border-line bg-transparent py-2 focus:border-wine focus:outline-none"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-wine">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 w-full rounded-full bg-wine py-3 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition-colors hover:bg-wine-deep disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
