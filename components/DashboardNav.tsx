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
      className={mobile ? "mobile-nav-scroll" : "hidden items-center gap-1 md:flex"}
      aria-label="Primary navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href === "/matrix" && pathname.startsWith("/grants/"));

        return (
          <Link
            className={`nav-link ${active ? "nav-link-active" : ""}`}
            href={item.href}
            key={item.href}
            aria-current={active ? "page" : undefined}
          >
            <Icon aria-hidden size={15} strokeWidth={1.9} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
