"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Destination } from "../lib/destinations";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../lib/source-links";
import ExternalLinkIcon from "./ExternalLinkIcon";
import { getDestinationCardFacts, getFactSourceDomain, getFactSourcePublisherUrl } from "./destinationCardFacts";
import { buildCompareUrl, buildFavoritesShareUrl, saveFavoriteSlugs, useFavorites } from "./favorites";

type StatusTone = "success" | "warning" | "error";

type StatusMessage = {
  text: string;
  tone: StatusTone;
};

type FavoritesPanelProps = {
  destinations: Destination[];
};

export default function FavoritesPanel({ destinations }: FavoritesPanelProps) {
  const router = useRouter();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [shareStatus, setShareStatus] = useState<StatusMessage | null>(null);
  const { favoriteSlugs } = useFavorites();
  const favoriteDestinations = destinations.filter((destination) => favoriteSlugs.includes(destination.slug));
  const compareHref = buildCompareUrl(favoriteSlugs.slice(0, 4));
  const shareHref = buildFavoritesShareUrl(favoriteSlugs);

  useEffect(() => {
    if (!shareStatus) return;

    const timeoutId = window.setTimeout(() => setShareStatus(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [shareStatus]);

  useEffect(() => {
    if (!status) return;

    const timeoutId = window.setTimeout(() => setStatus(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  const handleCopyShareLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await window.navigator.clipboard.writeText(`${window.location.origin}${shareHref}`);
      setShareStatus({ text: "Share link copied.", tone: "success" });
    } catch {
      setShareStatus({ text: "Could not copy link. Try again.", tone: "error" });
    }
  };

  const handleRemoveFavorite = async (slug: string) => {
    if (pendingSlug || isClearing) return;
    setPendingSlug(slug);
    setStatus(null);
    try {
      const synced = await saveFavoriteSlugs(favoriteSlugs.filter((item) => item !== slug));
      setStatus({
        text: synced ? "Favorite removed and synced." : "Favorite removed locally.",
        tone: synced ? "success" : "warning",
      });
      router.refresh();
    } catch {
      setStatus({ text: "Could not update favorites. Try again.", tone: "error" });
    } finally {
      setPendingSlug(null);
    }
  };

  const handleClearFavorites = async () => {
    if (pendingSlug || isClearing) return;
    setIsClearing(true);
    setStatus(null);
    try {
      const synced = await saveFavoriteSlugs([]);
      setStatus({
        text: synced ? "Favorites cleared and synced." : "Favorites cleared locally.",
        tone: synced ? "success" : "warning",
      });
      router.refresh();
    } catch {
      setStatus({ text: "Could not clear favorites. Try again.", tone: "error" });
    } finally {
      setIsClearing(false);
    }
  };

  const shareStatusClass =
    shareStatus?.tone === "success"
      ? "text-emerald-300"
      : shareStatus?.tone === "warning"
        ? "text-amber-300"
        : "text-rose-300";

  const statusClass =
    status?.tone === "success"
      ? "text-emerald-300"
      : status?.tone === "warning"
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
        <h2 className="text-2xl font-bold text-white">Favorites</h2>
        <p className="mt-3 text-slate-400">Saved cities live in your browser for now, so your shortlist follows you while you explore.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={compareHref} className="rounded-full border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10">
            Compare favorites
          </Link>
          <button type="button" onClick={handleCopyShareLink} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200">
            Copy share link
          </button>
          <button
            type="button"
            disabled={isClearing || pendingSlug !== null}
            onClick={() => void handleClearFavorites()}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isClearing ? "Saving..." : "Clear all"}
          </button>
        </div>
        {shareStatus ? <p className={`mt-3 text-xs ${shareStatusClass}`}>{shareStatus.text}</p> : null}
        {status ? <p className={`mt-2 text-xs ${statusClass}`}>{status.text}</p> : null}
        <p className="mt-4 text-sm text-slate-500">Shareable profile link: {shareHref}</p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
        <h2 className="text-2xl font-bold text-white">Saved cities</h2>
        {favoriteDestinations.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {favoriteDestinations.map((destination) => (
              <article key={destination.slug} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                {(() => {
                  const cardFacts = getDestinationCardFacts(destination);

                  return (
                    <>
                      <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">{destination.country}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{destination.city}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{cardFacts.summary}</p>
                      <div className="mt-4 grid gap-2 text-xs">
                        {cardFacts.facts.map((fact, index) => {
                          const safeSourceUrl = sanitizeExternalSourceUrl(fact.sourceUrl);
                          const sourceHref = resolveSourceHref(fact.sourceUrl, [fact.label, destination.city, destination.country]);
                          const publisherUrl = safeSourceUrl ? getFactSourcePublisherUrl(safeSourceUrl) : null;
                          const sourceDomain = safeSourceUrl ? getFactSourceDomain(safeSourceUrl) : "web search";

                          return (
                            <div key={`${fact.label}-${fact.value}-${index}`} className="rounded-xl bg-slate-950/80 px-3 py-2 text-slate-200">
                              <p>{fact.label}: {fact.value}</p>
                              {fact.sourceUrl ? (
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <a href={sourceHref} target="_blank" rel="noopener noreferrer" aria-label={`Open source evidence for ${fact.label}`} title={`Open source evidence for ${fact.label}`} className="inline-flex items-center gap-1 rounded-full border border-transparent px-1 py-0.5 text-[11px] uppercase tracking-[0.2em] leading-none text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                                    <span className="inline-flex items-center gap-1">
                                      {safeSourceUrl ? "Source" : "Source search"}
                                      <ExternalLinkIcon className="h-2.5 w-2.5" />
                                    </span>
                                  </a>
                                  {publisherUrl ? (
                                    <a href={publisherUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open publisher site ${sourceDomain}`} title={`Open publisher site ${sourceDomain}`} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] leading-none text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                                      <span className="inline-flex items-center gap-1">
                                        {sourceDomain}
                                        <ExternalLinkIcon className="h-2.5 w-2.5" />
                                      </span>
                                    </a>
                                  ) : (
                                    <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                                      {sourceDomain}
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Top score signals</p>
                        {cardFacts.scoreSignals.map((score) => (
                          <div key={score.category} className="flex items-center justify-between text-xs text-slate-200">
                            <span>{score.category}</span>
                            <span className="font-semibold text-cyan-200">{score.score}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/destinations/${destination.slug}`} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                    Open detail page
                  </Link>
                  <button
                    type="button"
                    disabled={isClearing || pendingSlug === destination.slug}
                    onClick={() => void handleRemoveFavorite(destination.slug)}
                    className="text-sm font-semibold text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pendingSlug === destination.slug ? "Saving..." : "Remove"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
            No cities saved yet. Use the save buttons on destination cards and detail pages to build a shortlist.
          </div>
        )}
      </div>
    </div>
  );
}