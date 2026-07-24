const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

const requiredMessage =
  "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.";

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const getSupabaseConfig = () => {
  if (!hasSupabaseConfig) {
    throw new Error(requiredMessage);
  }

  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
};

type SupabaseRequestOptions = RequestInit & {
  accessToken?: string;
};

export async function supabaseFetch(path: string, options: SupabaseRequestOptions = {}) {
  const { url, anonKey } = getSupabaseConfig();
  const headers = new Headers(options.headers);

  headers.set("apikey", anonKey);
  headers.set("Authorization", `Bearer ${options.accessToken ?? anonKey}`);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${url}${path}`, {
    ...options,
    headers,
  });
}

export function isSupabaseConfigured() {
  return hasSupabaseConfig;
}