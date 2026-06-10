import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You've been unsubscribed from follow-up emails.",
  alternates: { canonical: "/unsubscribed" },
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-5 py-section text-center md:px-10 lg:px-16">
      <p className="eyebrow mb-6">Done</p>
      <h1 className="font-display text-4xl leading-[1.08] text-ink text-balance md:text-5xl">
        You&apos;re unsubscribed.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
        I won&apos;t send any more follow-ups. If you change your mind or your plans
        change, you&apos;re always welcome to reach back out — your date might still
        be open.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Back home
        </Link>
        <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
        <a
          href={`mailto:${site.contact.email}`}
          className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {site.contact.email}
        </a>
      </div>
    </section>
  );
}
