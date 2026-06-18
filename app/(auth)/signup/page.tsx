import Link from "next/link";
import { redirect } from "next/navigation";

import { signup } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentSupabaseUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getCurrentSupabaseUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="space-y-3">
          <p className="eyebrow">ClearGrant Analyzer</p>
          <h1 className="auth-heading">Create your workspace</h1>
          <p className="text-sm leading-6 text-slate-600">
            Set up a private triage workspace for grant document analysis.
          </p>
        </div>

        <AuthForm action={signup} buttonLabel="Create account" />

        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="text-slate-950 underline-offset-4 hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
