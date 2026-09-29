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

export default async function CheckYourDatePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const date = (await searchParams).date;
  const initialDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";

  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Date inquiry</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">Let&apos;s talk about her day.</h1>
          <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">Tell us about the celebration. We&apos;ll check her date personally and help you find the right photo and film coverage.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 rounded-xl border border-line bg-white p-6 sm:p-8 lg:col-start-2 lg:row-start-1 lg:p-10"><InquiryForm initialDate={initialDate} /></div>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Good to know</p>
            <h2 className="mt-3 font-display text-2xl font-normal text-ink">Ask without a commitment.</h2>
            <p className="mt-4 text-base leading-7 text-ink-soft">You can ask even if you are still choosing a date. Sending this form does not reserve a date or require payment.</p>
            <div className="mt-8 border-t border-line pt-6 text-base leading-7 text-ink-soft">
              <p>Know the date and collection already? <Link href={site.cta.href} className="font-medium text-ink underline underline-offset-4 hover:text-ink-soft">Request a reservation ↗</Link></p>
              <p className="mt-4">Prefer email? <a href={`mailto:${site.contact.email}`} className="font-medium text-ink underline underline-offset-4 hover:text-ink-soft">{site.contact.email}</a></p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="inquiry-steps-title">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">What happens next</p>
          <h2 id="inquiry-steps-title" className="mt-3 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">A simple next step.</h2>
          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li key={step.title} className="rounded-xl border border-line bg-white p-6 sm:p-8">
                <span className="text-xs font-medium text-ink-soft">0{index + 1}</span>
                <h3 className="mt-7 font-display text-xl font-normal text-ink">{step.title}</h3>
                <p className="mt-3 text-base leading-7 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-[88rem] flex-col justify-between gap-6 px-5 py-16 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:px-12" aria-labelledby="inquiry-work-title">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Portfolio</p>
          <h2 id="inquiry-work-title" className="mt-3 max-w-xl font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">See our photo and film work.</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-ink-soft">Browse the available photographs and films, then tell us what feels right for your family.</p>
        </div>
        <Link href="/portfolio" className="inline-flex min-h-12 items-center self-start rounded-md border border-ink px-6 text-base font-medium text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Explore the portfolio <span aria-hidden="true" className="ml-3">↗</span></Link>
      </section>
      <Testimonials className="mx-auto max-w-[88rem] px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12" />
    </>
  );
}
