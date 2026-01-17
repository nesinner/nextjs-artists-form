import { PlannedDashboard } from "@/components/admin/planned-dashboard";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPlannedPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: planned } = await supabase
    .from("planned_catalog")
    .select(
      `
      *,
      releases (
        status,
        submissions (track_name, artists_display, artist_email)
      )
    `
    )
    .order("created_at", { ascending: false });

  return <PlannedDashboard planned={planned ?? []} />;
}
