import type { Metadata } from "next";
import { site } from "@/content/site";
import { InquiryForm } from "@/components/InquiryForm";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { Testimonials } from "@/components/Testimonials";
import { CTAButton } from "@/components/CTAButton";
import { Reveal } from "@/components/Reveal";

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

const NEXT_STEPS = [
  {
    title: "You send your details",
    body: "A few quick questions about your date, venue, and what you're looking for. Takes two minutes.",
  },
  {
    title: "I reply within 24 hours",
    body: "Personally — not an auto-bot. I'll confirm whether your date is open and answer anything you asked.",
  },
  {
    title: "You reserve your day",
    body: `If it's open, you lock it with a deposit from ${site.booking.depositLabel} (pay in full or in installments). One celebration per day — once it's yours, it's yours.`,
  },
] as const;

export default function CheckYourDatePage() {
  return (
    <>
      {/* Trust bar — proof before the ask. */}
      <div className="border-b border-line bg-ivory">
        <div className="mx-auto max-w-6xl px-5 py-5 md:px-8">
          <SocialProofStrip />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-section md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-section-lg">
        {/* Left: framing + scarcity (sold-out reality) */}
        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-5">Inquiries</p>
          <h1 className="display-2 text-ink text-balance">
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

          <p className="mt-8 text-sm text-ink-soft">
            Already sure?{" "}
            <a
              href={site.cta.href}
              className="text-ink underline underline-offset-2 hover:text-wine"
            >
              Reserve your date now
            </a>{" "}
            with a deposit from {site.booking.depositLabel}.
          </p>

          <p className="mt-4 text-sm text-ink-faint">
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

      {/* What happens next — removes "what happens after I send this?" doubt. */}
      <section className="bg-greige">
        <div className="mx-auto max-w-5xl px-5 py-section md:px-8 md:py-section-lg">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-5">What happens next</p>
            <h2 className="display-2 text-ink text-balance">
              No mystery, no waiting in the dark.
            </h2>
          </div>
          <ol className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:mt-14 md:grid-cols-3">
            {NEXT_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 80} className="bg-cream p-8 md:p-9">
                <span className="font-display text-2xl text-wine">0{i + 1}</span>
                <h3 className="mt-5 font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* See the real, full work — defuse the scam/"is this real?" fear. */}
      <section className="mx-auto max-w-3xl px-5 py-section text-center md:px-8 md:py-section-lg">
        <p className="eyebrow mb-5">See the work first</p>
        <h2 className="display-2 text-ink text-balance">
          Full quinceañeras, not just highlights.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
          Complete galleries and films from real DFW celebrations — so you know
          exactly who you&apos;re reaching out to.
        </p>
        <div className="mt-9 flex justify-center">
          <CTAButton href="/portfolio" variant="ink">
            View the galleries
          </CTAButton>
        </div>
      </section>

      {/* Testimonials — renders only when release-cleared ones exist. */}
      <Testimonials className="mx-auto max-w-7xl px-5 pb-section md:px-8 md:pb-section-lg" />
    </>
  );
}
