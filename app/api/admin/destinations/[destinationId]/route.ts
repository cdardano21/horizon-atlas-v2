import { cookies } from "next/headers";
import type {
  DestinationEditorialContent,
  DestinationRelocationProfile,
  DestinationResearchProfile,
} from "../../../../lib/destinations";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../../lib/supabase";

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
  relocationProfile?: DestinationRelocationProfile | null;
  editorialContent?: DestinationEditorialContent | null;
  researchProfile?: DestinationResearchProfile | null;
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

export async function PATCH(request: Request, context: { params: Promise<{ destinationId: string }> }) {
  try {
    const { destinationId } = await context.params;
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as DestinationUpdatePayload;
    const updates: Record<string, unknown> = {
      updated_by: user.id,
    };

    if (payload.status) updates.status = payload.status;
    if (payload.tier) updates.tier = payload.tier.trim();
    if (payload.city !== undefined) updates.city = payload.city.trim();
    if (payload.country !== undefined) updates.country = payload.country.trim();
    if (payload.description !== undefined) updates.description = payload.description.trim() || null;
    if (payload.overview !== undefined) updates.overview = payload.overview.trim() || null;

    const { url, anonKey } = getSupabaseConfig();

    if (
      payload.relocationProfile !== undefined
      || payload.editorialContent !== undefined
      || payload.researchProfile !== undefined
    ) {
      const existingResponse = await fetch(
        `${url}/rest/v1/destinations_catalog?select=metadata&id=eq.${destinationId}&limit=1`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
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
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to update destination." }, { status: response.status });
    }

    const rows = await response.json();
    return Response.json({ destination: rows[0] }, { status: 200 });
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