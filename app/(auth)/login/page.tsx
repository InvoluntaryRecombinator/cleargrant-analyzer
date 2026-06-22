import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { login } from "@/app/actions/auth";
import ClearGrantLogo from "@/assets/cleargrant.png";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentSupabaseUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentSupabaseUser();

  if (user) {
    redirect("/matrix");
  }

  return (
    <main className="auth-page" style={{ background: "#eef8f8" }}>
      <div className="flex w-full flex-col items-center">
        <Image
          alt="ClearGrant Logo"
          className="mx-auto mb-8 object-contain"
          height={200}
          priority
          src={ClearGrantLogo}
          width={600}
        />
        <section className="auth-panel">
          <div className="space-y-3">
            <h1 className="auth-heading text-center font-bold text-teal-700">
              Log in to ClearGrant
            </h1>
          </div>

          <AuthForm action={login} buttonLabel="Log in" pendingLabel="Signing in..." />

          <p className="text-sm text-slate-600">
            New to ClearGrant?{" "}
            <Link className="text-slate-950 underline-offset-4 hover:underline" href="/signup">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
