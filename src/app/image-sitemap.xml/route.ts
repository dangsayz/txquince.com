/**
 * /image-sitemap.xml — Google image-sitemap covering every slugged photograph.
 * Regenerates automatically (revalidated hourly) as new images are uploaded.
 * Submit alongside /sitemap.xml in Search Console.
 */
import { site } from "@/content/site";
import { getPortfolioImages } from "@/lib/content-db";

export const revalidate = 3600;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const images = (await getPortfolioImages()).filter((i) => i.slug);

  const entries = images
    .map(
      (i) => `  <url>
    <loc>${site.url}/photos/${i.section}/${i.slug}</loc>
    <image:image>
      <image:loc>${site.url}/api/img/${i.slug}</image:loc>
      <image:title>${esc(i.title || i.alt)}</image:title>
      <image:caption>${esc(i.caption || i.alt)}</image:caption>
    </image:image>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
