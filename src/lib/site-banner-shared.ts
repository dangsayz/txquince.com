/**
 * site-banner-shared.ts — the thin banner under the header (client + server, pure).
 *
 * It always says we accept payment plans. The owner can add one sale line in
 * Studio → Website → Banner; it rotates with the payment line and turns itself
 * off after its last day. No sale exists until the owner writes one.
 */
import { z } from "zod";

export type BannerSale = { en: string; es: string; ends: string };
export type SiteBanner = { sale: { en: string; es: string } | null };

const line = z
  .string()
  .trim()
  .max(90, "Keep it under 90 characters so it fits on a phone.")
  .refine((v) => !/[<>]/.test(v), "Plain words only.");

export const bannerSaleSchema = z.object({
  en: line.min(3, "Write the sale line in English."),
  es: line.min(3, "Write the sale line in Spanish."),
  /** Last day it shows (Dallas time), or "" for no end date. */
  ends: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a real date.")]),
});

/** What the public banner shows today from whatever is stored. Anything malformed or past its date is no sale. */
export function bannerFromStored(stored: unknown, today: string): SiteBanner {
  const parsed = bannerSaleSchema.safeParse(stored);
  if (!parsed.success) return { sale: null };
  const { en, es, ends } = parsed.data;
  if (ends && ends < today) return { sale: null };
  return { sale: { en, es } };
}

/** Pages with their own job to do: a form, a payment or a private link. No banner there. */
const QUIET = ["/account", "/booking", "/reserve", "/review", "/login", "/signup", "/logout", "/thank-you", "/unsubscribed", "/plan"];
export function bannerShowsOn(pathname: string): boolean {
  const p = pathname.replace(/^\/es(?=\/|$)/, "") || "/";
  return !QUIET.some((q) => p === q || p.startsWith(`${q}/`));
}
