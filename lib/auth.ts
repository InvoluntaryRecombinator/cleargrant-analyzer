import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const getCurrentSupabaseUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

export async function requireUser() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function ensureAppUser(user: SupabaseUser) {
  return prisma.user.upsert({
    where: {
      id: user.id,
    },
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@supabase.local`,
    },
    update: {
      email: user.email ?? `${user.id}@supabase.local`,
    },
  });
}

export async function getProfileForUser(userId: string) {
  return prisma.profile.findUnique({
    where: {
      userId,
    },
  });
}
