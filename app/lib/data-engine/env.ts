export function assertBaseEngineEnv(): void {
  const missing: string[] = [];

  if (!process.env.SUPABASE_URL) {
    missing.push("SUPABASE_URL");
  }

  if (!process.env.SUPABASE_PUBLISHABLE_KEY && !process.env.SUPABASE_ANON_KEY) {
    missing.push("SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY)");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required env vars for Data Engine: ${missing.join(", ")}`);
  }
}

export function assertSourceEnv(sourceKey: string, envKeys: string[] | undefined): void {
  if (!envKeys || envKeys.length === 0) {
    return;
  }

  const missing = envKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Source ${sourceKey} missing required env vars: ${missing.join(", ")}`);
  }
}
