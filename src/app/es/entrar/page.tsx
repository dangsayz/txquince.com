import type { Metadata } from "next";
import { ClerkShell, clerkOn } from "@/components/auth/ClerkShell";
import { LoginView } from "@/components/auth/LoginView";
import { safeNext } from "@/lib/clerk-config";
import { languageAlternates } from "@/lib/hreflang";
import "@/components/txq/pages/pages.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar o crear una cuenta",
  description: "Una sola cuenta para TX Quince y Quince Network. Entra para comentar en el Diario.",
  alternates: { canonical: "/es/entrar", languages: languageAlternates("/login", "/es/entrar") },
  robots: { index: false, follow: true },
};

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const back = next ? safeNext(next, "") || null : null;
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" aria-labelledby="login-title">
        <p className="tq-pg-mast__index tq-mono">[Cuenta / TX Quince × Quince Network]</p>
        <div className="tq-pg-mast__body">
          <h1 id="login-title" className="tq-display tq-pg-mast__title">
            Entrar <em>— o crea una cuenta gratis.</em>
          </h1>
          <p className="tq-pg-mast__dek">Únete a la conversación en el Diario: haz una pregunta o comparte lo que te funcionó en tu quince.</p>
          <ClerkShell>
            <LoginView lang="es" enabled={clerkOn()} next={back} />
          </ClerkShell>
        </div>
      </header>
    </div>
  );
}
