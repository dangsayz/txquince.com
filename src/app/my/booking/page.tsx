import type { Metadata } from "next";
import { FindMyBooking } from "@/components/journey/FindMyBooking";

export const metadata: Metadata = {
  title: "Find your booking",
  robots: { index: false, follow: true },
  alternates: { canonical: "/my/booking", languages: { "en-US": "/my/booking", "es-MX": "/es/mi-reserva" } },
};

export default function FindMyBookingPage() {
  return <FindMyBooking lang="en" />;
}
