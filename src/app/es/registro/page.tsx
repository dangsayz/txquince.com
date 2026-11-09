import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";
import { safeNext } from "@/lib/clerk-config";
import { languageAlternates } from "@/lib/hreflang";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea una cuenta gratis de TX Quince para comentar en el Diario.",
  alternates: { canonical: "/es/registro", languages: languageAlternates("/signup", "/es/registro") },
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPage lang="es" mode="sign-up" next={next ? safeNext(next, "") || null : null} />;
}
