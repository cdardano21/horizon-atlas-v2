import { cookies } from "next/headers";
import { getSupabaseConfig } from "../../../lib/supabase";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const { url, anonKey } = getSupabaseConfig();

    const response = await fetch(`${url}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        data: { name },
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: payload?.msg ?? payload?.error_description ?? "Unable to create account." },
        { status: response.status },
      );
    }

    if (payload?.session?.access_token) {
      const cookieStore = await cookies();
      cookieStore.set("ha-access-token", payload.session.access_token, {
        ...cookieOptions,
        maxAge: payload.session.expires_in ?? 3600,
      });
      cookieStore.set("ha-refresh-token", payload.session.refresh_token ?? "", {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return Response.json({
      user: payload.user,
      session: payload.session ?? null,
      needsConfirmation: !payload.session,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 500 },
    );
  }
}