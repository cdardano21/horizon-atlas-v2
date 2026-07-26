import { getAuthedAdmin } from "../../../../../lib/admin-auth";
import { DATA_CATEGORY_CATALOG } from "../../../../../lib/data-engine/category-catalog";
import {
  countStaleRunningImportRuns,
  failStaleRunningImportRuns,
  insertMaintenanceAction,
} from "../../../../../lib/data-engine/repository";
import { isSupabaseConfigured } from "../../../../../lib/supabase";
import type { DataCategoryKey } from "../../../../../lib/data-engine/types";

type CleanupRequestBody = {
  categoryKey?: DataCategoryKey;
  sourceKey?: string;
  staleAfterHours?: number;
  dryRun?: boolean;
};

const DEFAULT_STALE_AFTER_HOURS = 6;

function isValidCategoryKey(value: string): value is DataCategoryKey {
  return Object.prototype.hasOwnProperty.call(DATA_CATEGORY_CATALOG, value);
}

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

    const payload = (await request.json().catch(() => ({}))) as CleanupRequestBody;

    if (payload.categoryKey && !isValidCategoryKey(payload.categoryKey)) {
      return Response.json({ error: "categoryKey is invalid." }, { status: 400 });
    }

    if (
      payload.staleAfterHours !== undefined &&
      (!Number.isFinite(payload.staleAfterHours) || payload.staleAfterHours <= 0)
    ) {
      return Response.json({ error: "staleAfterHours must be a positive number." }, { status: 400 });
    }

    const staleAfterHours = payload.staleAfterHours ?? DEFAULT_STALE_AFTER_HOURS;
    const staleBeforeIso = new Date(Date.now() - staleAfterHours * 60 * 60 * 1000).toISOString();

    const staleMatchCount = await countStaleRunningImportRuns(
      accessToken,
      staleBeforeIso,
      payload.categoryKey,
      payload.sourceKey,
    );

    const scope = {
      categoryKey: payload.categoryKey ?? null,
      sourceKey: payload.sourceKey ?? null,
    };

    if (payload.dryRun) {
      const maintenanceLog = await insertMaintenanceAction(accessToken, {
        actionKey: "cleanup_stale_import_runs",
        initiatedBy: user.id,
        categoryKey: payload.categoryKey,
        sourceKey: payload.sourceKey,
        dryRun: true,
        staleAfterHours,
        staleBeforeIso,
        staleMatchCount,
        affectedCount: 0,
        notes: `Dry-run stale cleanup older than ${staleAfterHours}h`,
        details: scope,
      });

      return Response.json(
        {
          success: true,
          dryRun: true,
          staleAfterHours,
          staleBeforeIso,
          scope,
          staleMatchCount,
          affectedCount: 0,
          auditActionId: maintenanceLog.id,
        },
        { status: 200 },
      );
    }

    const affectedCount = await failStaleRunningImportRuns(accessToken, {
      categoryKey: payload.categoryKey,
      sourceKey: payload.sourceKey,
      staleBeforeIso,
      errorMessage: `Manual maintenance cleanup of stale running imports older than ${staleAfterHours}h by ${user.id}.`,
    });

    const maintenanceLog = await insertMaintenanceAction(accessToken, {
      actionKey: "cleanup_stale_import_runs",
      initiatedBy: user.id,
      categoryKey: payload.categoryKey,
      sourceKey: payload.sourceKey,
      dryRun: false,
      staleAfterHours,
      staleBeforeIso,
      staleMatchCount,
      affectedCount,
      notes: `Applied stale cleanup older than ${staleAfterHours}h`,
      details: scope,
    });

    return Response.json(
      {
        success: true,
        dryRun: false,
        staleAfterHours,
        staleBeforeIso,
        scope,
        staleMatchCount,
        affectedCount,
        auditActionId: maintenanceLog.id,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to cleanup stale runs." },
      { status: 500 },
    );
  }
}
