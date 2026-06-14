import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getCollections, writeCollections } from "@/content/collections-db";
import type { Package } from "@/content/packages";

export const dynamic = "force-dynamic";

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Bust every surface that renders collections. */
function bust() {
  revalidatePath("/");
  revalidatePath("/investment");
  revalidatePath("/reserve");
  revalidatePath("/quinceanera-photographer/[city]", "page");
  revalidatePath("/es/fotografo-de-quinceaneras/[city]", "page");
}

const ItemSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "id must be lowercase letters, numbers or dashes"),
  name: z.string().trim().min(1, "Name is required").max(60),
  price: z.number().int().min(0).max(1_000_000),
  priceLabel: z.string().trim().max(40).optional(),
  hours: z.number().int().min(0).max(48),
  singleCraft: z.boolean().optional(),
  tagline: z.string().trim().max(400).optional(),
  teaser: z.string().trim().max(500).optional(),
  includes: z.array(z.string().trim().max(300)).max(20).optional(),
  highlight: z.boolean().optional(),
  badge: z.string().trim().max(40).optional().or(z.literal("")),
  depositCents: z.number().int().min(0).max(10_000_000),
  depositLabel: z.string().trim().max(40).optional(),
});

const BodySchema = z.object({
  items: z.array(ItemSchema).min(1, "Keep at least one collection").max(12),
});

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();
  return NextResponse.json({ collections: await getCollections() });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return unauthorizedAdminResponse();

  const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid collections" },
      { status: 400 },
    );
  }

  // Unique ids.
  const ids = new Set<string>();
  for (const it of parsed.data.items) {
    if (ids.has(it.id)) {
      return NextResponse.json(
        { error: `Duplicate collection id "${it.id}"` },
        { status: 400 },
      );
    }
    ids.add(it.id);
  }

  // Normalize → Package[]; only the first highlighted tier stays highlighted.
  let highlighted = false;
  const items: Package[] = parsed.data.items.map((it) => {
    const highlight = Boolean(it.highlight) && !highlighted;
    if (highlight) highlighted = true;
    return {
      id: it.id,
      name: it.name,
      price: it.price,
      priceLabel: it.priceLabel?.trim() || money(it.price),
      hours: it.hours,
      singleCraft: Boolean(it.singleCraft),
      tagline: it.tagline ?? "",
      role: "",
      highlight,
      badge: it.badge ? it.badge : undefined,
      includes: (it.includes ?? []).filter((s) => s.trim().length > 0),
      teaser: it.teaser ?? "",
      depositCents: it.depositCents,
      depositLabel: it.depositLabel?.trim() || money(it.depositCents / 100),
    };
  });

  try {
    await writeCollections(items);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save" },
      { status: 500 },
    );
  }

  bust();
  return NextResponse.json({ ok: true, collections: items });
}
