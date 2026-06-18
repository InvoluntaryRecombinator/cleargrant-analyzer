import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  ExtractedGrant,
  ExtractedRequirementCategory,
} from "@/utils/matchGrantToProfile";

function asExtractedGrant(value: unknown): ExtractedGrant | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExtractedGrant>;
  return Array.isArray(candidate.requirements) ? (candidate as ExtractedGrant) : null;
}

function firstRequirement(
  extractedGrant: ExtractedGrant | null,
  categories: ExtractedRequirementCategory[],
) {
  const requirement = extractedGrant?.requirements.find((item) =>
    categories.includes(item.category),
  );

  return requirement?.value ?? "Not stated";
}

function countNeedsReview(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not stated";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function matchLabelClass(label: string | null | undefined) {
  switch (label) {
    case "High Match":
      return "status-high";
    case "Medium Match":
      return "status-medium";
    case "Low Match":
      return "status-low";
    case "Needs Review":
      return "status-review";
    case "Extraction Failed":
      return "status-failed";
    default:
      return "status-neutral";
  }
}

const extractionFailedText = "Extraction Failed: Document unreadable or unsupported.";

export default async function MatrixPage() {
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
      extractionResult: true,
      matchResult: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const highCount = grants.filter(
    (grant) => grant.matchResult?.matchLabel === "High Match",
  ).length;
  const reviewCount = grants.filter(
    (grant) => grant.matchResult?.matchLabel === "Needs Review",
  ).length;
  const failedCount = grants.filter(
    (grant) => grant.processingStatus === "failed",
  ).length;

  return (
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Matrix Dashboard</p>
          <h1 className="page-title">Grant eligibility matrix</h1>
          <p className="page-description">
            Compare analyzed grants against your saved applicant profile. Match
            labels are deterministic triage signals, not official eligibility
            decisions.
          </p>
        </div>
        <Link className="primary-button" href="/upload">
          Upload grants
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-panel compact">
          <p className="metric-label">High match</p>
          <p className="metric-value">{highCount}</p>
          <p className="metric-note">Strong first-pass fit</p>
        </div>
        <div className="metric-panel compact">
          <p className="metric-label">Needs review</p>
          <p className="metric-value">{reviewCount}</p>
          <p className="metric-note">Ambiguous or incomplete evidence</p>
        </div>
        <div className="metric-panel compact">
          <p className="metric-label">Extraction failed</p>
          <p className="metric-value">{failedCount}</p>
          <p className="metric-note">Unreadable files to replace</p>
        </div>
      </section>

      <section className="matrix-card">
        <div className="matrix-toolbar">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2 className="section-heading">Analyzed grants</h2>
          </div>
          <p className="text-sm text-slate-500">{grants.length} documents</p>
        </div>
        <div className="matrix-scroll">
          <table className="matrix-table">
            <colgroup>
              <col className="w-[260px]" />
              <col className="w-[150px]" />
              <col className="w-[360px]" />
              <col className="w-[190px]" />
              <col className="w-[140px]" />
              <col className="w-[160px]" />
              <col className="w-[250px]" />
              <col className="w-[240px]" />
              <col className="w-[240px]" />
              <col className="w-[130px]" />
              <col className="w-[130px]" />
              <col className="w-[160px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead>
              <tr>
                {[
                  "Grant Name",
                  "Match Label",
                  "Primary Reason",
                  "Funder",
                  "Deadline",
                  "Award Amount",
                  "Applicant Requirement",
                  "Location Requirement",
                  "Legal/Tax Requirement",
                  "Hard Requirements",
                  "Needs Review",
                  "Extraction Confidence",
                  "Actions",
                ].map((heading) => (
                  <th key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grants.length === 0 ? (
                <tr>
                  <td className="matrix-empty" colSpan={13}>
                    Upload grant documents to populate the matrix.
                  </td>
                </tr>
              ) : null}

              {grants.map((grant) => {
                const extractedGrant = asExtractedGrant(
                  grant.extractionResult?.extractedJson,
                );
                const hardRequirementCount =
                  extractedGrant?.requirements.filter(
                    (requirement) =>
                      requirement.category !== "other_eligibility_note",
                  ).length ?? 0;
                const statusLabel =
                  grant.processingStatus === "failed"
                    ? "Extraction Failed"
                    : grant.matchResult?.matchLabel ??
                      (grant.processingStatus === "processing"
                        ? "Processing"
                        : "Uploaded");
                const primaryReason =
                  grant.processingStatus === "failed"
                    ? extractionFailedText
                    : grant.matchResult?.primaryReason ??
                      "Analysis is not complete.";

                return (
                  <tr key={grant.id}>
                    <td className="matrix-name-cell">
                      <Link
                        className="table-link"
                        href={`/grants/${grant.id}`}
                      >
                        {grant.title ?? grant.sourceFileName ?? "Untitled grant"}
                      </Link>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {grant.sourceFileName ?? "Uploaded document"}
                      </p>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${matchLabelClass(
                          statusLabel,
                        )}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <details className="expandable-text">
                        <summary>
                          <span>{primaryReason}</span>
                        </summary>
                        <p>{primaryReason}</p>
                      </details>
                    </td>
                    <td>
                      {grant.funder ?? "Not stated"}
                    </td>
                    <td>
                      {formatDate(grant.deadline)}
                    </td>
                    <td>
                      {extractedGrant?.metadata.awardText || "Not stated"}
                    </td>
                    <td>
                      {firstRequirement(extractedGrant, ["applicant_type"])}
                    </td>
                    <td>
                      {firstRequirement(extractedGrant, ["location"])}
                    </td>
                    <td>
                      {firstRequirement(extractedGrant, [
                        "legal_status",
                        "tax_status",
                      ])}
                    </td>
                    <td className="numeric-cell">
                      {hardRequirementCount}
                    </td>
                    <td className="numeric-cell">
                      {countNeedsReview(grant.matchResult?.needsReviewItems)}
                    </td>
                    <td>
                      {extractedGrant?.extractionConfidence ?? "Not available"}
                    </td>
                    <td>
                      <Link className="secondary-button !min-h-9 !px-3" href={`/grants/${grant.id}`}>
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
