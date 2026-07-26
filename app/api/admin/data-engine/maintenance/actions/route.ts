import { getAuthedAdmin } from "../../../../../lib/admin-auth";
import { DATA_CATEGORY_CATALOG } from "../../../../../lib/data-engine/category-catalog";
import { listMaintenanceActions } from "../../../../../lib/data-engine/repository";
import { isSupabaseConfigured } from "../../../../../lib/supabase";
import type { DataCategoryKey } from "../../../../../lib/data-engine/types";

const DEFAULT_LIMIT = 50;
const DEFAULT_SINCE_HOURS = 168;

function parsePositiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function isValidCategoryKey(value: string): value is DataCategoryKey {
  return Object.prototype.hasOwnProperty.call(DATA_CATEGORY_CATALOG, value);
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(
        { error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY)." },
        { status: 500 },
      );
    }

    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(request.url);
    const actionKey = url.searchParams.get("actionKey") ?? undefined;
    const categoryKeyParam = url.searchParams.get("categoryKey") ?? undefined;
    const sourceKey = url.searchParams.get("sourceKey") ?? undefined;
    const dryRun = parseOptionalBoolean(url.searchParams.get("dryRun"));
    const limit = parsePositiveNumber(url.searchParams.get("limit"), DEFAULT_LIMIT);
    const sinceHours = parsePositiveNumber(url.searchParams.get("sinceHours"), DEFAULT_SINCE_HOURS);

    if (categoryKeyParam && !isValidCategoryKey(categoryKeyParam)) {
      return Response.json({ error: "categoryKey is invalid." }, { status: 400 });
    }

    const categoryKey: DataCategoryKey | undefined =
      categoryKeyParam && isValidCategoryKey(categoryKeyParam)
        ? categoryKeyParam
        : undefined;

    const sinceIso = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
    const rows = await listMaintenanceActions(accessToken, {
      actionKey,
      categoryKey,
      sourceKey,
      dryRun,
      limit,
      sinceIso,
    });

    return Response.json(
      {
        success: true,
        count: rows.length,
        filters: {
          actionKey: actionKey ?? null,
          categoryKey: categoryKey ?? null,
          sourceKey: sourceKey ?? null,
          dryRun: typeof dryRun === "boolean" ? dryRun : null,
          limit,
          sinceHours,
          sinceIso,
        },
        rows,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load maintenance actions." },
      { status: 500 },
    );
  }
}
