import { cookies } from "next/headers";
import { getSupabaseAuthHeaders, getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "../../../../../lib/supabase";
import { shouldUseAdminLocalFallback } from "../../../../../lib/admin-local-fallback";
import { buildEnrichedDestinationCreatePayload } from "../../../../../lib/destination-enrichment";

type BackfillRequestPayload = {
  destinationIds?: string[];
  previewOnly?: boolean;
  batchSize?: number;
  dryRun?: boolean;
};

type DestinationRow = {
  id: string;
  slug: string;
  city: string;
  country: string;
  description?: string | null;
  overview?: string | null;
  metadata?: Record<string, unknown> | null;
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
  const adminResponse = await fetch(`${url}/rest/v1/app_admins?select=role&user_id=eq.${user.id}&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const adminRows = adminResponse.ok ? ((await adminResponse.json()) as Array<{ role: string }>) : [];
  return { accessToken, user, adminRole: adminRows[0]?.role ?? null };
}

export async function POST(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    const fallbackEnabled = shouldUseAdminLocalFallback(accessToken, user, adminRole);

    if (!accessToken || !user || !adminRole || fallbackEnabled) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as BackfillRequestPayload;
    const destinationIds = Array.isArray(payload.destinationIds) ? payload.destinationIds.filter(Boolean) : [];
    const previewOnly = payload.previewOnly ?? payload.dryRun ?? false;
    const batchSize = Math.max(1, Number(payload.batchSize ?? (destinationIds.length > 0 ? destinationIds.length : 1)));

    const { url } = getSupabaseConfig();
    const headers = getSupabaseAuthHeaders(accessToken);

    const response = await fetch(`${url}/rest/v1/destinations_catalog?select=id,slug,city,country,description,overview,metadata&order=city.asc`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to load destinations for enrichment backfill." }, { status: response.status });
    }

    const rows = (await response.json()) as DestinationRow[];
    const scopedRows = destinationIds.length
      ? rows.filter((row) => destinationIds.includes(row.id))
      : rows.slice(0, batchSize);

    const plan = scopedRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      city: row.city,
      country: row.country,
      description: row.description ?? null,
      overview: row.overview ?? null,
      hasExistingMetadata: Boolean(row.metadata),
    }));

    if (previewOnly) {
      return Response.json({
        preview: true,
        plan,
        summary: {
          requested: destinationIds.length || plan.length,
          processed: 0,
          updated: 0,
          failed: 0,
        },
      }, { status: 200 });
    }

    const results: Array<{ id: string; status: "updated" | "skipped" | "failed"; error?: string }> = [];

    for (const row of scopedRows) {
      try {
        const enrichmentPayload = buildEnrichedDestinationCreatePayload({
          city: row.city,
          country: row.country,
          slug: row.slug,
          description: row.description ?? undefined,
          overview: row.overview ?? undefined,
        });

        const nextMetadata = {
          ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
          ...(enrichmentPayload.metadata ? enrichmentPayload.metadata : {}),
        };

        const patchResponse = await fetch(`${url}/rest/v1/destinations_catalog?id=eq.${row.id}`, {
          method: "PATCH",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            metadata: nextMetadata,
            description: enrichmentPayload.description || row.description || null,
            overview: enrichmentPayload.overview || row.overview || null,
            updated_at: new Date().toISOString(),
          }),
        });

        if (!patchResponse.ok) {
          results.push({ id: row.id, status: "failed", error: await patchResponse.text() });
          continue;
        }

        results.push({ id: row.id, status: "updated" });
      } catch (error) {
        results.push({ id: row.id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return Response.json({
      preview: false,
      plan,
      results,
      summary: {
        requested: destinationIds.length || plan.length,
        processed: results.length,
        updated: results.filter((result) => result.status === "updated").length,
        failed: results.filter((result) => result.status === "failed").length,
      },
    }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to run enrichment backfill." }, { status: 500 });
  }
}
