import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { journeyDeps } from "@/lib/journey/deps";
import { legacyRedirect } from "@/lib/journey/family";

/**
 * /booking/{id}?t={payToken} — links from approval emails sent before the
 * private booking page existed. A valid, unexpired pay token gets a fresh
 * private link and a redirect to /my/booking/{token}. Anything else is a 404.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your Booking",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function LegacyBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  const url = await legacyRedirect(journeyDeps(), id, t).catch(() => null);
  if (!url) notFound();
  redirect(new URL(url).pathname);
}
