import { getAuthedAdmin } from "../../../../lib/admin-auth";
import { isSupabaseConfigured } from "../../../../lib/supabase";
import {
  listPendingStagedRecords,
  patchReviewStatus,
} from "../../../../lib/data-engine/repository";
import type { DataCategoryKey, ReviewStatus } from "../../../../lib/data-engine/types";

type ReviewPatchBody = {
  recordIds?: string[];
  status?: ReviewStatus;
  notes?: string;
};

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
    const limit = Number(url.searchParams.get("limit") ?? "200");
    const categoryKey = (url.searchParams.get("categoryKey") ?? undefined) as DataCategoryKey | undefined;

    const rows = await listPendingStagedRecords(accessToken, Number.isFinite(limit) ? limit : 200, categoryKey);
    return Response.json({ rows, count: rows.length }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load review queue." },
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

    const payload = (await request.json()) as ReviewPatchBody;
    if (!Array.isArray(payload.recordIds) || payload.recordIds.length === 0) {
      return Response.json({ error: "recordIds must be a non-empty array." }, { status: 400 });
    }

    if (!payload.status || !["approved", "rejected", "pending"].includes(payload.status)) {
      return Response.json({ error: "status must be approved, rejected, or pending." }, { status: 400 });
    }

    const updated = await patchReviewStatus(accessToken, payload.recordIds, payload.status, user.id, payload.notes);

    return Response.json({ success: true, updated }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update review status." },
      { status: 500 },
    );
  }
}
