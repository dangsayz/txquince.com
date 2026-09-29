import { depositFloorLabel } from "@/content/packages";
import { Reveal } from "@/components/Reveal";

/**
 * "How booking works" — a 4-step visual that removes the "what happens next?"
 * uncertainty the booking-funnel research names as a top drop-off cause. Shown
 * on the conversion pages so paying the deposit feels like step one of a known
 * process, not a leap of faith.
 */
export const BOOKING_STEPS = [
  {
    title: "Send the date",
    body: "Tell us the date and collection you are considering. We personally confirm availability before any payment.",
  },
  {
    title: "Lock it in",
    body: `If the date is open, a deposit from ${depositFloorLabel} holds it. The deposit applies to your collection balance.`,
  },
  {
    title: "Your save-the-date session",
    body: "Essential, Signature, and Legacy include a portrait session before the day, so we already know each other when the camera comes out.",
  },
  {
    title: "Your day, captured",
    body: "We document the moments covered by your chosen collection, from la misa to the celebration. Signature includes a same-week sneak peek.",
  },
] as const;

export function HowBookingWorks({ className = "" }: { className?: string }) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-5">How booking works</p>
        <h2 className="display-2 text-ink text-balance">
          Four simple steps, no guesswork.
        </h2>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:mt-14 md:grid-cols-4">
        {BOOKING_STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 80} className="bg-cream p-8 md:p-9">
            <span className="font-display text-2xl text-wine">0{i + 1}</span>
            <h3 className="mt-5 font-display text-xl text-ink">{step.title}</h3>
            <p className="mt-3 text-base leading-7 text-ink-soft">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
