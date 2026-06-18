import Link from "next/link";
import { FileUp, Table2, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const grants = await prisma.grant.findMany({
    where: {
      userId: user.id,
    },
    include: {
      matchResult: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const analyzedCount = grants.filter(
    (grant) => grant.processingStatus === "analyzed",
  ).length;
  const failedCount = grants.filter(
    (grant) => grant.processingStatus === "failed",
  ).length;
  const needsReviewCount = grants.filter(
    (grant) => grant.matchResult?.matchLabel === "Needs Review",
  ).length;
  const recentGrants = grants.slice(0, 4);
  const workflowItems = [
    {
      label: "Upload",
      description: "Add PDF, DOCX, or TXT grant documents in small batches.",
      href: "/upload",
      action: "Start analysis",
      icon: FileUp,
    },
    {
      label: "Compare",
      description: "Scan match labels, deadlines, awards, and extracted requirements.",
      href: "/matrix",
      action: "Open matrix",
      icon: Table2,
    },
    {
      label: "Refine",
      description: "Keep profile details current so comparisons stay useful.",
      href: "/profile",
      action: "Edit profile",
      icon: UserRound,
    },
  ];
  const location =
    [profile.city, profile.state].filter(Boolean).join(", ") ||
    profile.country ||
    "Not set";

  return (
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Workspace home</p>
          <h1 className="page-title">Ready to triage grants</h1>
          <p className="page-description">
            Upload grant documents, review extracted requirements, and use the
            matrix to decide which opportunities deserve a closer read.
          </p>
        </div>
        <div className="button-row">
          <Link className="secondary-button" href="/profile">
            Manage profile
          </Link>
          <Link className="primary-button" href="/upload">
            Upload grants
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Applicant type</p>
          <p className="metric-value">{profile.applicantType}</p>
          <p className="metric-note">{location}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Documents analyzed</p>
          <p className="metric-value">{analyzedCount}</p>
          <p className="metric-note">{grants.length} total uploaded</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Needs review</p>
          <p className="metric-value">{needsReviewCount}</p>
          <p className="metric-note">Ambiguous items to inspect</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Extraction issues</p>
          <p className="metric-value">{failedCount}</p>
          <p className="metric-note">Unreadable or unsupported files</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2 className="section-heading">Triage path</h2>
          </div>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          {workflowItems.map((item) => {
            const Icon = item.icon;

            return (
            <Link
              className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-lg border border-stone-200 bg-[#fffdf8] p-4 transition hover:border-teal-200 hover:bg-teal-50/40"
              href={item.href}
              key={item.label}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-800 ring-1 ring-teal-100">
                <Icon aria-hidden size={18} strokeWidth={2} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-950">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  {item.description}
                </span>
                <span className="mt-4 inline-flex text-sm font-semibold text-teal-800">
                  {item.action}
                </span>
              </span>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 py-3">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2 className="section-heading">Latest documents</h2>
          </div>
          <Link className="secondary-button !min-h-9 !px-3" href="/matrix">
            View matrix
          </Link>
        </div>
        {recentGrants.length > 0 ? (
          <div className="divide-y divide-stone-200">
            {recentGrants.map((grant) => (
              <div className="activity-row" key={grant.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {grant.title ?? grant.sourceFileName ?? "Untitled grant"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {grant.processingStatus === "failed"
                      ? "Extraction Failed"
                      : grant.matchResult?.matchLabel ??
                        (grant.processingStatus === "processing"
                          ? "Processing"
                          : "Uploaded")}
                  </p>
                </div>
                <Link
                  className="secondary-button !min-h-9 !px-3"
                  href={`/grants/${grant.id}`}
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="text-sm font-semibold text-slate-950">
              No grant documents yet
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Upload the first document to begin building your triage matrix.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
