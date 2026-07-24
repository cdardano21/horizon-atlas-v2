import { cookies } from "next/headers";
import { getSupabaseConfig } from "../../lib/supabase";

type FavoritePayload = {
  slugs?: string[];
};

const normalizeSlugs = (slugs: string[]) => Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));

async function getAuthedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ha-access-token")?.value;

  if (!accessToken) {
    return { accessToken: null, user: null };
  }

  const { url, anonKey } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { accessToken: null, user: null };
  }

  return { accessToken, user: await response.json() };
}

export async function GET() {
  try {
    const { accessToken, user } = await getAuthedUser();
    if (!accessToken || !user) {
      return Response.json({ authenticated: false, slugs: [] }, { status: 200 });
    }

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/favorites?select=slug&user_id=eq.${user.id}&order=created_at.asc`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json({ authenticated: false, slugs: [] }, { status: 200 });
    }

    const rows: Array<{ slug: string }> = await response.json();
    return Response.json({ authenticated: true, slugs: rows.map((row) => row.slug) });
  } catch {
    return Response.json({ authenticated: false, slugs: [] }, { status: 200 });
  }
}

export async function PUT(request: Request) {
  try {
    const { slugs = [] }: FavoritePayload = await request.json();
    const normalizedSlugs = normalizeSlugs(slugs);
    const { accessToken, user } = await getAuthedUser();

    if (!accessToken || !user) {
      return Response.json({ error: "Please sign in to sync favorites." }, { status: 401 });
    }

    const { url, anonKey } = getSupabaseConfig();

    await fetch(`${url}/rest/v1/favorites?user_id=eq.${user.id}`, {
      method: "DELETE",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
    });

    if (normalizedSlugs.length > 0) {
      const rows = normalizedSlugs.map((slug) => ({ user_id: user.id, slug }));

      const insertResponse = await fetch(`${url}/rest/v1/favorites`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(rows),
      });

      if (!insertResponse.ok) {
        return Response.json({ error: "Unable to save favorites." }, { status: insertResponse.status });
      }
    }

    return Response.json({ slugs: normalizedSlugs });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save favorites." },
      { status: 500 },
    );
  }
}