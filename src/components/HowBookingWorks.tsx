import { retainerPercentLabel } from "@/content/commissions";
import "@/components/txq/pages/pages.css";

/**
 * "How booking works" — a 4-step ledger that removes the "what happens next?"
 * uncertainty the booking-funnel research names as a top drop-off cause.
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
    <section className={`tq-pg-steps ${className}`} aria-labelledby="booking-steps-title">
      <header style={{ display: "grid", gap: 16, alignContent: "start" }}>
        <p className="tq-mono" style={{ margin: 0 }}>
          [How booking works]
        </p>
        <h2 id="booking-steps-title" className="tq-display tq-pg-row__title">
          From first look to her day.
        </h2>
      </header>
      <ol>
        {BOOKING_STEPS.map((step, index) => (
          <li key={step.title}>
            <span className="tq-mono tq-muted">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="tq-display">{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
