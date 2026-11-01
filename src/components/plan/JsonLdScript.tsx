import { jsonLdString } from "@/lib/json-ld";

/** Structured data, escaped for a <script> element (see src/lib/json-ld.ts). */
export function JsonLdScript({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
