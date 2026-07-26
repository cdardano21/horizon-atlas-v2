import { getAuthedAdmin } from "../../../../lib/admin-auth";
import { DATA_CATEGORY_CATALOG } from "../../../../lib/data-engine/category-catalog";
import { listSchedulePolicies, upsertSchedulePolicy } from "../../../../lib/data-engine/repository";
import { isSupabaseConfigured } from "../../../../lib/supabase";
import type { DataCategoryKey } from "../../../../lib/data-engine/types";

type SchedulePolicyPatchBody = {
  categoryKey?: DataCategoryKey;
  isEnabled?: boolean;
  sourceKey?: string | null;
  minIntervalHours?: number | null;
  maxDestinationsPerRun?: number | null;
  staleAfterHours?: number | null;
  notes?: string | null;
};

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
    const categoryKey = url.searchParams.get("categoryKey");

    const rows = await listSchedulePolicies(accessToken);
    const filtered = categoryKey ? rows.filter((row) => row.category_key === categoryKey) : rows;

    return Response.json({ rows: filtered, count: filtered.length }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load schedule policies." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
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

    const payload = (await request.json()) as SchedulePolicyPatchBody;

    if (!payload.categoryKey || !isValidCategoryKey(payload.categoryKey)) {
      return Response.json({ error: "A valid categoryKey is required." }, { status: 400 });
    }

    if (
      payload.minIntervalHours !== undefined &&
      payload.minIntervalHours !== null &&
      (!Number.isFinite(payload.minIntervalHours) || payload.minIntervalHours <= 0)
    ) {
      return Response.json({ error: "minIntervalHours must be a positive number." }, { status: 400 });
    }

    if (
      payload.maxDestinationsPerRun !== undefined &&
      payload.maxDestinationsPerRun !== null &&
      (!Number.isFinite(payload.maxDestinationsPerRun) || payload.maxDestinationsPerRun <= 0)
    ) {
      return Response.json(
        { error: "maxDestinationsPerRun must be a positive number." },
        { status: 400 },
      );
    }

    if (
      payload.staleAfterHours !== undefined &&
      payload.staleAfterHours !== null &&
      (!Number.isFinite(payload.staleAfterHours) || payload.staleAfterHours <= 0)
    ) {
      return Response.json({ error: "staleAfterHours must be a positive number." }, { status: 400 });
    }

    const row = await upsertSchedulePolicy(accessToken, {
      categoryKey: payload.categoryKey,
      updatedBy: user.id,
      isEnabled: payload.isEnabled,
      sourceKey: payload.sourceKey,
      minIntervalHours: payload.minIntervalHours,
      maxDestinationsPerRun: payload.maxDestinationsPerRun,
      staleAfterHours: payload.staleAfterHours,
      notes: payload.notes,
    });

    return Response.json({ success: true, row }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update schedule policy." },
      { status: 500 },
    );
  }
}
