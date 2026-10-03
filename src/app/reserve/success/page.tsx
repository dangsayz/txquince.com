import type { Metadata } from "next";
import { ConfirmationPage } from "@/components/ConfirmationPage";
import {
  retrieveStripeCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe";
import { formatEventDate, formatMoney } from "@/lib/booking";
import { reservationConfirmation } from "@/lib/reservation-confirmation";

export const metadata: Metadata = {
  title: "Reservation Status",
  description: "Check the status of your TX Quince date request and deposit.",
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
  let checkoutFound = false;

  if (session_id && isStripeConfigured()) {
    try {
      const session = await retrieveStripeCheckoutSession(session_id);
      checkoutFound = true;
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

  const confirmation = reservationConfirmation({ paid, checkoutFound, eventDate, depositLabel });

  return (
    <ConfirmationPage
      eyebrow={confirmation.eyebrow}
      title={confirmation.title}
      primaryLabel="See the galleries"
      homeLabel="Back home"
      homeHref="/"
      contactLabel="Questions about your reservation? Write us at"
    >
      <p>{confirmation.message}</p>
    </ConfirmationPage>
  );
}
