import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/ProfileForm";
import { getProfileForUser, requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (profile) {
    redirect("/matrix");
  }

  return (
    <div className="profile-page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1 className="page-title">Build your applicant profile</h1>
          <p className="page-description">
            This profile is used to compare grant opportunities against the
            applicant.
          </p>
        </div>
      </section>

      <ProfileForm mode="onboarding" profile={null} />
    </div>
  );
}
