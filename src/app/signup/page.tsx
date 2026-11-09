import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";
import { safeNext } from "@/lib/clerk-config";
import { languageAlternates } from "@/lib/hreflang";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a free TX Quince account to comment on the Journal.",
  alternates: { canonical: "/signup", languages: languageAlternates("/signup", "/es/registro") },
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPage lang="en" mode="sign-up" next={next ? safeNext(next, "") || null : null} />;
}
