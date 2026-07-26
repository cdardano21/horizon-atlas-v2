"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Destination } from "../lib/destinations";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../lib/source-links";
import ExternalLinkIcon from "./ExternalLinkIcon";
import { getDestinationCardFacts, getFactSourceDomain, getFactSourcePublisherUrl } from "./destinationCardFacts";
import {
  fetchSyncedAssessmentRecords,
  getSavedAssessmentRecords,
  mergeAssessmentRecords,
  type SavedAssessmentRecord,
} from "../lib/assessment-records";
import FavoritesPanel from "./FavoritesPanel";
import ProfilePlanningPanel from "./ProfilePlanningPanel";
import ProfileAuthSummary from "./ProfileAuthSummary";
import type { ProfileSnapshot } from "../lib/profile-data";

type ProfileClientProps = {
  destinations: Destination[];
  profile: ProfileSnapshot;
};

export default function ProfileClient({ destinations, profile }: ProfileClientProps) {
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessmentRecord[]>(() => getSavedAssessmentRecords());
  const [assessmentSyncLabel, setAssessmentSyncLabel] = useState("Retirement DNA sessions stored on this device and ready to sync later.");

  useEffect(() => {
    let cancelled = false;

    const loadSyncedHistory = async () => {
      try {
        const localRecords = getSavedAssessmentRecords();
        const payload = await fetchSyncedAssessmentRecords();

        if (cancelled) return;

        if (!payload.authenticated) {
          setSavedAssessments(localRecords);
          setAssessmentSyncLabel("Retirement DNA sessions stored on this device and ready to sync later.");
          return;
        }

        const merged = mergeAssessmentRecords(localRecords, payload.records);
        setSavedAssessments(merged);
        setAssessmentSyncLabel("Assessment history synced from Supabase and merged with this browser.");
      } catch {
        if (cancelled) return;
        setSavedAssessments(getSavedAssessmentRecords());
        setAssessmentSyncLabel("Assessment history available locally. Sync will resume once Supabase is reachable.");
      }
    };

    void loadSyncedHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const savedAssessmentCount = savedAssessments.length;
  const recommendationHistoryCount = savedAssessments.reduce((count, assessment) => count + (assessment.topSlugs.length > 0 ? 1 : 0), 0);
  const personalizedCollections = useMemo(() => {
    const collections = new Map<string, { title: string; slugs: string[]; description: string }>();

    savedAssessments.forEach((assessment) => {
      const topPriority = assessment.profile.topPriorities[0]?.label ?? "Balanced fit";
      const collectionKey = topPriority;

      if (!collections.has(collectionKey)) {
        collections.set(collectionKey, {
          title: topPriority,
          slugs: [],
          description: `Cities that repeatedly align with your ${topPriority.toLowerCase()} priority pattern.`,
        });
      }

      const target = collections.get(collectionKey);
      if (!target) return;

      assessment.topSlugs.forEach((slug) => {
        if (!target.slugs.includes(slug)) {
          target.slugs.push(slug);
        }
      });
    });

    return Array.from(collections.values()).slice(0, 3);
  }, [savedAssessments]);

  return (
    <div className="space-y-6">
      <ProfileAuthSummary />

      {profile.authenticated ? (
        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Synced from Supabase</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {profile.user?.user_metadata?.name ?? profile.user?.email ?? "Your account"}
              </h2>
              <p className="mt-2 text-slate-300">
                {profile.favoriteSlugs.length > 0
                  ? `${profile.favoriteSlugs.length} favorites synced across your account.`
                  : "No favorites have been saved to Supabase yet."}
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              Account connected
            </div>
          </div>
          {profile.favoriteDestinations.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.favoriteDestinations.map((destination) => (
                <article key={destination.slug} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
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
                              <div key={`${fact.label}-${fact.value}-${index}`} className="rounded-xl bg-white/5 px-3 py-2 text-slate-200">
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
                        <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
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
                  <Link href={`/destinations/${destination.slug}`} className="mt-4 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                    Open detail page
                  </Link>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Saved DNA profiles</p>
          <p className="mt-3 text-4xl font-black text-white">{savedAssessmentCount}</p>
          <p className="mt-2 text-sm text-slate-400">{assessmentSyncLabel}</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Recommendation history</p>
          <p className="mt-3 text-4xl font-black text-white">{recommendationHistoryCount}</p>
          <p className="mt-2 text-sm text-slate-400">Completed recommendation sets you can revisit as your priorities evolve.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Saved favorites</p>
          <p className="mt-3 text-4xl font-black text-white">{profile.favoriteSlugs.length}</p>
          <p className="mt-2 text-sm text-slate-400">Destination shortlist currently connected to your profile and browser state.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Collections</p>
          <p className="mt-3 text-4xl font-black text-white">{personalizedCollections.length}</p>
          <p className="mt-2 text-sm text-slate-400">Priority-driven clusters of destinations generated from your saved assessment history.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <h2 className="text-2xl font-bold text-white">Recommendation history</h2>
          <p className="mt-3 text-slate-400">Revisit completed Retirement DNA profiles, reopen result sets, and observe how your priorities change over time.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            {savedAssessments.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-4 text-slate-400">No saved Retirement DNA results yet. Complete the assessment once and your dashboard history will start building automatically.</div>
            ) : savedAssessments.slice(0, 4).map((assessment, index) => (
              <article key={assessment.id} className="rounded-3xl bg-white/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Assessment #{savedAssessments.length - index}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{assessment.profile.topPriorities.map((item) => item.label).join(" • ") || "Balanced retirement profile"}</p>
                    <p className="mt-2 text-sm text-slate-400">Saved {new Date(assessment.createdAt).toLocaleDateString()} with {assessment.profile.answeredCount} answered questions.</p>
                  </div>
                  <Link href={`/results?dna=${encodeURIComponent(assessment.answersEncoded)}`} className="rounded-full border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10">
                    Reopen results
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {assessment.topSlugs.slice(0, 4).map((slug) => {
                    const destination = destinations.find((item) => item.slug === slug);
                    return destination ? (
                      <span key={slug} className="rounded-full bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                        {destination.city}
                      </span>
                    ) : null;
                  })}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Need a fresh shortlist? <Link href="/life-match" className="text-cyan-300 hover:text-cyan-200">Run Life Match again</Link>.
          </p>
        </div>

        <FavoritesPanel destinations={destinations} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Personalized collections</p>
          <h2 className="mt-4 text-2xl font-bold text-white">Destination clusters shaped by your own history</h2>
          <div className="mt-6 space-y-4">
            {personalizedCollections.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-5 text-slate-400">Collections appear after you save assessment history. They group recurring recommendation patterns into practical shortlists.</div>
            ) : personalizedCollections.map((collection) => (
              <article key={collection.title} className="rounded-3xl bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">{collection.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{collection.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {collection.slugs.slice(0, 5).map((slug) => {
                    const destination = destinations.find((item) => item.slug === slug);
                    return destination ? (
                      <Link key={slug} href={`/destinations/${slug}`} className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200">
                        {destination.city}
                      </Link>
                    ) : null;
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        <ProfilePlanningPanel />
      </div>
    </div>
  );
}