import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Vision model used to draft alt text + SEO descriptions. Routed through the
// Vercel AI Gateway via a plain "provider/model" string (needs
// AI_GATEWAY_API_KEY). Haiku is cheap, fast, and more than capable.
const MODEL = process.env.ALT_TEXT_MODEL || "anthropic/claude-haiku-4-5";

// `url` may be relative ("/api/img/slug") or absolute — it is resolved against
// this request's origin and the bytes are fetched HERE, so the model never has
// to reach the URL itself (which fails for localhost during development).
const Body = z.object({
  url: z.string().min(1),
  kind: z.enum(["alt", "caption", "hook", "tags"]).optional().default("alt"),
});

const ALT_PROMPT =
  "Write ONE concise, natural alt-text sentence (max ~125 characters) describing " +
  "this quinceañera photograph for accessibility and SEO. Name the subject, the " +
  "gown color, the setting, and the mood. Plain text only — no quotes, no line " +
  'breaks, and do not begin with "image of" or "photo of".';

const CAPTION_PROMPT =
  "Write a vivid 1–2 sentence caption (max ~320 characters) for this quinceañera " +
  "photograph, for a luxury photography portfolio and image SEO. Describe the subject, " +
  "her gown, the venue or setting, and the emotion in natural editorial language a " +
  "Dallas–Fort Worth quinceañera photographer would use. Weave in a relevant detail " +
  "(la misa, el vals, the court, the reception) when visible. Plain text only — no " +
  'quotes, no line breaks, and do not begin with "image of" or "photo of".';

const HOOK_PROMPT =
  "Write ONE short, evocative hook (max ~70 characters) for this quinceañera " +
  "photograph — a single punchy line like a magazine plate caption (e.g. " +
  '"The moment before she walked in" or "Her father\'s first turn"). Emotional and ' +
  "specific to what is shown. Plain text only — no quotes, no period needed, no " +
  '"image of".';

const TAGS_PROMPT =
  "List 5–8 short SEO keyword tags for this quinceañera photograph, comma-separated " +
  "on a single line. Mix what is visible (gown color, setting, moment like 'el vals' " +
  "or 'la misa') with quinceañera photography terms. Lowercase, no hashtags, no " +
  "quotes, no trailing period. Example: quinceañera portrait, blush gown, garden, golden hour, dallas";

const PROMPTS: Record<string, string> = {
  alt: ALT_PROMPT,
  caption: CAPTION_PROMPT,
  hook: HOOK_PROMPT,
  tags: TAGS_PROMPT,
};

const MAX_LEN: Record<string, number> = { alt: 300, caption: 600, hook: 200, tags: 400 };

async function fetchImageBytes(
  absUrl: string,
): Promise<{ bytes: Uint8Array; mediaType: string }> {
  const res = await fetch(absUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load image (${res.status})`);
  const mediaType = res.headers.get("content-type") || "image/webp";
  return { bytes: new Uint8Array(await res.arrayBuffer()), mediaType };
}

// Draft alt text or an SEO description for one image. The admin reviews/edits
// before it sticks — nothing is saved here; the client keeps the suggestion.
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

  const { url, kind } = parsed.data;
  const prompt = PROMPTS[kind] ?? ALT_PROMPT;
  const max = MAX_LEN[kind] ?? 300;

  try {
    const absUrl = new URL(url, request.url).toString();
    const { bytes, mediaType } = await fetchImageBytes(absUrl);
    const { text } = await generateText({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: bytes, mediaType },
          ],
        },
      ],
    });
    // Trim, collapse whitespace, strip wrapping quotes the model may add.
    const value = text.trim().replace(/\s+/g, " ").replace(/^["']|["']$/g, "").slice(0, max);
    if (!value) return NextResponse.json({ error: "Empty result" }, { status: 502 });
    return NextResponse.json({ [kind]: value });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to describe image";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
