import { home } from "@/content/home";

/**
 * FAQPage structured data for the homepage "Good to know" section.
 *
 * Mirrors the visible Q&A (home.faq.items) one-to-one so Google can surface
 * the answers as expandable rich-result rows under the listing. Content-driven
 * — same source as what renders on the page — so the markup can never drift
 * from the visible text (a Google requirement for FAQ rich results).
 */
export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: home.faq.items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
