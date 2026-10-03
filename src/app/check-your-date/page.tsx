import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Check Your Date",
  description: "Ask TX Quince about your quinceañera date and photo or film coverage in Dallas–Fort Worth. We confirm availability personally; no payment is needed to inquire.",
  alternates: { canonical: "/check-your-date" },
  openGraph: {
    title: "Check Your Date · TX Quince",
    description: "Tell us about your celebration. We will confirm availability personally, with no payment needed to inquire.",
    url: site.url + "/check-your-date",
  },
};

const steps = [
  { title: "Share your plans", body: "Tell us the date, venue or city, and the coverage you have in mind." },
  { title: "We check the calendar", body: "We review your details and confirm availability with you personally." },
  { title: "Decide what feels right", body: "If the date works, we can talk through collections and the reservation. This inquiry is free." },
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
      <section aria-labelledby="inquiry-title" className="mx-auto max-w-[88rem] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-14">
          <figure className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown holding flowers" fill priority sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover object-[center_35%]" />
            </div>
            <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Start with the day you have in mind</figcaption>
          </figure>
          <div className="max-w-xl lg:pb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Date inquiry / Dallas–Fort Worth</p>
            <h1 id="inquiry-title" className="mt-5 max-w-[17ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">Tell us about her day.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">Still choosing a date or deciding between photography and film? Start here. We&apos;ll check the details and reply personally.</p>
            <a href="#inquiry-form" className="mt-8 inline-flex min-h-12 items-center gap-8 whitespace-nowrap border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Start the inquiry <span aria-hidden="true">↓</span></a>
            <p className="mt-8 border-t border-line pt-5 text-base leading-7 text-ink-soft">No payment or commitment is required to ask. Sending an inquiry does not hold the date.</p>
          </div>
        </div>
      </section>

      <section id="inquiry-form" aria-labelledby="inquiry-form-title" className="scroll-mt-20 border-t border-line bg-white">
        <div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20 lg:px-12">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">01 / The first hello</p>
            <h2 id="inquiry-form-title" className="mt-4 max-w-sm font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">Begin with what you know.</h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-ink-soft">A few details help us respond with the right availability and collection guidance.</p>
            <p className="mt-7 max-w-sm border-t border-line pt-5 text-base leading-7 text-ink-soft">Already decided on a collection? <Link href={site.cta.href} className="text-ink underline underline-offset-4">Request her date ↗</Link></p>
          </div>
          <div className="min-w-0 border-t border-line pt-8 lg:pt-0"><InquiryForm initialDate={initialDate} /></div>
        </div>
      </section>

      <section aria-labelledby="inquiry-next-title" className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-6 border-b border-line pb-8 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">After you write</p>
          <h2 id="inquiry-next-title" className="font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">What happens next.</h2>
        </div>
        <ol className="divide-y divide-line">{steps.map((step, index) => <li key={step.title} className="grid gap-3 py-6 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-6"><p className="text-xs uppercase tracking-[0.16em] text-ink-soft">0{index + 1}</p><div><h3 className="text-lg font-medium text-ink">{step.title}</h3><p className="mt-2 max-w-xl text-base leading-7 text-ink-soft">{step.body}</p></div></li>)}</ol>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"><Link href="/portfolio" className="inline-flex min-h-12 items-center gap-4 whitespace-nowrap border-b border-ink text-base text-ink">Explore the photographs ↗</Link><a href={"mailto:" + site.contact.email} className="inline-flex min-h-12 items-center border-b border-line text-base text-ink-soft">{site.contact.email}</a></div>
      </section>
    </>
  );
}
