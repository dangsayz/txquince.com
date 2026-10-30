import type { Metadata } from "next";
import { RootDocument, rootMetadata, rootViewport } from "./_shell/root";

/**
 * The site's single root layout: renders <html lang="en"> for every route,
 * /es included. The Spanish subtree (app/es/layout.tsx) is a nested layout that
 * scopes its language with a lang="es" wrapper and swaps in the Spanish metadata
 * defaults; both read app/_shell/root.tsx.
 */
export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata("en");
}

export const viewport = rootViewport;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument>{children}</RootDocument>;
}
