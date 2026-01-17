import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const email = user.email.toLowerCase();
  const isAdmin = env.adminEmails.includes(email);

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.display_name ?? user.email.split("@")[0],
    is_admin: isAdmin,
  });

  return NextResponse.json({ ok: true, is_admin: isAdmin });
}
