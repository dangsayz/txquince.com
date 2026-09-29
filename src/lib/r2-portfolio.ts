/**
 * r2-portfolio.ts — SERVER-ONLY access to the PORTFOLIO R2 bucket.
 *
 * Replaces Supabase Storage after the self-host cutover. The bucket stays
 * PRIVATE: /api/img is the only public reader, admin routes are the only
 * writers. Keys keep the historical `portfolio/...` prefix so no DB
 * storage_path ever had to change.
 */
import "server-only";

/** Minimal structural types for the R2 binding (no generated env types). */
export interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  size: number;
}
export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ReadableStream | ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
}

/** PORTFOLIO binding — present on Workers, absent in plain `next dev`. */
export async function getPortfolioBucket(): Promise<R2Bucket | null> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const { env } = mod.getCloudflareContext();
    return (env as { PORTFOLIO?: R2Bucket }).PORTFOLIO ?? null;
  } catch {
    return null;
  }
}

/**
 * Extract the object key from an internal storage URL
 * ("…/storage/v1/object/[public/]portfolio/<key>"). Works for both legacy
 * Supabase URLs still stored in site_settings and freshly built ones.
 */
export function storageKeyFromUrl(url: string): string | null {
  const m = url.match(/\/storage\/v1\/object\/(?:public\/)?portfolio\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Best-effort object cleanup (a dangling object is better than a failed request). */
export async function deletePortfolioObjects(paths: string[]): Promise<void> {
  const bucket = await getPortfolioBucket();
  if (!bucket || !paths.length) return;
  try {
    await bucket.delete(paths);
  } catch {
    /* best-effort */
  }
}
