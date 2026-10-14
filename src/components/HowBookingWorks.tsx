import { bookingSteps } from "@/content/commissions";
import "@/components/txq/pages/pages.css";

/**
 * "How booking works" — a 4-step ledger (copy lives in content/commissions.ts) that removes the "what happens next?"
 * uncertainty the booking-funnel research names as a top drop-off cause.
 */
export const BOOKING_STEPS = bookingSteps.en;

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
