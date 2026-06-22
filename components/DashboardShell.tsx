import Link from "next/link";
import Image from "next/image";

import { logout } from "@/app/actions/auth";
import GeminiLogo from "@/assets/gemini-svg.svg";
import { DashboardNav } from "@/components/DashboardNav";

type DashboardShellProps = {
  children: React.ReactNode;
  email: string;
};

export function DashboardShell({ children, email }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-[#BFA486] bg-[#D8C3A5] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6">
          <Link className="flex min-w-max items-center gap-3" href="/matrix">
            <Image src={GeminiLogo} alt="Logo" width={32} height={32} className="mr-2" />
            <span>
              <span className="block text-sm font-semibold tracking-normal text-slate-950">
                ClearGrant
              </span>
              <span className="block text-xs text-slate-500">Analyzer</span>
            </span>
          </Link>

          <DashboardNav />

          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-xs font-medium text-slate-500 lg:block">
              {email}
            </span>
            <form action={logout}>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-950 bg-teal-700 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mobile-nav-shell md:hidden">
        <DashboardNav mobile />
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
    </div>
  );
}
