"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseAuthHeaders = exports.getSupabaseServiceRoleKey = exports.getSupabaseConfig = exports.hasSupabaseConfig = void 0;
exports.supabaseFetch = supabaseFetch;
exports.isSupabaseConfigured = isSupabaseConfigured;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const loadDotEnvFiles = () => {
    const searchDirs = [];
    let currentDir = process.cwd();
    while (true) {
        searchDirs.push(currentDir);
        const parentDir = node_path_1.default.dirname(currentDir);
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
            const filePath = node_path_1.default.join(dir, fileName);
            if (!node_fs_1.default.existsSync(filePath)) {
                continue;
            }
            const contents = node_fs_1.default.readFileSync(filePath, "utf8");
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
const readEnvValue = (...keys) => {
    for (const key of keys) {
        const value = process.env[key]?.trim();
        if (value) {
            return value;
        }
    }
    return "";
};
const SUPABASE_URL = readEnvValue("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY = readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = readEnvValue("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY");
const requiredMessage = "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or the legacy SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY variables) in your environment.";
exports.hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
const getSupabaseConfig = () => {
    if (!exports.hasSupabaseConfig) {
        throw new Error(requiredMessage);
    }
    return {
        url: SUPABASE_URL,
        anonKey: SUPABASE_PUBLISHABLE_KEY,
    };
};
exports.getSupabaseConfig = getSupabaseConfig;
const getSupabaseServiceRoleKey = () => SUPABASE_SERVICE_ROLE_KEY;
exports.getSupabaseServiceRoleKey = getSupabaseServiceRoleKey;
const getSupabaseAuthHeaders = (accessToken) => {
    const { anonKey } = (0, exports.getSupabaseConfig)();
    const serviceRoleKey = (0, exports.getSupabaseServiceRoleKey)();
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
exports.getSupabaseAuthHeaders = getSupabaseAuthHeaders;
async function supabaseFetch(path, options = {}) {
    const { url, anonKey } = (0, exports.getSupabaseConfig)();
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
function isSupabaseConfigured() {
    return exports.hasSupabaseConfig;
}
