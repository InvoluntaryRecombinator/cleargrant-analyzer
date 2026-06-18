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
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Medium Match":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "Low Match":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Needs Review":
      return "border-amber-200 bg-amber-50 text-amber-800";
    default:
      return "border-stone-200 bg-stone-50 text-slate-600";
  }
}

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

      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-100 text-xs uppercase text-slate-500">
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
                  <th className="whitespace-nowrap px-4 py-3 font-medium" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grants.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={13}>
                    Upload and analyze grants to populate the matrix.
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

                return (
                  <tr
                    className="border-b border-stone-200 last:border-b-0 hover:bg-stone-50"
                    key={grant.id}
                  >
                    <td className="min-w-64 px-4 py-4 align-top">
                      <Link
                        className="font-medium text-slate-950 underline-offset-4 hover:underline"
                        href={`/grants/${grant.id}`}
                      >
                        {grant.title ?? grant.sourceFileName ?? "Untitled grant"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${matchLabelClass(
                          grant.matchResult?.matchLabel,
                        )}`}
                      >
                        {grant.matchResult?.matchLabel ?? grant.processingStatus}
                      </span>
                    </td>
                    <td className="min-w-80 px-4 py-4 align-top text-slate-600">
                      {grant.matchResult?.primaryReason ??
                        grant.extractionResult?.errorMessage ??
                        "Analysis is not complete."}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-600">
                      {grant.funder ?? "Not stated"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-600">
                      {formatDate(grant.deadline)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-600">
                      {extractedGrant?.metadata.awardText || "Not stated"}
                    </td>
                    <td className="min-w-56 px-4 py-4 align-top text-slate-600">
                      {firstRequirement(extractedGrant, ["applicant_type"])}
                    </td>
                    <td className="min-w-56 px-4 py-4 align-top text-slate-600">
                      {firstRequirement(extractedGrant, ["location"])}
                    </td>
                    <td className="min-w-56 px-4 py-4 align-top text-slate-600">
                      {firstRequirement(extractedGrant, [
                        "legal_status",
                        "tax_status",
                      ])}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-600">
                      {hardRequirementCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-600">
                      {countNeedsReview(grant.matchResult?.needsReviewItems)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-600">
                      {extractedGrant?.extractionConfidence ?? "Not available"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <Link className="secondary-button !min-h-9 !px-3" href={`/grants/${grant.id}`}>
                        View JSON
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
