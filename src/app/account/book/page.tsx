import type { Metadata } from "next";
import { AccountBookPage } from "@/components/account/AccountBookPage";
import { languageAlternates } from "@/lib/hreflang";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Book your date",
  alternates: { canonical: "/account/book", languages: languageAlternates("/account/book", "/es/cuenta/reservar") },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountBookPage lang="en" />;
}
