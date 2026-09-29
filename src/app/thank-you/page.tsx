import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { CTAButton } from "@/components/CTAButton";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your inquiry has been received.",
  alternates: { canonical: "/thank-you" },
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="bg-ivory px-5 py-12 sm:px-6 md:py-20">
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-7 text-center sm:p-12">
        <Badge>Inquiry received</Badge>
        <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink text-balance">
          Thank you — your inquiry is on its way.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-ink-soft">
          I&apos;ll review your details and confirm whether your date is open.
          Check your inbox for a reply from the studio.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CTAButton href="/portfolio" variant="primary">
            See the galleries
          </CTAButton>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-base text-ink-soft underline underline-offset-4 hover:text-ink"
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
      </div>
    </section>
  );
}
