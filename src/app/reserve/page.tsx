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
  { title: "Choose coverage", body: "Select the collection that fits her day." },
  { title: "Share her date", body: "Tell us when to check and how to reach you." },
  { title: "We confirm", body: "If available, we send the deposit link to complete the reservation." },
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
      <section aria-labelledby="reserve-title" className="mx-auto max-w-[88rem] px-5 pb-14 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <div className="grid gap-7 border-b border-line pb-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Reservation request / TX Quince</p>
            <h1 id="reserve-title" className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">Let&apos;s make space for her day.</h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-ink-soft">Choose a collection and share the date. We&apos;ll review availability with you before any deposit is due. The date is held after confirmation and payment.</p>
        </div>
        <figure className="mt-7">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-greige sm:aspect-[5/4]"><Image src="/portfolio/reception.webp" alt="Quinceañera portrait in a pink gown" fill priority sizes="(max-width: 640px) 33vw, 30vw" className="object-cover object-[center_30%]" /></div>
            <div className="relative aspect-[3/4] overflow-hidden bg-greige sm:aspect-[5/4]"><Image src="/portfolio/dance.webp" alt="Dancers at a quinceañera celebration" fill sizes="(max-width: 640px) 33vw, 30vw" className="object-cover object-[center_55%]" /></div>
            <div className="relative aspect-[3/4] overflow-hidden bg-greige sm:aspect-[5/4]"><Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown holding flowers" fill sizes="(max-width: 640px) 33vw, 30vw" className="object-cover object-[center_40%]" /></div>
          </div>
          <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Portrait / tradition / celebration</figcaption>
        </figure>
      </section>

      <section aria-labelledby="reserve-form-title" className="border-t border-line bg-white">
        <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">The reservation journey</p>
          <ol className="mt-6 grid gap-5 border-y border-line py-6 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => <li key={step.title} className="flex gap-4"><span className="shrink-0 text-xs uppercase tracking-[0.15em] text-ink-soft">0{index + 1}</span><div><h2 className="text-base font-medium text-ink">{step.title}</h2><p className="mt-1 text-base leading-6 text-ink-soft">{step.body}</p></div></li>)}
          </ol>

          <div className="mx-auto mt-14 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Your request</p>
            <h2 id="reserve-form-title" className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">The details of her day.</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">A request starts the conversation. It does not reserve the date or charge you.</p>
            {canceled ? <p role="status" className="mt-6 border-l-2 border-ink bg-ivory px-5 py-4 text-base leading-7 text-ink">The previous checkout was canceled, and no payment was taken. You can request your date below; we will confirm availability before sending a payment link.</p> : null}
            <div className="mt-8 border-t border-line pt-8"><BookingForm key={(defaultCollection ?? "") + ":" + (defaultDate ?? "")} defaultCollection={defaultCollection} defaultDate={defaultDate} /></div>
          </div>
        </div>
      </section>

      <section aria-labelledby="collections-title" className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Before you decide</p><h2 id="collections-title" className="mt-3 font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-normal leading-tight text-ink">The four collections.</h2></div>
          <Link href="/investment" className="inline-flex min-h-12 items-center gap-4 whitespace-nowrap border-b border-ink text-base text-ink">Compare what&apos;s included ↗</Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6 md:grid-cols-4">
          {packages.map((item) => <li key={item.id} className="min-w-0"><p className="text-base text-ink">{item.name}</p><p className="mt-1 text-xl text-ink">{item.priceLabel}</p><p className="mt-1 text-base text-ink-soft">{item.depositLabel} deposit</p></li>)}
        </ul>
        <p className="mt-9 max-w-2xl border-t border-line pt-6 text-base leading-7 text-ink-soft">A date is reserved only after we confirm availability and you complete the collection deposit. Just have a question? <Link href={site.secondaryCta.href} className="text-ink underline underline-offset-4">Send an inquiry first ↗</Link></p>
      </section>
    </>
  );
}
