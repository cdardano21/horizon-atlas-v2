import { cookies } from "next/headers";
import { buildBatchImportPlan, buildDestinationUpdatePayload, buildImportSummary, buildImportedDestinationMetadata, normalizeSlug } from "./processor";
import { getSupabaseAuthHeaders, getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "../../../../lib/supabase";
import { shouldUseAdminLocalFallback } from "../../../../lib/admin-local-fallback";
import { buildEnrichedDestinationCreatePayload } from "../../../../lib/destination-enrichment";
import { verifyDestinationImport } from "../../../../lib/destination-import-verification";
import { buildWorkbookImportPlan, normalizeWorkbookImportMode } from "../../../../lib/workbook-import-engine";

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
    const plan = useWorkbookSchema
      ? (rows as Array<Record<string, unknown>>).map((row, index) => {
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
        })
      : buildBatchImportPlan({
          rows,
          existingDestinations,
          mode,
          matchField,
          selectedColumns,
          allowBlankClears,
        });

    const summary = buildImportSummary({ plan, totalRows: rows.length });
    const preview = plan.filter((entry) => entry.action !== "reject" && entry.action !== "skip");
    if (previewOnly) {
      return Response.json({ plan, previewCount: preview.length, summary, mode, matchField }, { status: 200 });
    }

    const runId = crypto.randomUUID();
    const importResults: Array<{ rowNumber: number; action: string; destinationId?: string; error?: string }> = [];

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
        const response = await fetch(`${url}/rest/v1/${ADMIN_TABLE}?id=eq.${payloadToSend.existingDestination.id}`, {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            ...payloadToSend.updates,
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

    return Response.json({ plan, previewCount: preview.length, importResults, summary, mode, matchField }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to import destinations." },
      { status: 500 },
    );
  }
}
