import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";
import { adminReleaseStatusSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await requireAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const statusParse = adminReleaseStatusSchema.safeParse(body.status);
  if (!statusParse.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("releases")
    .update({
      status: statusParse.data,
      release_note: body.release_note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
