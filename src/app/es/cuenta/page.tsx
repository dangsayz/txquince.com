import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { languageAlternates } from "@/lib/hreflang";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tu cuenta",
  alternates: { canonical: "/es/cuenta", languages: languageAlternates("/account", "/es/cuenta") },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountDashboard lang="es" />;
}
