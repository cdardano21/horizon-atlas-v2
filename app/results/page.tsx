import Link from "next/link";
import LifeMatchResultImage from "../components/LifeMatchResultImage";
import ResultsHistorySaver from "../components/ResultsHistorySaver";
import type { Destination } from "../lib/destinations";
import { getPublicDestinations } from "../lib/public-destinations";
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
  return raw.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
};

const parseDna = (value: string | string[] | undefined) => {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
};

const scoreDestination = (destination: Destination, selectedTags: string[]) => {
  const matchedTags = selectedTags.filter((tag) => destination.tags?.includes(tag));
  const rejectedTags = selectedTags.filter((tag) => !destination.tags?.includes(tag));
  return {
    destination,
    score: destination.match + matchedTags.length * 12 - rejectedTags.length * 4,
    matchedTags,
    rejectedTags,
  };
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const publicDestinations = await getPublicDestinations();
  const selectedTags = parseTags(params?.tags);
  const dnaPayload = parseDna(params?.dna);
  const dnaAnswers = dnaPayload ? deserializeRetirementDnaAnswers(dnaPayload) : {};
  const hasDnaAssessment = Object.keys(dnaAnswers).length > 0;
  const dnaRanking = hasDnaAssessment ? rankDestinationsForRetirementDna(publicDestinations, dnaAnswers) : null;
  const fallbackRanking = [...publicDestinations]
    .map((destination) => scoreDestination(destination, selectedTags))
    .sort((left, right) => right.score - left.score)
    .slice(0, 10);
  const profile = hasDnaAssessment ? dnaRanking?.profile ?? computeRetirementDnaProfile(dnaAnswers) : null;
  const dnaRanked = (dnaRanking?.ranked ?? []).slice(0, 10);
  const topMatch = dnaRanked[0];
  const remainingMatches = dnaRanked.slice(1);
  const compareHref = `/compare?slugs=${dnaRanked.slice(0, 3).map((item) => item.destination.slug).join(",")}`;

  if (!hasDnaAssessment || !profile || !topMatch) {
    return (
      <main className="min-h-screen bg-[#04162b] text-white">
        <section className="border-b border-white/10 bg-[#061b34] px-5 py-16 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#58c7c4]">Destination recommendations</p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">Start with Life Match for a recommendation set built around you.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#b9c8d4]">
              Without a completed assessment, these are broad catalog matches rather than personal recommendations.
            </p>
            <Link href="/life-match" className="mt-8 inline-flex min-h-12 items-center bg-[#e5b654] px-6 text-sm font-bold text-[#06172c] hover:bg-[#f0c66e]">
              Start Life Match <span aria-hidden="true" className="ml-3">&#8594;</span>
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-5 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 lg:px-10">
          {fallbackRanking.map((item, index) => (
            <article key={item.destination.slug} className="border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#58c7c4]">Catalog rank {index + 1}</span>
                <span className="text-sm font-semibold text-[#e5b654]">{Math.max(0, Math.round(item.score))}%</span>
              </div>
              <h2 className="mt-5 text-2xl text-white">{item.destination.city}, {item.destination.country}</h2>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#aebdca]">{item.destination.overview}</p>
              <Link href={`/destinations/${item.destination.slug}`} className="mt-6 inline-flex text-sm font-semibold text-[#7ed4d1] hover:text-white">View destination</Link>
            </article>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#04162b] text-white">
      <ResultsHistorySaver
        answersEncoded={dnaPayload}
        profile={profile}
        topSlugs={dnaRanked.map((item) => item.destination.slug)}
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-35"><LifeMatchResultImage destination={topMatch.destination} priority /></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#031326_0%,rgba(3,19,38,0.96)_42%,rgba(3,19,38,0.7)_70%,rgba(3,19,38,0.84)_100%)]" />
        <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] content-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,780px)_1fr] lg:px-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#58c7c4]">Your Life Match</p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-[0.98] text-white sm:text-6xl">Your priorities point somewhere meaningful.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#c4d1dc] sm:text-lg">
              We weighed all {profile.answeredCount} answers against {publicDestinations.length} destinations. These are your strongest evidence-backed matches and the tradeoffs worth understanding next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={compareHref} className="inline-flex min-h-12 items-center bg-[#e5b654] px-6 text-sm font-bold text-[#06172c] hover:bg-[#f0c66e]">Compare top 3</Link>
              <Link href="/life-match" className="inline-flex min-h-12 items-center border border-white/25 bg-white/[0.06] px-6 text-sm font-semibold text-white hover:border-[#58c7c4]">Revisit my answers</Link>
            </div>
          </div>

          <div className="self-end border-l border-white/15 pl-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#91a6b8]">Your strongest priorities</p>
            <div className="mt-5 space-y-4">
              {profile.topPriorities.map((priority) => (
                <div key={priority.id}>
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span>{priority.label}</span><span className="text-[#e5b654]">{priority.score}</span>
                  </div>
                  <div className="mt-2 h-1 bg-white/10"><div className="h-full bg-[#58c7c4]" style={{ width: `${priority.score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid overflow-hidden border border-[#e5b654]/30 bg-[#061b34] lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <div className="relative min-h-[330px] lg:min-h-[520px]">
            <LifeMatchResultImage destination={topMatch.destination} priority />
            <div className="absolute left-5 top-5 z-20 bg-[#e5b654] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#06172c]">Strongest match</div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#58c7c4]">No. 1 recommendation</p>
                <h2 className="mt-3 text-4xl leading-tight text-white sm:text-5xl">{topMatch.destination.city}</h2>
                <p className="mt-1 text-sm text-[#91a6b8]">{topMatch.destination.country}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-semibold text-[#e5b654]">{Math.max(0, Math.round(topMatch.score))}%</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#91a6b8]">Compatibility</p>
              </div>
            </div>

            <p className="mt-7 text-sm leading-7 text-[#c2cfda]">{topMatch.destination.overview}</p>

            <div className="mt-7 grid gap-5 border-y border-white/10 py-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#58c7c4]">Best aligned</p>
                <p className="mt-3 text-sm leading-6 text-[#d4dee6]">{topMatch.matchedPriorities.length ? topMatch.matchedPriorities.join(", ") : "Broad fit across your weighted profile."}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5b654]">Tradeoffs to review</p>
                <p className="mt-3 text-sm leading-6 text-[#d4dee6]">{topMatch.watchouts.length ? topMatch.watchouts.join(", ") : "No major conflicts surfaced in your top-priority dimensions."}</p>
              </div>
            </div>

            {topMatch.whyItFits.length ? <p className="mt-6 text-xs leading-6 text-[#91a6b8]">{topMatch.whyItFits[0]}</p> : null}
            <Link href={`/destinations/${topMatch.destination.slug}`} className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#43b4b0] px-6 text-sm font-bold text-[#04162b] hover:bg-[#61cbc7]">Explore {topMatch.destination.city}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#58c7c4]">Your shortlist</p>
            <h2 className="mt-2 text-3xl text-white">Nine more places worth a closer look</h2>
          </div>
          <p className="hidden max-w-sm text-right text-xs leading-5 text-[#8198ab] sm:block">Compatibility is relative to your weighted answers and available destination evidence.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {remainingMatches.map((item, index) => (
            <article key={item.destination.slug} className="group overflow-hidden border border-white/10 bg-[#061b34] transition hover:border-[#58c7c4]/50">
              <div className="relative aspect-[16/9]"><LifeMatchResultImage destination={item.destination} /></div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#58c7c4]">Match {index + 2}</p>
                    <h3 className="mt-2 text-2xl text-white">{item.destination.city}</h3>
                    <p className="mt-1 text-xs text-[#8198ab]">{item.destination.country}</p>
                  </div>
                  <p className="text-2xl font-semibold text-[#e5b654]">{Math.max(0, Math.round(item.score))}%</p>
                </div>

                <div className="mt-6 space-y-4 border-t border-white/10 pt-5 text-xs leading-5">
                  <div>
                    <p className="font-bold uppercase tracking-[0.12em] text-[#58c7c4]">Aligned</p>
                    <p className="mt-2 text-[#bdcad5]">{item.matchedPriorities.length ? item.matchedPriorities.join(", ") : "Broad overall fit."}</p>
                  </div>
                  <div>
                    <p className="font-bold uppercase tracking-[0.12em] text-[#d5b66f]">Watch</p>
                    <p className="mt-2 text-[#9eb1c1]">{item.watchouts.length ? item.watchouts.join(", ") : "No major top-priority conflicts surfaced."}</p>
                  </div>
                </div>

                <Link href={`/destinations/${item.destination.slug}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#7ed4d1] transition group-hover:text-white">View destination <span aria-hidden="true" className="ml-2">&#8594;</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#061b34] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.17em] text-[#58c7c4]">Assessment complete</p>
            <p className="mt-2 text-sm text-[#b9c8d4]">{profile.completionPercent}% complete, {RETIREMENT_DNA_TOTAL_QUESTIONS} of {RETIREMENT_DNA_TOTAL_QUESTIONS} decisions recorded.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={compareHref} className="inline-flex min-h-11 items-center border border-[#e5b654]/50 px-5 text-sm font-semibold text-[#e5b654] hover:bg-[#e5b654]/10">Compare top 3</Link>
            <Link href="/destinations" className="inline-flex min-h-11 items-center border border-white/15 px-5 text-sm font-semibold text-white hover:border-[#58c7c4]">Browse all destinations</Link>
          </div>
        </div>
      </section>
    </main>
  );
}