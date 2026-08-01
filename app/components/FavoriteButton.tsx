"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { saveFavoriteSlugs, useFavorites } from "./favorites";

type StatusTone = "success" | "warning" | "error";

type StatusMessage = {
  text: string;
  tone: StatusTone;
};

type FavoriteButtonProps = {
  slug: string;
  label: string;
  className?: string;
};

export default function FavoriteButton({ slug, label, className = "" }: FavoriteButtonProps) {
  const { favoriteSlugs, isFavorite } = useFavorites();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const active = isFavorite(slug);

  useEffect(() => {
    if (!status) return;

    const timeoutId = window.setTimeout(() => setStatus(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  const handleToggle = async (event?: MouseEvent<HTMLButtonElement>) => {
    if (isSaving) return;
    event?.preventDefault();
    event?.stopPropagation();
    setIsSaving(true);
    setStatus(null);
    const nextSlugs = active ? favoriteSlugs.filter((item) => item !== slug) : [...favoriteSlugs, slug];
    try {
      const synced = await saveFavoriteSlugs(nextSlugs);
      setStatus({
        text: synced ? "Saved to your account." : "Saved locally. Sign in to sync.",
        tone: synced ? "success" : "warning",
      });
    } catch {
      setStatus({ text: "Could not save right now. Try again.", tone: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const statusClass =
    status?.tone === "success"
      ? "text-emerald-300"
      : status?.tone === "warning"
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <div>
      <button
        type="button"
        disabled={isSaving}
        aria-pressed={active}
        onClick={(event) => void handleToggle(event)}
        className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${active ? "border-cyan-400 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400 hover:text-cyan-200"} ${className}`}
      >
        {isSaving ? "Saving..." : active ? "Saved" : label}
      </button>
      {status ? <p className={`mt-2 text-xs ${statusClass}`}>{status.text}</p> : null}
    </div>
  );
}