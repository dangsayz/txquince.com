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
      <section aria-labelledby="reserve-title" className="bg-white px-5 pb-16 pt-20 text-center sm:px-8 sm:pb-24 sm:pt-28 lg:pt-36">
        <p className="text-xs uppercase tracking-[0.26em] text-ink-soft">Quinceañera photo &amp; film / Date request</p>
        <h1 id="reserve-title" className="mx-auto mt-7 max-w-[20ch] font-display text-[clamp(2.25rem,4vw,3.75rem)] font-light leading-[1.13] text-ink">Tell us when she&apos;s celebrating.</h1>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-ink-soft">Choose a collection and tell us the date. We will confirm availability with you personally before any deposit is due.</p>
      </section>

      <section aria-labelledby="reserve-form-title" className="grid bg-ivory lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="order-2 min-w-0 px-5 py-14 sm:px-10 sm:py-20 lg:order-1 lg:px-[clamp(3rem,7vw,8rem)] lg:py-24">
          <p className="text-xs uppercase tracking-[0.24em] text-ink-soft">The first step</p>
          <h2 id="reserve-form-title" className="mt-5 font-display text-[clamp(2rem,3vw,3rem)] font-light leading-tight text-ink">Tell us about her celebration.</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft">Your request starts the conversation. It does not charge you or hold the date.</p>
          {canceled ? <p role="status" className="mt-8 border-l-2 border-ink bg-white px-5 py-4 text-base leading-7 text-ink">The previous checkout was canceled, and no payment was taken. Send your request below and we will confirm availability before sending a payment link.</p> : null}
          <div className="mt-10 border-t border-line pt-8"><BookingForm key={(defaultCollection ?? "") + ":" + (defaultDate ?? "")} defaultCollection={defaultCollection} defaultDate={defaultDate} /></div>
        </div>
        <figure className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-0 lg:self-start">
          <div className="relative aspect-[5/4] overflow-hidden bg-greige lg:min-h-[calc(100svh-5rem)] lg:aspect-auto">
            <Image src="/portfolio/lilac-arch.webp" alt="Quinceañera in a lilac gown outside her venue" fill priority sizes="(max-width: 1024px) 100vw, 43vw" className="object-cover object-[center_55%]" />
          </div>
          <figcaption className="bg-white px-5 py-4 text-xs uppercase tracking-[0.18em] text-ink-soft sm:px-10">A day to remember / Dallas–Fort Worth</figcaption>
        </figure>
      </section>

      <section aria-labelledby="reserve-steps-title" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="text-center"><p className="text-xs uppercase tracking-[0.24em] text-ink-soft">From here to her day</p><h2 id="reserve-steps-title" className="mt-5 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-light text-ink">What happens next</h2></div>
        <ol className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-12">{steps.map((step, index) => <li key={step.title}><span className="font-display text-3xl font-light text-ink-soft">0{index + 1}</span><h3 className="mt-6 text-lg font-normal text-ink">{step.title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p></li>)}</ol>
        <div className="mt-14 grid gap-6 border-t border-line pt-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Four collections</p>
          <div className="grid grid-cols-2 gap-x-7 gap-y-6 sm:grid-cols-4">{packages.map((item) => <div key={item.id}><p className="text-base text-ink">{item.name}</p><p className="mt-1 font-display text-xl font-light text-ink">{item.priceLabel}</p></div>)}</div>
        </div>
        <p className="mt-8 max-w-2xl text-base leading-7 text-ink-soft">A date is reserved only after we confirm availability and you complete the collection deposit. <Link href="/investment" className="text-ink underline underline-offset-4">Compare what is included ↗</Link></p>
      </section>
    </>
  );
}
