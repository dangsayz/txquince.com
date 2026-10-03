import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { isCollectionId, packages } from "@/content/packages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Request Your Date",
  description: "Request a date and choose a TX Quince photo or film collection. We confirm availability before sending a deposit link; no payment is due with your request.",
  alternates: { canonical: "/reserve" },
  openGraph: {
    title: "Request Your Date · TX Quince",
    description: "Choose a collection and request your quinceañera date. We confirm the details before payment.",
    url: site.url + "/reserve",
  },
};

const steps = [
  { title: "Choose your collection", body: "Select the coverage that feels right for her celebration." },
  { title: "Share her date", body: "Send the details you know. There is no charge to make a request." },
  { title: "Confirm and reserve", body: "We review availability, then send a secure deposit link if the date is open." },
] as const;

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; collection?: string; date?: string }>;
}) {
  const { canceled, collection, date } = await searchParams;
  const defaultCollection = isCollectionId(collection) ? collection : undefined;
  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;

  return (
    <>
      <header aria-labelledby="reserve-title" className="relative flex min-h-[23rem] items-end overflow-hidden bg-ink text-white sm:min-h-[30rem]">
        <Image src="/portfolio/lilac-arch.webp" alt="Quinceañera in a lilac gown outside her venue" fill priority unoptimized sizes="100vw" className="object-cover object-[center_53%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-10 pt-24 sm:px-10 sm:pb-14 lg:px-16">
          <p className="text-[.7rem] uppercase tracking-[.23em] text-white/85">A date worth remembering</p>
          <h1 id="reserve-title" className="mt-5 max-w-[23ch] font-display text-[clamp(2.1rem,3.4vw,3.4rem)] font-light leading-[1.13] tracking-[-.03em]">Start with her date.</h1>
        </div>
      </header>

      <section aria-labelledby="reserve-form-title" className="bg-white px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div className="mx-auto grid max-w-[90rem] gap-14 lg:grid-cols-[minmax(0,.4fr)_minmax(0,.6fr)] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[.7rem] uppercase tracking-[.2em] text-ink-soft">The first step</p>
            <h2 id="reserve-form-title" className="mt-5 max-w-[16ch] font-display text-[clamp(1.9rem,2.8vw,2.8rem)] font-light leading-tight text-ink">Tell us about her celebration.</h2>
            <p className="mt-6 max-w-md font-serif text-lg leading-8 text-ink-soft">Choose a collection and share the date you have in mind. We will check availability personally.</p>
            <p className="mt-8 max-w-md border-t border-line pt-6 text-sm leading-7 text-ink-soft">Your request does not charge you or hold the date. We confirm availability before any deposit is due.</p>
            <Link href="/investment" className="mt-6 inline-flex min-h-12 items-center gap-6 border-b border-ink text-xs uppercase tracking-[.14em] text-ink">Compare collections <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="min-w-0">
            {canceled ? <p role="status" className="mb-8 border-l-2 border-ink bg-ivory px-5 py-4 text-base leading-7 text-ink">The previous checkout was canceled, and no payment was taken. Send your request below and we will confirm availability before sending a payment link.</p> : null}
            <BookingForm key={(defaultCollection ?? "") + ":" + (defaultDate ?? "")} defaultCollection={defaultCollection} defaultDate={defaultDate} />
          </div>
        </div>
      </section>

      <section aria-labelledby="reserve-steps-title" className="bg-ivory px-5 py-20 sm:px-10 sm:py-28 lg:px-16">
        <div className="mx-auto max-w-[90rem]">
          <p className="text-[.7rem] uppercase tracking-[.2em] text-ink-soft">From here to her day</p>
          <h2 id="reserve-steps-title" className="mt-4 font-display text-[clamp(1.9rem,2.8vw,2.8rem)] font-light text-ink">What happens next</h2>
          <ol className="mt-12 grid gap-8 border-t border-line pt-9 md:grid-cols-3 md:gap-12">{steps.map((step, index) => <li key={step.title}><span className="text-xs tracking-[.14em] text-ink-faint">0{index + 1}</span><h3 className="mt-6 font-display text-xl font-light text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
          <div className="mt-14 grid gap-6 border-t border-line pt-8 sm:grid-cols-[minmax(0,.4fr)_minmax(0,.6fr)]">
            <p className="text-[.7rem] uppercase tracking-[.2em] text-ink-soft">Four collections</p>
            <div className="grid grid-cols-2 gap-x-7 gap-y-6 sm:grid-cols-4">{packages.map((item) => <div key={item.id}><p className="text-base text-ink">{item.name}</p><p className="mt-1 font-display text-xl font-light text-ink">{item.priceLabel}</p></div>)}</div>
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-ink-soft">A date is reserved only after we confirm availability and you complete the collection deposit.</p>
        </div>
      </section>
    </>
  );
}
