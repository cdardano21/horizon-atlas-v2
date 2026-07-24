"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthUser = {
  email?: string | null;
  user_metadata?: { name?: string | null };
};

export default function ProfileAuthSummary() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload: { user: AuthUser | null } = await response.json();

        if (!cancelled) {
          setUser(payload.user);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
        <div className="h-6 w-48 animate-pulse rounded-full bg-white/5" />
        <div className="mt-4 h-4 w-72 animate-pulse rounded-full bg-white/5" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Account</p>
        <h2 className="mt-4 text-2xl font-bold text-white">You are browsing as a guest</h2>
        <p className="mt-3 text-slate-400">Log in to sync favorites across devices and keep your shortlist with your account.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            Log in
          </Link>
          <Link href="/signup" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.name ?? user.email ?? "Account";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Account</p>
      <h2 className="mt-4 text-2xl font-bold text-white">Signed in as {displayName}</h2>
      <p className="mt-3 text-slate-400">Your account is connected. Favorites can now sync from this browser to Supabase.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/destinations" className="rounded-full border border-cyan-400 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10">
          Browse destinations
        </Link>
        <button type="button" onClick={handleLogout} className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Log out
        </button>
      </div>
    </div>
  );
}