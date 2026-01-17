import { ReleasesDashboard } from "@/components/admin/releases-dashboard";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReleasesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: releases } = await supabase
    .from("releases")
    .select(
      `
      *,
      submissions (track_name, artists_display, artist_email)
    `
    )
    .order("created_at", { ascending: false });

  return <ReleasesDashboard releases={releases ?? []} />;
}
