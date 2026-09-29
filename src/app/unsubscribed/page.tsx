import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You've been unsubscribed from follow-up emails.",
  alternates: { canonical: "/unsubscribed" },
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <section className="bg-ivory px-5 py-12 sm:px-6 md:py-20">
      <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-7 text-center sm:p-12">
        <Badge>Done</Badge>
        <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink text-balance">
          You&apos;re unsubscribed.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-ink-soft">
          I won&apos;t send any more follow-ups. If you change your mind or your plans
          change, you&apos;re always welcome to reach back out.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Back home</Link>
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
