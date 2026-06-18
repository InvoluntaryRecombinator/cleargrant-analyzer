import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentSupabaseUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentSupabaseUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="eyebrow">ClearGrant Analyzer</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-slate-950">
              Eligibility triage for grant documents.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Upload grant requirements, extract explicit eligibility rules, and
              compare them against a saved applicant profile before investing
              time in a full application.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link className="primary-button" href="/signup">
              Create workspace
            </Link>
            <Link className="secondary-button" href="/login">
              Log in
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6">
          <div className="border-b border-stone-200 pb-4">
            <p className="text-sm font-medium text-slate-950">
              First-pass review
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Built for fast disqualification checks, not application tracking.
            </p>
          </div>
          <div className="divide-y divide-stone-200">
            {[
              ["Profile", "Save applicant type, location, tax status, and capacity."],
              ["Extraction", "Store explicit requirements with source quotes."],
              ["Matrix", "Compare grants in a readable desktop-first table."],
            ].map(([label, description]) => (
              <div className="grid grid-cols-[7rem_1fr] gap-4 py-4" key={label}>
                <span className="text-sm font-medium text-slate-950">{label}</span>
                <span className="text-sm leading-6 text-slate-600">
                  {description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
