import "server-only";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { getRequiredEnv, getSupabaseServiceRoleKey } from "@/lib/env";

let cachedAdminClient: SupabaseClient | null = null;

export function createAdminClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    return null;
  }

  cachedAdminClient ??= createSupabaseClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return cachedAdminClient;
}
