import { ClerkShell, clerkOn } from "@/components/auth/ClerkShell";
import { AdminLogin } from "@/components/auth/AdminLogin";

export const dynamic = "force-dynamic";

/**
 * Owner sign-in. Accounts are shared with Quince Network (Clerk); the studio
 * opens only for a verified email on the ADMIN_EMAILS allowlist, which every
 * admin page and API checks again on the server.
 */
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: asked } = await searchParams;
  // Only ever return to an /admin page on this site.
  const next = /^\/admin(?:[/?#]|$)/.test(asked ?? "") ? (asked as string) : "/admin";
  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 sm:p-9">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">TX Quince · Studio</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,3.4vw,2.5rem)] font-medium leading-tight tracking-[-0.03em] text-ink">Welcome back.</h1>
        <p className="mt-3 text-base leading-7 text-ink-soft">Log in with your Quince Network account to manage your studio.</p>
        <div className="mt-8">
          <ClerkShell>
            <AdminLogin enabled={clerkOn()} next={next} />
          </ClerkShell>
        </div>
      </div>
    </div>
  );
}
