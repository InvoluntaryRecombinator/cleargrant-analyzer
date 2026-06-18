import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      uploadedDocument: true,
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
      <section className="page-header">
        <div>
          <p className="eyebrow">Grant Detail</p>
          <h1 className="page-title">
            {grant.title ?? grant.sourceFileName ?? "Untitled grant"}
          </h1>
          <p className="page-description">
            Extracted requirements are shown with source quotes. This is triage
            evidence, not an official eligibility determination.
          </p>
        </div>
        <Link className="secondary-button" href="/matrix">
          Back to matrix
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-panel">
          <p className="metric-label">Match label</p>
          <p className="metric-value">{statusLabel}</p>
        </div>
        <div className="metric-panel">
          <p className="metric-label">Funder</p>
          <p className="metric-value">{grant.funder ?? "Not stated"}</p>
        </div>
        <div className="metric-panel">
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

      <section className="content-panel">
        <div className="panel-header">
          <h2 className="section-heading">Match Result</h2>
        </div>
        <div className="space-y-3 px-5 py-4 text-sm leading-6 text-slate-600">
          <p>
            {extractionFailed
              ? extractionFailedText
              : grant.matchResult?.primaryReason ?? "No match result saved."}
          </p>
        </div>
      </section>

      {groups.map(([category, requirements]) => (
        <section className="content-panel" key={category}>
          <div className="panel-header">
            <h2 className="section-heading">{categoryTitles[category]}</h2>
          </div>
          <div className="divide-y divide-stone-200">
            {requirements.map((requirement, index) => (
              <div className="space-y-3 px-5 py-4" key={`${category}-${index}`}>
                <p className="text-sm font-medium text-slate-950">
                  {requirement.value}
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {requirement.sourceQuote}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(requirement.normalizedValues ?? []).map((value) => (
                    <span
                      className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-slate-600"
                      key={value}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {!extractionFailed ? (
        <section className="content-panel">
          <div className="panel-header">
            <h2 className="section-heading">Raw JSON</h2>
          </div>
          <pre className="overflow-x-auto px-5 py-4 text-xs leading-5 text-slate-700">
            {jsonString(grant.extractionResult?.extractedJson ?? {})}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
