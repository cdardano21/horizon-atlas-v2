import { cookies } from "next/headers";
import * as supabaseModule from "../../../lib/supabase";

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
  addAdminFallbackTag,
  listAdminFallbackTags,
  removeAdminFallbackTag,
  renameAdminFallbackTag,
  shouldUseAdminLocalFallback,
} from "../../../lib/admin-local-fallback";

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
    console.error("admin-tags auth failure", error);
    return { accessToken: null, user: null, adminRole: null };
  }
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
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const url = new URL(request.url);
      const destinationId = (url.searchParams.get("destinationId") ?? "").trim();
      if (!destinationId) {
        return Response.json({ tags: [] }, { status: 200 });
      }
      return Response.json({ tags: listAdminFallbackTags(destinationId) }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(request.url);
    const destinationId = (url.searchParams.get("destinationId") ?? "").trim();
    if (!destinationId) {
      return Response.json({ tags: [] }, { status: 200 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfigSafe();
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
    console.error("destination-tags GET failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to fetch destination tags." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const payload = (await request.json()) as CreateTagPayload;
      const destinationId = (payload.destinationId ?? "").trim();
      const tag = normalizeTag(payload.tag ?? "");

      if (!destinationId || !tag) {
        return Response.json({ error: "destinationId and tag are required." }, { status: 400 });
      }

      addAdminFallbackTag(destinationId, tag);
      return Response.json({ success: true }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as CreateTagPayload;
    const destinationId = (payload.destinationId ?? "").trim();
    const tag = normalizeTag(payload.tag ?? "");

    if (!destinationId || !tag) {
      return Response.json({ error: "destinationId and tag are required." }, { status: 400 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfigSafe();
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
    console.error("destination-tags POST failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to add destination tag." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const payload = (await request.json()) as DeleteTagPayload;
      const destinationId = (payload.destinationId ?? "").trim();
      const tag = normalizeTag(payload.tag ?? "");

      if (!destinationId || !tag) {
        return Response.json({ error: "destinationId and tag are required." }, { status: 400 });
      }

      const removed = removeAdminFallbackTag(destinationId, tag);
      return Response.json({ success: removed }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as DeleteTagPayload;
    const destinationId = (payload.destinationId ?? "").trim();
    const tag = normalizeTag(payload.tag ?? "");

    if (!destinationId || !tag) {
      return Response.json({ error: "destinationId and tag are required." }, { status: 400 });
    }

    const { url: supabaseUrl, anonKey } = getSupabaseConfigSafe();
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
    console.error("destination-tags DELETE failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to remove destination tag." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const payload = (await request.json()) as UpdateTagPayload;
      const destinationId = (payload.destinationId ?? "").trim();
      const currentTag = normalizeTag(payload.currentTag ?? "");
      const nextTag = normalizeTag(payload.nextTag ?? "");

      if (!destinationId || !currentTag || !nextTag) {
        return Response.json({ error: "destinationId, currentTag, and nextTag are required." }, { status: 400 });
      }

      const renamed = renameAdminFallbackTag(destinationId, currentTag, nextTag);
      return Response.json({ success: renamed }, { status: 200 });
    }

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

    const { url: supabaseUrl, anonKey } = getSupabaseConfigSafe();
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
    console.error("destination-tags PATCH failed", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to rename destination tag." },
      { status: 500 },
    );
  }
}