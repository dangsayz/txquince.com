import type { Metadata } from "next";
import { PaymentPlansPage } from "@/components/PaymentPlansPage";

export const metadata: Metadata = {
  title: "Planes de Pago para Foto y Video de Quinceañera — Dallas–Fort Worth",
  description: "Aparta su fecha con un depósito de $300 a $1,000 según la colección y divide el saldo en pagos sin intereses antes de la celebración.",
  alternates: { canonical: "/es/planes-de-pago", languages: { "en-US": "/payment-plans", "es-MX": "/es/planes-de-pago" } },
  openGraph: { locale: "es_MX" },
};

export default function Page() { return <PaymentPlansPage locale="es" />; }
