import { cookies } from "next/headers";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../lib/supabase";

type AuthUser = {
  id: string;
  email?: string | null;
};

type DestinationInsertPayload = {
  slug?: string;
  city?: string;
  country?: string;
  status?: "draft" | "review" | "published" | "archived";
  tier?: string;
  description?: string;
  overview?: string;
};

type DestinationRow = {
  id: string;
  slug: string;
  city: string;
  country: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
  description: string | null;
  updated_at: string;
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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
  const adminRole = adminRows[0]?.role ?? null;
  return { accessToken, user, adminRole };
}

export async function GET() {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user) {
      return Response.json({ authenticated: false, canManage: false, destinations: [] }, { status: 200 });
    }

    const { url, anonKey } = getSupabaseConfig();
    const destinationsResponse = await fetch(
      `${url}/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,updated_at&order=updated_at.desc&limit=120`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!destinationsResponse.ok) {
      return Response.json(
        { authenticated: true, canManage: Boolean(adminRole), destinations: [] },
        { status: 200 },
      );
    }

    const destinations = (await destinationsResponse.json()) as DestinationRow[];
    const destinationIds = destinations.map((item) => item.id);

    const [mediaResponse, resourcesResponse, videosResponse] = destinationIds.length
      ? await Promise.all([
        fetch(
          `${url}/rest/v1/destination_media_assets?select=destination_id&id=not.is.null&destination_id=in.(${destinationIds.join(",")})`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          },
        ),
        fetch(
          `${url}/rest/v1/destination_resource_links?select=destination_id&id=not.is.null&destination_id=in.(${destinationIds.join(",")})`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          },
        ),
        fetch(
          `${url}/rest/v1/destination_video_links?select=destination_id&id=not.is.null&destination_id=in.(${destinationIds.join(",")})`,
          {
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          },
        ),
      ])
      : [null, null, null];

    const mediaRows = mediaResponse && mediaResponse.ok
      ? ((await mediaResponse.json()) as Array<{ destination_id: string }>)
      : [];
    const resourceRows = resourcesResponse && resourcesResponse.ok
      ? ((await resourcesResponse.json()) as Array<{ destination_id: string }>)
      : [];
    const videoRows = videosResponse && videosResponse.ok
      ? ((await videosResponse.json()) as Array<{ destination_id: string }>)
      : [];

    const countByDestination = (rows: Array<{ destination_id: string }>) => {
      const counts = new Map<string, number>();
      rows.forEach((row) => {
        counts.set(row.destination_id, (counts.get(row.destination_id) ?? 0) + 1);
      });
      return counts;
    };

    const mediaCounts = countByDestination(mediaRows);
    const resourceCounts = countByDestination(resourceRows);
    const videoCounts = countByDestination(videoRows);

    return Response.json(
      {
        authenticated: true,
        canManage: Boolean(adminRole),
        adminRole,
        destinations: destinations.map((destination) => ({
          ...destination,
          mediaCount: mediaCounts.get(destination.id) ?? 0,
          resourceCount: resourceCounts.get(destination.id) ?? 0,
          videoCount: videoCounts.get(destination.id) ?? 0,
        })),
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ authenticated: false, canManage: false, destinations: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload: DestinationInsertPayload = await request.json();
    const city = (payload.city ?? "").trim();
    const country = (payload.country ?? "").trim();
    const slug = normalizeSlug(payload.slug ?? `${city}-${country}`);

    if (!city || !country || !slug) {
      return Response.json({ error: "City, country, and slug are required." }, { status: 400 });
    }

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/destinations_catalog`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([
        {
          slug,
          city,
          country,
          status: payload.status ?? "draft",
          tier: payload.tier ?? "launch",
          description: payload.description?.trim() || null,
          overview: payload.overview?.trim() || null,
          created_by: user.id,
          updated_by: user.id,
        },
      ]),
    });

    if (!response.ok) {
      const message = response.status === 409 ? "Slug already exists." : "Unable to create destination.";
      return Response.json({ error: message }, { status: response.status });
    }

    const rows = await response.json();
    return Response.json({ destination: rows[0] }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create destination." },
      { status: 500 },
    );
  }
}