import Image from "next/image";
import Link from "next/link";
import { sanitizeSummary, toConsumerCopy } from "../lib/consumer-copy";
import { sortDestinationsForFeaturedPlacement } from "../lib/flagship-destinations";
import { getPublicDestinations } from "../lib/public-destinations";
import { COSTA_DEL_SOL_HERO_IMAGE, getDestinationImageUrl, hasVerifiedDestinationImage } from "../lib/imageFallback";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../lib/source-links";
import ExternalLinkIcon from "./ExternalLinkIcon";
import FavoriteButton from "./FavoriteButton";
import { getDestinationCardFacts, getFactSourceDomain, getFactSourcePublisherUrl } from "./destinationCardFacts";

export default async function FeaturedDestinations() {
  const publicDestinations = await getPublicDestinations();
  const featured = sortDestinationsForFeaturedPlacement(publicDestinations).slice(0, 4);

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-6 py-28 sm:px-8">
      <div className="mb-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="atlas-kicker">Find places that fit your life</p>
          <h2 className="mt-4 max-w-4xl text-5xl leading-tight text-[var(--atlas-ink)]">Curated destinations. Real data. A clearer picture of your next chapter.</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--atlas-muted)]">
            Start with the places that already feel aligned, then use the facts and score signals to test whether the day-to-day life really fits.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,251,241,0.98),rgba(248,236,214,0.88))] p-6 shadow-[var(--atlas-shadow)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-gold)]">Why this matters</p>
          <p className="mt-4 text-2xl font-semibold leading-10 text-[var(--atlas-ink)]">
            You are not choosing a vacation. You are choosing a place that could support the life you want to build.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/destinations"
              className="atlas-button-primary"
            >
              Explore all destinations
            </Link>
            <Link
              href="/compare"
              className="atlas-button-secondary"
            >
              Open comparison studio
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-7 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.84)] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">How to use this section</p>
        <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">
          Start with story-level fit, then use the facts and score signals to pressure-test where your routine will actually work.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {featured.map((place, index) => {
          const cardFacts = getDestinationCardFacts(place);
          const isLead = index === 0;

          return (
          <article key={place.slug} className={`overflow-hidden rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] shadow-[0_26px_54px_-36px_rgba(39,33,22,0.75)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(31,95,99,0.42)] ${isLead ? "lg:col-span-6" : "lg:col-span-3"}`}>
            {hasVerifiedDestinationImage(place) ? (
              <div className="relative h-64 overflow-hidden bg-slate-900/10">
                <Image
                  src={getDestinationImageUrl(place.images[0] ?? { src: "", alt: place.city }, place)}
                  alt={place.images[0]?.alt || place.city}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142224]/75 via-[#142224]/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-[#fffaf2]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#f8dfb4]">{isLead ? "Editor’s relocation pick" : "Featured city"}</p>
                      <p className="text-xl font-semibold">{place.city}</p>
                      <p className="text-sm text-[#f0e6d7]">{place.country}</p>
                    </div>
                    <span className="rounded-full bg-[rgba(242,217,173,0.28)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#fff5df]">
                      {cardFacts.overallScore} overall
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-64 overflow-hidden bg-slate-900/10">
                <Image
                  src={getDestinationImageUrl({ src: COSTA_DEL_SOL_HERO_IMAGE, alt: `${place.city} editorial fallback` }, place)}
                  alt={`${place.city} editorial fallback view`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#142224]/78 via-[#142224]/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-[#fffaf2]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#f8dfb4]">{isLead ? "Editor’s relocation pick" : "Featured city"}</p>
                <p className="mt-2 text-xl font-semibold">{place.city}</p>
                <p className="text-sm text-[#f0e6d7]">{place.country}</p>
                <p className="mt-4 inline-block rounded-full bg-[rgba(242,217,173,0.15)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#f8dfb4]">
                  Imagery pending verification
                </p>
                </div>
              </div>
            )}
            <div className="p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--atlas-accent)]">{place.tags?.slice(0, 2).join(" • ")}</p>
              <p className="mt-4 text-xl font-semibold text-[var(--atlas-ink)]">{place.description}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--atlas-muted)]">{sanitizeSummary(cardFacts.summary)}</p>
              {isLead ? (
                <div className="mt-5 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.6)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">Why it enters the shortlist</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">
                    Strong first-glance fit for people who want a place that can support everyday routines, not just a beautiful weekend.
                  </p>
                </div>
              ) : null}
              <div className="mt-4 grid gap-2 text-xs">
                {cardFacts.facts.map((fact, index) => {
                  const safeSourceUrl = sanitizeExternalSourceUrl(fact.sourceUrl);
                  const sourceHref = resolveSourceHref(fact.sourceUrl, [fact.label, place.city, place.country]);
                  const publisherUrl = safeSourceUrl ? getFactSourcePublisherUrl(safeSourceUrl) : null;
                  const sourceDomain = safeSourceUrl ? getFactSourceDomain(safeSourceUrl) : "web search";

                  return (
                    <div key={`${fact.label}-${fact.value}-${index}`} className="rounded-xl bg-[rgba(29,48,51,0.93)] px-3 py-2 text-[#f8f0e2]">
                      <p>{fact.label}: {toConsumerCopy(fact.value)}</p>
                      {fact.sourceUrl ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <a href={sourceHref} target="_blank" rel="noopener noreferrer" aria-label={`Open source evidence for ${fact.label}`} title={`Open source evidence for ${fact.label}`} className="inline-flex items-center gap-1 rounded-full border border-transparent px-1 py-0.5 text-[11px] uppercase tracking-[0.2em] leading-none text-[#f2d9ad] transition hover:text-[#fdebcf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d9ad]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d3033]">
                            <span className="inline-flex items-center gap-1">
                              {safeSourceUrl ? "Source" : "Source search"}
                              <ExternalLinkIcon className="h-2.5 w-2.5" />
                            </span>
                          </a>
                          {publisherUrl ? (
                            <a href={publisherUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open publisher site ${sourceDomain}`} title={`Open publisher site ${sourceDomain}`} className="rounded-full border border-[#f2d9ad]/30 bg-[#f2d9ad]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] leading-none text-[#fdebcf] transition hover:border-[#f2d9ad] hover:text-[#fff4e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d9ad]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d3033]">
                              <span className="inline-flex items-center gap-1">
                                {sourceDomain}
                                <ExternalLinkIcon className="h-2.5 w-2.5" />
                              </span>
                            </a>
                          ) : (
                            <span className="rounded-full border border-[#f2d9ad]/30 bg-[#f2d9ad]/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#fdebcf]">
                              {sourceDomain}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.6)] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--atlas-accent)]">Living Here Scorecard</p>
                <div className="mt-3 grid gap-2">
                  {cardFacts.scoreSignals.map((item) => (
                    <div key={item.category} className="flex items-center justify-between rounded-xl bg-[rgba(245,238,226,0.9)] px-3 py-2 text-xs">
                      <span className="text-[var(--atlas-muted)]">{item.category}</span>
                      <span className="font-semibold text-[var(--atlas-accent)]">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <FavoriteButton slug={place.slug} label="Save city" />
                {isLead ? (
                  <Link
                    href={`/compare?slugs=${encodeURIComponent(place.slug)}`}
                    className="atlas-button-secondary px-4 py-2"
                  >
                    Compare this city
                  </Link>
                ) : null}
              </div>
              <Link
                href={`/destinations/${place.slug}`}
                className="atlas-button-primary mt-8 px-5 py-3"
              >
                View details
              </Link>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
