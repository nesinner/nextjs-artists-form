import { SubmitForm } from "@/components/submit-form";
import { requireUser } from "@/lib/auth";

export default async function SubmitPage() {
  const profile = await requireUser();

  return <SubmitForm profileEmail={profile.email} />;
}
