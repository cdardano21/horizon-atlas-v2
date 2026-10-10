// Server route boundary only. Never return privileged catalog data to a client.
import { getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "./supabase";

export type PublicDestinationEligibility = "PUBLISHED" | "NONPUBLIC" | "UNKNOWN" | "UNAVAILABLE";

export interface PublicationDiagnostic { reason?: "MISSING_SERVER_CREDENTIAL" | "HTTP_ERROR" | "MALFORMED_RESPONSE" | "AMBIGUOUS_IDENTITY" | "NONPUBLIC" | "REQUEST_FAILED" | "JSON_ERROR"; httpStatus?: number; }

/** Anonymous RLS hides drafts, so an empty anonymous result cannot establish an unknown slug. */
export async function getPublicDestinationEligibility(slug: string, diagnostic?: PublicationDiagnostic): Promise<PublicDestinationEligibility> {
  if (!isSupabaseConfigured()) return "UNKNOWN"; // Preserve offline/non-catalog fallback behavior.
  const key = getSupabaseServiceRoleKey();
  if (!key) { if (diagnostic) diagnostic.reason = "MISSING_SERVER_CREDENTIAL"; return "UNAVAILABLE"; }
  const identity = slug.trim().toLowerCase();
  const { url } = getSupabaseConfig();
  try {
    // Resolve exact slug first, then exact destination_key, just like the canonical loader.
    for (const column of ["slug", "destination_key"]) {
      const query = new URLSearchParams({ select: "status", [column]: `eq.${identity}`, limit: "2" });
      if (diagnostic) { diagnostic.reason = "REQUEST_FAILED"; delete diagnostic.httpStatus; }
      const response = await fetch(`${url}/rest/v1/destinations_catalog?${query}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store",
      });
      if (diagnostic) diagnostic.httpStatus = response.status;
      if (!response.ok) { if (diagnostic) diagnostic.reason = "HTTP_ERROR"; return "UNAVAILABLE"; }
      if (diagnostic) diagnostic.reason = "JSON_ERROR";
      const rows: unknown = await response.json();
      if (!Array.isArray(rows) || rows.length > 1) {
        if (diagnostic) diagnostic.reason = Array.isArray(rows) ? "AMBIGUOUS_IDENTITY" : "MALFORMED_RESPONSE";
        return "UNAVAILABLE";
      }
      if (diagnostic) diagnostic.reason = rows.length === 1 && rows[0]?.status !== "published" ? "NONPUBLIC" : undefined;
      if (rows.length === 1) return rows[0]?.status === "published" ? "PUBLISHED" : "NONPUBLIC";
    }
    return "UNKNOWN";
  } catch {
    return "UNAVAILABLE"; // Never generate a public page when publication cannot be established.
  }
}
