import Link from "next/link";
import { redirect } from "next/navigation";
import { MoreHorizontal, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { getProfileForUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildGrantMatrixRow } from "@/utils/buildGrantMatrixRow";

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
      uploadedDocuments: {
        where: {
          isActive: true,
        },
        orderBy: {
          sourceOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rows = grants.map(buildGrantMatrixRow);
  const likelyFitCount = rows.filter((row) => row.fitLabel === "Likely fit").length;
  const reviewCount = grants.filter(
    (grant) => grant.matchResult?.matchLabel === "Needs Review",
  ).length;
  const failedCount = grants.filter(
    (grant) => grant.processingStatus === "failed",
  ).length;

  return (
    <div className="space-y-6">
      <section className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 border-t-4 border-t-emerald-500 bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Compare</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Grant comparison table
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Compare analyzed grant opportunities against your applicant profile.
            Fit ratings are first-pass review signals, not official eligibility
            decisions.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-teal-700 bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          href="/upload"
        >
          Add opportunity
        </Link>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase text-emerald-900">Likely fit</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{likelyFitCount}</p>
          <p className="mt-1 text-xs leading-5 text-emerald-900/80">
            Strong first-pass fit
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase text-amber-900">Review needed</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{reviewCount}</p>
          <p className="mt-1 text-xs leading-5 text-amber-900/80">
            Needs a closer human read
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase text-red-900">Unreadable sources</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">{failedCount}</p>
          <p className="mt-1 text-xs leading-5 text-red-900/80">
            Source documents to replace
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-emerald-500 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Reviews</p>
            <h2 className="text-base font-semibold text-slate-950">
              Grant opportunities
            </h2>
          </div>
          <p className="text-sm text-slate-500">{rows.length} reviews</p>
        </div>
        <div className="max-h-[72vh] overflow-auto">
          <table
            className="w-full border-separate border-spacing-0 text-left text-sm"
            style={{ minWidth: "1040px", tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "320px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "330px" }} />
              <col style={{ width: "170px" }} />
              <col style={{ width: "96px" }} />
            </colgroup>
            <thead>
              <tr className="bg-amber-50/30">
                <th className="sticky top-0 z-10 border-b border-r border-gray-200 bg-amber-50/80 px-4 py-3 text-xs font-bold uppercase leading-4 tracking-normal text-slate-500">
                  Opportunity
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-amber-50/80 px-4 py-3 text-xs font-bold uppercase leading-4 tracking-normal text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Fit
                    <span
                      className="text-gray-400"
                      title="A first-pass signal based on extracted requirements and your applicant profile. Not an official eligibility decision."
                    >
                      ?
                    </span>
                  </span>
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-amber-50/80 px-4 py-3 text-xs font-bold uppercase leading-4 tracking-normal text-slate-500">
                  Key Issue
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-amber-50/80 px-4 py-3 text-xs font-bold uppercase leading-4 tracking-normal text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    Details
                    <span
                      className="text-gray-400"
                      title="Shows deadline, award amount, and source readability."
                    >
                      ?
                    </span>
                  </span>
                </th>
                <th className="sticky top-0 z-10 border-b border-gray-200 bg-amber-50/80 px-4 py-3 text-right text-xs font-bold uppercase leading-4 tracking-normal text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={5}>
                    Add a grant opportunity to populate the comparison table.
                  </td>
                </tr>
              ) : null}

              {rows.map((row) => (
                <tr
                  className="odd:bg-white even:bg-slate-50/40 hover:bg-emerald-50/30"
                  key={row.id}
                >
                  <td className="border-b border-r border-gray-200 px-4 py-4 align-top">
                    <div className="min-w-0">
                      <Link
                        className="block truncate font-semibold text-slate-950 underline-offset-4 hover:text-teal-800 hover:underline"
                        href={`/grants/${row.id}`}
                      >
                        {row.opportunityName}
                      </Link>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {row.funderLabel}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {row.sourceSummary}
                      </p>
                    </div>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-4 align-top">
                    <div className="flex flex-col items-start gap-2">
                      <span
                        className={`inline-flex min-h-7 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-bold leading-4 ${fitBadgeClassName(
                          row.fitLabel,
                        )}`}
                        title={row.fitHelpText}
                      >
                        {row.fitLabel}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-4 align-top">
                    <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                      {row.keyIssue}
                    </p>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-4 align-top">
                    <div className="space-y-1.5 text-xs leading-5 text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-900">
                          Deadline:
                        </span>{" "}
                        {row.deadlineLabel}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Award:</span>{" "}
                        {row.awardLabel}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">
                          Sources:
                        </span>{" "}
                        {row.sourceHealthLabel}
                      </p>
                    </div>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-4 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        className="inline-flex min-h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                        href={`/grants/${row.id}`}
                      >
                        Open
                      </Link>
                      <details className="relative">
                        <summary
                          className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border border-gray-300 bg-white text-slate-600 transition hover:bg-slate-50"
                          aria-label={`More actions for ${row.opportunityName}`}
                        >
                          <MoreHorizontal aria-hidden size={16} />
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                            type="button"
                          >
                            <Pencil aria-hidden size={14} />
                            Rename
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                            type="button"
                          >
                            <RefreshCw aria-hidden size={14} />
                            Re-run analysis
                          </button>
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-700 hover:bg-rose-50"
                            type="button"
                          >
                            <Trash2 aria-hidden size={14} />
                            Delete
                          </button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
