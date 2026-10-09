import { getSupabaseConfig, getSupabaseAuthHeaders, isSupabaseConfigured } from "./supabase";

type PublishedCatalogIdentity = { id: string; destination_key: string; slug: string; status: string };

export async function loadPublishedCatalogIdentities(keys: readonly string[]): Promise<PublishedCatalogIdentity[]> {
  if (!keys.length || !isSupabaseConfigured()) return [];
  const { url } = getSupabaseConfig();
  const query = new URLSearchParams({
    select: "id,destination_key,slug,status",
    destination_key: `in.(${keys.join(",")})`,
    status: "eq.published",
  });
  // Publication is checked afresh; a previously published result cannot bypass a later unpublish.
  try {
    const response = await fetch(`${url}/rest/v1/destinations_catalog?${query}`, {
      headers: getSupabaseAuthHeaders(), cache: "no-store",
    });
    if (!response.ok) return [];
    const rows: PublishedCatalogIdentity[] = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch {
    // Unavailable publication evidence excludes new identities without breaking legacy candidates.
    return [];
  }
}
