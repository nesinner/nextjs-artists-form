import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return null;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    display_name: profile?.display_name ?? null,
    is_admin: Boolean(profile?.is_admin),
  };
}

export async function requireUser() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/auth/sign-in");
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireUser();
  if (!profile.is_admin) {
    redirect("/submit");
  }
  return profile;
}
