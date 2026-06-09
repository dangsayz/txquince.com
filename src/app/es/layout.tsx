/**
 * /es segment layout — declares every Spanish route as Spanish for assistive tech
 * and browsers.
 *
 * Next's App Router allows only one <html> element (the root layout, which is
 * lang="en"), and reading the pathname in the root layout would force `headers()`
 * and de-opt the whole site from static rendering. So instead we scope the Spanish
 * language to this subtree with a lang="es" wrapper: screen readers switch to a
 * Spanish voice for descendants, and combined with each page's hreflang alternates
 * the bilingual SEO signals stay correct. (A future full `/[lang]` route refactor
 * could move `lang` onto <html> itself.)
 */
export default function EsLayout({ children }: { children: React.ReactNode }) {
  return <div lang="es">{children}</div>;
}
