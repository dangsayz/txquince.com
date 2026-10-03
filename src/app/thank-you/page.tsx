import type { Metadata } from "next";
import { ConfirmationPage } from "@/components/ConfirmationPage";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your inquiry has been received.",
  alternates: { canonical: "/thank-you" },
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <ConfirmationPage eyebrow="Inquiry received" title="Thank you. We'll be in touch." primaryLabel="See the galleries" homeLabel="Back home" homeHref="/" contactLabel="Didn't get a confirmation email? Write us at">
      <p>We&apos;ll review your details and confirm whether your date is open. Watch your inbox for a reply from the studio.</p>
    </ConfirmationPage>
  );
}
