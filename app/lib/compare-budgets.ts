import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";
import { loadPublishedCatalogIdentities } from "./published-catalog-identities";
import { supabaseFetch } from "./supabase";

const CATEGORY = "u3_r5_total_monthly_estimate";
const BATCH_SIZE = 50;
const ROW_LIMIT = 1000;
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const amount = (value: unknown) =>
  typeof value === "number" || (typeof value === "string" && value.trim() !== "") ? Number(value) : NaN;

/** Compare-only projection of persisted budgets. No workbook decoding or fallback estimates. */
export async function loadCompareBudgets(destinations: readonly { slug: string }[]): Promise<Record<string, string>> {
  const keys = [...new Set(EXPANSION_WORKBOOK_REGISTRY.flatMap(entry => [...entry.expectedDestinationKeys]))];
  const registered = new Set(keys);
  const slugs = new Set(destinations.map(destination => destination.slug));
  const result: Record<string, string> = {};
  try {
    const published = await loadPublishedCatalogIdentities(keys);
    const identities = published.filter(row => row && row.status === "published"
      && registered.has(row.destination_key) && slugs.has(row.slug)
      && /^[0-9a-f-]{36}$/i.test(row.id)
      && published.filter(other => other.id === row.id || other.slug === row.slug || other.destination_key === row.destination_key).length === 1);

    // Bounded bulk reads, not a full persisted bundle request for every card.
    for (let offset = 0; offset < identities.length; offset += BATCH_SIZE) {
      const batch = identities.slice(offset, offset + BATCH_SIZE);
      const query = new URLSearchParams({
        select: "destination_id,destination_key,category,monthly_low,monthly_high,currency,household_type,lifestyle_tier,stay_mode_key",
        destination_id: `in.(${batch.map(row => row.id).join(",")})`,
        category: `eq.${CATEGORY}`,
        household_type: "eq.couple",
        limit: String(ROW_LIMIT),
      });
      const response = await supabaseFetch(`/rest/v1/premium_cost_of_living?${query}`, { cache: "no-store" });
      if (!response.ok) return {};
      const payload: unknown = await response.json();
      // A possibly truncated response must not conceal duplicate household totals.
      if (!Array.isArray(payload) || payload.length >= ROW_LIMIT
        || payload.some(row => !row || typeof row !== "object" || Array.isArray(row))) return {};
      const rows: Record<string, unknown>[] = payload;
      for (const identity of batch) {
        const matches = rows.filter(row => row.destination_id === identity.id);
        if (matches.length !== 1) continue;
        const row = matches[0];
        if (row.destination_key !== identity.destination_key
          || text(row.category).toLowerCase() !== CATEGORY
          || text(row.household_type).toLowerCase() !== "couple"
          || text(row.lifestyle_tier).toLowerCase() !== "comfortable"
          || text(row.stay_mode_key).toUpperCase() !== "RELOCATE"
          || text(row.currency).toUpperCase() !== "USD") continue;
        const low = amount(row.monthly_low);
        const high = amount(row.monthly_high);
        if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low) continue;
        // Same en-US range formatting as the canonical Destination Guide; no conversion or midpoint.
        const format = new Intl.NumberFormat("en-US");
        result[identity.slug] = `$${format.format(low)}–$${format.format(high)} per month (USD)`;
      }
    }
    return result;
  } catch {
    return {}; // Missing evidence never restores the old tag-derived estimates.
  }
}
