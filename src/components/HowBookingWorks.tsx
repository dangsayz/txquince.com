import { retainerPercentLabel } from "@/content/commissions";

/**
 * "How booking works" — a 4-step visual that removes the "what happens next?"
 * uncertainty the booking-funnel research names as a top drop-off cause. Shown
 * on the conversion pages so paying the deposit feels like step one of a known
 * process, not a leap of faith.
 */
export const BOOKING_STEPS = [
  {
    title: "Send the date",
    body: "Pick the date on the live calendar and the commission you are considering. Questions first? Request a consultation and we hold the date for 7 days.",
  },
  {
    title: "Lock it in",
    body: `A ${retainerPercentLabel} retainer at secure checkout reserves the date exclusively. It applies in full; the balance is due 30 days before the celebration.`,
  },
  {
    title: "Your portrait session",
    body: "The Full Production and the Multi-Day Archive include an editorial portrait session before the day, so we already know each other when the camera comes out.",
  },
  {
    title: "Your day, captured",
    body: "We document the whole arc of your commission, from la misa to the last dance, with stills and film made side by side."
  },
] as const;

export function HowBookingWorks({ className = "" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="booking-steps-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">How booking works</p>
          <h2 id="booking-steps-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">From first look to her day.</h2>
        </div>
        <ol className="border-t border-line">
          {BOOKING_STEPS.map((step, index) => (
            <li key={step.title} className="grid gap-4 border-b border-line py-6 sm:grid-cols-[2.5rem_minmax(0,0.4fr)_minmax(0,0.6fr)] sm:gap-6 sm:py-8">
              <span className="text-xs text-ink-faint">0{index + 1}</span>
              <h3 className="font-display text-xl font-normal leading-tight text-ink">{step.title}</h3>
              <p className="max-w-md text-base leading-7 text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
