import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  matchStatusClassName,
  readableGrantStatus,
} from "@/utils/presentation";
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

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 py-3">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2 className="section-heading">Analyzed grants</h2>
          </div>
          <p className="text-sm text-slate-500">{grants.length} documents</p>
        </div>
        <div className="max-h-[72vh] overflow-auto">
          <table
            className="w-full border-separate border-spacing-0 text-left text-sm"
            style={{ minWidth: "2020px", tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "250px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "350px" }} />
              <col style={{ width: "190px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "110px" }} />
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
                  "Location / Legal",
                  "Hard Requirements",
                  "Needs Review",
                  "Extraction Confidence",
                  "Actions",
                ].map((heading) => (
                  <th
                    className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase leading-4 tracking-normal text-slate-500"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grants.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={12}>
                    Upload grant documents to populate the matrix.
                  </td>
                </tr>
              ) : null}

              {grants.map((grant) => {
                const extractedGrant = asExtractedGrant(
                  grant.extractionResult?.extractedJson,
                );
                const locationRequirement = firstRequirement(extractedGrant, [
                  "location",
                ]);
                const legalTaxRequirement = firstRequirement(extractedGrant, [
                  "legal_status",
                  "tax_status",
                ]);
                const hardRequirementCount =
                  extractedGrant?.requirements.filter(
                    (requirement) =>
                      requirement.category !== "other_eligibility_note",
                  ).length ?? 0;
                const statusLabel = readableGrantStatus(
                  grant.processingStatus,
                  grant.matchResult?.matchLabel,
                );
                const primaryReason =
                  grant.processingStatus === "failed"
                    ? extractionFailedText
                    : grant.matchResult?.primaryReason ??
                      "Analysis is not complete.";

                return (
                  <tr
                    className="odd:bg-white even:bg-slate-50/50 hover:bg-teal-50/40"
                    key={grant.id}
                  >
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top">
                      <Link
                        className="block truncate font-semibold text-slate-950 underline-offset-4 hover:text-teal-800 hover:underline"
                        href={`/grants/${grant.id}`}
                      >
                        {grant.title ?? grant.sourceFileName ?? "Untitled grant"}
                      </Link>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {grant.sourceFileName ?? "Uploaded document"}
                      </p>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top">
                      <span
                        className={`inline-flex min-h-7 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-bold leading-4 ${matchStatusClassName(
                          statusLabel,
                        )}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top">
                      <details className="group">
                        <summary className="cursor-pointer list-none">
                          <span className="block max-h-[4.25rem] overflow-hidden text-sm leading-5 text-slate-700">
                            {primaryReason}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-teal-700 group-open:hidden">
                            Expand
                          </span>
                        </summary>
                        <p className="mt-2 border-l-2 border-teal-200 pl-3 text-sm leading-5 text-slate-700">
                          {primaryReason}
                        </p>
                      </details>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top text-slate-700">
                      <div className="max-h-16 overflow-hidden leading-5">
                        {grant.funder ?? "Not stated"}
                      </div>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top font-mono text-xs leading-5 text-slate-700">
                      {formatDate(grant.deadline)}
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top font-mono text-xs leading-5 text-slate-700">
                      <div className="max-h-16 overflow-hidden">
                        {extractedGrant?.metadata.awardText || "Not stated"}
                      </div>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top text-slate-700">
                      <div className="max-h-16 overflow-hidden leading-5">
                        {firstRequirement(extractedGrant, ["applicant_type"])}
                      </div>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top text-slate-700">
                      <div className="max-h-20 overflow-hidden leading-5">
                        <span className="font-semibold text-slate-900">Location:</span>{" "}
                        {locationRequirement}
                        <br />
                        <span className="font-semibold text-slate-900">Legal:</span>{" "}
                        {legalTaxRequirement}
                      </div>
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top font-mono text-sm font-semibold text-slate-950">
                      {hardRequirementCount}
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top font-mono text-sm font-semibold text-slate-950">
                      {countNeedsReview(grant.matchResult?.needsReviewItems)}
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top text-xs font-semibold uppercase leading-5 text-slate-600">
                      {extractedGrant?.extractionConfidence ?? "Not available"}
                    </td>
                    <td className="border-b border-slate-200/60 px-3 py-3 align-top">
                      <Link
                        className="inline-flex min-h-8 items-center justify-center rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-slate-950 transition hover:bg-stone-50"
                        href={`/grants/${grant.id}`}
                      >
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
