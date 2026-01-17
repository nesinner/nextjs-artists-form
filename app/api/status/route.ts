import { NextResponse } from "next/server";

import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data: submission, error } = await adminClient
    .from("submissions")
    .select(
      `
      id,
      user_id,
      track_name,
      artists_display,
      status,
      admin_note,
      public_token,
      created_at,
      updated_at,
      releases (
        id,
        status,
        release_note,
        created_at,
        updated_at
      )
    `
    )
    .eq("public_token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profile = await getSessionProfile();
  if (profile && !profile.is_admin && submission.user_id !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const release = Array.isArray(submission.releases)
    ? submission.releases[0] ?? null
    : submission.releases ?? null;

  return NextResponse.json({
    data: {
      ...submission,
      releases: release,
    },
  });
}
