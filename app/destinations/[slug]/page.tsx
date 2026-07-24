import Image from "next/image";
import { getDestinationContent } from "../../lib/destination-content";
import { getDestinationIntelligence } from "../../lib/destination-intelligence";
import { getDestinationImageUrl } from "../../lib/imageFallback";
import { getDestinationMemberDetails, getDestinationResearchLinks } from "../../lib/member-details";
import { toYouTubeEmbedUrl } from "../../lib/youtube";
import DestinationGallery from "../../components/DestinationGallery";
import FavoriteButton from "../../components/FavoriteButton";
import Link from "next/link";

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

const toResourceGroupsFromSupabase = (
  links: Array<{ category: string; label: string; provider: string | null; url: string }>,
) => {
  const byCategory = (category: string[]) =>
    links
      .filter((item) => category.includes(item.category))
      .map((item) => ({
        label: item.label,
        href: item.url,
        note: item.provider ? `Source: ${item.provider}` : "Source link",
      }));

  return [
    { title: "Rentals", items: byCategory(["rentals"]) },
    { title: "Healthcare", items: byCategory(["healthcare"]) },
    { title: "Restaurants", items: byCategory(["restaurants"]) },
    { title: "Taxes", items: byCategory(["taxes"]) },
    { title: "Visas", items: byCategory(["visas"]) },
    { title: "Relocation", items: byCategory(["guides", "maps", "government"]) },
  ];
};

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;
  const content = await getDestinationContent(slug);
  const destination = content?.destination;

  if (!destination) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-8 py-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <h1 className="text-4xl font-black">Destination not found</h1>
          <p className="mt-4 text-slate-400">Try returning to the homepage and selecting another destination.</p>
        </div>
      </main>
    );
  }

  const heroBackground = getDestinationImageUrl(destination.images[0] ?? { src: "", alt: destination.city, caption: destination.city }, destination);
  const intelligence = getDestinationIntelligence(destination);
  const defaultResourceGroups = [
    { title: "Rentals", items: intelligence.resources.rentals },
    { title: "Healthcare", items: intelligence.resources.healthcare },
    { title: "Restaurants", items: intelligence.resources.restaurants },
    { title: "Taxes", items: intelligence.resources.taxes },
    { title: "Visas", items: intelligence.resources.visas },
    { title: "Relocation", items: intelligence.resources.relocation },
  ];
  const supabaseResourceGroups = content?.resourceLinks?.length
    ? toResourceGroupsFromSupabase(content.resourceLinks)
    : null;
  const resourceGroups = supabaseResourceGroups ?? defaultResourceGroups;
  const mapMedia = content?.mediaAssets.find((item) => item.kind === "map" || item.kind === "streetview");
  const mapEmbedUrl = mapMedia?.url?.includes("output=embed") || mapMedia?.url?.includes("/maps/embed")
    ? mapMedia.url
    : intelligence.mapEmbedUrl;
  const mapSearchUrl = mapMedia?.url && !mapMedia.url.includes("output=embed") ? mapMedia.url : intelligence.mapSearchUrl;
  const primaryVideo = content?.videoLinks[0];
  const videoSearchUrl = intelligence.youtubeUrl;
  const sourceVideoUrl = primaryVideo?.url;
  const normalizedPrimaryEmbed = toYouTubeEmbedUrl(primaryVideo?.embedUrl) ?? toYouTubeEmbedUrl(primaryVideo?.url);
  const hasEmbeddableVideo = Boolean(normalizedPrimaryEmbed);
  const memberDetails = getDestinationMemberDetails(destination);
  const memberResearchLinks = getDestinationResearchLinks(destination);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-8 py-24">
        <Image
          src={heroBackground}
          alt={`${destination.city} hero image`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.82),rgba(15,23,42,0.82))]" />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/40 p-10 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="uppercase tracking-[0.35em] text-cyan-400">{destination.country}</p>
              <h1 className="mt-4 text-5xl font-black">{destination.city}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{destination.overview}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <FavoriteButton slug={destination.slug} label="Save city" />
                <Link
                  href={`/compare?slugs=${encodeURIComponent(destination.slug)}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                >
                  Compare this city
                </Link>
                <Link
                  href={mapSearchUrl}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                >
                  Open map
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-3xl bg-slate-900/80 px-6 py-4 text-slate-300">
              <span className="text-5xl">{destination.emoji}</span>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Horizon match</p>
                <p className="mt-2 text-4xl font-black text-cyan-400">{destination.match}%</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {intelligence.quickFacts.map((fact) => (
              <div key={fact.label} className="rounded-3xl border border-white/10 bg-slate-950/65 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">{fact.label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{fact.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-semibold text-white">Overview</h2>
              <p className="mt-4 text-slate-300 leading-7">{destination.description}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-semibold text-white">Climate</h2>
              <p className="mt-4 text-slate-300 leading-7">{destination.climate}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-xl font-semibold text-white">Lifestyle</h2>
              <p className="mt-4 text-slate-300 leading-7">{intelligence.lifestyleHeadline}</p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {intelligence.planningSignals.map((signal) => (
              <div key={signal.label} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold text-white">{signal.label}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${signal.tone === "strong" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                    {signal.tone === "strong" ? "Strong" : "Review"}
                  </span>
                </div>
                <p className="mt-4 text-slate-300 leading-7">{signal.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
              <h2 className="text-2xl font-semibold text-white">Relocation briefing</h2>
              <div className="mt-6 space-y-6">
                {intelligence.briefingSections.map((section) => (
                  <div key={section.title} className="rounded-3xl bg-white/5 p-5">
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <p className="mt-3 text-slate-300 leading-7">{section.summary}</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-400">
                      {section.bullets.map((bullet) => (
                        <p key={bullet}>{bullet}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
              <h2 className="text-2xl font-semibold text-white">Core decision areas</h2>
              <div className="mt-6 space-y-5 text-sm text-slate-300">
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Healthcare</p>
                  <p className="mt-3 leading-7">{intelligence.healthcareHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Housing</p>
                  <p className="mt-3 leading-7">{intelligence.housingHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Cost of living</p>
                  <p className="mt-3 leading-7">{intelligence.costHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Taxes</p>
                  <p className="mt-3 leading-7">{intelligence.taxHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Visas & residency</p>
                  <p className="mt-3 leading-7">{intelligence.visaHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Internet & remote practicality</p>
                  <p className="mt-3 leading-7">{intelligence.internetHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Dining & local life</p>
                  <p className="mt-3 leading-7">{intelligence.restaurantHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Culture</p>
                  <p className="mt-3 leading-7">{intelligence.cultureHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Transportation</p>
                  <p className="mt-3 leading-7">{destination.transportation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
              <h2 className="text-2xl font-semibold text-white">Lifestyle extras</h2>
              <div className="mt-6 space-y-5 text-sm text-slate-300">
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Golf</p>
                  <p className="mt-3 leading-7">{intelligence.golfHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Beaches & waterfront</p>
                  <p className="mt-3 leading-7">{intelligence.beachHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Nearby airports</p>
                  <p className="mt-3 leading-7">{intelligence.airportHeadline}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Things to do</p>
                  <p className="mt-3 leading-7">{intelligence.thingsToDoHeadline}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
              <h2 className="text-2xl font-semibold text-white">Retirement advantages and tradeoffs</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl bg-emerald-500/10 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Advantages</p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-emerald-100/90">
                    {intelligence.retirementAdvantages.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-amber-500/10 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Tradeoffs</p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-amber-100/90">
                    {intelligence.retirementTradeoffs.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 xl:col-span-2">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Member detail snapshot</h2>
                  <p className="mt-3 max-w-4xl text-slate-400 leading-7">
                    This is where the high-detail operational profile lives: month-by-month weather, public versus private golf, hospitals, airport names and drive times, restaurant depth, pickleball, and school coverage.
                  </p>
                </div>
                <div className="rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">
                  {memberDetails.researchStatus === "structured" ? "Structured details loaded" : "Research links available"}
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Best months</p>
                  <p className="mt-3 text-lg font-semibold text-white">{memberDetails.bestMonths ?? "Research needed"}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Golf</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {typeof memberDetails.golf?.publicCourses === "number" || typeof memberDetails.golf?.privateCourses === "number"
                      ? `${memberDetails.golf?.publicCourses ?? 0} public / ${memberDetails.golf?.privateCourses ?? 0} private`
                      : "Research needed"}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Hospitals</p>
                  <p className="mt-3 text-lg font-semibold text-white">{memberDetails.hospitals?.length ? `${memberDetails.hospitals.length} listed` : "Research needed"}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Airports</p>
                  <p className="mt-3 text-lg font-semibold text-white">{memberDetails.airports?.length ? `${memberDetails.airports.length} listed` : "Research needed"}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Amenity counts</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Restaurants", memberDetails.amenities?.restaurants],
                      ["Pickleball courts", memberDetails.amenities?.pickleballCourts],
                      ["Schools", memberDetails.amenities?.schools],
                      ["English schools", memberDetails.amenities?.englishSchools],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
                        <p className="mt-2 text-base font-semibold text-white">{typeof value === "number" ? value : "Research needed"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Structured facilities</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-sm font-semibold text-white">Hospitals</p>
                      <div className="mt-3 space-y-3 text-sm text-slate-300">
                        {memberDetails.hospitals?.length ? memberDetails.hospitals.map((hospital) => (
                          <div key={hospital.name}>
                            <p className="font-semibold text-white">{hospital.name}</p>
                            <p className="mt-1 text-slate-400">{[hospital.distance, hospital.note].filter(Boolean).join(" • ")}</p>
                          </div>
                        )) : <p className="text-slate-400">Research needed.</p>}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-950/80 p-4">
                      <p className="text-sm font-semibold text-white">Airports</p>
                      <div className="mt-3 space-y-3 text-sm text-slate-300">
                        {memberDetails.airports?.length ? memberDetails.airports.map((airport) => (
                          <div key={airport.name}>
                            <p className="font-semibold text-white">{airport.name}</p>
                            <p className="mt-1 text-slate-400">{[airport.distance, airport.note].filter(Boolean).join(" • ")}</p>
                          </div>
                        )) : <p className="text-slate-400">Research needed.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {memberDetails.monthlyWeather?.length ? (
                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-300">
                      <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Month</th>
                          <th className="px-4 py-3">Avg high</th>
                          <th className="px-4 py-3">Avg low</th>
                          <th className="px-4 py-3">Sea</th>
                          <th className="px-4 py-3">Rain</th>
                          <th className="px-4 py-3">Sun</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberDetails.monthlyWeather.map((month) => (
                          <tr key={month.month} className="border-t border-white/5">
                            <td className="px-4 py-3 font-semibold text-white">{month.month}</td>
                            <td className="px-4 py-3">{typeof month.avgHighC === "number" ? `${month.avgHighC} C` : "-"}</td>
                            <td className="px-4 py-3">{typeof month.avgLowC === "number" ? `${month.avgLowC} C` : "-"}</td>
                            <td className="px-4 py-3">{typeof month.avgSeaC === "number" ? `${month.avgSeaC} C` : "-"}</td>
                            <td className="px-4 py-3">{typeof month.rainfallMm === "number" ? `${month.rainfallMm} mm` : "-"}</td>
                            <td className="px-4 py-3">{typeof month.sunshineHours === "number" ? `${month.sunshineHours} h` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {memberResearchLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    target="_blank"
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/60 hover:bg-slate-900"
                  >
                    <p className="text-sm font-semibold text-white">{link.title}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-white">Interactive map</h2>
                <Link href={intelligence.mapSearchUrl} target="_blank" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20">
                  Open full map
                </Link>
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
                <iframe
                  src={mapEmbedUrl}
                  title={`${destination.city} map`}
                  className="h-[420px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-white">YouTube exploration</h2>
                <Link href={videoSearchUrl} target="_blank" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20">
                  Open YouTube search
                </Link>
              </div>
              {hasEmbeddableVideo ? (
                <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
                  <iframe
                    src={normalizedPrimaryEmbed ?? undefined}
                    title={`${destination.city} YouTube guide`}
                    className="h-[420px] w-full border-0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-300">
                  <p className="text-lg font-semibold text-white">No embeddable video is currently configured for this destination.</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Use YouTube search to see current city tours and neighborhood walkthroughs. This avoids broken in-page players when YouTube restricts or removes older links.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={videoSearchUrl}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
                    >
                      Open YouTube search results
                    </Link>
                    {sourceVideoUrl ? (
                      <Link
                        href={sourceVideoUrl}
                        target="_blank"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40"
                      >
                        Open original source link
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <h2 className="text-2xl font-semibold text-white">Resource stack</h2>
            <p className="mt-3 max-w-3xl text-slate-400 leading-7">These links are structured to support real relocation research instead of surface-level browsing. Use them to validate rentals, healthcare options, dining patterns, official residency information, and local context before making decisions.</p>
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {resourceGroups.map((group) => (
                <div key={group.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-semibold text-white">{group.title}</h3>
                  <div className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        className="block rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-4 transition hover:border-cyan-400/60 hover:bg-slate-900"
                      >
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{item.note}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black text-white">Destination gallery & travel media</h2>
          <DestinationGallery destination={destination} />
        </div>
      </section>
    </main>
  );
}
