"use client";

import Link from "next/link";

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">ClearGrant Analyzer</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
          This page could not load.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Retry the page or return to your comparison table.
        </p>
        <div className="button-row mt-6">
          <button
            className="secondary-button"
            type="button"
            onClick={unstable_retry}
          >
            Retry
          </button>
          <Link className="primary-button" href="/matrix">
            Open comparison table
          </Link>
        </div>
      </section>
    </main>
  );
}
