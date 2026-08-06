import { cookies } from "next/headers";
import type {
  DestinationEditorialContent,
  DestinationMemberDetails,
  DestinationRelocationProfile,
  DestinationResearchProfile,
} from "../../../lib/destinations";
import { getSupabaseAuthHeaders, getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "../../../lib/supabase";
import {
  createAdminFallbackDestination,
  listAdminFallbackDestinations,
  shouldUseAdminLocalFallback,
} from "../../../lib/admin-local-fallback";
import { buildEnrichedDestinationCreatePayload } from "../../../lib/destination-enrichment";
import { verifyDestinationImport } from "../../../lib/destination-import-verification";
import { buildDestinationIdentity, findDestinationIdentityConflict } from "../../../lib/destination-identity";

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
  overview: string | null;
  updated_at: string;
  metadata?: {
    relocationProfile?: DestinationRelocationProfile;
    memberDetails?: DestinationMemberDetails;
    editorialContent?: DestinationEditorialContent;
    researchProfile?: DestinationResearchProfile;
  } | null;
};

const normalizeDestinationIdentity = (input: { city?: string; country?: string; slug?: string }) => buildDestinationIdentity(input);

const normalizeAuditUserId = (user: { id: string } | null | undefined) => {
  if (!user?.id) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id)
    ? user.id
    : null;
};

async function getAuthedAdmin() {
  if (!isSupabaseConfigured()) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (serviceRoleKey) {
    return { accessToken: serviceRoleKey, user: { id: "service-role" }, adminRole: "admin" };
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
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      return Response.json(
        {
          authenticated: true,
          canManage: true,
          adminRole: "admin",
          destinations: listAdminFallbackDestinations().map((destination) => ({
            ...destination,
            relocationProfile: destination.metadata?.relocationProfile ?? null,
            memberDetails: destination.metadata?.memberDetails ?? null,
            editorialContent: destination.metadata?.editorialContent ?? null,
            researchProfile: destination.metadata?.researchProfile ?? null,
            mediaCount: 0,
            resourceCount: 0,
            videoCount: 0,
          })),
        },
        { status: 200 },
      );
    }

    if (!accessToken || !user) {
      return Response.json({ authenticated: false, canManage: false, destinations: [] }, { status: 200 });
    }

    const { url } = getSupabaseConfig();
    const headers = getSupabaseAuthHeaders(accessToken);
    const destinationsResponse = await fetch(
      `${url}/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview,updated_at,metadata&order=updated_at.desc&limit=1000`,
      {
        headers: {
          ...headers,
        },
        cache: "no-store",
      },
    );

    if (!destinationsResponse.ok) {
      return Response.json(
        { authenticated: true, canManage: Boolean(adminRole), adminRole, destinations: [] },
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
              ...headers,
            },
            cache: "no-store",
          },
        ),
        fetch(
          `${url}/rest/v1/destination_resource_links?select=destination_id&id=not.is.null&destination_id=in.(${destinationIds.join(",")})`,
          {
            headers: {
              ...headers,
            },
            cache: "no-store",
          },
        ),
        fetch(
          `${url}/rest/v1/destination_video_links?select=destination_id&id=not.is.null&destination_id=in.(${destinationIds.join(",")})`,
          {
            headers: {
              ...headers,
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
          relocationProfile: destination.metadata?.relocationProfile ?? null,
          memberDetails: destination.metadata?.memberDetails ?? null,
          editorialContent: destination.metadata?.editorialContent ?? null,
          researchProfile: destination.metadata?.researchProfile ?? null,
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
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const payload: DestinationInsertPayload = await request.json();
      const destination = createAdminFallbackDestination(payload);
      return Response.json({ destination }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload: DestinationInsertPayload = await request.json();
    const { city, country, slug } = normalizeDestinationIdentity(payload);

    if (!city || !country || !slug) {
      return Response.json({ error: "City, country, and slug are required." }, { status: 400 });
    }

    const { url } = getSupabaseConfig();
    const headers = getSupabaseAuthHeaders(accessToken);
    const existingConflict = await findDestinationIdentityConflict({
      accessToken,
      url,
      headers,
      city,
      country,
      slug,
    });

    if (existingConflict) {
      return Response.json({ error: "A destination with this identity already exists." }, { status: 409 });
    }
    const auditUserId = normalizeAuditUserId(user);
    const enrichedPayload = buildEnrichedDestinationCreatePayload({
      city,
      country,
      slug,
      description: payload.description,
      overview: payload.overview,
    });

    const response = await fetch(`${url}/rest/v1/destinations_catalog`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([
        {
          slug: enrichedPayload.slug,
          city,
          country,
          status: payload.status ?? "published",
          tier: payload.tier ?? "launch",
          description: enrichedPayload.description,
          overview: enrichedPayload.overview,
          metadata: enrichedPayload.metadata,
          ...(auditUserId ? { created_by: auditUserId } : {}),
          ...(auditUserId ? { updated_by: auditUserId } : {}),
        },
      ]),
    });

    if (!response.ok) {
      const message = response.status === 409 ? "Slug already exists." : "Unable to create destination.";
      return Response.json({ error: message }, { status: response.status });
    }

    const rows = await response.json();
    const createdDestination = rows[0] as { id?: string; slug?: string; city?: string; country?: string; status?: string; tier?: string; description?: string | null; overview?: string | null } | undefined;

    if (!createdDestination?.id) {
      return Response.json({ error: "Unable to verify destination after create." }, { status: 500 });
    }

    await verifyDestinationImport({
      accessToken,
      destinationId: createdDestination.id,
      slug: createdDestination.slug,
      expectedStatus: payload.status ?? "published",
      expectedCity: createdDestination.city,
      expectedCountry: createdDestination.country,
      expectedTier: payload.tier ?? "launch",
      expectedDescription: payload.description,
      expectedOverview: payload.overview,
    });

    return Response.json({ destination: createdDestination }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create destination." },
      { status: 500 },
    );
  }
}