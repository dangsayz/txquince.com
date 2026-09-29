import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { Testimonials } from "@/components/Testimonials";
import { isCollectionId, packages } from "@/content/packages";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Request Your Date",
  description:
    "Request a date and choose a TX Quince photo or film collection. We confirm availability before sending a deposit link; no payment is due with your request.",
  alternates: { canonical: "/reserve" },
  openGraph: {
    title: "Request Your Date · TX Quince",
    description:
      "Choose a collection and request your quinceañera date. We confirm the details before payment.",
    url: `${site.url}/reserve`,
  },
};

const nextSteps = [
  { title: "Send your request", body: "Choose her date and collection, then tell us how to reach you. There is no payment at this step." },
  { title: "We confirm the details", body: "We check availability and follow up about the celebration, coverage, and next steps." },
  { title: "Complete the reservation", body: "Once the details are confirmed, we send a secure deposit link. The deposit applies to your final collection balance." },
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
      <section className="mx-auto max-w-[88rem] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Reservation request</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.14] text-ink">Request her date.</h1>
          <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">Choose a collection and tell us when you&apos;re celebrating. We&apos;ll confirm the details with you before any deposit is due.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-[minmax(16rem,0.42fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 rounded-xl border border-line bg-white p-6 sm:p-8 lg:col-start-2 lg:row-start-1 lg:p-10">
            {canceled && <p role="status" className="mb-5 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-ink-soft">The previous checkout was canceled, and no payment was taken. You can request your date below; we will confirm availability before sending a payment link.</p>}
            <BookingForm key={`${defaultCollection ?? ""}:${defaultDate ?? ""}`} defaultCollection={defaultCollection} defaultDate={defaultDate} />
          </div>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:pt-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Good to know</p>
            <h2 className="mt-3 font-display text-2xl font-normal text-ink">No payment with this request.</h2>
            <p className="mt-4 text-base leading-7 text-ink-soft">Your request is reviewed personally. A date is reserved only after availability is confirmed and the collection deposit is completed.</p>
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-sm font-medium text-ink">Collection prices</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {packages.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 text-sm text-ink-soft"><span>{item.name}</span><span className="font-medium text-ink">{item.priceLabel}</span></li>
                ))}
              </ul>
              <Link href="/investment" className="mt-4 inline-block text-sm font-medium text-ink underline underline-offset-4 hover:text-ink-soft">Compare what is included ↗</Link>
            </div>
            <p className="mt-8 text-base leading-7 text-ink-soft">Just have a question? <Link href={site.secondaryCta.href} className="font-medium text-ink underline underline-offset-4 hover:text-ink-soft">Send an inquiry first ↗</Link></p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="reserve-steps-title">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">What happens next</p>
          <h2 id="reserve-steps-title" className="mt-3 font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">How reservations work.</h2>
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

      <section className="mx-auto flex max-w-[88rem] flex-col justify-between gap-6 px-5 py-16 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:px-12" aria-labelledby="reserve-work-title">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">Before you request</p>
          <h2 id="reserve-work-title" className="mt-3 max-w-xl font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-tight text-ink">Review the portfolio and collections.</h2>
          <p className="mt-4 max-w-md text-base leading-7 text-ink-soft">Browse the available photo and film portfolio to picture how your day could be covered.</p>
        </div>
        <Link href="/portfolio" className="inline-flex min-h-12 items-center self-start rounded-md border border-ink px-6 text-base font-medium text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Explore the portfolio <span aria-hidden="true" className="ml-3">↗</span></Link>
      </section>
      <Testimonials className="mx-auto max-w-[88rem] px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12" />
    </>
  );
}
