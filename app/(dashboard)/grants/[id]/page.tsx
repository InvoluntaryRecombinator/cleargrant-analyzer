import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { matchStatusClassName } from "@/utils/presentation";
import type { ExtractedGrant, ExtractedRequirementCategory } from "@/utils/matchGrantToProfile";

const categoryTitles: Record<ExtractedRequirementCategory, string> = {
  applicant_type: "Applicant Eligibility",
  legal_status: "Legal Status",
  tax_status: "Tax Status",
  location: "Location Eligibility",
  registration: "Required Registrations",
  funding_constraint: "Funding Constraints",
  required_document: "Required Documents",
  ongoing_requirement: "Ongoing Requirements",
  other_hard_requirement: "Other Hard Requirements",
  other_eligibility_note: "Other Eligibility Notes",
};

function asExtractedGrant(value: unknown): ExtractedGrant | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExtractedGrant>;
  return Array.isArray(candidate.requirements) ? (candidate as ExtractedGrant) : null;
}

function groupedRequirements(extractedGrant: ExtractedGrant | null) {
  const groups = new Map<ExtractedRequirementCategory, ExtractedGrant["requirements"]>();

  extractedGrant?.requirements.forEach((requirement) => {
    const current = groups.get(requirement.category) ?? [];
    current.push(requirement);
    groups.set(requirement.category, current);
  });

  return Array.from(groups.entries());
}

function jsonString(value: unknown) {
  return JSON.stringify(value, null, 2);
}

const extractionFailedText = "Extraction Failed: Document unreadable or unsupported.";

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const { id } = await params;
  const grant = await prisma.grant.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      extractionResult: true,
      matchResult: true,
      uploadedDocuments: {
        where: {
          isActive: true,
        },
        orderBy: {
          sourceOrder: "asc",
        },
      },
    },
  });

  if (!grant) {
    notFound();
  }

  const extractedGrant = asExtractedGrant(grant.extractionResult?.extractedJson);
  const groups = groupedRequirements(extractedGrant);
  const extractionFailed = grant.processingStatus === "failed";
  const statusLabel = extractionFailed
    ? "Extraction Failed"
    : grant.matchResult?.matchLabel ??
      (grant.processingStatus === "processing" ? "Processing" : "Uploaded");

  return (
    <div className="space-y-8">
      <section className="page-header rounded-lg border border-slate-300 bg-slate-100 px-5 py-4 shadow-sm">
        <div>
          <p className="eyebrow">Grant Detail</p>
          <h1 className="page-title">
            {grant.title ?? grant.sourceFileName ?? "Untitled grant"}
          </h1>
        </div>
        <Link className="secondary-button" href="/matrix">
          Back to matrix
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Match label</p>
          <span
            className={`mt-3 inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-bold ${matchStatusClassName(
              statusLabel,
            )}`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Funder</p>
          <p className="metric-value">{grant.funder ?? "Not stated"}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="metric-label">Extraction</p>
          <p className="metric-value">
            {extractedGrant?.extractionConfidence ??
              grant.extractionResult?.status ??
              "Not available"}
          </p>
        </div>
      </section>

      {extractionFailed ? (
        <section className="alert-panel alert-error">
          <p className="text-sm font-semibold text-rose-950">
            Document could not be analyzed
          </p>
          <p className="mt-1 text-sm leading-6 text-rose-900">
            {extractionFailedText} Upload a clearer file or a text-based copy
            and try again.
          </p>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 bg-white px-4 py-3">
          <h2 className="section-heading">Match Result</h2>
        </div>
        <div className="px-4 py-3 text-sm leading-6 text-slate-600">
          <p>
            {extractionFailed
              ? extractionFailedText
              : grant.matchResult?.primaryReason ?? "No match result saved."}
          </p>
        </div>
      </section>

      {groups.map(([category, requirements]) => (
        <section
          className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
          key={category}
        >
          <div className="flex items-center justify-between border-b border-stone-200 bg-slate-50 px-4 py-3">
            <h2 className="section-heading">{categoryTitles[category]}</h2>
            <span className="font-mono text-xs font-semibold text-slate-500">
              {requirements.length}
            </span>
          </div>
          <div className="divide-y divide-stone-200">
            {requirements.map((requirement, index) => (
              <div
                className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                key={`${category}-${index}`}
              >
                <div>
                  <p className="text-sm font-semibold leading-6 text-slate-950">
                  {requirement.value}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(requirement.normalizedValues ?? []).map((value) => (
                      <span
                        className="rounded-md border border-stone-200 bg-[#fffdf8] px-2 py-1 font-mono text-xs text-slate-600"
                        key={value}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
                <blockquote className="rounded-md border-l-2 border-teal-300 bg-slate-50 px-3 py-2 font-mono text-xs leading-5 text-slate-700">
                  {requirement.sourceQuote}
                </blockquote>
              </div>
            ))}
          </div>
        </section>
      ))}

      {!extractionFailed ? (
        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 bg-white px-4 py-3">
            <h2 className="section-heading">Raw JSON</h2>
          </div>
          <pre className="overflow-x-auto bg-slate-950 px-4 py-3 font-mono text-xs leading-5 text-slate-100">
            {jsonString(grant.extractionResult?.extractedJson ?? {})}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
