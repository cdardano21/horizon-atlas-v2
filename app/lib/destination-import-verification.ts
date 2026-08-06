import { getSupabaseAuthHeaders, getSupabaseConfig, isSupabaseConfigured } from "./supabase";

type DestinationCatalogVerificationRow = {
  id?: string | null;
  slug?: string | null;
  city?: string | null;
  country?: string | null;
  status?: string | null;
  tier?: string | null;
  description?: string | null;
  overview?: string | null;
};

export type DestinationImportVerificationResult = {
  adminVisible: boolean;
  publicVisible: boolean;
  detailPageAvailable: boolean;
  requiredFieldsPresent: boolean;
  row?: DestinationCatalogVerificationRow;
};

type DestinationImportVerificationOptions = {
  accessToken?: string | null;
  destinationId?: string | null;
  slug?: string | null;
  expectedStatus?: string | null;
  expectedCity?: string | null;
  expectedCountry?: string | null;
  expectedTier?: string | null;
  expectedDescription?: string | null;
  expectedOverview?: string | null;
};

const normalizeValue = (value?: string | null) => value?.trim() ?? "";

const fetchCatalogRow = async ({ url, accessToken, slug, destinationId }: { url: string; accessToken?: string | null; slug?: string | null; destinationId?: string | null }) => {
  const headers = getSupabaseAuthHeaders(accessToken);

  if (slug) {
    const slugResponse = await fetch(`${url}/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
      headers,
      cache: "no-store",
    });

    if (slugResponse.ok) {
      const rows = (await slugResponse.json()) as DestinationCatalogVerificationRow[];
      const row = rows[0];
      if (row) {
        return row;
      }
    }
  }

  if (destinationId) {
    const idResponse = await fetch(`${url}/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&id=eq.${destinationId}&limit=1`, {
      headers,
      cache: "no-store",
    });

    if (idResponse.ok) {
      const rows = (await idResponse.json()) as DestinationCatalogVerificationRow[];
      return rows[0];
    }
  }

  return null;
};

export async function verifyDestinationImport(options: DestinationImportVerificationOptions): Promise<DestinationImportVerificationResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }

  const { url } = getSupabaseConfig();
  const slug = normalizeValue(options.slug);
  const destinationId = normalizeValue(options.destinationId);
  const row = await fetchCatalogRow({ url, accessToken: options.accessToken, slug, destinationId });

  const adminVisible = Boolean(row);
  const publicVisible = Boolean(row && normalizeValue(row.status).toLowerCase() === "published");
  const detailPageAvailable = Boolean(row && normalizeValue(row.slug) && normalizeValue(row.city) && normalizeValue(row.country));

  const requiredFieldChecks: string[] = [];
  if (!row?.slug) requiredFieldChecks.push("slug");
  if (!row?.city) requiredFieldChecks.push("city");
  if (!row?.country) requiredFieldChecks.push("country");
  if (!row?.status) requiredFieldChecks.push("status");
  if (!row?.tier) requiredFieldChecks.push("tier");

  if (options.expectedDescription !== undefined && options.expectedDescription !== null && normalizeValue(options.expectedDescription) !== "" && !normalizeValue(row?.description)) {
    requiredFieldChecks.push("description");
  }

  if (options.expectedOverview !== undefined && options.expectedOverview !== null && normalizeValue(options.expectedOverview) !== "" && !normalizeValue(row?.overview)) {
    requiredFieldChecks.push("overview");
  }

  if (options.expectedCity !== undefined && options.expectedCity !== null && normalizeValue(options.expectedCity) !== "" && !normalizeValue(row?.city)) {
    requiredFieldChecks.push("city");
  }

  if (options.expectedCountry !== undefined && options.expectedCountry !== null && normalizeValue(options.expectedCountry) !== "" && !normalizeValue(row?.country)) {
    requiredFieldChecks.push("country");
  }

  if (options.expectedTier !== undefined && options.expectedTier !== null && normalizeValue(options.expectedTier) !== "" && !normalizeValue(row?.tier)) {
    requiredFieldChecks.push("tier");
  }

  if (options.expectedStatus !== undefined && options.expectedStatus !== null && normalizeValue(options.expectedStatus) !== "" && normalizeValue(row?.status).toLowerCase() !== normalizeValue(options.expectedStatus).toLowerCase()) {
    requiredFieldChecks.push("status");
  }

  const requiredFieldsPresent = requiredFieldChecks.length === 0;

  if (!row) {
    throw new Error(`Verification failed: destination ${slug || destinationId || "unknown"} was not found in destinations_catalog.`);
  }

  if (options.expectedStatus && normalizeValue(options.expectedStatus).toLowerCase() === "published" && !publicVisible) {
    throw new Error(`Verification failed: destination ${slug || destinationId || "unknown"} is not published in destinations_catalog.`);
  }

  if (!detailPageAvailable) {
    throw new Error(`Verification failed: destination ${slug || destinationId || "unknown"} is missing detail-page fields.`);
  }

  if (!requiredFieldsPresent) {
    throw new Error(`Verification failed: destination ${slug || destinationId || "unknown"} is missing required fields: ${requiredFieldChecks.join(", ")}.`);
  }

  return {
    adminVisible,
    publicVisible,
    detailPageAvailable,
    requiredFieldsPresent,
    row,
  };
}
