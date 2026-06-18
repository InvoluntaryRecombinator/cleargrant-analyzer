import Link from "next/link";
import { redirect } from "next/navigation";

import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentSupabaseUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentSupabaseUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="space-y-3">
          <p className="eyebrow">ClearGrant Analyzer</p>
          <h1 className="auth-heading">Log in to your workspace</h1>
          <p className="text-sm leading-6 text-slate-600">
            Access your applicant profile and eligibility triage workspace.
          </p>
        </div>

        <AuthForm action={login} buttonLabel="Log in" />

        <p className="text-sm text-slate-600">
          New workspace?{" "}
          <Link className="text-slate-950 underline-offset-4 hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
