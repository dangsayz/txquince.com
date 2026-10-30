import type { Metadata } from "next";
import { RootDocument, rootMetadata, rootViewport } from "../_shell/root";

/**
 * Root layout for every Spanish route (/es and /es/*): renders <html lang="es">
 * in the server HTML, so browsers, screen readers and crawlers see the page's
 * language on the document itself. The English subtree's root layout is
 * app/(en)/layout.tsx; both share app/_shell/root.tsx.
 */
export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata("es");
}

export const viewport = rootViewport;

export default function EsRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="es">{children}</RootDocument>;
}
