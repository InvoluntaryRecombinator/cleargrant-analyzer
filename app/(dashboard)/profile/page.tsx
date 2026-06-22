import { ProfileForm, type ProfileFormValues } from "@/components/ProfileForm";
import { getProfileForUser, requireUser } from "@/lib/auth";

function toProfileFormValues(profile: NonNullable<Awaited<ReturnType<typeof getProfileForUser>>>): ProfileFormValues {
  return {
    applicantType: profile.applicantType,
    organizationName: profile.organizationName,
    legalStatus: profile.legalStatus,
    taxStatus: profile.taxStatus,
    country: profile.country,
    state: profile.state,
    city: profile.city,
    missionStatement: profile.missionStatement,
    focusAreas: profile.focusAreas,
    populationsServed: profile.populationsServed,
    projectTypes: profile.projectTypes,
    hasFiscalSponsor: profile.hasFiscalSponsor,
    hasEin: profile.hasEin,
    hasSamRegistration: profile.hasSamRegistration,
    hasUei: profile.hasUei,
    canProvideMatchFunds: profile.canProvideMatchFunds,
    minimumUsefulAward: profile.minimumUsefulAward,
  };
}

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);
  const formProfile = profile ? toProfileFormValues(profile) : null;

  return (
    <div className="profile-page">
      <section className="profile-page-heading">
        <div>
          <p className="eyebrow">Applicant profile</p>
          <h1 className="profile-heading-title">
            {profile ? "Update applicant profile" : "Complete applicant profile"}
          </h1>
          <p className="profile-heading-description">
            ClearGrant uses this profile to check each grant opportunity
            against the applicant.
          </p>
        </div>
      </section>

      <ProfileForm mode={profile ? "edit" : "onboarding"} profile={formProfile} />
    </div>
  );
}
