import { getAuthedAdmin } from "../../../../../lib/admin-auth";
import { DATA_CATEGORY_CATALOG } from "../../../../../lib/data-engine/category-catalog";
import {
  bulkUpsertSchedulePolicies,
  listSchedulePolicies,
} from "../../../../../lib/data-engine/repository";
import { getDefaultSchedulePolicy } from "../../../../../lib/data-engine/scheduling";
import { inferDefaultSourceKey } from "../../../../../lib/data-engine/source-selection";
import { isSupabaseConfigured } from "../../../../../lib/supabase";
import type { DataCategoryKey } from "../../../../../lib/data-engine/types";

type BootstrapRequestBody = {
  overwrite?: boolean;
};

export async function POST(request: Request) {
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

    const payload = (await request.json().catch(() => ({}))) as BootstrapRequestBody;
    const overwrite = payload.overwrite ?? false;

    const categories = Object.keys(DATA_CATEGORY_CATALOG) as DataCategoryKey[];
    const existing = await listSchedulePolicies(accessToken);
    const existingSet = new Set(existing.map((row) => row.category_key));

    const targetCategories = overwrite
      ? categories
      : categories.filter((categoryKey) => !existingSet.has(categoryKey));

    const rows = targetCategories.map((categoryKey) => {
      const defaults = getDefaultSchedulePolicy(categoryKey);
      return {
        categoryKey,
        updatedBy: user.id,
        isEnabled: defaults.isEnabled,
        sourceKey: inferDefaultSourceKey(categoryKey) ?? null,
        minIntervalHours: defaults.minIntervalHours,
        maxDestinationsPerRun: defaults.maxDestinationsPerRun,
        staleAfterHours: 6,
        notes: "Auto-seeded default schedule policy.",
      };
    });

    const upserted = await bulkUpsertSchedulePolicies(accessToken, rows);

    return Response.json(
      {
        success: true,
        overwrite,
        categoryCount: categories.length,
        seededCount: upserted.length,
        skippedCount: categories.length - targetCategories.length,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to bootstrap schedule policies." },
      { status: 500 },
    );
  }
}
