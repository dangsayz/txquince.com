import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { languageAlternates } from "@/lib/hreflang";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your account",
  alternates: { canonical: "/account", languages: languageAlternates("/account", "/es/cuenta") },
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ booked?: string }> }) {
  return <AccountDashboard lang="en" justBooked={(await searchParams).booked === "1"} />;
}
