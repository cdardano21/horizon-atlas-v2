import Link from "next/link";
import ResultsHistorySaver from "../components/ResultsHistorySaver";
import RouteFrame from "../components/RouteFrame";
import type { Destination } from "../lib/destinations";
import { publicDestinations } from "../lib/public-destinations";
import { rankDestinationsForRetirementDna } from "../lib/recommendation-engine";
import {
  computeRetirementDnaProfile,
  deserializeRetirementDnaAnswers,
  RETIREMENT_DNA_TOTAL_QUESTIONS,
} from "../lib/retirement-dna";

type SearchParams = Record<string, string | string[] | undefined>;
type ResultsPageProps = {
  searchParams?: Promise<SearchParams>;
};

const parseTags = (value: string | string[] | undefined) => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const parseDna = (value: string | string[] | undefined) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
};

const scoreDestination = (destination: Destination, selectedTags: string[]) => {
  const matchedTags = selectedTags.filter((tag) => destination.tags?.includes(tag));
  const rejectedTags = selectedTags.filter((tag) => !destination.tags?.includes(tag));
  const score = destination.match + matchedTags.length * 12 - rejectedTags.length * 4;
  return {
    destination,
    score,
    matchedTags,
    rejectedTags,
  };
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedTags = parseTags(params?.tags);
  const dnaPayload = parseDna(params?.dna);
  const dnaAnswers = dnaPayload ? deserializeRetirementDnaAnswers(dnaPayload) : {};
  const hasDnaAssessment = Object.keys(dnaAnswers).length > 0;
  const dnaRanking = hasDnaAssessment ? rankDestinationsForRetirementDna(publicDestinations, dnaAnswers) : null;
  const fallbackRanking = [...publicDestinations]
    .map((destination) => scoreDestination(destination, selectedTags))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  const profile = hasDnaAssessment ? dnaRanking?.profile ?? computeRetirementDnaProfile(dnaAnswers) : null;
  const dnaRanked = (dnaRanking?.ranked ?? []).slice(0, 10);

  return (
    <RouteFrame
      eyebrow={hasDnaAssessment ? "Retirement DNA results" : "Personal Top 10"}
      title={hasDnaAssessment ? "Your best retirement matches across the DestinationFinderAI catalog" : "Your best matches across the DestinationFinderAI catalog"}
      description={
        hasDnaAssessment && profile
          ? `Your ${profile.answeredCount}-answer Retirement DNA profile has been weighted against the full catalog of ${publicDestinations.length} destinations to generate a recommendation set with strengths and tradeoffs.`
          : selectedTags.length > 0
            ? `Results are weighted around ${selectedTags.join(", ")} and ranked against the full catalog of ${publicDestinations.length} destinations.`
            : `No questionnaire tags were provided, so these are the strongest overall matches from the full catalog of ${publicDestinations.length} destinations.`
      }
      primaryAction={{ href: "/life-match", label: "Refine my questionnaire" }}
      secondaryAction={{ href: "/destinations", label: "Browse all destinations" }}
    >
      {hasDnaAssessment && profile ? (
        <ResultsHistorySaver
          answersEncoded={dnaPayload}
          profile={profile}
          topSlugs={dnaRanked.slice(0, 10).map((item) => item.destination.slug)}
        />
      ) : null}

      {hasDnaAssessment && profile ? (
        <div className="mb-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Assessment profile</p>
            <h2 className="mt-4 text-2xl font-bold text-white">Retirement DNA snapshot</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Completed</p>
                <p className="mt-2 text-3xl font-black text-white">{profile.completionPercent}%</p>
                <p className="mt-2 text-sm text-slate-400">{profile.answeredCount} of {RETIREMENT_DNA_TOTAL_QUESTIONS} questions answered</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Top priorities</p>
                <p className="mt-2 text-sm text-white">{profile.topPriorities.map((item) => item.label).join(" • ")}</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Match signals</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.derivedTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">What the engine prioritized</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {profile.topPriorities.map((priority) => (
                <div key={priority.id} className="rounded-3xl bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-white">{priority.label}</p>
                    <span className="text-cyan-300">{priority.score}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-950/80">
                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${priority.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {hasDnaAssessment ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dnaRanked.map((item, index) => (
            <article
              key={item.destination.slug}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-cyan-400/50"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">#{index + 1}</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{Math.max(0, Math.round(item.score))}% compatibility</span>
              </div>
              <div className="mt-5">
                <h2 className="text-2xl font-semibold text-white">{item.destination.city}, {item.destination.country}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.destination.overview}</p>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-400">
                <div>
                  <p className="text-white">Best aligned priorities</p>
                  <p className="mt-1">{item.matchedPriorities.length ? item.matchedPriorities.join(", ") : "Broad overall fit across your profile."}</p>
                </div>
                <div>
                  <p className="text-white">Tradeoffs to review</p>
                  <p className="mt-1">{item.watchouts.length ? item.watchouts.join(", ") : "No major conflicts surfaced in the top-priority dimensions."}</p>
                </div>
                <div>
                  <p className="text-white">Why it matched</p>
                  <p className="mt-1">{item.whyItFits.length ? item.whyItFits.join(" ") : "This destination showed steady strength across multiple important dimensions."}</p>
                </div>
              </div>
              <Link
                href={`/destinations/${item.destination.slug}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-cyan-400 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                View destination details
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fallbackRanking.map((item, index) => (
            <article
              key={item.destination.slug}
              className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-cyan-400/50"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">#{index + 1}</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{Math.max(0, Math.round(item.score))}% compatibility</span>
              </div>
              <div className="mt-5">
                <h2 className="text-2xl font-semibold text-white">{item.destination.city}, {item.destination.country}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">{item.destination.overview}</p>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-400">
                <div>
                  <p className="text-white">Pros</p>
                  <p className="mt-1">{item.matchedTags.length ? item.matchedTags.join(", ") : "Broad overall fit and strong baseline retirement profile."}</p>
                </div>
                <div>
                  <p className="text-white">Cons</p>
                  <p className="mt-1">{item.rejectedTags.length ? item.rejectedTags.join(", ") : "No major preference conflicts surfaced in this pass."}</p>
                </div>
                <div>
                  <p className="text-white">Why it matched</p>
                  <p className="mt-1">This city rose to the top because its existing destination tags and overall Horizon score aligned with your selected priorities.</p>
                </div>
                <div>
                  <p className="text-white">Why it was not perfect</p>
                  <p className="mt-1">Every recommendation is still a tradeoff; use the detail page to verify climate, budget, and lifestyle fit before deciding.</p>
                </div>
              </div>
              <Link
                href={`/destinations/${item.destination.slug}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-cyan-400 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                View destination details
              </Link>
            </article>
          ))}
        </div>
      )}
    </RouteFrame>
  );
}