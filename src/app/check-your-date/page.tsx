import type { Metadata } from "next";
import { site } from "@/content/site";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Check Your Date",
  description:
    "Tell me about your daughter's quinceañera and I'll personally reply within 24 hours to confirm whether your date is open.",
  alternates: { canonical: "/check-your-date" },
  openGraph: {
    title: "Check Your Date · TX Quince",
    description:
      "Tell me about your celebration and I'll personally reply within 24 hours.",
    url: `${site.url}/check-your-date`,
  },
};

export default function CheckYourDatePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-section md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-section-lg">
      {/* Left: framing + scarcity (sold-out reality) */}
      <div className="md:sticky md:top-28 md:self-start">
        <p className="eyebrow mb-5">Inquiries</p>
        <h1 className="font-display text-4xl leading-[1.06] text-ink text-balance md:text-5xl">
          Let&apos;s see if your date is open.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
          Tell me about your celebration and I&apos;ll personally reply within 24
          hours.
        </p>

        <div className="mt-8 border-l-2 border-wine pl-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            I&apos;m currently <strong className="text-ink">booked through {site.scarcity.bookedThrough}</strong> and
            reserving a limited number of {site.scarcity.reservingYear} dates. If your
            date is already taken, I&apos;ll add you to the cancellation waitlist —
            reaching out early is the surest way to hold your day.
          </p>
        </div>

        <p className="mt-8 text-sm text-ink-faint">
          Prefer email?{" "}
          <a
            href={`mailto:${site.contact.email}`}
            className="text-ink underline underline-offset-2"
          >
            {site.contact.email}
          </a>
        </p>
      </div>

      {/* Right: the form */}
      <div>
        <InquiryForm />
      </div>
    </div>
  );
}
