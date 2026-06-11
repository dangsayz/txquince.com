import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Vision model used to draft alt text. Routed through the Vercel AI Gateway via
// a plain "provider/model" string (needs AI_GATEWAY_API_KEY). Haiku is cheap,
// fast, and more than capable of describing a single photograph.
const MODEL = process.env.ALT_TEXT_MODEL || "anthropic/claude-haiku-4-5";

const Body = z.object({ url: z.string().url() });

const PROMPT =
  "Write ONE concise, natural alt-text sentence (max ~125 characters) describing " +
  "this quinceañera photograph for accessibility and SEO. Name the subject, the " +
  "gown color, the setting, and the mood. Plain text only — no quotes, no line " +
  'breaks, and do not begin with "image of" or "photo of".';

// Draft alt text for one image. The admin reviews/edits before it sticks —
// nothing is saved here; the client decides whether to keep the suggestion.
export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();

  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: "Alt-text AI is not configured. Set AI_GATEWAY_API_KEY." },
      { status: 503 },
    );
  }

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image", image: new URL(parsed.data.url) },
          ],
        },
      ],
    });
    // Trim, collapse whitespace, strip wrapping quotes the model may add.
    const alt = text.trim().replace(/\s+/g, " ").replace(/^["']|["']$/g, "").slice(0, 300);
    if (!alt) return NextResponse.json({ error: "Empty result" }, { status: 502 });
    return NextResponse.json({ alt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to describe image";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
