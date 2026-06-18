import Link from "next/link";

import { logout } from "@/app/actions/auth";
import { DashboardNav } from "@/components/DashboardNav";

type DashboardShellProps = {
  children: React.ReactNode;
  email: string;
};

export function DashboardShell({ children, email }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-app text-slate-950">
      <header className="app-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6">
          <Link className="brand-lockup" href="/dashboard">
            <span className="brand-mark">
              CG
            </span>
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
              <button className="secondary-button header-action" type="submit">
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
