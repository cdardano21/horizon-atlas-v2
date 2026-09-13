// Server route boundary only. Never return privileged catalog data to a client.
import { getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "./supabase";

export type PublicDestinationEligibility = "PUBLISHED" | "NONPUBLIC" | "UNKNOWN" | "UNAVAILABLE";

/** Anonymous RLS hides drafts, so an empty anonymous result cannot establish an unknown slug. */
export async function getPublicDestinationEligibility(slug: string): Promise<PublicDestinationEligibility> {
  if (!isSupabaseConfigured()) return "UNKNOWN"; // Preserve offline/non-catalog fallback behavior.
  const key = getSupabaseServiceRoleKey();
  if (!key) return "UNAVAILABLE";
  const identity = slug.trim().toLowerCase();
  const { url } = getSupabaseConfig();
  try {
    // Resolve exact slug first, then exact destination_key, just like the canonical loader.
    for (const column of ["slug", "destination_key"]) {
      const query = new URLSearchParams({ select: "status", [column]: `eq.${identity}`, limit: "2" });
      const response = await fetch(`${url}/rest/v1/destinations_catalog?${query}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store",
      });
      if (!response.ok) return "UNAVAILABLE";
      const rows: unknown = await response.json();
      if (!Array.isArray(rows) || rows.length > 1) return "UNAVAILABLE";
      if (rows.length === 1) return rows[0]?.status === "published" ? "PUBLISHED" : "NONPUBLIC";
    }
    return "UNKNOWN";
  } catch {
    return "UNAVAILABLE"; // Never generate a public page when publication cannot be established.
  }
}
