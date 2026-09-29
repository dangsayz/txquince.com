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
      <section className="mx-auto max-w-[88rem] px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 xl:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold text-accent-strong">Reservation request</p>
            <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2rem,4vw,4rem)] leading-[1.12] text-ink">Request your <span className="text-accent">date.</span></h1>
            <p className="mt-6 max-w-md text-base leading-7 text-ink-soft">Tell us when you are celebrating and the collection you would like. We will confirm the details before any deposit is due.</p>
            <div className="mt-8 rounded-2xl border border-line bg-white p-6">
              <p className="text-sm font-semibold text-ink">No payment with this request.</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">Your request is reviewed personally. A date is reserved only after availability is confirmed and the collection deposit is completed.</p>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold text-ink">Collection prices</p>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {packages.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 text-sm text-ink-soft"><span>{item.name}</span><span className="font-semibold text-ink">{item.priceLabel}</span></li>
                ))}
              </ul>
              <Link href="/investment" className="mt-3 inline-block text-sm font-semibold text-ink underline underline-offset-4 hover:text-accent">Compare what is included ↗</Link>
            </div>
            <p className="mt-8 text-sm leading-6 text-ink-soft">Just have a question? <Link href={site.secondaryCta.href} className="font-semibold text-ink underline underline-offset-4 hover:text-accent">Send an inquiry first ↗</Link></p>
          </div>
          <div className="min-w-0">
            {canceled && <p role="status" className="mb-5 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-ink-soft">The previous checkout was canceled, and no payment was taken. You can request your date below; we will confirm availability before sending a payment link.</p>}
            <BookingForm key={`${defaultCollection ?? ""}:${defaultDate ?? ""}`} defaultCollection={defaultCollection} defaultDate={defaultDate} />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="reserve-steps-title">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-semibold text-accent-strong">What happens next</p>
          <h2 id="reserve-steps-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">How reservations work.</h2>
          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-cream p-6 sm:p-8">
                <span className="text-xs font-semibold text-accent-strong">0{index + 1}</span>
                <h3 className="mt-7 font-display text-2xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-[88rem] flex-col justify-between gap-6 px-5 py-16 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:px-12" aria-labelledby="reserve-work-title">
        <div>
          <p className="text-xs font-semibold text-accent-strong">Before you request</p>
          <h2 id="reserve-work-title" className="mt-3 max-w-xl font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">Review the portfolio and collections.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft">Browse the available photo and film portfolio to picture how your day could be covered.</p>
        </div>
        <Link href="/portfolio" className="inline-flex self-start rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Explore the portfolio <span aria-hidden="true" className="ml-3">↗</span></Link>
      </section>
      <Testimonials className="mx-auto max-w-[88rem] px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12" />
    </>
  );
}
