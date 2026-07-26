import { getAuthedAdmin } from "../../../../lib/admin-auth";
import { executeScheduledImport } from "../../../../lib/data-engine/scheduling";
import { isSupabaseConfigured } from "../../../../lib/supabase";
import type { DataCategoryKey } from "../../../../lib/data-engine/types";

type ScheduleRequestBody = {
  categoryKey?: DataCategoryKey;
  sourceKey?: string;
  destinationSlugs?: string[];
  force?: boolean;
  maxDestinations?: number;
};

function isImportConflict(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "ImportConcurrencyError" || error.message.toLowerCase().includes("already active"))
  );
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

    const payload = (await request.json()) as ScheduleRequestBody;
    if (!payload.categoryKey) {
      return Response.json({ error: "categoryKey is required." }, { status: 400 });
    }

    if (
      payload.maxDestinations !== undefined &&
      (!Number.isFinite(payload.maxDestinations) || payload.maxDestinations <= 0)
    ) {
      return Response.json({ error: "maxDestinations must be a positive number." }, { status: 400 });
    }

    const result = await executeScheduledImport({
      accessToken,
      userId: user.id,
      categoryKey: payload.categoryKey,
      sourceKey: payload.sourceKey,
      destinationSlugs: payload.destinationSlugs,
      force: payload.force,
      maxDestinations: payload.maxDestinations,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    if (isImportConflict(error)) {
      return Response.json({ error: error instanceof Error ? error.message : "Import already active." }, { status: 409 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Scheduled import failed." },
      { status: 500 },
    );
  }
}
