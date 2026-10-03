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
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">TX Quince / Email preferences</p>
        <h1 className="mt-6 font-body text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1.1] tracking-[-0.04em] text-ink text-balance">
          You&apos;re unsubscribed.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-ink-soft">
          I won&apos;t send any more follow-ups. If you change your mind or your plans
          change, you&apos;re always welcome to reach back out.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center border-b border-ink text-sm uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Back home ↗</Link>
          <a
            href={`mailto:${site.contact.email}`}
            className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {site.contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
