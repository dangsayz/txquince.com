import type { Metadata } from "next";
import { RootDocument, rootMetadata, rootViewport } from "./_shell/root";
import { NotFoundScene } from "@/components/txq/NotFoundScene";

/**
 * The 404 for URLs that match no route at all, including unsupported city slugs
 * (src/middleware.ts rewrites those to an unmatched path).
 *
 * The site has two root layouts — app/(en)/layout.tsx and app/es/layout.tsx —
 * so there is no single layout to compose a global 404 from; Next's
 * `global-not-found` convention (experimental.globalNotFound) covers that case.
 * It renders the same shell and 404 scene as every other page. The scene picks
 * its copy (EN / ES) from the URL on the client.
 *
 * Next adds `<meta name="robots" content="noindex">` itself, so no robots or
 * canonical metadata is declared here (a second robots tag would conflict).
 */
export async function generateMetadata(): Promise<Metadata> {
  return { ...(await rootMetadata("en")), title: { absolute: "Page not found · TX Quince" } };
}

export const viewport = rootViewport;

export default function GlobalNotFound() {
  return (
    <RootDocument lang="en">
      <NotFoundScene />
    </RootDocument>
  );
}
