import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { Testimonials } from "@/components/Testimonials";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Check Your Date",
  description:
    "Ask TX Quince about your quinceañera date and photo or film coverage in Dallas–Fort Worth. We confirm availability personally; no payment is needed to inquire.",
  alternates: { canonical: "/check-your-date" },
  openGraph: {
    title: "Check Your Date · TX Quince",
    description:
      "Tell us about your celebration. We will confirm availability personally, with no payment needed to inquire.",
    url: `${site.url}/check-your-date`,
  },
};

const nextSteps = [
  { title: "Tell us about her day", body: "Share the date if you have one, where you are celebrating, and the coverage you are considering." },
  { title: "We check the details", body: "We review your inquiry and confirm availability with you personally." },
  { title: "Choose your next step", body: "If the date works, we can discuss collections and how to request a reservation. There is no payment to send this inquiry." },
] as const;

export default function CheckYourDatePage() {
  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 xl:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-deep">Start a conversation</p>
            <h1 className="mt-5 max-w-[11ch] font-display text-[clamp(3rem,5vw,5rem)] leading-[0.98] text-ink">Is her date on your calendar?</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-ink-soft">Tell us about the celebration. We will check the date personally and help you understand your photo and film options.</p>
            <div className="mt-8 rounded-2xl border border-line bg-white p-6">
              <p className="text-sm font-semibold text-ink">An inquiry is a first step.</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">You can ask even if you are still choosing a date. Sending this form does not reserve a date or require payment.</p>
            </div>
            <p className="mt-8 text-sm leading-6 text-ink-soft">Know the date and collection already? <Link href={site.cta.href} className="font-semibold text-ink underline underline-offset-4 hover:text-wine">Request a reservation ↗</Link></p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">Prefer email? <a href={`mailto:${site.contact.email}`} className="font-semibold text-ink underline underline-offset-4 hover:text-wine">{site.contact.email}</a></p>
          </div>
          <div className="min-w-0"><InquiryForm /></div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="inquiry-steps-title">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-deep">What happens next</p>
          <h2 id="inquiry-steps-title" className="mt-3 font-display text-[clamp(2.5rem,4vw,4rem)] leading-none text-ink">Clear steps, from the first hello.</h2>
          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-cream p-6 sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-deep">0{index + 1}</span>
                <h3 className="mt-7 font-display text-2xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-[88rem] flex-col justify-between gap-6 px-5 py-16 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:px-12" aria-labelledby="inquiry-work-title">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine-deep">See the work</p>
          <h2 id="inquiry-work-title" className="mt-3 max-w-xl font-display text-[clamp(2.5rem,4vw,4rem)] leading-none text-ink">Explore the moments before you inquire.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft">Browse the available photographs and films, then tell us what feels right for your family.</p>
        </div>
        <Link href="/portfolio" className="inline-flex self-start rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">Explore the portfolio <span aria-hidden="true" className="ml-3">↗</span></Link>
      </section>
      <Testimonials className="mx-auto max-w-[88rem] px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12" />
    </>
  );
}
