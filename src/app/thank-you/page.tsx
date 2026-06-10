import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { CTAButton } from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your inquiry has been received.",
  alternates: { canonical: "/thank-you" },
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-5 py-section text-center md:px-10 lg:px-16">
      <p className="eyebrow mb-6">Inquiry received</p>
      <h1 className="font-display text-4xl leading-[1.08] text-ink text-balance md:text-5xl">
        Thank you — I&apos;ll personally reach out within 24 hours.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
        I&apos;ll confirm whether your date is open. I take a limited number of
        celebrations each season, so if it&apos;s already reserved I&apos;ll let you
        know honestly and offer the cancellation waitlist. Check your inbox for a
        note from me.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <CTAButton href="/portfolio" variant="primary">
          See the galleries
        </CTAButton>
        <Link
          href="/"
          className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Back home
        </Link>
      </div>
      <p className="mt-12 text-xs text-ink-faint">
        Didn&apos;t get a confirmation email? Write me at{" "}
        <a href={`mailto:${site.contact.email}`} className="underline underline-offset-2">
          {site.contact.email}
        </a>
        .
      </p>
    </section>
  );
}
