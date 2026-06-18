import Link from "next/link";

import { logout } from "@/app/actions/auth";

type DashboardShellProps = {
  children: React.ReactNode;
  email: string;
};

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
  },
  {
    href: "/upload",
    label: "Upload Grants",
  },
  {
    href: "/matrix",
    label: "Matrix Dashboard",
  },
  {
    href: "/profile",
    label: "Manage Profile",
  },
];

export function DashboardShell({ children, email }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <header className="border-b border-stone-200 bg-stone-50/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link className="flex items-center gap-3" href="/dashboard">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-stone-50">
              CG
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-normal text-slate-950">
                ClearGrant
              </span>
              <span className="block text-xs text-slate-500">Analyzer</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link className="nav-link" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-xs text-slate-500 lg:block">
              {email}
            </span>
            <form action={logout}>
              <button className="secondary-button" type="submit">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="border-b border-stone-200 bg-white md:hidden">
        <nav
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link className="nav-link shrink-0" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
