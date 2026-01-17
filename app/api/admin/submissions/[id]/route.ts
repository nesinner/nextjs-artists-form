import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";
import { adminSubmissionStatusSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const profile = await requireAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = params;
  const body = await request.json();
  const statusParse = adminSubmissionStatusSchema.safeParse(body.status);
  if (!statusParse.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({
      status: statusParse.data,
      admin_note: body.admin_note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
