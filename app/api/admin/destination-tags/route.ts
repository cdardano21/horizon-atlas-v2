import { cookies } from "next/headers";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../lib/supabase";

type AuthUser = {
  id: string;
};

type CreateTagPayload = {
  destinationId?: string;
  tag?: string;
};

type DeleteTagPayload = {
  destinationId?: string;
  tag?: string;
};

type UpdateTagPayload = {
  destinationId?: string;
  currentTag?: string;
  nextTag?: string;
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

const normalizeTag = (tag: string) => tag.trim().toLowerCase();

type SupabaseErrorBody = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const isUniqueViolation = (body: SupabaseErrorBody | null) => body?.code === "23505";

export async function GET(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(request.url);
    const destinationId = (url.searchParams.get("destinationId") ?? "").trim();
    if (!destinationId) {
      return Response.json({ tags: [] }, { status: 200 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfig();
    const response = await fetch(
      `${supabaseUrl}/rest/v1/destination_tags?select=tag&destination_id=eq.${destinationId}&order=tag.asc`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return Response.json({ error: "Unable to fetch destination tags." }, { status: response.status });
    }

    const rows = (await response.json()) as Array<{ tag: string }>;
    return Response.json({ tags: rows.map((row) => row.tag) }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to fetch destination tags." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as CreateTagPayload;
    const destinationId = (payload.destinationId ?? "").trim();
    const tag = normalizeTag(payload.tag ?? "");

    if (!destinationId || !tag) {
      return Response.json({ error: "destinationId and tag are required." }, { status: 400 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfig();
    const response = await fetch(`${supabaseUrl}/rest/v1/destination_tags`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([{ destination_id: destinationId, tag }]),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as SupabaseErrorBody | null;
      if (isUniqueViolation(errorBody)) {
        return Response.json({ error: "Tag already exists for this destination." }, { status: 409 });
      }

      return Response.json({ error: "Unable to add destination tag." }, { status: response.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to add destination tag." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as DeleteTagPayload;
    const destinationId = (payload.destinationId ?? "").trim();
    const tag = normalizeTag(payload.tag ?? "");

    if (!destinationId || !tag) {
      return Response.json({ error: "destinationId and tag are required." }, { status: 400 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfig();
    const response = await fetch(
      `${supabaseUrl}/rest/v1/destination_tags?destination_id=eq.${destinationId}&tag=eq.${encodeURIComponent(tag)}`,
      {
        method: "DELETE",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=minimal",
        },
      },
    );

    if (!response.ok) {
      return Response.json({ error: "Unable to remove destination tag." }, { status: response.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to remove destination tag." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as UpdateTagPayload;
    const destinationId = (payload.destinationId ?? "").trim();
    const currentTag = normalizeTag(payload.currentTag ?? "");
    const nextTag = normalizeTag(payload.nextTag ?? "");

    if (!destinationId || !currentTag || !nextTag) {
      return Response.json({ error: "destinationId, currentTag, and nextTag are required." }, { status: 400 });
    }

    if (currentTag === nextTag) {
      return Response.json({ success: true }, { status: 200 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfig();
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/destination_tags?destination_id=eq.${destinationId}&tag=eq.${encodeURIComponent(currentTag)}`,
      {
        method: "PATCH",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ tag: nextTag }),
      },
    );

    if (!updateResponse.ok) {
      const errorBody = (await updateResponse.json().catch(() => null)) as SupabaseErrorBody | null;
      if (isUniqueViolation(errorBody)) {
        return Response.json({ error: "Tag already exists for this destination." }, { status: 409 });
      }

      return Response.json({ error: "Unable to rename destination tag." }, { status: updateResponse.status });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to rename destination tag." },
      { status: 500 },
    );
  }
}