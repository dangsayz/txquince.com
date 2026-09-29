import type { Metadata } from "next";
import { site } from "@/content/site";
import { Badge } from "@/components/ui";
import { CTAButton } from "@/components/CTAButton";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You've been unsubscribed from follow-up emails.",
  alternates: { canonical: "/unsubscribed" },
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <section className="bg-ivory px-5 py-12 sm:px-6 md:py-20">
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-white p-7 text-center sm:p-12">
        <Badge>Done</Badge>
        <h1 className="mt-5 font-display text-4xl leading-[1.08] text-ink text-balance md:text-5xl">
          You&apos;re unsubscribed.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
          I won&apos;t send any more follow-ups. If you change your mind or your plans
          change, you&apos;re always welcome to reach back out.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <CTAButton href="/">Back home</CTAButton>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <a
            href={`mailto:${site.contact.email}`}
            className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {site.contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
