import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { journeyDeps } from "@/lib/journey/deps";
import { loadFamilyView } from "@/lib/journey/family";
import { FamilyBookingPage } from "./FamilyBookingPage";

/** Private, token-keyed: never indexed, never cached, never leaks the URL as a referrer. */
export const familyPageMetadata = (lang: "en" | "es"): Metadata => ({
  title: lang === "es" ? "Tu reservación" : "Your booking",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
});

/** Shared by /my/booking/[token] and /es/mi-reserva/[token]. A bad token is a plain 404. */
export async function renderFamilyPage(lang: "en" | "es", params: Promise<{ token: string }>, searchParams: Promise<{ paid?: string }>) {
  const [{ token }, { paid }] = await Promise.all([params, searchParams]);
  const view = await loadFamilyView(journeyDeps(), token).catch((err) => {
    console.error("[my/booking]", err);
    return null;
  });
  if (!view) notFound();
  return <FamilyBookingPage view={view} token={token} lang={lang} paidReturn={paid === "1"} />;
}
