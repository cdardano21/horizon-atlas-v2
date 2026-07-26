import { cookies } from "next/headers";
import { enrichedDestinations } from "./destination-enrichment";
import { getSupabaseConfig } from "./supabase";

type ProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: { name?: string | null };
};

export type ProfileSnapshot = {
  authenticated: boolean;
  user: ProfileUser | null;
  favoriteSlugs: string[];
  favoriteDestinations: typeof enrichedDestinations;
};

export async function getProfileSnapshot(): Promise<ProfileSnapshot> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ha-access-token")?.value;

  if (!accessToken) {
    return {
      authenticated: false,
      user: null,
      favoriteSlugs: [],
      favoriteDestinations: [],
    };
  }

  try {
    const { url, anonKey } = getSupabaseConfig();

    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!userResponse.ok) {
      return {
        authenticated: false,
        user: null,
        favoriteSlugs: [],
        favoriteDestinations: [],
      };
    }

    const user: ProfileUser = await userResponse.json();

    const favoritesResponse = await fetch(
      `${url}/rest/v1/favorites?select=slug&user_id=eq.${user.id}&order=created_at.asc`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    const favoriteSlugs = favoritesResponse.ok
      ? ((await favoritesResponse.json()) as Array<{ slug: string }>).map((row) => row.slug)
      : [];

    return {
      authenticated: true,
      user,
      favoriteSlugs,
      favoriteDestinations: enrichedDestinations.filter((destination) => favoriteSlugs.includes(destination.slug)),
    };
  } catch {
    return {
      authenticated: false,
      user: null,
      favoriteSlugs: [],
      favoriteDestinations: [],
    };
  }
}
