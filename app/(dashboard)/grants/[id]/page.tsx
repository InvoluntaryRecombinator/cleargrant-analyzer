import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  Clipboard,
  FileText,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
  ExtractedGrant,
  ExtractedRequirement,
  ExtractedRequirementCategory,
} from "@/utils/matchGrantToProfile";

const requirementSections: Array<{
  title: string;
  description: string;
  categories: ExtractedRequirementCategory[];
  emptyText: string;
}> = [
  {
    title: "Who can apply",
    description: "Applicant type, entity, and tax-status rules.",
    categories: ["applicant_type", "legal_status", "tax_status"],
    emptyText: "No applicant eligibility rule found in sources.",
  },
  {
    title: "Location rules",
    description: "Applicant location, project area, or geographic limits.",
    categories: ["location"],
    emptyText: "No location rule found in sources.",
  },
  {
    title: "Registrations",
    description: "Required IDs, registrations, or standing requirements.",
    categories: ["registration"],
    emptyText: "No registration rule found in sources.",
  },
  {
    title: "Funding and match rules",
    description: "Award constraints, match requirements, and funding limits.",
    categories: ["funding_constraint"],
    emptyText: "No funding constraint found in sources.",
  },
  {
    title: "Required documents",
    description: "Attachments or materials needed to apply.",
    categories: ["required_document"],
    emptyText: "No required document rule found in sources.",
  },
  {
    title: "Ongoing requirements",
    description: "Reporting, compliance, and post-award requirements.",
    categories: ["ongoing_requirement"],
    emptyText: "No ongoing requirement found in sources.",
  },
  {
    title: "Other eligibility notes",
    description: "Additional hard rules or notes that do not fit above.",
    categories: ["other_hard_requirement", "other_eligibility_note"],
    emptyText: "No additional eligibility notes found in sources.",
  },
];

function asExtractedGrant(value: unknown): ExtractedGrant | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<ExtractedGrant>;
  return Array.isArray(candidate.requirements) ? (candidate as ExtractedGrant) : null;
}

