import Link from "next/link";
import { redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";

export default async function MatrixPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-8">
      <section className="page-header">
        <div>
          <p className="eyebrow">Matrix Dashboard</p>
          <h1 className="page-title">No analyzed grants yet</h1>
          <p className="page-description">
            The matrix will display real extracted grant records after the
            upload and extraction pipeline is implemented.
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
                ].map((heading) => (
                  <th className="whitespace-nowrap px-4 py-3 font-medium" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={9}>
                  Upload and analyze grants to populate the matrix.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
