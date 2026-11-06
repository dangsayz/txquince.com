"use client";

import Link from "next/link";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-[44rem] flex-col justify-center px-4 py-16 sm:px-8">
      <h1 className="st-h1">We couldn&apos;t load this page.</h1>
      <p className="m-0 mt-3 text-base text-[var(--tq-ink-mute)]">Your client records are still saved. Check your connection and try again.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="st-btn">Try again</button>
        <Link href="/admin" className="st-btn-ghost">Back to Today</Link>
      </div>
    </main>
  );
}
