import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const ANSWER_ENGINE_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "DuckAssistBot",
  "Meta-ExternalFetcher",
  "MistralAI-User",
] as const;

export const MODEL_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot",
  "Google-Extended",
  "Applebot-Extended",
] as const;

const PRIVATE_SURFACES = [
  "/admin/",
  "/api/",
  "/reserve/success",
  "/thank-you",
  "/unsubscribed",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/img/ is the branded image route — it MUST stay crawlable for
        // Google Images (longest-match allow beats the /api/ disallow).
        allow: ["/", "/api/img/"],
        disallow: PRIVATE_SURFACES,
      },
      {
        userAgent: [...ANSWER_ENGINE_AGENTS],
        allow: ["/", "/llms.txt", "/api/img/"],
        disallow: PRIVATE_SURFACES,
      },
      {
        userAgent: [...MODEL_TRAINING_BOTS],
        disallow: "/",
      },
    ],
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/image-sitemap.xml`],
    host: site.url,
  };
}
