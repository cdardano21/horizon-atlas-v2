import { getSupabaseConfigurationPresence, getSupabaseServiceRoleKey } from "./supabase";

const reasons = new Set([
  "DESTINATION_NOT_FOUND", "DB_READ_FAILED", "UNSUPPORTED_LEGACY_STATE",
  "INCOMPLETE_PERSISTED_STATE", "MALFORMED_PERSISTED_STATE", "MISSING_SERVER_CREDENTIAL", "HTTP_ERROR", "MALFORMED_RESPONSE", "AMBIGUOUS_IDENTITY",
  "NONPUBLIC", "UNAVAILABLE", "REQUEST_FAILED", "JSON_ERROR", "EMPTY_ROWS", "ROWS",
  "authoritative-supabase-unconfigured", "authoritative-catalog-unavailable",
  "authoritative-bundle-identity-mismatch", "authoritative-persisted-bundle-unavailable",
  "authoritative-load-exception", "MISSING_V31_MODULES",
]);

/** Server route diagnostic only: never include identities, rows, errors or credentials. */
export function logDestinationNotFound(
  gate: "PUBLICATION" | "CATALOG" | "PERSISTED_BUNDLE" | "RENDERER",
  reason?: string,
  httpStatus?: number,
): void {
  // Observability must never replace the existing notFound behavior if logging fails.
  try {
    const config = getSupabaseConfigurationPresence();
    const environment = process.env.VERCEL_ENV;
    const region = process.env.VERCEL_REGION;
    console.warn("[destination-404]", JSON.stringify({
      gate,
      reason: reason && reasons.has(reason) ? reason : "UNCLASSIFIED",
      httpStatus: Number.isInteger(httpStatus) && httpStatus! >= 100 && httpStatus! <= 599 ? httpStatus : null,
      environment: ["production", "preview", "development"].includes(environment ?? "") ? environment : "unknown",
      region: region && /^[a-z]{3}[0-9]$/.test(region) ? region : "unknown",
      projectReference: config.projectReference,
      publicKeySha256: config.publicKeySha256,
      serverCredentialPresent: Boolean(getSupabaseServiceRoleKey()),
    }));
  } catch {
    // Keep the original access decision even if diagnostic output is unavailable.
  }
}
