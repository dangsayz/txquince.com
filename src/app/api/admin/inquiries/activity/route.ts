import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminEmail } from "@/lib/require-admin";
import { unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const InquiryId = z.string().uuid();
const CreateSchema = z.discriminatedUnion("kind", [
  z.object({ inquiry_id: InquiryId, kind: z.literal("note"), note: z.string().trim().min(1).max(2000) }),
  z.object({ inquiry_id: InquiryId, kind: z.literal("contact"), note: z.string().trim().max(2000) }),
  z.object({ inquiry_id: InquiryId, kind: z.literal("reminder"), note: z.string().trim().max(2000), due_at: z.iso.datetime({ offset: true }) }),
]);
const CompleteSchema = z.object({ inquiry_id: InquiryId, id: InquiryId });

function refresh(inquiryId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function POST(request: Request) {
  const actor = await getAdminEmail();
  if (!actor) return unauthorizedAdminResponse();
  const parsed = CreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Check the activity details and try again." }, { status: 400 });

  const item = parsed.data;
  if (item.kind === "reminder") {
    const due = Date.parse(item.due_at);
    if (due < Date.now() - 300_000 || due > Date.now() + 2 * 365 * 86_400_000) {
      return NextResponse.json({ error: "Choose a follow-up date within the next two years." }, { status: 400 });
    }
  }

  const supabase = getServiceSupabase();
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select("id, status, unsubscribed_at")
    .eq("id", item.inquiry_id)
    .maybeSingle();
  if (inquiryError) return NextResponse.json({ error: "Could not load this inquiry." }, { status: 503 });
  if (!inquiry) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  if (item.kind === "reminder" && (inquiry.status !== "new" || inquiry.unsubscribed_at)) {
    return NextResponse.json({ error: "Follow-ups can only be scheduled for open inquiries." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("inquiry_activity")
    .insert({
      inquiry_id: item.inquiry_id,
      kind: item.kind,
      note: item.note,
      actor_email: actor,
      due_at: item.kind === "reminder" ? item.due_at : null,
    })
    .select("id, inquiry_id, kind, note, actor_email, due_at, completed_at, created_at")
    .single();
  if (error) return NextResponse.json({ error: "Could not save this activity. Please retry." }, { status: 503 });
  refresh(item.inquiry_id);
  return NextResponse.json({ activity: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await getAdminEmail())) return unauthorizedAdminResponse();
  const parsed = CompleteSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reminder." }, { status: 400 });
  const { id, inquiry_id } = parsed.data;
  const { data, error } = await getServiceSupabase()
    .from("inquiry_activity")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("inquiry_id", inquiry_id)
    .eq("kind", "reminder")
    .is("completed_at", null)
    .select("id, completed_at")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not complete the reminder. Please retry." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Open reminder not found." }, { status: 404 });
  refresh(inquiry_id);
  return NextResponse.json({ activity: data });
}
