import type { Metadata } from "next";
import { FindMyBooking } from "@/components/journey/FindMyBooking";

export const metadata: Metadata = {
  title: "Encuentra tu reservación",
  robots: { index: false, follow: true },
  alternates: { canonical: "/es/mi-reserva", languages: { "en-US": "/my/booking", "es-MX": "/es/mi-reserva" } },
  openGraph: { locale: "es_MX" },
};

export default function EncuentraTuReservacionPage() {
  return <FindMyBooking lang="es" />;
}