function jsonString(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function fitLabel(processingStatus: string, matchLabel: string | null | undefined) {
  if (processingStatus === "failed") {
    return "Analysis failed";
  }

  switch (matchLabel) {
    case "High Match":
      return "Likely fit";
    case "Needs Review":
      return "Review needed";
    case "Low Match":
      return "Likely conflict";
    case "Medium Match":
      return "Possible fit";
    default:
      return processingStatus === "processing" ? "Processing" : "Review needed";
  }
}

function fitBadgeClassName(label: string) {
  switch (label) {
    case "Likely fit":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "Review needed":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "Likely conflict":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Analysis failed":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-sky-200 bg-sky-50 text-sky-900";
  }
}

function requirementsForSection(
  extractedGrant: ExtractedGrant | null,
  categories: ExtractedRequirementCategory[],
) {
  return (
    extractedGrant?.requirements.filter((requirement) =>
      categories.includes(requirement.category),
    ) ?? []
  );
}

function notesWithConflict(extractedGrant: ExtractedGrant | null) {
  return (
    extractedGrant?.extractionNotes?.filter((note) =>
      /conflict|contradict|inconsistent|different/i.test(note),
    ) ?? []
  );
}

function sourceKindLabel(sourceKind: string) {
  return sourceKind === "pasted_text" ? "Source text" : "Uploaded file";
}

function sourceStatusLabel(status: string) {
  return status === "failed" ? "Unreadable" : "Readable";
}

function sourceStatusClassName(status: string) {
  return status === "failed"
    ? "border-red-200 bg-red-50 text-red-800"
    : "border-emerald-200 bg-emerald-50 text-emerald-900";
}

function primaryReason(processingStatus: string, reason: string | null | undefined) {
  if (processingStatus === "failed") {
    return "Sources could not be read. Add clearer documents or source text.";
  }

  if (!reason) {
    return "Open the requirement sections below for the extracted review details.";
  }

  return reason
    .replaceAll("deterministic", "clear")
    .replaceAll("match label", "fit rating");
}

function RequirementList({
  requirements,
  emptyText,
}: {
  requirements: ExtractedRequirement[];
  emptyText: string;
}) {
  if (requirements.length === 0) {
    return <p className="text-sm leading-6 text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="divide-y divide-gray-200">
      {requirements.map((requirement, index) => (
        <div className="grid gap-3 py-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" key={`${requirement.category}-${index}`}>
          <div>
            <p className="text-sm font-semibold leading-6 text-slate-950">
              {requirement.value}
            </p>
            {requirement.normalizedValues?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {requirement.normalizedValues.map((value) => (
                  <span
                    className="rounded-md border border-gray-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-600"
                    key={value}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="rounded-md border border-gray-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-bold uppercase text-slate-500">
              Source: {requirement.sourceName}
            </p>
            <blockquote className="mt-2 border-l-2 border-emerald-400 pl-3 font-mono text-xs leading-5 text-slate-700">
              {requirement.sourceQuote}
            </blockquote>
          </div>
        </div>
      ))}
    </div>
  );
}

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
      extractionRevisions: {
        orderBy: {
          revision: "desc",
        },
      },
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
  const fit = fitLabel(grant.processingStatus, grant.matchResult?.matchLabel);
  const conflictNotes = notesWithConflict(extractedGrant);
  const failedSources = grant.uploadedDocuments.filter(
    (document) => document.extractionStatus === "failed",
  );
  const title =
    grant.title ??
    extractedGrant?.metadata.grantTitle ??
    grant.sourceFileName ??
    "Grant opportunity";
  const funder =
    grant.funder ??
    extractedGrant?.metadata.funderName ??
    "No funder found in sources.";
  const lastAnalyzed =
    formatDate(grant.lastAnalyzedAt) ?? formatDate(grant.updatedAt);
  const awardText =
    extractedGrant?.metadata.awardText || "No award amount found in sources.";
  const deadlineText =
    extractedGrant?.metadata.deadline ||
    (grant.deadline ? formatDate(grant.deadline) : null) ||
    "No deadline found in sources.";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 border-t-4 border-t-emerald-500 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">
              Grant opportunity
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>{funder}</span>
              <span>Last analyzed: {lastAnalyzed ?? "Not analyzed yet"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold ${fitBadgeClassName(
                fit,
              )}`}
            >
              {fit}
            </span>
            <Link
              className="inline-flex min-h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              href="/matrix"
            >
              Back to Compare
            </Link>
            <details className="relative">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-gray-300 bg-white text-slate-600 transition hover:bg-slate-50">
                <MoreHorizontal aria-hidden size={17} />
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50" type="button">
                  <Pencil aria-hidden size={14} />
                  Rename
                </button>
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50" type="button">
                  <RefreshCw aria-hidden size={14} />
                  Re-run analysis
                </button>
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-700 hover:bg-rose-50" type="button">
                  <Trash2 aria-hidden size={14} />
                  Delete
                </button>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Deadline</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
            {deadlineText}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Award</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
            {awardText}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Source quality
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
            {grant.uploadedDocuments.length - failedSources.length} readable
            {failedSources.length > 0 ? `, ${failedSources.length} unreadable` : ""}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-emerald-500 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-stone-50 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">Fit summary</h2>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-semibold text-slate-950">Primary reason</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {primaryReason(grant.processingStatus, grant.matchResult?.primaryReason)}
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-md border border-rose-200 bg-rose-50/50 px-3 py-2">
              <p className="text-xs font-bold uppercase text-rose-900">
                Likely conflicts
              </p>
              <p className="mt-1 text-sm text-rose-900">
                {Array.isArray(grant.matchResult?.hardNoReasons)
                  ? `${grant.matchResult.hardNoReasons.length} found`
                  : "No likely conflicts found."}
              </p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2">
              <p className="text-xs font-bold uppercase text-amber-900">
                Needs a closer read
              </p>
              <p className="mt-1 text-sm text-amber-900">
                {Array.isArray(grant.matchResult?.needsReviewItems)
                  ? `${grant.matchResult.needsReviewItems.length} found`
                  : "No unclear rules found."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-stone-50 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">
            Source documents
          </h2>
        </div>
        {grant.uploadedDocuments.length === 0 ? (
          <p className="p-4 text-sm leading-6 text-slate-500">
            No source documents are attached to this opportunity.
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {grant.uploadedDocuments.map((document) => {
              const SourceIcon =
                document.sourceKind === "pasted_text" ? Clipboard : FileText;

              return (
                <div className="grid gap-3 px-4 py-3 md:grid-cols-[2rem_minmax(0,1fr)_auto]" key={document.id}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-slate-50 text-slate-500">
                    <SourceIcon aria-hidden size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {document.displayName ?? document.fileName}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{sourceKindLabel(document.sourceKind)}</span>
                      {document.sourceUrl ? (
                        <span className="truncate">URL: {document.sourceUrl}</span>
                      ) : null}
                      {document.extractionError ? (
                        <span>{document.extractionError}</span>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold ${sourceStatusClassName(
                      document.extractionStatus,
                    )}`}
                  >
                    {sourceStatusLabel(document.extractionStatus)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {failedSources.length > 0 ? (
        <section className="rounded-lg border border-red-200 bg-red-50/60 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-700" size={18} />
            <div>
              <p className="text-sm font-semibold text-red-950">
                Some sources could not be read
              </p>
              <p className="mt-1 text-sm leading-6 text-red-900">
                Replace unreadable files with clearer PDFs, DOCX files, or pasted
                source text before re-running analysis.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {requirementSections.map((section) => {
        const requirements = requirementsForSection(
          extractedGrant,
          section.categories,
        );

        return (
          <section
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            key={section.title}
          >
            <div className="border-b border-gray-200 bg-stone-50 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
            </div>
            <div className="px-4">
              <RequirementList
                emptyText={section.emptyText}
                requirements={requirements}
              />
            </div>
          </section>
        );
      })}

      {conflictNotes.length > 0 ? (
        <section className="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
          <div className="border-b border-amber-200 bg-amber-50/70 px-4 py-3">
            <h2 className="text-base font-semibold text-amber-950">
              Source conflicts
            </h2>
          </div>
          <div className="divide-y divide-amber-100">
            {conflictNotes.map((note) => (
              <p className="px-4 py-3 text-sm leading-6 text-amber-950" key={note}>
                {note}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <details className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <summary className="cursor-pointer border-b border-gray-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950">
          Developer details
        </summary>
        <div className="grid gap-4 p-4">
          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              Revision history
            </h3>
            <div className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200">
              {grant.extractionRevisions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">
                  No revision snapshots saved.
                </p>
              ) : (
                grant.extractionRevisions.map((revision) => (
                  <div className="px-3 py-2 text-sm text-slate-600" key={revision.id}>
                    <span className="font-semibold text-slate-950">
                      Revision {revision.revision}
                    </span>{" "}
                    · {revision.reason} · {formatDate(revision.createdAt)}
                  </div>
                ))
              )}
            </div>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-slate-950">Raw JSON</h3>
            <pre className="mt-2 max-h-96 overflow-auto rounded-md bg-slate-950 px-4 py-3 font-mono text-xs leading-5 text-slate-100">
              {jsonString(grant.extractionResult?.extractedJson ?? {})}
            </pre>
          </section>
        </div>
      </details>
    </div>
  );
}
