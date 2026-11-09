import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";
import { safeNext } from "@/lib/clerk-config";
import { languageAlternates } from "@/lib/hreflang";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your TX Quince account to comment on the Journal.",
  alternates: { canonical: "/login", languages: languageAlternates("/login", "/es/entrar") },
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPage lang="en" mode="sign-in" next={next ? safeNext(next, "") || null : null} />;
}
