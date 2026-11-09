import type { Metadata } from "next";
import { ClerkShell, clerkOn } from "@/components/auth/ClerkShell";
import { SignOutNow } from "@/components/auth/SignOutNow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logging out",
  robots: { index: false, follow: false },
};

/** Signs out of the shared account (TX Quince and Quince Network), then goes home. */
export default async function LogoutPage({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  return (
    <div className="tq-wrap" style={{ padding: "6rem 0" }}>
      <ClerkShell>
        <SignOutNow enabled={clerkOn()} to={to === "es" ? "/es" : "/"} />
      </ClerkShell>
    </div>
  );
}
