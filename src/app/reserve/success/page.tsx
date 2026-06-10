import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { CTAButton } from "@/components/CTAButton";
import {
  retrieveStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe";
import { formatEventDate, formatMoney } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Your Date Is Reserved",
  description: "Your deposit was received and your date is reserved.",
  alternates: { canonical: "/reserve/success" },
  robots: { index: false, follow: false },
};

export default async function ReserveSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // Optimistic read straight from Stripe so the page is right even before the
  // webhook lands. The webhook is the source of truth for the DB + emails.
  let eventDate: string | null = null;
  let depositLabel: string | null = null;
  let paid = false;

  if (session_id && isStripeConfigured()) {
    try {
      const session = await retrieveStripeCheckoutSession(session_id);
      paid = session.payment_status === "paid";
      if (session.amount_total != null) {
        depositLabel = formatMoney(session.amount_total, session.currency ?? "usd");
      }
      const rawDate = session.metadata?.event_date;
      if (rawDate) eventDate = formatEventDate(rawDate);
    } catch {
      // Fall back to the generic confirmation below.
    }
  }

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center px-5 py-section text-center md:px-10 lg:px-16">
      <p className="eyebrow mb-6">{paid ? "Reserved" : "Almost there"}</p>

      <h1 className="font-display text-4xl leading-[1.08] text-ink text-balance md:text-5xl">
        {eventDate ? (
          <>Your date is reserved — {eventDate}.</>
        ) : paid ? (
          <>Your date is reserved.</>
        ) : (
          <>Thank you — we&apos;re confirming your deposit.</>
        )}
      </h1>

      <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
        {paid ? (
          <>
            {depositLabel ? `Your ${depositLabel} deposit is in` : "Your deposit is in"}
            {" "}and applied to your final balance. I won&apos;t take another
            celebration on your day. Watch your inbox — a confirmation is on its
            way, and I&apos;ll reach out personally to start planning the details.
          </>
        ) : (
          <>
            Your payment is processing. The moment it clears, your date is locked
            and a confirmation email goes out. This can take a minute — no need to
            pay again.
          </>
        )}
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <CTAButton href="/portfolio" variant="primary">
          See the galleries
        </CTAButton>
        <Link
          href="/"
          className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Back home
        </Link>
      </div>

      <p className="mt-12 text-xs text-ink-faint">
        Questions about your reservation? Write me at{" "}
        <a href={`mailto:${site.contact.email}`} className="underline underline-offset-2">
          {site.contact.email}
        </a>
        .
      </p>
    </section>
  );
}
