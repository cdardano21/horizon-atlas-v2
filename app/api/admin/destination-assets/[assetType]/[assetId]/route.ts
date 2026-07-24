import { cookies } from "next/headers";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../../../lib/supabase";
import { toYouTubeEmbedUrl } from "../../../../../lib/youtube";

type AuthUser = {
  id: string;
};

type AssetType = "media" | "resource" | "video";

type UpdateAssetPayload = {
  label?: string;
  url?: string;
  provider?: string;
  category?: string;
  kind?: string;
  embedUrl?: string;
};

async function getAuthedAdmin() {
  if (!isSupabaseConfigured()) {
    return { accessToken: null, user: null, adminRole: null };
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

  const user = (await userResponse.json()) as AuthUser;
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

const isAssetType = (value: string): value is AssetType =>
  value === "media" || value === "resource" || value === "video";

const tableForAssetType = (assetType: AssetType) => {
  if (assetType === "media") return "destination_media_assets";
  if (assetType === "resource") return "destination_resource_links";
  return "destination_video_links";
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ assetType: string; assetId: string }> },
) {
  try {
    const { assetType: rawAssetType, assetId } = await context.params;
    if (!isAssetType(rawAssetType)) {
      return Response.json({ error: "Invalid asset type." }, { status: 400 });
    }

    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as UpdateAssetPayload;
    const updates: Record<string, string> = {};

    if (rawAssetType === "media") {
      if (payload.label !== undefined) {
        updates.caption = payload.label.trim();
        updates.alt_text = payload.label.trim();
      }
      if (payload.url !== undefined) updates.url = payload.url.trim();
      if (payload.provider !== undefined) updates.provider = payload.provider.trim() || "manual";
      if (payload.kind !== undefined) updates.kind = payload.kind.trim() || "gallery";
    } else if (rawAssetType === "resource") {
      if (payload.label !== undefined) updates.label = payload.label.trim();
      if (payload.url !== undefined) updates.url = payload.url.trim();
      if (payload.provider !== undefined) updates.provider = payload.provider.trim() || "manual";
      if (payload.category !== undefined) updates.category = payload.category.trim() || "guides";
    } else {
      if (payload.label !== undefined) updates.label = payload.label.trim();
      if (payload.url !== undefined) updates.url = payload.url.trim();
      if (payload.provider !== undefined) updates.provider = payload.provider.trim() || "custom";
      if (payload.embedUrl !== undefined || payload.url !== undefined) {
        const rawEmbedCandidate = payload.embedUrl?.trim() || payload.url?.trim() || "";
        updates.embed_url = toYouTubeEmbedUrl(rawEmbedCandidate) ?? rawEmbedCandidate;
      }
    }

    const table = tableForAssetType(rawAssetType);
    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/${table}?id=eq.${assetId}`, {
      method: "PATCH",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to update linked asset." }, { status: response.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update linked asset." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ assetType: string; assetId: string }> },
) {
  try {
    const { assetType: rawAssetType, assetId } = await context.params;
    if (!isAssetType(rawAssetType)) {
      return Response.json({ error: "Invalid asset type." }, { status: 400 });
    }

    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const table = tableForAssetType(rawAssetType);
    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/${table}?id=eq.${assetId}`, {
      method: "DELETE",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to delete linked asset." }, { status: response.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to delete linked asset." },
      { status: 500 },
    );
  }
}