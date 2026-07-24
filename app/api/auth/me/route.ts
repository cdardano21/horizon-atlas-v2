import { cookies } from "next/headers";
import { getSupabaseConfig } from "../../../lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("ha-access-token")?.value;

    if (!accessToken) {
      return Response.json({ user: null }, { status: 200 });
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
      return Response.json({ user: null }, { status: 200 });
    }

    const user = await response.json();
    return Response.json({ user });
  } catch {
    return Response.json({ user: null }, { status: 200 });
  }
}