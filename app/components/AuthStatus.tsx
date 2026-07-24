"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFavorites } from "./favorites";

type AuthUser = {
  email?: string | null;
  user_metadata?: { name?: string | null };
};

type AuthStatusProps = {
  variant?: "desktop" | "mobile";
};

export default function AuthStatus({ variant = "desktop" }: AuthStatusProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { favoriteSlugs } = useFavorites();
  const layoutClass = variant === "desktop" ? "hidden items-center gap-3 lg:flex" : "flex flex-col gap-3";
  const favoriteCount = favoriteSlugs.length;

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
      <div className={layoutClass}>
        <span className="h-9 w-24 animate-pulse rounded-full bg-white/5" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={layoutClass}>
        <Link
          href="/login"
          className={variant === "desktop" ? "rounded-full border border-white/10 bg-slate-900/80 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white" : "rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white text-center"}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className={variant === "desktop" ? "rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400" : "rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 text-center"}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const displayName = user.user_metadata?.name ?? user.email ?? "Account";

  return (
    <div className={layoutClass}>
      {favoriteCount > 0 ? (
        <Link
          href="/profile"
          className={variant === "desktop" ? "rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200 transition hover:bg-cyan-500/15" : "rounded-3xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 text-center transition hover:bg-cyan-500/15"}
        >
          {favoriteCount} saved
        </Link>
      ) : null}
      <Link
        href="/profile"
        className={variant === "desktop" ? "rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200" : "rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200 text-center"}
      >
        {displayName}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className={variant === "desktop" ? "rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400" : "rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"}
      >
        Log out
      </button>
    </div>
  );
}
