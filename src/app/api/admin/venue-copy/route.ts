import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getVenue } from "@/content/venues";

export const dynamic = "force-dynamic";

// Text model for venue marketing copy (no image). Routed via the AI gateway.
const MODEL = process.env.VENUE_COPY_MODEL || "anthropic/claude-haiku-4-5";

const Body = z.object({ slug: z.string().min(1) });

const CopySchema = z.object({
  about: z
    .string()
    .describe(
      "A warm, specific 2–4 sentence intro for a quinceañera photography landing page about this venue. Mention the venue, the city, and what makes it lovely to photograph a quinceañera there. Editorial, not salesy. Do NOT invent facts like capacity, price, or address.",
    ),
  faq: z
    .array(
      z.object({
        q: z.string().describe("A question a parent planning a quinceañera at this venue would search/ask."),
        a: z.string().describe("A concise, helpful 1–3 sentence answer in a confident, warm photographer's voice. Truthful and general — no invented specifics."),
      }),
    )
    .min(4)
    .max(6),
});

/** Draft an about-paragraph + FAQ for a venue landing page. Admin edits before
 *  saving — nothing is persisted here. */
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();

  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: "AI is not configured. Set AI_GATEWAY_API_KEY." },
      { status: 503 },
    );
  }

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const venue = getVenue(parsed.data.slug);
  if (!venue) return NextResponse.json({ error: "Unknown venue" }, { status: 400 });

  const prompt =
    `You write SEO landing-page copy for TX Quince, a Dallas–Fort Worth quinceañera ` +
    `photography & film studio. Write copy for the venue page targeting searches like ` +
    `"${venue.venue} quinceañera photographer" and "quinceañera at ${venue.venue}".\n\n` +
    `Venue: ${venue.venue} (${venue.venueFull})\n` +
    `City: ${venue.city}, TX\n` +
    `Typical coverage there: ${venue.section}\n\n` +
    `Naturally use the venue name and the city. Keep it truthful and general — do NOT ` +
    `invent capacity, pricing, square footage, or addresses. Voice: warm, confident, ` +
    `no fluff. The goal is to help a family planning a quinceañera at this venue and ` +
    `gently lead them to book TX Quince.`;

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: CopySchema,
      prompt,
    });
    return NextResponse.json(object);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate copy";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
