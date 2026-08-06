import fs from "node:fs";
import path from "node:path";

const TRACE_LOG_PATH = process.env.HORIZON_ATLAS_TRACE_LOG ?? "/tmp/horizon-atlas-trace.log";

const writeTrace = (label: string, payload: unknown) => {
  try {
    const line = `[${new Date().toISOString()}] ${label} ${JSON.stringify(payload)}\n`;
    fs.appendFileSync(TRACE_LOG_PATH, line);
  } catch {
    // ignore trace-file failures
  }
};

const loadDotEnvFiles = () => {
  const searchDirs: string[] = [];
  let currentDir = process.cwd();

  while (true) {
    searchDirs.push(currentDir);
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  for (const dir of searchDirs) {
    for (const fileName of [
      ".env.local",
      ".env",
      ".env.development",
      ".env.development.local",
      ".env.production",
      ".env.production.local",
    ]) {
      const filePath = path.join(dir, fileName);
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const contents = fs.readFileSync(filePath, "utf8");
      for (const rawLine of contents.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
          continue;
        }

        const normalized = line.startsWith("export ") ? line.slice("export ".length) : line;
        const separatorIndex = normalized.indexOf("=");
        if (separatorIndex === -1) {
          continue;
        }

        const key = normalized.slice(0, separatorIndex).trim();
        let value = normalized.slice(separatorIndex + 1).trim();
        if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
          continue;
        }

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        process.env[key] = value;
      }
    }
  }
};

loadDotEnvFiles();

const readEnvValue = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
};

const SUPABASE_URL = readEnvValue("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY = readEnvValue(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
);
const SUPABASE_SERVICE_ROLE_KEY = readEnvValue("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");

const requiredMessage =
  "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or the legacy SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY variables) in your environment.";

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const getSupabaseConfig = () => {
  if (!hasSupabaseConfig) {
    throw new Error(requiredMessage);
  }

  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_PUBLISHABLE_KEY,
  };
};

export const getSupabaseServiceRoleKey = () => SUPABASE_SERVICE_ROLE_KEY;

export const getSupabaseAuthHeaders = (accessToken?: string | null) => {
  const { anonKey } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const effectiveKey = serviceRoleKey || anonKey;
  const effectiveAuthorization = accessToken
    ? `Bearer ${accessToken}`
    : serviceRoleKey
      ? `Bearer ${serviceRoleKey}`
      : `Bearer ${anonKey}`;

  return {
    apikey: effectiveKey,
    Authorization: effectiveAuthorization,
  };
};

type SupabaseRequestOptions = RequestInit & {
  accessToken?: string;
};

export async function supabaseFetch(path: string, options: SupabaseRequestOptions = {}) {
  const { url, anonKey } = getSupabaseConfig();
  const headers = new Headers(options.headers);
  const fullUrl = `${url}${path}`;

  headers.set("apikey", anonKey);
  headers.set("Authorization", `Bearer ${options.accessToken ?? anonKey}`);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  console.log("[supabase] fetch:start", { path, fullUrl, headers: Object.fromEntries(headers.entries()) });
  writeTrace("[supabase] fetch:start", { path, fullUrl, headers: Object.fromEntries(headers.entries()) });

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log("[supabase] fetch:response", { path, fullUrl, status: response.status, ok: response.ok });
    writeTrace("[supabase] fetch:response", { path, fullUrl, status: response.status, ok: response.ok });
    return response;
  } catch (error) {
    console.error("[supabase] fetch:error", { path, fullUrl, error });
    writeTrace("[supabase] fetch:error", { path, fullUrl, error });
    throw error;
  }
}

export function isSupabaseConfigured() {
  return hasSupabaseConfig;
}