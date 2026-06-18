"use client";

import { Home, Table2, UploadCloud, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
  },
  {
    href: "/upload",
    label: "Upload Grants",
    icon: UploadCloud,
  },
  {
    href: "/matrix",
    label: "Matrix",
    icon: Table2,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        mobile
          ? "mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2"
          : "hidden items-center gap-2 md:flex"
      }
      aria-label="Primary navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href === "/matrix" && pathname.startsWith("/grants/"));

        return (
          <Link
            className={`relative inline-flex min-h-10 shrink-0 items-center gap-2 px-2.5 text-sm font-semibold transition ${
              active
                ? "text-slate-950"
                : "text-slate-500 hover:text-slate-950"
            }`}
            href={item.href}
            key={item.href}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden size={15} strokeWidth={2} />
            <span>{item.label}</span>
            {active ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-teal-500" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
