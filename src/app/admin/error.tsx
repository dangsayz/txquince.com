"use client";

import Link from "next/link";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-[60dvh] max-w-2xl flex-col justify-center px-5 py-16 sm:px-8">
    <p className="text-xs font-medium uppercase tracking-[0.18em] text-wine">Studio unavailable</p>
    <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">We couldn&apos;t load this view.</h1>
    <p className="mt-4 text-base text-ink-soft">Your client records are still saved. Check your connection and try again.</p>
    <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={reset} className="min-h-11 rounded-full bg-ink px-6 text-sm font-medium text-cream hover:bg-wine">Try again</button><Link href="/admin" className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-6 text-sm font-medium text-ink hover:border-wine">Back to Today</Link></div>
  </main>;
}
