import { cookies } from "next/headers";
import { buildBatchImportPlan, buildDestinationUpdatePayload, buildImportSummary, buildImportedDestinationMetadata, normalizeSlug } from "./processor";
import { getSupabaseAuthHeaders, getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "../../../../lib/supabase";
import { shouldUseAdminLocalFallback } from "../../../../lib/admin-local-fallback";
import { buildEnrichedDestinationCreatePayload } from "../../../../lib/destination-enrichment";
import { verifyDestinationImport } from "../../../../lib/destination-import-verification";
import { buildPremiumV2WorkbookContractPreview, buildPremiumV2WorkbookImportPlan, buildWorkbookImportPlan, normalizeWorkbookImportMode, normalizeWorkbookPayloadToPremiumV2ImportInput } from "../../../../lib/workbook-import-engine";

const ADMIN_TABLE = "destinations_catalog";

function isValidUuid(value?: string | null) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const buildRouteEnrichedDestinationCreatePayload = ({
  city,
  country,
  slug,
  description,
  overview,
  row,
}: {
  city: string;
  country: string;
  slug?: string;
  description?: string;
  overview?: string;
  row?: Record<string, unknown>;
}) => {
  const normalizedSlug = normalizeSlug(slug || `${city}-${country}`);
  const basePayload = buildEnrichedDestinationCreatePayload({
    city,
    country,
    slug: normalizedSlug,
    description,
    overview,
  });

  if (!row) {
    return basePayload;
  }

  const importedMetadata = buildImportedDestinationMetadata(row);
  const editorialContent = importedMetadata.editorialContent ? { ...basePayload.metadata?.editorialContent, ...importedMetadata.editorialContent } : basePayload.metadata?.editorialContent;
  const researchProfile = importedMetadata.researchProfile ? { ...basePayload.metadata?.researchProfile, ...importedMetadata.researchProfile } : basePayload.metadata?.researchProfile;
  const resolvedDescription = importedMetadata.descriptionValue || description || basePayload.description || null;
  const resolvedOverview = importedMetadata.overviewValue || overview || basePayload.overview || null;

  return {
    ...basePayload,
    description: resolvedDescription,
    overview: resolvedOverview,
    metadata: {
      ...basePayload.metadata,
      ...(editorialContent ? { editorialContent } : {}),
      ...(researchProfile ? { researchProfile } : {}),
    },
  };
};

const normalizeImporterText = (value: unknown) => {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return String(value).trim();
};

const normalizeImporterBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const text = normalizeImporterText(value).toLowerCase();
  return ["true", "1", "yes", "y", "verified", "on"].includes(text);
};

type PostApplyEnrichmentTarget = {
  destinationId: string;
  slug: string;
  city: string;
  country: string;
  description: string | null;
  overview: string | null;
};

const createPostApplyEnrichmentTarget = ({
  destinationId,
  slug,
  city,
  country,
  description,
  overview,
}: {
  destinationId: string;
  slug: string;
  city: string;
  country: string;
  description?: string | null;
  overview?: string | null;
}): PostApplyEnrichmentTarget => ({
  destinationId,
  slug: normalizeImporterText(slug),
  city: normalizeImporterText(city),
  country: normalizeImporterText(country),
  description: description ?? null,
  overview: overview ?? null,
});

