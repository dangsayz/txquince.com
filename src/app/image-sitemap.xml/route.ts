/**
 * /image-sitemap.xml — Google image-sitemap covering every slugged photograph.
 * Regenerates automatically (revalidated hourly) as new images are uploaded.
 * Submit alongside /sitemap.xml in Search Console.
 *
 * Every image is listed under /portfolio, the indexable gallery that displays
 * all of them. The single-photo pages (/photos/[category]/[slug]) are
 * `noindex, follow` share targets, so they are not used as <loc> here: an
 * image sitemap's <loc> must be a page that can be indexed. Google allows up
 * to 1,000 <image:image> entries per <url>.
 */
import { site } from "@/content/site";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { getPortfolioImages } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { escapeHtml } from "@/lib/html-escape";

export const revalidate = 3600;

const esc = escapeHtml;
const MAX_IMAGES_PER_URL = 1000;

export async function GET() {
  const images = (await getPortfolioImages()).filter((i) => i.slug).slice(0, MAX_IMAGES_PER_URL);

  const entries = images
    .map((i) => {
      const copy = publicPhotoCopy(i, altPhraseFor(i.section));
      return `    <image:image>
      <image:loc>${site.url}/api/img/${i.slug}</image:loc>
      <image:title>${esc(copy.title)}</image:title>
      <image:caption>${esc(copy.description)}</image:caption>
    </image:image>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images.length ? `  <url>
    <loc>${site.url}/portfolio</loc>
${entries}
  </url>
` : ""}</urlset>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
