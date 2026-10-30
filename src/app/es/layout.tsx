import type { Metadata } from "next";
import { rootMetadata } from "../_shell/root";

/**
 * /es segment layout — declares every Spanish route as Spanish for assistive tech
 * and browsers.
 *
 * Next's App Router allows only one <html> element (the root layout, which is
 * lang="en"), and reading the pathname in the root layout would force `headers()`
 * and de-opt the whole site from static rendering. A second root layout (via a
 * route group) was tried and dropped: the encoded group name in the client chunk
 * paths broke chunk loading on Workers, and Google ignores <html lang> anyway.
 * So instead we scope the Spanish language to this subtree with a lang="es"
 * wrapper: screen readers switch to a Spanish voice for descendants, and combined
 * with each page's hreflang alternates the bilingual SEO signals stay correct.
 *
 * The Spanish metadata defaults (title template, description, es_US OG locale)
 * replace the root layout's English ones for every /es page.
 */
export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata("es");
}

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return <div lang="es">{children}</div>;
}
