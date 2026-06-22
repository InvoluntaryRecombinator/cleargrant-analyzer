import { redirect } from "next/navigation";

import { getProfileForUser, requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfileForUser(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  redirect("/matrix");
}
