import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Workspace home</p>
          <h1 className="page-title">Grant triage workspace</h1>
          <p className="page-description">
            Your applicant profile is ready. The next build phase connects real
            document upload, extraction, and matching.
          </p>
        </div>
        <Link className="primary-button" href="/profile">
          Manage profile
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-panel">
          <p className="metric-label">Applicant type</p>
          <p className="metric-value">{profile.applicantType}</p>
        </div>
        <div className="metric-panel">
          <p className="metric-label">Location</p>
          <p className="metric-value">
            {[profile.city, profile.state].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="metric-panel">
          <p className="metric-label">Focus areas</p>
          <p className="metric-value">{profile.focusAreas.length}</p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="section-heading">Phase 1 and 2 status</h2>
        </div>
        <div className="divide-y divide-stone-200">
          {[
            ["Authentication", "Supabase email/password auth is connected."],
            ["Profile", "Structured onboarding data is saved with Prisma."],
            ["Navigation", "Protected app shell and core routes are in place."],
          ].map(([label, description]) => (
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[12rem_1fr]" key={label}>
              <p className="text-sm font-medium text-slate-950">{label}</p>
              <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
