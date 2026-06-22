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
    <div className="space-y-5">
      <section className="rounded-lg border border-teal-100 bg-teal-50/60 px-5 py-4 shadow-sm">
        <div>
          <p className="eyebrow">Add opportunity</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Add a grant opportunity
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Name a grant opportunity, add source documents or source text, and
            run one analysis against your applicant profile.
          </p>
        </div>
      </section>

      <IntakeDesk />
    </div>
  );
}
