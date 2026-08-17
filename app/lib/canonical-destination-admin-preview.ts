// Server-only, admin-authenticated privileged read path for previewing a draft-status v3.1
// destination through the exact same CanonicalDestinationPage renderer used publicly. Never
// imported by any client component - the service-role key stays entirely on the server.
import { getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "./supabase";
import { createPersistedDestinationReadClient } from "./persistence/v31/persisted-destination-read-client";
import { createSupabasePersistedDestinationReadPort } from "./persistence/v31/supabase-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "./persistence/v31/load-normalized-persisted-destination-bundle";
import { buildCanonicalDestinationFromPersistedBundle, buildFallbackCanonicalDestination } from "./canonical-destination-loader";
import type { CanonicalDestination } from "./canonical-destination-model";
import type { CanonicalDestinationKey, DestinationId, ResolvedDestinationIdentity } from "./persistence/v31/types";

export type AdminPreviewResult =
  | { readonly ok: true; readonly destination: CanonicalDestination }
  | { readonly ok: false; readonly reason: string };

async function serviceRoleFetch(path: string, options?: RequestInit): Promise<Response> {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured - admin preview cannot bypass RLS.");
  }
  const headers = new Headers(options?.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  return fetch(`${url}${path}`, { ...options, headers, cache: "no-store" });
}

/**
 * Loads a destination for admin preview purposes ONLY: exact slug match, then exact destination_key
 * match - no fuzzy/substring resolution, matching the same safe identity policy as the public route.
 * Loads the real persisted v3.1 bundle directly - never the workbook.
 */
export async function loadCanonicalDestinationForAdminPreview(slug: string): Promise<AdminPreviewResult> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return { ok: false, reason: "EMPTY_SLUG" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, reason: "SUPABASE_NOT_CONFIGURED" };
  }
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    return { ok: false, reason: "SERVICE_ROLE_KEY_REQUIRED" };
  }

  const exactSlugResponse = await serviceRoleFetch(`/rest/v1/destinations_catalog?slug=eq.${encodeURIComponent(normalizedSlug)}&select=*`);
  let rows = exactSlugResponse.ok ? ((await exactSlugResponse.json()) as Array<Record<string, unknown>>) : [];
  let row = rows[0];

  if (!row) {
    const exactKeyResponse = await serviceRoleFetch(`/rest/v1/destinations_catalog?destination_key=eq.${encodeURIComponent(normalizedSlug)}&select=*`);
    rows = exactKeyResponse.ok ? ((await exactKeyResponse.json()) as Array<Record<string, unknown>>) : [];
    row = rows[0];
  }

  if (!row) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const destinationKey = typeof row.destination_key === "string" && row.destination_key.trim() ? row.destination_key.trim() : "";
  const destinationId = typeof row.id === "string" && row.id.trim() ? row.id.trim() : "";
  if (!destinationKey || !destinationId) {
    return { ok: false, reason: "MISSING_DESTINATION_KEY" };
  }

  const identity: ResolvedDestinationIdentity = {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
  const client = createPersistedDestinationReadClient({ fetcher: serviceRoleFetch });
  const port = createSupabasePersistedDestinationReadPort(client);
  const bundleResult = await loadNormalizedPersistedDestinationBundle(identity, port);

  if (bundleResult.outcome !== "SUCCESS") {
    return { ok: false, reason: `BUNDLE_LOAD_FAILED:${bundleResult.failure.reason}` };
  }

  const fallback = buildFallbackCanonicalDestination(normalizedSlug) ?? buildFallbackCanonicalDestination(destinationKey);
  if (!fallback) {
    return { ok: false, reason: "FALLBACK_BUILD_FAILED" };
  }

  const destination = buildCanonicalDestinationFromPersistedBundle(normalizedSlug, fallback, bundleResult.bundle, null);
  return { ok: true, destination };
}
