import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ data: null }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("data")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data?.data ?? null });
}

export async function POST(request: Request) {
  const body = await request.json();
  const token = body?.token as string | undefined;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("drafts").upsert(
    {
      token,
      user_id: user?.id ?? null,
      data: body.data ?? null,
    },
    { onConflict: "token" }
  );
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const supabase = await createClient();
  const { error } = await supabase.from("drafts").delete().eq("token", token);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
