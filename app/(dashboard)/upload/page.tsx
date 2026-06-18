import { redirect } from "next/navigation";

import { UploadDropzone } from "@/components/UploadDropzone";
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
          <h1 className="page-title">Analyze grant documents</h1>
          <p className="page-description">
            Upload PDF, DOCX, or TXT files. Each document is processed
            separately, compared against your applicant profile, and saved to
            the matrix for review.
          </p>
        </div>
      </section>

      <section className="form-panel">
        <UploadDropzone />
      </section>
    </div>
  );
}
