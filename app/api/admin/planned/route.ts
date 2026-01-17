import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const profile = await requireAdminProfile();
  if (!profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const releaseId = body?.release_id as string | undefined;
  if (!releaseId) {
    return NextResponse.json({ error: "Missing release_id" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planned_catalog")
    .insert({ release_id: releaseId })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
