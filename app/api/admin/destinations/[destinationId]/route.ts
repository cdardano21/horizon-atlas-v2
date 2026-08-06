import { cookies } from "next/headers";
import type {
  DestinationEditorialContent,
  DestinationRelocationProfile,
  DestinationResearchProfile,
} from "../../../../lib/destinations";
import { getSupabaseAuthHeaders, getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "../../../../lib/supabase";
import {
  deleteAdminFallbackDestination,
  shouldUseAdminLocalFallback,
  updateAdminFallbackDestination,
} from "../../../../lib/admin-local-fallback";
import { verifyDestinationImport } from "../../../../lib/destination-import-verification";
import { buildDestinationIdentity, findDestinationIdentityConflict } from "../../../../lib/destination-identity";

type AuthUser = {
  id: string;
};

type DestinationUpdatePayload = {
  status?: "draft" | "review" | "published" | "archived";
  tier?: string;
  description?: string;
  overview?: string;
  city?: string;
  country?: string;
  slug?: string;
  relocationProfile?: DestinationRelocationProfile | null;
  editorialContent?: DestinationEditorialContent | null;
  researchProfile?: DestinationResearchProfile | null;
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
  return { accessToken, user, adminRole: adminRows[0]?.role ?? null };
}

export async function PATCH(request: Request, context: { params: Promise<{ destinationId: string }> }) {
  try {
    const { destinationId } = await context.params;
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    const fallbackEnabled = shouldUseAdminLocalFallback(accessToken, user, adminRole);

    if (fallbackEnabled) {
      const payload = (await request.json()) as DestinationUpdatePayload;
      const metadataUpdate = (payload.relocationProfile !== undefined || payload.editorialContent !== undefined || payload.researchProfile !== undefined)
        ? {
            ...(payload.relocationProfile !== undefined ? { relocationProfile: payload.relocationProfile } : {}),
            ...(payload.editorialContent !== undefined ? { editorialContent: payload.editorialContent } : {}),
            ...(payload.researchProfile !== undefined ? { researchProfile: payload.researchProfile } : {}),
          }
        : undefined;

      const destination = updateAdminFallbackDestination(destinationId, {
        slug: payload.slug,
        city: payload.city,
        country: payload.country,
        status: payload.status,
        tier: payload.tier,
        description: payload.description,
        overview: payload.overview,
        metadata: metadataUpdate,
      });
      if (!destination) {
        return Response.json({ error: "Destination not found." }, { status: 404 });
      }
      return Response.json({ destination }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as DestinationUpdatePayload;
    const updates: Record<string, unknown> = {};
    const auditUserId = normalizeAuditUserId(user);
    if (auditUserId) {
      updates.updated_by = auditUserId;
    }

    const nextIdentity = normalizeDestinationIdentity({
      city: payload.city,
      country: payload.country,
      slug: payload.slug,
    });

    if (payload.status) updates.status = payload.status;
    if (payload.tier !== undefined) updates.tier = payload.tier.trim();
    if (payload.city !== undefined) updates.city = nextIdentity.city;
    if (payload.country !== undefined) updates.country = nextIdentity.country;
    if (payload.slug !== undefined) {
      if (!nextIdentity.slug) {
        return Response.json({ error: "Slug is required." }, { status: 400 });
      }
      updates.slug = nextIdentity.slug;
    }
    if (payload.description !== undefined) updates.description = payload.description.trim() || null;
    if (payload.overview !== undefined) updates.overview = payload.overview.trim() || null;

    const { url } = getSupabaseConfig();
    const conflict = await findDestinationIdentityConflict({
      accessToken,
      url,
      headers: getSupabaseAuthHeaders(accessToken),
      currentDestinationId: destinationId,
      city: payload.city !== undefined ? nextIdentity.city : undefined,
      country: payload.country !== undefined ? nextIdentity.country : undefined,
      slug: payload.slug !== undefined ? nextIdentity.slug : undefined,
    });

    if (conflict) {
      return Response.json({ error: "Another destination already uses this identity." }, { status: 409 });
    }

    if (
      payload.relocationProfile !== undefined
      || payload.editorialContent !== undefined
      || payload.researchProfile !== undefined
    ) {
      const existingResponse = await fetch(
        `${url}/rest/v1/destinations_catalog?select=metadata&id=eq.${destinationId}&limit=1`,
        {
          headers: {
            ...getSupabaseAuthHeaders(accessToken),
          },
          cache: "no-store",
        },
      );

      if (!existingResponse.ok) {
        return Response.json({ error: "Unable to load destination metadata." }, { status: existingResponse.status });
      }

      const existingRows = (await existingResponse.json()) as Array<{ metadata?: Record<string, unknown> | null }>;
      const existingMetadata = existingRows[0]?.metadata && typeof existingRows[0].metadata === "object"
        ? { ...existingRows[0].metadata }
        : {};

      if (payload.relocationProfile !== undefined) {
        if (payload.relocationProfile === null) {
          delete existingMetadata.relocationProfile;
        } else {
          existingMetadata.relocationProfile = payload.relocationProfile;
        }
      }

      if (payload.editorialContent !== undefined) {
        if (payload.editorialContent === null) {
          delete existingMetadata.editorialContent;
        } else {
          existingMetadata.editorialContent = payload.editorialContent;
        }
      }

      if (payload.researchProfile !== undefined) {
        if (payload.researchProfile === null) {
          delete existingMetadata.researchProfile;
        } else {
          existingMetadata.researchProfile = payload.researchProfile;
        }
      }

      updates.metadata = existingMetadata;
    }

    const response = await fetch(`${url}/rest/v1/destinations_catalog?id=eq.${destinationId}`, {
      method: "PATCH",
      headers: {
        ...getSupabaseAuthHeaders(accessToken),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to update destination." }, { status: response.status });
    }

    const rows = await response.json();
    const updatedDestination = rows[0] as { id?: string; slug?: string; city?: string; country?: string; status?: string; tier?: string; description?: string | null; overview?: string | null } | undefined;

    if (!updatedDestination?.id) {
      return Response.json({ error: "Unable to verify destination after update." }, { status: 500 });
    }

    await verifyDestinationImport({
      accessToken,
      destinationId: updatedDestination.id,
      slug: updatedDestination.slug ?? payload.slug,
      expectedStatus: updatedDestination.status ?? payload.status,
      expectedCity: updatedDestination.city ?? payload.city,
      expectedCountry: updatedDestination.country ?? payload.country,
      expectedTier: updatedDestination.tier ?? payload.tier,
      expectedDescription: payload.description,
      expectedOverview: payload.overview,
    });

    return Response.json({ destination: updatedDestination }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update destination." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ destinationId: string }> }) {
  try {
    const { destinationId } = await context.params;
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    const fallbackEnabled = shouldUseAdminLocalFallback(accessToken, user, adminRole);

    if (fallbackEnabled) {
      const deleted = deleteAdminFallbackDestination(destinationId);
      return Response.json({ success: deleted }, { status: deleted ? 200 : 404 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/destinations_catalog?id=eq.${destinationId}`, {
      method: "DELETE",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to delete destination." }, { status: response.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to delete destination." },
      { status: 500 },
    );
  }
}