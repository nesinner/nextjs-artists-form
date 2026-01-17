import { ApplicationsDashboard } from "@/components/admin/applications-dashboard";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      `
      *,
      profiles (email, display_name),
      artist_participants (*)
    `
    )
    .order("created_at", { ascending: false });

  return <ApplicationsDashboard submissions={submissions ?? []} />;
}
