"use client";

import Link from "next/link";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <section className="content-panel p-6">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
          The workspace could not load this view.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Retry the view or return to the matrix. Uploaded documents and saved
          profile details remain in your workspace.
        </p>
        <div className="button-row mt-6">
          <button className="secondary-button" type="button" onClick={reset}>
            Retry
          </button>
          <Link className="primary-button" href="/matrix">
            Open matrix
          </Link>
        </div>
      </section>
    </div>
  );
}
