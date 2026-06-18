import Link from "next/link";
import { redirect } from "next/navigation";

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
          <h1 className="page-title">Document upload comes next</h1>
          <p className="page-description">
            Phase 1 and 2 establish auth, profile storage, and protected
            navigation. The upload pipeline starts after the profile flow is
            complete.
          </p>
        </div>
        <Link className="secondary-button" href="/profile">
          Review profile
        </Link>
      </section>

      <section className="empty-panel">
        <p className="text-sm font-medium text-slate-950">
          Supported in the next phase
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          PDF, DOCX, and TXT upload will connect to server-side text extraction
          and requirement-array LLM extraction.
        </p>
      </section>
    </div>
  );
}
