import { getSessionProfile } from "@/lib/auth";

export async function requireAdminProfile() {
  const profile = await getSessionProfile();
  if (!profile || !profile.is_admin) {
    return null;
  }
  return profile;
}
