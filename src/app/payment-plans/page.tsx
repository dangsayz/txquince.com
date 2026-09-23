import type { Metadata } from "next";
import { PaymentPlansPage } from "@/components/PaymentPlansPage";

export const metadata: Metadata = {
  title: "Quinceañera Photography Payment Plans — Dallas–Fort Worth",
  description: "Reserve your quinceañera photography or film date with a $300–$1,000 collection deposit, then split the remaining balance into interest-free payments.",
  alternates: { canonical: "/payment-plans", languages: { "en-US": "/payment-plans", "es-MX": "/es/planes-de-pago" } },
};

export default function Page() { return <PaymentPlansPage locale="en" />; }
