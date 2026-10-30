import type { Metadata } from "next";
import { RootDocument, rootMetadata, rootViewport } from "../_shell/root";

/**
 * Root layout for every English route (and /admin): renders <html lang="en">.
 * The Spanish subtree has its own root layout at app/es/layout.tsx; both share
 * app/_shell/root.tsx (fonts, providers, analytics, business JSON-LD).
 */
export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata("en");
}

export const viewport = rootViewport;

export default function EnRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
