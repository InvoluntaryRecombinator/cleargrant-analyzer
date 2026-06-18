import { DashboardShell } from "@/components/DashboardShell";
import { ensureAppUser, requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  await ensureAppUser(user);

  return (
    <DashboardShell email={user.email ?? "Signed in"}>{children}</DashboardShell>
  );
}
