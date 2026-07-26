import { getAuthedAdmin } from "../../../../lib/admin-auth";
import { isSupabaseConfigured } from "../../../../lib/supabase";
import { publishApprovedCategory } from "../../../../lib/data-engine/publishers";
import type { DataCategoryKey } from "../../../../lib/data-engine/types";

type PublishRequestBody = {
  categoryKey?: DataCategoryKey;
  runId?: string;
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

    const payload = (await request.json()) as PublishRequestBody;
    if (!payload.categoryKey) {
      return Response.json({ error: "categoryKey is required." }, { status: 400 });
    }

    const result = await publishApprovedCategory({
      accessToken,
      userId: user.id,
      categoryKey: payload.categoryKey,
      runId: payload.runId,
    });

    return Response.json({ success: true, result }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Publish failed." },
      { status: 500 },
    );
  }
}
