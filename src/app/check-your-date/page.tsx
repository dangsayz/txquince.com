import type { Metadata } from "next";
import { site } from "@/content/site";
import { InquiryForm } from "@/components/InquiryForm";
import { Testimonials } from "@/components/Testimonials";
import { CTAButton } from "@/components/CTAButton";
import { Reveal } from "@/components/Reveal";
import { depositFloorLabel } from "@/content/packages";

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
    body: "A few quick questions about your date, venue, and what you're looking for.",
  },
  {
    title: "We reply within 24 hours",
    body: "We personally confirm whether your date is open and answer anything you asked.",
  },
  {
    title: "You reserve your day",
    body: `If the date is open and the collection feels right, a deposit from ${depositFloorLabel} holds it. Asking costs nothing.`,
  },
] as const;

export default async function CheckYourDatePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const dateParam = (await searchParams).date;
  const initialDate = typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : "";

  return (
    <>
      <div className="mx-auto grid max-w-[90rem] gap-8 px-5 py-10 md:px-10 md:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:px-16 lg:py-28">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">A personal response, within 24 hours</p>
          <h1 className="mt-4 max-w-[11ch] font-serif text-[clamp(3.2rem,6vw,5.8rem)] leading-[0.93] tracking-[-0.04em] text-ink">
            Is her date still open?
          </h1>
          <p className="mt-5 max-w-[45ch] text-lg leading-7 text-ink-soft">
            Tell us about her celebration. We&apos;ll check the full calendar and personally reply within 24 hours.
          </p>
          <div className="mt-6 border-t border-line pt-5 text-base leading-7 text-ink-soft">
            <p>No payment or commitment to ask. Collections from $1,800; deposits from {depositFloorLabel} after confirmation.</p>
          </div>
        </div>

        <div className="border border-line bg-white p-6 sm:p-9 lg:p-11">
          <p className="text-sm font-medium text-wine-deep">About her celebration</p>
          <h2 className="mt-2 font-serif text-4xl leading-none text-ink">Start with the date.</h2>
          <p className="mt-4 mb-8 text-base text-ink-soft">A few details help us give you a useful answer.</p>
          <InquiryForm initialDate={initialDate} />
          <p className="mt-7 text-base text-ink-soft">Prefer email? <a href={`mailto:${site.contact.email}`} className="text-ink underline underline-offset-4">{site.contact.email}</a></p>
        </div>
      </div>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-[90rem] px-5 py-20 md:px-10 lg:px-16 md:py-28">
          <div className="grid md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">
                What happens next
              </p>
              <h2 className="mt-4 max-w-xs font-serif text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-ink">
                No mystery, no waiting in the dark.
              </h2>
            </div>
            <ol className="mt-10 md:col-span-6 md:col-start-6 md:mt-0">
              {NEXT_STEPS.map((step, i) => (
                <Reveal
                  key={step.title}
                  delay={i * 70}
                  className={`grid grid-cols-12 gap-4 py-8 ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <p className="col-span-2 font-serif text-3xl text-ink/35">0{i + 1}</p>
                  <div className="col-span-10">
                    <h3 className="font-serif text-2xl text-ink">{step.title}</h3>
                    <p className="mt-2 text-base leading-7 text-ink-soft">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 lg:px-16 md:py-36">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-wine-deep">See the work first</p>
        <h2 className="mt-4 max-w-2xl font-serif text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-ink">
          Full quinceañeras, not just highlights.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">
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
