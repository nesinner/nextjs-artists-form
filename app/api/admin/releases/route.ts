import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const profile = await requireAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const submissionId = body?.submission_id as string | undefined;
  if (!submissionId) {
    return NextResponse.json({ error: "Missing submission_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("releases")
    .insert({
      submission_id: submissionId,
      status: "IN_PREP",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
