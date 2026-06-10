import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/img/ is the branded image route — it MUST stay crawlable for
        // Google Images (longest-match allow beats the /api/ disallow).
        allow: ["/", "/api/img/"],
        disallow: ["/admin/", "/api/", "/reserve/success", "/thank-you", "/unsubscribed"],
      },
    ],
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/image-sitemap.xml`],
    host: site.url,
  };
}
