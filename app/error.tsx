"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="auth-page">
          <section className="auth-panel">
            <p className="eyebrow">ClearGrant Analyzer</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
              This page could not load.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Retry the page or return to your workspace.
            </p>
            <div className="button-row mt-6">
              <button className="secondary-button" type="button" onClick={reset}>
                Retry
              </button>
              <Link className="primary-button" href="/dashboard">
                Go to workspace
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
