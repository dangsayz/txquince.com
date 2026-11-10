/**
 * site-banner.ts — SERVER-ONLY storage for the banner's sale line.
 * One small JSON file beside the price book (same bucket, same local fallback).
 */
import "server-only";
import { cache } from "react";
import { getPricingBucket } from "@/lib/pricing";
import { todayInDallas } from "@/lib/plan";
import { bannerFromStored, type BannerSale, type SiteBanner } from "@/lib/site-banner-shared";

const KEY = "config/banner.json";

/** The stored sale line as the owner wrote it (also when it has ended), or null. */
export async function readBannerSale(): Promise<BannerSale | null> {
  try {
    const { bucket } = await getPricingBucket();
    const obj = await bucket?.get(KEY);
    if (!obj) return null;
    const raw = JSON.parse(await obj.text()) as Partial<BannerSale> | null;
    if (!raw || typeof raw.en !== "string" || typeof raw.es !== "string") return null;
    return { en: raw.en, es: raw.es, ends: typeof raw.ends === "string" ? raw.ends : "" };
  } catch {
    return null;
  }
}

/** What the public banner shows today. Never throws: with no storage there is simply no sale. */
export const getSiteBanner = cache(async (): Promise<SiteBanner> => bannerFromStored(await readBannerSale(), todayInDallas()));

export async function saveBannerSale(sale: BannerSale | null): Promise<void> {
  const { bucket } = await getPricingBucket();
  if (!bucket) throw new Error("Storage not available");
  await bucket.put(KEY, JSON.stringify(sale ?? {}), { httpMetadata: { contentType: "application/json" } });
}
