import { cookies } from "next/headers";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("ha-access-token", "", { ...cookieOptions, maxAge: 0 });
  cookieStore.set("ha-refresh-token", "", { ...cookieOptions, maxAge: 0 });
  return Response.json({ ok: true });
}