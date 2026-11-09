import type { Metadata } from "next";
import { ClerkShell, clerkOn } from "@/components/auth/ClerkShell";
import { LoginView } from "@/components/auth/LoginView";
import { safeNext } from "@/lib/clerk-config";
import { languageAlternates } from "@/lib/hreflang";
import "@/components/txq/pages/pages.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log in or create an account",
  description: "One account for TX Quince and Quince Network. Log in to comment on the Journal.",
  alternates: { canonical: "/login", languages: languageAlternates("/login", "/es/entrar") },
  robots: { index: false, follow: true },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const back = next ? safeNext(next, "") || null : null;
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" aria-labelledby="login-title">
        <p className="tq-pg-mast__index tq-mono">[Account / TX Quince × Quince Network]</p>
        <div className="tq-pg-mast__body">
          <h1 id="login-title" className="tq-display tq-pg-mast__title">
            Log in <em>— or create a free account.</em>
          </h1>
          <p className="tq-pg-mast__dek">Join the conversation on the Journal: ask a question or share what worked for your quince.</p>
          <ClerkShell>
            <LoginView lang="en" enabled={clerkOn()} next={back} />
          </ClerkShell>
        </div>
      </header>
    </div>
  );
}
