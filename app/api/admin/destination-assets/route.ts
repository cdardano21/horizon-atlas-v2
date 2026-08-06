import { cookies } from "next/headers";
import * as supabaseModule from "../../../lib/supabase";
import { toYouTubeEmbedUrl } from "../../../lib/youtube";

const getSupabaseConfigSafe = () => {
  const configFn = (supabaseModule as { getSupabaseConfig?: () => { url: string; anonKey: string } }).getSupabaseConfig;
  return typeof configFn === "function" ? configFn() : { url: "", anonKey: "" };
};

const isSupabaseConfiguredSafe = () => {
  const configuredFn = (supabaseModule as { isSupabaseConfigured?: () => boolean }).isSupabaseConfigured;
  return typeof configuredFn === "function" ? configuredFn() : false;
};

const getServiceRoleKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
import {
  listAdminFallbackAssets,
  shouldUseAdminLocalFallback,
  upsertAdminFallbackAsset,
} from "../../../lib/admin-local-fallback";

type AuthUser = {
  id: string;
};

type AssetPayload = {
  destinationId?: string;
  assetType?: "media" | "resource" | "video";
  label?: string;
  url?: string;
  provider?: string;
  category?: string;
  kind?: string;
};

type LinkedAssetRecord = {
  id: string;
  assetType: "media" | "resource" | "video";
  label: string;
  url: string;
  provider: string;
  category: string;
  kind: string;
  embedUrl: string;
};

async function getAuthedAdmin() {
  if (!isSupabaseConfiguredSafe()) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const serviceRoleKey = getServiceRoleKey();
  if (serviceRoleKey) {
    return { accessToken: serviceRoleKey, user: { id: "service-role" }, adminRole: "admin" };
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("ha-access-token")?.value ?? null;
    if (!accessToken) {
      return { accessToken: null, user: null, adminRole: null };
    }

    const { url, anonKey } = getSupabaseConfigSafe();
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
  } catch (error) {
    console.error("admin-assets auth failure", error);
    return { accessToken: null, user: null, adminRole: null };
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const payload = (await request.json()) as AssetPayload;
      const destinationId = (payload.destinationId ?? "").trim();
      const assetType = payload.assetType;
      const label = (payload.label ?? "").trim();
      const link = (payload.url ?? "").trim();

      if (!destinationId || !assetType || !label || !link) {
        return Response.json({ error: "destinationId, assetType, label, and url are required." }, { status: 400 });
      }

      upsertAdminFallbackAsset({
        destination_id: destinationId,
        assetType,
        label,
        url: link,
        provider: (payload.provider ?? "manual").trim() || "manual",
        category: (payload.category ?? "").trim() || "guides",
        kind: (payload.kind ?? "").trim() || "gallery",
        embedUrl: assetType === "video" ? (toYouTubeEmbedUrl(link) ?? link) : "",
      });
      return Response.json({ success: true }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as AssetPayload;
    const destinationId = (payload.destinationId ?? "").trim();
    const assetType = payload.assetType;
    const label = (payload.label ?? "").trim();
    const link = (payload.url ?? "").trim();

    if (!destinationId || !assetType || !label || !link) {
      return Response.json({ error: "destinationId, assetType, label, and url are required." }, { status: 400 });
    }

    const { url, anonKey } = getSupabaseConfigSafe();
    if (assetType === "media") {
      const kind = (payload.kind ?? "").trim() || "gallery";
      const response = await fetch(`${url}/rest/v1/destination_media_assets`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify([
          {
            destination_id: destinationId,
            kind,
            provider: (payload.provider ?? "manual").trim() || "manual",
            url: link,
            caption: label,
            alt_text: label,
          },
        ]),
      });

      if (!response.ok) {
        return Response.json({ error: "Unable to create media asset." }, { status: response.status });
      }

      return Response.json({ success: true }, { status: 200 });
    }

    if (assetType === "resource") {
      const category = (payload.category ?? "").trim() || "guides";
      const response = await fetch(`${url}/rest/v1/destination_resource_links`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify([
          {
            destination_id: destinationId,
            category,
            label,
            provider: (payload.provider ?? "manual").trim() || "manual",
            url: link,
          },
        ]),
      });

      if (!response.ok) {
        return Response.json({ error: "Unable to create resource link." }, { status: response.status });
      }

      return Response.json({ success: true }, { status: 200 });
    }

    const response = await fetch(`${url}/rest/v1/destination_video_links`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          destination_id: destinationId,
          provider: (payload.provider ?? "custom").trim() || "custom",
          label,
          url: link,
          embed_url: toYouTubeEmbedUrl(link) ?? link,
        },
      ]),
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to create video link." }, { status: response.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("destination-assets POST failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create destination asset." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const url = new URL(request.url);
      const destinationId = (url.searchParams.get("destinationId") ?? "").trim();
      if (!destinationId) {
        return Response.json({ assets: [] }, { status: 200 });
      }
      return Response.json({ assets: listAdminFallbackAssets(destinationId) }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(request.url);
    const destinationId = (url.searchParams.get("destinationId") ?? "").trim();

    if (!destinationId) {
      return Response.json({ assets: [] }, { status: 200 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfigSafe();
    const [mediaResponse, resourceResponse, videoResponse] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/destination_media_assets?select=id,provider,url,kind,caption,alt_text,created_at&destination_id=eq.${destinationId}&order=created_at.desc`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      ),
      fetch(
        `${supabaseUrl}/rest/v1/destination_resource_links?select=id,provider,url,category,label,created_at&destination_id=eq.${destinationId}&order=created_at.desc`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      ),
      fetch(
        `${supabaseUrl}/rest/v1/destination_video_links?select=id,provider,url,label,embed_url,created_at&destination_id=eq.${destinationId}&order=created_at.desc`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      ),
    ]);

    const mediaRows = mediaResponse.ok
      ? ((await mediaResponse.json()) as Array<{ id: string; provider: string; url: string; kind: string; caption: string | null; alt_text: string | null }>)
      : [];
    const resourceRows = resourceResponse.ok
      ? ((await resourceResponse.json()) as Array<{ id: string; provider: string | null; url: string; category: string; label: string }>)
      : [];
    const videoRows = videoResponse.ok
      ? ((await videoResponse.json()) as Array<{ id: string; provider: string; url: string; label: string; embed_url: string | null }>)
      : [];

    const assets: LinkedAssetRecord[] = [
      ...mediaRows.map((item) => ({
        id: item.id,
        assetType: "media" as const,
        label: item.caption || item.alt_text || "Media asset",
        url: item.url,
        provider: item.provider || "manual",
        category: "",
        kind: item.kind || "gallery",
        embedUrl: "",
      })),
      ...resourceRows.map((item) => ({
        id: item.id,
        assetType: "resource" as const,
        label: item.label,
        url: item.url,
        provider: item.provider || "manual",
        category: item.category,
        kind: "",
        embedUrl: "",
      })),
      ...videoRows.map((item) => ({
        id: item.id,
        assetType: "video" as const,
        label: item.label,
        url: item.url,
        provider: item.provider || "custom",
        category: "",
        kind: "",
        embedUrl: item.embed_url || "",
      })),
    ];

    return Response.json({ assets }, { status: 200 });
  } catch (error) {
    console.error("destination-assets GET failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to fetch destination assets." },
      { status: 500 },
    );
  }
}