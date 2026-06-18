import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/ProfileForm";
import { getProfileForUser, requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1 className="page-title">Build your applicant profile</h1>
          <p className="page-description">
            This profile becomes the comparison baseline for extracted grant
            requirements when you analyze documents.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <ProfileForm mode="onboarding" profile={null} />
      </section>
    </div>
  );
}
