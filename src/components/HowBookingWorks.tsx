import { site } from "@/content/site";
import { Reveal } from "@/components/Reveal";

/**
 * "How booking works" — a 4-step visual that removes the "what happens next?"
 * uncertainty the booking-funnel research names as a top drop-off cause. Shown
 * on the conversion pages so paying the deposit feels like step one of a known
 * process, not a leap of faith.
 */
const STEPS = [
  {
    title: "Reserve your date",
    body: `Choose your collection and date, then pay a deposit from ${site.booking.depositLabel} — your day is held instantly, and you can pay in full or in interest-free installments at checkout.`,
  },
  {
    title: "We plan it together",
    body: "I reach out personally within 24 hours to confirm the details — your timeline, the church and venue, and the moments that matter most to your family.",
  },
  {
    title: "Your save-the-date session",
    body: "Every collection includes a complimentary portrait session before the big day, so we already know each other when the camera comes out.",
  },
  {
    title: "Your day, captured",
    body: "I document la misa, el vals, and the celebration in full. Your deposit applies to the balance, and your sneak peek lands the same week.",
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
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 80} className="bg-cream p-8 md:p-9">
            <span className="font-display text-2xl text-wine">0{i + 1}</span>
            <h3 className="mt-5 font-display text-xl text-ink">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
