/**
 * analytics.ts — custom conversion events on top of Vercel Analytics.
 *
 * SUCCESS METRICS LAW: instrument the inquiry as the primary conversion, plus
 * the budget tier (proves the filter works). Safe to call on the client; no-ops
 * if the Vercel Analytics script hasn't loaded.
 */
import { track } from "@vercel/analytics";

export function trackInquirySubmitted(props: {
  budget_range: string;
  services: string;
}) {
  try {
    track("inquiry_submitted", props);
  } catch {
    // analytics must never break the UX
  }
}

/**
 * Fired the moment a family is handed off to Stripe Checkout for the deposit —
 * the booking equivalent of the inquiry conversion. `package` proves which tier
 * actually reserves dates (not just inquires).
 */
export function trackBookingStarted(props: { package: string }) {
  try {
    track("booking_started", props);
  } catch {
    // analytics must never break the UX
  }
}
