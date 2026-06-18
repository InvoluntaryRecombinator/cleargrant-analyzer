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
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Manage Profile</p>
          <h1 className="page-title">
            {profile ? "Edit applicant profile" : "Complete applicant profile"}
          </h1>
          <p className="page-description">
            Keep applicant attributes current so deterministic matching can
            compare requirements against reliable profile data.
          </p>
        </div>
      </section>

      <section className="form-panel">
        <ProfileForm mode={profile ? "edit" : "onboarding"} profile={formProfile} />
      </section>
    </div>
  );
}
