/**
 * analytics.ts — custom conversion events on top of our first-party tracker
 * (components/Tracker.tsx → /api/track). Replaces @vercel/analytics, which
 * reports nothing on a Cloudflare deploy. Safe to call on the client; the
 * underlying beacon is fully guarded and never throws.
 */
import { trackEvent } from "@/components/Tracker";

export function trackInquirySubmitted(props: { budget_range: string; services: string }) {
  trackEvent("inquiry_submitted", `${props.budget_range} · ${props.services}`);
}

/** Fired when a family submits a date request — the booking conversion. */
export function trackBookingStarted(props: { package: string }) {
  trackEvent("booking_requested", props.package);
}
