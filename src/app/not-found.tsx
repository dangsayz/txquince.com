import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">404 · Page not found</p>
      <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">This page isn&apos;t here.</h1>
      <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">The link may have moved. You can return home or browse our galleries.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-12 items-center rounded-md bg-ink px-6 text-base font-medium text-white hover:bg-accent-strong">Return home</Link>
        <Link href="/portfolio" className="inline-flex min-h-12 items-center rounded-md border border-line px-6 text-base font-medium text-ink hover:bg-accent-soft">View galleries</Link>
      </div>
    </section>
  );
}
