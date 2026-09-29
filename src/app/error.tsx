"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[65svh] max-w-xl flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-wine">Something went wrong</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">We couldn&apos;t load this page.</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-soft">Please try again. If it still doesn&apos;t work, you can return home and check your date from there.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft">Try again</button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg border border-line px-6 text-sm font-semibold text-ink hover:bg-greige">Return home</Link>
      </div>
    </section>
  );
}
