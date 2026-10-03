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
  { title: "Tell us about her day", body: "Share the date, venue or city, and the coverage you have in mind." },
  { title: "We check the calendar", body: "We review your details and confirm availability with you personally." },
  { title: "Choose your next step", body: "If the day is open, we can talk through collections and a reservation. This inquiry is free." },
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
      <section aria-labelledby="inquiry-title" className="relative flex min-h-[32rem] items-center justify-center overflow-hidden bg-ink px-5 py-20 text-center text-white sm:min-h-[38rem] sm:px-8 lg:min-h-[44rem]">
        <Image src="/portfolio/red-garden.webp" alt="Quinceañera holding flowers in a garden" fill priority sizes="100vw" className="object-cover object-[center_39%]" />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.26em] text-white">Say hello / Dallas–Fort Worth</p>
          <h1 id="inquiry-title" className="mx-auto mt-7 max-w-[19ch] font-display text-[clamp(2.5rem,5vw,4.75rem)] font-light leading-[1.12] text-white">Tell us how she&apos;s celebrating.</h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-white">Tell us the date you have in mind. We will check the details and reply personally.</p>
          <a href="#inquiry-form" className="mt-8 inline-flex min-h-12 items-center justify-center gap-4 whitespace-nowrap border-b border-white text-xs uppercase tracking-[0.17em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Begin the inquiry <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="inquiry-form" aria-labelledby="inquiry-form-title" className="scroll-mt-20 bg-ivory px-5 py-20 sm:px-8 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">The first hello</p>
            <h2 id="inquiry-form-title" className="mt-6 max-w-sm font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light leading-[1.13] text-ink">Begin with what you know.</h2>
            <p className="mt-7 max-w-sm text-base leading-8 text-ink-soft">Whether the date is set or you are still weighing photography and film, a few details help us give you a useful answer.</p>
            <p className="mt-8 max-w-sm border-t border-line pt-6 text-base leading-7 text-ink-soft">No payment is needed to inquire. Sending a message does not hold the date.</p>
            <Link href="/investment" className="mt-6 inline-flex min-h-12 items-center gap-4 whitespace-nowrap border-b border-ink text-sm uppercase tracking-[0.13em] text-ink">See the collections <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="min-w-0 bg-white px-5 py-8 sm:px-10 sm:py-12 lg:px-12"><InquiryForm initialDate={initialDate} /></div>
        </div>
      </section>

      <section aria-labelledby="inquiry-next-title" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">After you write</p><h2 id="inquiry-next-title" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">How we proceed</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{steps.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-line pt-8"><Link href="/portfolio" className="inline-flex min-h-12 items-center gap-3 whitespace-nowrap border-b border-ink text-sm uppercase tracking-[0.13em] text-ink">Explore the photographs ↗</Link><a href={"mailto:" + site.contact.email} className="inline-flex min-h-12 items-center text-base text-ink-soft underline underline-offset-4">{site.contact.email}</a></div>
      </section>
    </>
  );
}
