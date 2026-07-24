import { cookies } from "next/headers";
import { getSupabaseConfig, isSupabaseConfigured } from "../../../lib/supabase";

type PlanningDraftPayload = {
  displayName?: string;
  homeCountry?: string;
  moveWindow?: string;
  planningNotes?: string;
};

type ProfileRow = {
  display_name: string | null;
  home_country: string | null;
  move_window: string | null;
  planning_notes: string | null;
};

type AuthUser = {
  id: string;
};

const EMPTY_DRAFT = {
  displayName: "",
  homeCountry: "",
  moveWindow: "",
  planningNotes: "",
};

async function getAuthedUser(): Promise<{ accessToken: string | null; user: AuthUser | null }> {
  if (!isSupabaseConfigured()) {
    return { accessToken: null, user: null };
  }

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

  return { accessToken, user: (await response.json()) as AuthUser };
}

export async function GET() {
  try {
    const { accessToken, user } = await getAuthedUser();

    if (!accessToken || !user) {
      return Response.json({ authenticated: false, draft: EMPTY_DRAFT }, { status: 200 });
    }

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(
      `${url}/rest/v1/app_user_profiles?select=display_name,home_country,move_window,planning_notes&user_id=eq.${user.id}&limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return Response.json({ authenticated: true, draft: EMPTY_DRAFT }, { status: 200 });
    }

    const rows = (await response.json()) as ProfileRow[];
    const row = rows[0];
    return Response.json(
      {
        authenticated: true,
        draft: {
          displayName: row?.display_name ?? "",
          homeCountry: row?.home_country ?? "",
          moveWindow: row?.move_window ?? "",
          planningNotes: row?.planning_notes ?? "",
        },
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ authenticated: false, draft: EMPTY_DRAFT }, { status: 200 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload: PlanningDraftPayload = await request.json();
    const { accessToken, user } = await getAuthedUser();

    if (!accessToken || !user) {
      return Response.json({ error: "Please sign in to sync your planning profile." }, { status: 401 });
    }

    const displayName = (payload.displayName ?? "").trim();
    const homeCountry = (payload.homeCountry ?? "").trim();
    const moveWindow = (payload.moveWindow ?? "").trim();
    const planningNotes = (payload.planningNotes ?? "").trim();

    const { url, anonKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/app_user_profiles?on_conflict=user_id`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        {
          user_id: user.id,
          display_name: displayName || null,
          home_country: homeCountry || null,
          move_window: moveWindow || null,
          planning_notes: planningNotes || null,
        },
      ]),
    });

    if (!response.ok) {
      return Response.json({ error: "Unable to sync profile fields." }, { status: response.status });
    }

    return Response.json(
      {
        synced: true,
        syncedFields: ["displayName", "homeCountry", "moveWindow", "planningNotes"],
        localOnlyFields: [],
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to sync profile fields." },
      { status: 500 },
    );
  }
}