const fetchDestinationEnrichmentDataset = async ({
  accessToken,
  url,
  headers,
  destinationId,
}: {
  accessToken: string | null;
  url: string;
  headers: HeadersInit;
  destinationId: string;
}) => {
  const destinationResponse = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?select=id,slug,city,country,description,overview,status,tier,metadata&id=eq.${destinationId}&limit=1`, {
    headers: {
      ...(headers as Record<string, string>),
      Authorization: getSupabaseAuthHeaders(accessToken).Authorization ?? "",
    },
    cache: "no-store",
  });

  const [neighborhoodsResponse, placesResponse, resourcesResponse, mediaResponse] = await Promise.all([
    fetch(`${url}/rest/v1/neighborhoods?select=id,name,subtitle,value_1,url,source_url,source_organization,source_type,verification_status,confidence_level,last_verified_at,notes,destination_id&destination_id=eq.${destinationId}`, {
      headers: {
        ...(headers as Record<string, string>),
        Authorization: getSupabaseAuthHeaders(accessToken).Authorization ?? "",
      },
      cache: "no-store",
    }),
    fetch(`${url}/rest/v1/destination_places?select=id,name,neighborhood_name,category,address,google_maps_url,website_url,verified,source,source_url,last_verified_at,destination_id&destination_id=eq.${destinationId}`, {
      headers: {
        ...(headers as Record<string, string>),
        Authorization: getSupabaseAuthHeaders(accessToken).Authorization ?? "",
      },
      cache: "no-store",
    }),
    fetch(`${url}/rest/v1/destination_resource_links?select=id,label,category,provider,url,verified,official,source,source_url,destination_id&destination_id=eq.${destinationId}`, {
      headers: {
        ...(headers as Record<string, string>),
        Authorization: getSupabaseAuthHeaders(accessToken).Authorization ?? "",
      },
      cache: "no-store",
    }),
    fetch(`${url}/rest/v1/destination_media_assets?select=id,kind,provider,url,caption,alt_text,sort_order,is_primary,verified,source,source_url,destination_id&destination_id=eq.${destinationId}`, {
      headers: {
        ...(headers as Record<string, string>),
        Authorization: getSupabaseAuthHeaders(accessToken).Authorization ?? "",
      },
      cache: "no-store",
    }),
  ]);

  const destinationRows = destinationResponse.ok ? ((await destinationResponse.json()) as Array<Record<string, unknown>>) : [];
  const neighborhoods = neighborhoodsResponse.ok ? ((await neighborhoodsResponse.json()) as Array<Record<string, unknown>>) : [];
  const places = placesResponse.ok ? ((await placesResponse.json()) as Array<Record<string, unknown>>) : [];
  const resources = resourcesResponse.ok ? ((await resourcesResponse.json()) as Array<Record<string, unknown>>) : [];
  const media = mediaResponse.ok ? ((await mediaResponse.json()) as Array<Record<string, unknown>>) : [];

  return {
    destination: destinationRows[0] ?? null,
    neighborhoods,
    places,
    resources,
    media,
  };
};

async function getAuthedAdmin() {
  if (!isSupabaseConfigured()) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (serviceRoleKey) {
    return { accessToken: serviceRoleKey, user: { id: "service-role" }, adminRole: "admin" };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ha-access-token")?.value;
  if (!accessToken) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const { url, anonKey } = getSupabaseConfig();
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const user = (await userResponse.json()) as { id: string };
  const adminResponse = await fetch(
    `${url}/rest/v1/app_admins?select=role&user_id=eq.${user.id}&limit=1`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  const adminRows = adminResponse.ok ? ((await adminResponse.json()) as Array<{ role: string }>) : [];
  return { accessToken, user, adminRole: adminRows[0]?.role ?? null };
}

export async function GET() {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    const fallbackEnabled = shouldUseAdminLocalFallback(accessToken, user, adminRole);

    if (!accessToken || !user || !adminRole || fallbackEnabled) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const { url } = getSupabaseConfig();
    const headers = getSupabaseAuthHeaders(accessToken);
    const response = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?select=id,slug,city,country,description,overview,status,tier&order=city.asc`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to load existing destinations." }, { status: response.status });
    }

    const data = (await response.json()) as Array<{ id: string; slug: string; city: string; country: string; description?: string | null; overview?: string | null; status?: string | null; tier?: string | null }>;
    return Response.json({ destinations: data }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to prepare import." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    const fallbackEnabled = shouldUseAdminLocalFallback(accessToken, user, adminRole);

    if (!accessToken || !user || !adminRole || fallbackEnabled) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      rows?: Array<Record<string, unknown>>;
      mode?: string;
      matchField?: string;
      previewOnly?: boolean;
      dryRun?: boolean;
      fileName?: string;
      selectedColumns?: string[];
      allowBlankClears?: boolean;
      schema?: { sheetName?: string; headers?: string[] };
      workbookSheets?: string[];
      workbookRowsBySheet?: Record<string, Array<Record<string, unknown>>>;
      workbookHeadersBySheet?: Record<string, string[]>;
    };

    const rows = payload.rows ?? [];
    const mode = (payload.mode ?? "create_or_update") as "preview" | "create" | "update" | "create_or_update";
    const matchField = (payload.matchField ?? "slug") as "slug" | "city_country";
    const previewOnly = payload.previewOnly ?? payload.dryRun ?? false;
    const selectedColumns = Array.isArray(payload.selectedColumns) ? payload.selectedColumns : [];
    const allowBlankClears = Boolean(payload.allowBlankClears);

    const { url } = getSupabaseConfig();
    const headers = getSupabaseAuthHeaders(accessToken);
    const actorId = isValidUuid(user?.id) ? user.id : null;
    const existingResponse = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?select=id,slug,city,country,description,overview,status,tier&order=city.asc`, {
      headers,
      cache: "no-store",
    });

    if (!existingResponse.ok) {
      return Response.json({ error: "Unable to load existing destinations." }, { status: existingResponse.status });
    }

    const existingDestinations = (await existingResponse.json()) as Array<{ id: string; slug: string; city: string; country: string; description?: string | null; overview?: string | null; status?: string | null; tier?: string | null }>;
    const useWorkbookSchema = Boolean(payload.schema?.headers?.length);
    const hasMultiSheetWorkbookPayload = Array.isArray(payload.workbookSheets) && payload.workbookSheets.length > 0;

    let plan: Array<Record<string, unknown>> = [];
    let summary = buildImportSummary({ plan: [], totalRows: rows.length });
    let compatibilityNotes: Array<{ sheetName: string; unsupportedColumns: string[]; note: string }> = [];

    if (hasMultiSheetWorkbookPayload) {
      const normalizedWorkbookInput = normalizeWorkbookPayloadToPremiumV2ImportInput({
        workbookSheets: payload.workbookSheets ?? [],
        workbookRowsBySheet: payload.workbookRowsBySheet ?? {},
        workbookHeadersBySheet: payload.workbookHeadersBySheet ?? {},
      });

      const destinationRows = normalizedWorkbookInput.destinationRows;
      const neighborhoodRows = normalizedWorkbookInput.neighborhoodRows;
      const neighborhoodPlaceRows = normalizedWorkbookInput.neighborhoodPlaceRows;
      const resourceRows = normalizedWorkbookInput.resourceRows;
      const mediaRows = normalizedWorkbookInput.mediaRows;

      const contractPreview = buildPremiumV2WorkbookContractPreview({
        workbookSheets: payload.workbookSheets ?? [],
        workbookRowsBySheet: payload.workbookRowsBySheet ?? {},
        workbookHeadersBySheet: payload.workbookHeadersBySheet ?? {},
        existingDestinations,
      });

      const premiumPlan = buildPremiumV2WorkbookImportPlan({
        destinationRows,
        neighborhoodRows,
        neighborhoodPlaceRows,
        resourceRows,
        mediaRows,
        existingDestinations,
        mode: normalizeWorkbookImportMode(mode),
        compatibilityNotes: normalizedWorkbookInput.compatibilityNotes ?? [],
      });

      const planEntries = [
        ...premiumPlan.destinations.map((entry, index) => ({
          ...entry,
          city: String(destinationRows[index]?.city ?? destinationRows[index]?.destination_name ?? ""),
          country: String(destinationRows[index]?.country ?? ""),
          slug: String(destinationRows[index]?.slug ?? destinationRows[index]?.destination_slug ?? entry.slug ?? ""),
          description: String(destinationRows[index]?.description ?? ""),
          overview: String(destinationRows[index]?.overview ?? ""),
          status: String(destinationRows[index]?.status ?? "draft"),
          tier: String(destinationRows[index]?.tier ?? "launch"),
          importedRow: destinationRows[index] ?? {},
        })),
        ...premiumPlan.neighborhoods.map((entry, index) => ({
          ...entry,
          city: String(neighborhoodRows[index]?.city ?? ""),
          country: String(neighborhoodRows[index]?.country ?? ""),
          slug: String(neighborhoodRows[index]?.neighborhood_slug ?? entry.slug ?? ""),
          description: String(neighborhoodRows[index]?.description ?? ""),
          overview: String(neighborhoodRows[index]?.overview ?? ""),
          status: String(neighborhoodRows[index]?.status ?? "draft"),
          tier: String(neighborhoodRows[index]?.tier ?? "launch"),
          importedRow: neighborhoodRows[index] ?? {},
        })),
        ...premiumPlan.neighborhoodPlaces.map((entry, index) => ({
          ...entry,
          city: String(neighborhoodPlaceRows[index]?.city ?? ""),
          country: String(neighborhoodPlaceRows[index]?.country ?? ""),
          slug: String(neighborhoodPlaceRows[index]?.place_slug ?? entry.slug ?? ""),
          description: String(neighborhoodPlaceRows[index]?.description ?? ""),
          overview: String(neighborhoodPlaceRows[index]?.overview ?? ""),
          status: String(neighborhoodPlaceRows[index]?.status ?? "draft"),
          tier: String(neighborhoodPlaceRows[index]?.tier ?? "launch"),
          importedRow: neighborhoodPlaceRows[index] ?? {},
        })),
        ...premiumPlan.resources.map((entry, index) => ({
          ...entry,
          city: String(resourceRows[index]?.city ?? ""),
          country: String(resourceRows[index]?.country ?? ""),
          slug: String(resourceRows[index]?.resource_slug ?? entry.slug ?? ""),
          description: String(resourceRows[index]?.description ?? ""),
          overview: String(resourceRows[index]?.overview ?? ""),
          status: String(resourceRows[index]?.status ?? "draft"),
          tier: String(resourceRows[index]?.tier ?? "launch"),
          importedRow: resourceRows[index] ?? {},
        })),
        ...premiumPlan.media.map((entry, index) => ({
          ...entry,
          city: String(mediaRows[index]?.city ?? ""),
          country: String(mediaRows[index]?.country ?? ""),
          slug: String(mediaRows[index]?.media_slug ?? entry.slug ?? ""),
          description: String(mediaRows[index]?.description ?? ""),
          overview: String(mediaRows[index]?.overview ?? ""),
          status: String(mediaRows[index]?.status ?? "draft"),
          tier: String(mediaRows[index]?.tier ?? "launch"),
          importedRow: mediaRows[index] ?? {},
        })),
      ];

      plan = planEntries as Array<Record<string, unknown>>;
      summary = {
        ...buildImportSummary({ plan: plan as Array<Record<string, unknown>> as never[], totalRows: Object.values(payload.workbookRowsBySheet ?? {}).reduce((sum, sheetRows) => sum + sheetRows.length, 0) }),
        destinationCount: premiumPlan.previewSummary.destinationCount,
        neighborhoodCount: premiumPlan.previewSummary.neighborhoodCount,
        placeCount: premiumPlan.previewSummary.placeCount,
        resourceCount: premiumPlan.previewSummary.resourceCount,
        mediaCount: premiumPlan.previewSummary.mediaCount,
        rejectedCount: premiumPlan.previewSummary.rejectedCount,
      };

      compatibilityNotes = premiumPlan.compatibilityNotes ?? normalizedWorkbookInput.compatibilityNotes ?? [];
    } else if (useWorkbookSchema) {
      plan = (rows as Array<Record<string, unknown>>).map((row, index) => {
        const schema = payload.schema ?? { headers: [] };
        const workplan = buildWorkbookImportPlan(
          [row],
          existingDestinations,
          {
            sheetName: schema.sheetName ?? "Imported Sheet",
            columns: (schema.headers ?? []).map((header) => ({ rawName: header, canonicalName: header.toLowerCase().replace(/[^a-z0-9]+/g, "_"), sourceType: "sheet" as const })),
          },
          normalizeWorkbookImportMode(mode),
        )[0];
        const city = String(row.city ?? row.City ?? row.city_name ?? row.location_city ?? row.destination_name ?? row.destinationName ?? row.name ?? row.Name ?? row.destination ?? row.Destination ?? "").trim();
        const country = String(row.country ?? row.Country ?? row.country_name ?? "").trim();
        const slug = String(row.slug ?? row.Slug ?? row.destination_slug ?? workplan?.slug ?? "").trim();
        const description = String(row.description ?? row.Description ?? "").trim();
        const overview = String(row.overview ?? row.Overview ?? "").trim();
        const status = String(row.status ?? row.Status ?? "draft").trim();
        const tier = String(row.tier ?? row.Tier ?? "launch").trim();
        const existingDestination = existingDestinations.find((destination) => normalizeSlug(destination.slug) === normalizeSlug(slug));

        return {
          rowNumber: index + 2,
          action: workplan?.action === "create" ? "create" : workplan?.action === "update" ? "update" : "reject",
          reason: workplan?.reason,
          slug,
          city,
          country,
          status,
          tier,
          description,
          overview,
          existingId: existingDestination?.id,
          existingSlug: existingDestination?.slug,
          fieldUpdates: workplan?.fieldUpdates,
          warnings: [],
          errors: workplan?.action === "reject" ? [workplan.reason ?? "Rejected by schema rules."] : [],
          importedRow: row,
        };
      });
      summary = buildImportSummary({ plan, totalRows: rows.length });
    } else {
      plan = buildBatchImportPlan({
        rows,
        existingDestinations,
        mode,
        matchField,
        selectedColumns,
        allowBlankClears,
      }) as Array<Record<string, unknown>>;
      summary = buildImportSummary({ plan: plan as never[], totalRows: rows.length });
    }

    const preview = plan.filter((entry) => entry.action !== "reject" && entry.action !== "skip");
    if (previewOnly) {
      const contractPreview = hasMultiSheetWorkbookPayload
        ? buildPremiumV2WorkbookContractPreview({
            workbookSheets: payload.workbookSheets ?? [],
            workbookRowsBySheet: payload.workbookRowsBySheet ?? {},
            workbookHeadersBySheet: payload.workbookHeadersBySheet ?? {},
            existingDestinations,
          })
        : null;

      return Response.json({ plan, previewCount: preview.length, summary, mode, matchField, compatibilityNotes, contractPreview }, { status: 200 });
    }

    const runId = crypto.randomUUID();
    const importResults: Array<{ rowNumber: number; action: string; destinationId?: string; error?: string }> = [];

    const destinationIdBySlug = new Map<string, string>();
    const postApplyEnrichmentTargets = new Map<string, PostApplyEnrichmentTarget>();

    let importRunCreated = false;
    const createImportRunResponse = await fetch(`${url}/rest/v1/destination_import_runs`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: runId,
        source_name: payload.fileName ? `admin-batch-import:${payload.fileName}` : "admin-batch-import",
        import_type: "mixed",
        status: "running",
        file_name: payload.fileName ?? null,
        metadata: {
          mode,
          matchField,
          rowCount: rows.length,
        },
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });

    if (createImportRunResponse.ok) {
      importRunCreated = true;
    }

    for (const entry of preview) {
      const rowValues = (entry as unknown as { importedRow?: Record<string, unknown> }).importedRow ?? {};
      const entityType = String((entry as Record<string, unknown>).entityType ?? "destination");
      const destinationLookupSlug = normalizeImporterText((entry as Record<string, unknown>).destinationSlug ?? entry.slug);

      if (entityType !== "destination") {
        const destinationId = destinationLookupSlug ? destinationIdBySlug.get(destinationLookupSlug) : null;
        if (!destinationId) {
          importResults.push({ rowNumber: entry.rowNumber, action: entityType, error: `Unable to resolve destination for ${entityType}.` });
          continue;
        }

        if (entityType === "neighborhood") {
          const neighborhoodResponse = await fetch(`${url}/rest/v1/neighborhoods`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              destination_id: destinationId,
              name: normalizeImporterText(rowValues.neighborhood_name ?? rowValues.neighborhood ?? entry.slug),
              subtitle: normalizeImporterText(rowValues.description ?? rowValues.overview ?? ""),
              value_1: normalizeImporterText(rowValues.category ?? ""),
              url: normalizeImporterText(rowValues.website_url ?? rowValues.url ?? ""),
              source_url: normalizeImporterText(rowValues.source_url ?? rowValues.sourceUrl ?? ""),
              source_organization: normalizeImporterText(rowValues.source ?? rowValues.source_name ?? ""),
              source_type: "premium_v2_workbook",
              verification_status: normalizeImporterBoolean(rowValues.verified) ? "verified" : "in_progress",
              confidence_level: normalizeImporterBoolean(rowValues.verified) ? "high" : "medium",
              last_verified_at: normalizeImporterText(rowValues.last_verified_at ?? rowValues.lastVerifiedAt ?? ""),
              notes: normalizeImporterText(rowValues.notes ?? ""),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });

          if (!neighborhoodResponse.ok) {
            const errorMessage = await neighborhoodResponse.text();
            importResults.push({ rowNumber: entry.rowNumber, action: "create", error: errorMessage || "Unable to create neighborhood." });
            continue;
          }

          importResults.push({ rowNumber: entry.rowNumber, action: "create", destinationId });
          continue;
        }

        if (entityType === "neighborhood_place") {
          const placeResponse = await fetch(`${url}/rest/v1/destination_places`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              destination_id: destinationId,
              neighborhood_name: normalizeImporterText(rowValues.neighborhood_name ?? rowValues.neighborhood ?? ""),
              name: normalizeImporterText(rowValues.real_place_name ?? rowValues.place_name ?? rowValues.name ?? entry.slug),
              category: normalizeImporterText(rowValues.category ?? ""),
              address: normalizeImporterText(rowValues.address ?? rowValues.street_address ?? ""),
              google_maps_url: normalizeImporterText(rowValues.google_maps_url ?? rowValues.google_maps ?? ""),
              website_url: normalizeImporterText(rowValues.website_url ?? rowValues.url ?? ""),
              verified: normalizeImporterBoolean(rowValues.verified),
              source: normalizeImporterText(rowValues.source ?? rowValues.source_name ?? ""),
              source_url: normalizeImporterText(rowValues.source_url ?? rowValues.sourceUrl ?? ""),
              last_verified_at: normalizeImporterText(rowValues.last_verified_at ?? rowValues.lastVerifiedAt ?? ""),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });

          if (!placeResponse.ok) {
            const errorMessage = await placeResponse.text();
            importResults.push({ rowNumber: entry.rowNumber, action: "create", error: errorMessage || "Unable to create neighborhood place." });
            continue;
          }

          importResults.push({ rowNumber: entry.rowNumber, action: "create", destinationId });
          continue;
        }

        if (entityType === "resource") {
          const resourceResponse = await fetch(`${url}/rest/v1/destination_resource_links`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              destination_id: destinationId,
              category: normalizeImporterText(rowValues.resource_category ?? rowValues.category ?? "guides"),
              label: normalizeImporterText(rowValues.resource_name ?? rowValues.name ?? entry.slug),
              provider: normalizeImporterText(rowValues.source ?? rowValues.provider ?? "premium_v2_workbook"),
              url: normalizeImporterText(rowValues.url ?? rowValues.website_url ?? rowValues.website ?? ""),
              verified: normalizeImporterBoolean(rowValues.verified),
              official: normalizeImporterBoolean(rowValues.official),
              source: normalizeImporterText(rowValues.source ?? rowValues.source_name ?? ""),
              source_url: normalizeImporterText(rowValues.source_url ?? rowValues.sourceUrl ?? ""),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });

          if (!resourceResponse.ok) {
            const errorMessage = await resourceResponse.text();
            importResults.push({ rowNumber: entry.rowNumber, action: "create", error: errorMessage || "Unable to create resource." });
            continue;
          }

          importResults.push({ rowNumber: entry.rowNumber, action: "create", destinationId });
          continue;
        }

        if (entityType === "media") {
          const mediaResponse = await fetch(`${url}/rest/v1/destination_media_assets`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              destination_id: destinationId,
              kind: normalizeImporterText(rowValues.media_type ?? rowValues.kind ?? "gallery"),
              provider: normalizeImporterText(rowValues.source ?? rowValues.provider ?? "premium_v2_workbook"),
              url: normalizeImporterText(rowValues.image_url ?? rowValues.media_url ?? rowValues.url ?? ""),
              caption: normalizeImporterText(rowValues.caption ?? rowValues.title ?? ""),
              alt_text: normalizeImporterText(rowValues.caption ?? rowValues.alt_text ?? rowValues.title ?? ""),
              sort_order: Number(rowValues.gallery_order ?? rowValues.sort_order ?? 0) || 0,
              is_primary: normalizeImporterBoolean(rowValues.primary_image),
              verified: normalizeImporterBoolean(rowValues.verified),
              source: normalizeImporterText(rowValues.source ?? rowValues.source_name ?? ""),
              source_url: normalizeImporterText(rowValues.source_url ?? rowValues.sourceUrl ?? ""),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });

          if (!mediaResponse.ok) {
            const errorMessage = await mediaResponse.text();
            importResults.push({ rowNumber: entry.rowNumber, action: "create", error: errorMessage || "Unable to create media asset." });
            continue;
          }

          importResults.push({ rowNumber: entry.rowNumber, action: "create", destinationId });
          continue;
        }
      }

      const importedMetadata = buildImportedDestinationMetadata(rowValues);
      const payloadToSend = buildDestinationUpdatePayload({
        existingDestination: entry.existingId ? { id: entry.existingId, slug: entry.existingSlug ?? entry.slug, city: entry.city, country: entry.country } : null,
        existingDestinations,
        row: entry,
        selectedColumns,
        allowBlankClears,
        metadata: importedMetadata.researchProfile || importedMetadata.editorialContent ? {
          ...(importedMetadata.researchProfile ? { researchProfile: importedMetadata.researchProfile } : {}),
          ...(importedMetadata.editorialContent ? { editorialContent: importedMetadata.editorialContent } : {}),
        } : null,
        description: importedMetadata.descriptionValue || entry.description || null,
        overview: importedMetadata.overviewValue || entry.overview || null,
      });
      if (entry.action === "update" && payloadToSend.existingDestination) {
        const enrichmentPayload = buildRouteEnrichedDestinationCreatePayload({
          city: entry.city,
          country: entry.country,
          slug: entry.slug,
          description: entry.description,
          overview: entry.overview,
          row: rowValues,
        });
        const response = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?id=eq.${payloadToSend.existingDestination.id}`, {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            ...payloadToSend.updates,
            ...(enrichmentPayload.metadata ? { metadata: enrichmentPayload.metadata } : {}),
            ...(actorId ? { updated_by: actorId } : {}),
            updated_at: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          importResults.push({ rowNumber: entry.rowNumber, action: "update", error: errorMessage || "Unable to update destination." });
          continue;
        }

        const updatedRows = (await response.json()) as Array<Record<string, unknown>>;
        const destinationId = String(updatedRows[0]?.id ?? payloadToSend.existingDestination.id);
        destinationIdBySlug.set(normalizeImporterText(entry.slug), destinationId);
        postApplyEnrichmentTargets.set(destinationId, createPostApplyEnrichmentTarget({
          destinationId,
          slug: normalizeImporterText(entry.slug),
          city: normalizeImporterText(entry.city),
          country: normalizeImporterText(entry.country),
          description: entry.description ? String(entry.description) : null,
          overview: entry.overview ? String(entry.overview) : null,
        }));

        try {
          await verifyDestinationImport({
            accessToken,
            destinationId,
            slug: String(updatedRows[0]?.slug ?? entry.slug ?? payloadToSend.existingDestination.slug ?? ""),
            expectedStatus: String(entry.status || "draft"),
            expectedCity: String(entry.city || ""),
            expectedCountry: String(entry.country || ""),
            expectedTier: String(entry.tier || "launch"),
            expectedDescription: entry.description,
            expectedOverview: entry.overview,
          });
        } catch (verificationError) {
          importResults.push({ rowNumber: entry.rowNumber, action: "update", destinationId, error: verificationError instanceof Error ? verificationError.message : "Destination verification failed." });
          continue;
        }

        importResults.push({ rowNumber: entry.rowNumber, action: "update", destinationId });

        if (importRunCreated) {
          await fetch(`${url}/rest/v1/destination_import_rows`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              import_run_id: runId,
              destination_id: destinationId,
              module_key: "destination_catalog",
              row_number: entry.rowNumber,
              row_status: "accepted",
              source_ref: entry.slug,
              payload: {
                city: entry.city,
                country: entry.country,
                slug: entry.slug,
                status: entry.status,
                tier: entry.tier,
                description: entry.description,
                overview: entry.overview,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });
        }
      } else {
        const enrichedCreatePayload = buildRouteEnrichedDestinationCreatePayload({
          city: entry.city,
          country: entry.country,
          slug: entry.slug,
          description: entry.description,
          overview: entry.overview,
          row: rowValues,
        });
        const createBody: Record<string, unknown> = {
          id: crypto.randomUUID(),
          city: entry.city,
          country: entry.country,
          slug: enrichedCreatePayload.slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: enrichedCreatePayload.metadata,
        };

        if (actorId) {
          createBody.created_by = actorId;
          createBody.updated_by = actorId;
        }

        const shouldSetStatus = selectedColumns.length === 0 || selectedColumns.some((column) => ["status", "destination_status"].includes(column.toLowerCase()));
        const shouldSetTier = selectedColumns.length === 0 || selectedColumns.some((column) => ["tier", "destination_tier"].includes(column.toLowerCase()));
        const resolvedStatus = shouldSetStatus ? entry.status || "published" : "published";
        const resolvedTier = shouldSetTier ? entry.tier || "launch" : "launch";

        if (shouldSetStatus) {
          createBody.status = resolvedStatus;
        }

        if (shouldSetTier) {
          createBody.tier = resolvedTier;
        }

        if (selectedColumns.length === 0 || selectedColumns.some((column) => ["description", "destination_description"].includes(column.toLowerCase()))) {
          const shouldUseEnrichedDescription = allowBlankClears || entry.description !== "" || Boolean(enrichedCreatePayload.description);
          createBody.description = shouldUseEnrichedDescription ? (enrichedCreatePayload.description ?? null) : null;
        }

        if (selectedColumns.length === 0 || selectedColumns.some((column) => ["overview", "destination_overview"].includes(column.toLowerCase()))) {
          const shouldUseEnrichedOverview = allowBlankClears || entry.overview !== "" || Boolean(enrichedCreatePayload.overview);
          createBody.overview = shouldUseEnrichedOverview ? (enrichedCreatePayload.overview ?? null) : null;
        }

        const response = await fetch(`${url}/rest/v1/${ADMIN_TABLE}`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(createBody),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          importResults.push({ rowNumber: entry.rowNumber, action: "create", error: errorMessage || "Unable to create destination." });
          continue;
        }

        const createdRows = (await response.json()) as Array<Record<string, unknown>>;
        const destinationId = String(createdRows[0]?.id ?? "");
        destinationIdBySlug.set(normalizeImporterText(entry.slug), destinationId);
        postApplyEnrichmentTargets.set(destinationId, createPostApplyEnrichmentTarget({
          destinationId,
          slug: normalizeImporterText(entry.slug),
          city: normalizeImporterText(entry.city),
          country: normalizeImporterText(entry.country),
          description: entry.description ? String(entry.description) : null,
          overview: entry.overview ? String(entry.overview) : null,
        }));

        try {
          await verifyDestinationImport({
            accessToken,
            destinationId,
            slug: String(createdRows[0]?.slug ?? entry.slug ?? ""),
            expectedStatus: resolvedStatus,
            expectedCity: String(entry.city || ""),
            expectedCountry: String(entry.country || ""),
            expectedTier: resolvedTier,
            expectedDescription: enrichedCreatePayload.description ?? entry.description,
            expectedOverview: enrichedCreatePayload.overview ?? entry.overview,
          });
        } catch (verificationError) {
          importResults.push({ rowNumber: entry.rowNumber, action: "create", destinationId, error: verificationError instanceof Error ? verificationError.message : "Destination verification failed." });
          continue;
        }

        importResults.push({ rowNumber: entry.rowNumber, action: "create", destinationId });

        if (destinationId && importRunCreated) {
          await fetch(`${url}/rest/v1/destination_import_rows`, {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: crypto.randomUUID(),
              import_run_id: runId,
              destination_id: destinationId,
              module_key: "destination_catalog",
              row_number: entry.rowNumber,
              row_status: "accepted",
              source_ref: entry.slug,
              payload: {
                city: entry.city,
                country: entry.country,
                slug: entry.slug,
                status: entry.status,
                tier: entry.tier,
                description: entry.description,
                overview: entry.overview,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });
        }
      }
    }

    for (const target of postApplyEnrichmentTargets.values()) {
      if (!target.destinationId) {
        continue;
      }

      try {
        const dataset = await fetchDestinationEnrichmentDataset({
          accessToken,
          url,
          headers,
          destinationId: target.destinationId,
        });

        const enrichmentPayload = buildEnrichedDestinationCreatePayload({
          city: target.city || String(dataset.destination?.city ?? ""),
          country: target.country || String(dataset.destination?.country ?? ""),
          slug: target.slug || String(dataset.destination?.slug ?? target.destinationId),
          description: target.description ?? (dataset.destination?.description ? String(dataset.destination.description) : undefined),
          overview: target.overview ?? (dataset.destination?.overview ? String(dataset.destination.overview) : undefined),
        });

        const existingDestinationResponse = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?select=id,metadata&id=eq.${target.destinationId}&limit=1`, {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const existingMetadata = existingDestinationResponse.ok ? ((await existingDestinationResponse.json()) as Array<{ metadata?: Record<string, unknown> | null }>)[0]?.metadata : {};

        const metadata = {
          ...(enrichmentPayload.metadata ?? {}),
          ...(existingMetadata && typeof existingMetadata === "object" ? existingMetadata : {}),
          importedVerifiedFacts: {
            destination: dataset.destination ? { ...dataset.destination } : null,
            neighborhoods: dataset.neighborhoods,
            places: dataset.places,
            resources: dataset.resources,
            media: dataset.media,
          },
          postApplyEnrichment: {
            status: "completed",
            runAt: new Date().toISOString(),
            source: "premium_v2_workbook",
            destinationId: target.destinationId,
          },
        };

        const patchResponse = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?id=eq.${target.destinationId}`, {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            metadata,
            status: "review",
            updated_at: new Date().toISOString(),
          }),
        });

        if (!patchResponse.ok) {
          const errorMessage = await patchResponse.text();
          importResults.push({ rowNumber: 0, action: "enrich", destinationId: target.destinationId, error: errorMessage || "Unable to persist final editorial enrichment." });
        }
      } catch (error) {
        importResults.push({ rowNumber: 0, action: "enrich", destinationId: target.destinationId, error: error instanceof Error ? error.message : "Unable to run final editorial enrichment." });
      }
    }

    if (importRunCreated) {
      await fetch(`${url}/rest/v1/destination_import_runs?id=eq.${runId}`, {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    }

    return Response.json({ plan, previewCount: preview.length, importResults, summary, mode, matchField, compatibilityNotes }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to import destinations." },
      { status: 500 },
    );
  }
}
