import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-wine">404 · Page not found</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">This page isn&apos;t here.</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">The link may have moved. You can return home or browse our galleries.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft">Return home</Link>
        <Link href="/portfolio" className="inline-flex min-h-11 items-center rounded-lg border border-line px-6 text-sm font-semibold text-ink hover:bg-greige">View galleries</Link>
      </div>
    </section>
  );
}
