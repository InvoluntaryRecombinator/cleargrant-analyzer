import { redirect } from "next/navigation";

import { IntakeDesk } from "@/components/IntakeDesk";
import { getProfileForUser, requireUser } from "@/lib/auth";

export default async function UploadPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Upload Grants</p>
          <h1 className="page-title">Create a grant dossier</h1>
          <p className="page-description">
            Name a new opportunity, stage multiple files or pasted source text,
            and run one grouped analysis against your saved applicant profile.
          </p>
        </div>
      </section>

      <IntakeDesk />
    </div>
  );
}
