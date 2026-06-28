import type { Metadata } from "next";
import { site } from "@/content/site";
import { InquiryForm } from "@/components/InquiryForm";
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
      <div className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-5 md:px-10 lg:px-16">
        </div>
      </div>

      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:px-10 lg:px-16 md:py-28">
        {/* Left: framing + scarcity (sold-out reality) */}
        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Inquiries</p>
          <h1
            className="mt-5 font-display text-ink"
            style={{ fontSize: "clamp(2.3rem,4.6vw,3.9rem)", lineHeight: 1, letterSpacing: "-0.022em" }}
          >
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

      {/* What happens next — calm numbered rows, offset right. */}
      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 lg:px-16 md:py-28">
          <div className="grid md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
                What happens next
              </p>
              <h2
                className="mt-4 max-w-xs font-display text-ink"
                style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
              >
                No mystery, no waiting in the dark.
              </h2>
            </div>
            <ol className="mt-10 md:col-span-6 md:col-start-6 md:mt-0">
              {NEXT_STEPS.map((step, i) => (
                <Reveal
                  key={step.title}
                  delay={i * 70}
                  className={`grid grid-cols-12 gap-4 py-8 ${i > 0 ? "border-t border-ink/10" : ""}`}
                >
                  <p className="col-span-2 font-display text-2xl text-ink/25">0{i + 1}</p>
                  <div className="col-span-10">
                    <h3 className="font-display text-xl text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* See the real, full work — defuse the "is this real?" fear. */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 lg:px-16 md:py-36">
        <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">See the work first</p>
        <h2
          className="mt-4 max-w-2xl font-display text-ink"
          style={{ fontSize: "clamp(2rem,3.8vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
        >
          Full quinceañeras, not just highlights.
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
          Complete galleries and films from real DFW celebrations — so you know
          exactly who you&apos;re reaching out to.
        </p>
        <div className="mt-8">
          <CTAButton href="/portfolio" variant="text">
            View the galleries
          </CTAButton>
        </div>
      </section>

      {/* Testimonials — renders only when release-cleared ones exist. */}
      <Testimonials className="mx-auto max-w-7xl px-5 pb-section md:px-10 lg:px-16 md:pb-section-lg" />
    </>
  );
}
