export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function getSupabaseServiceRoleKey() {
  return (
    getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    getOptionalEnv("SUPABASE_SECRET_KEY") ??
    getOptionalEnv("SUPABASE_SERVICE_KEY")
  );
}
