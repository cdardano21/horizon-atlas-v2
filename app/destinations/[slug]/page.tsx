import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "../../components/FavoriteButton";
import DestinationGallery from "../../components/DestinationGallery";
import DestinationStickyNav from "../../components/destination/DestinationStickyNav";
import GuideSpotExplorer from "../../components/destination/GuideSpotExplorer";
import MonthlyClimatePanel from "../../components/destination/MonthlyClimatePanel";
import MissingDataState from "../../components/destination/MissingDataState";
import NeighborhoodExplorer from "../../components/destination/NeighborhoodExplorer";
import ShareDestinationButton from "../../components/destination/ShareDestinationButton";
import SourceVerificationBadge from "../../components/destination/SourceVerificationBadge";
import { getDestinationContent } from "../../lib/destination-content";
import { defaultMissingVerification, getDestinationCommandCenter } from "../../lib/destination-command-center";
import type { CommandCenterData, NamedRecord, VerificationMeta } from "../../lib/destination-command-center";
import { toConsumerCopy } from "../../lib/consumer-copy";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../../lib/source-links";

interface DestinationPageProps {
  params: Promise<{ slug: string }>;
}

function confidenceClass(level: "high" | "medium" | "low") {
  if (level === "high") return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (level === "medium") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-slate-500/20 text-slate-200 border-slate-300/20";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not published";
  return date.toLocaleDateString();
}

function formatVerificationLine(verification?: { lastVerifiedAt?: string | null; verificationStatus?: string | null } | null) {
  const status = verification?.verificationStatus;
  if (status === "verified") {
    return `Verified ${formatDate(verification?.lastVerifiedAt)}`;
  }
  if (status === "estimated") {
    return verification?.lastVerifiedAt ? `Source-backed • reviewed ${formatDate(verification.lastVerifiedAt)}` : "Source-backed";
  }
  if (status === "stale") {
    return verification?.lastVerifiedAt ? `Stale • last verified ${formatDate(verification.lastVerifiedAt)}` : "Stale";
  }
  return "Not published";
}

function formatMetricValue(metric: { displayValue?: string | null; value: string | null; unit?: string | null }) {
  return metric.displayValue ?? (metric.value && metric.unit ? `${metric.value} ${metric.unit}` : metric.value);
}

function hasPublishedVerification(verification?: VerificationMeta | null) {
  const status = verification?.verificationStatus;
  return status === "verified" || status === "estimated" || status === "stale";
}

function hasNoVerifiedPlaceholder(value: string | null | undefined) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes("no verified")
    || normalized.includes("editorial estimate from current destination records")
    || normalized.includes("source expansion underway")
    || normalized.includes("see source links below")
    || normalized.includes("not published");
}

function summarizeRows(rows: NamedRecord[], limit = 3) {
  return rows.slice(0, limit).map((row) => row.name);
}

function formatList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function isTemplateCopy(value: string | null | undefined) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes("a tier ")
    || normalized.includes("ranks strongly in the retirement-first")
    || normalized.includes("standout scores for walkability")
    || normalized.includes("verify before decision")
    || normalized.includes("standard/unknown")
    || normalized.includes("professional review needed");
}

function buildEditorialOverview(command: CommandCenterData) {
  const destination = command.destination;
  const tags = destination.tags ?? [];
  const coastal = tags.includes("beach") || tags.includes("coast") || command.beaches.length > 0;
  const cultural = tags.includes("culture");
  const neighborhoods = summarizeRows(command.neighborhoods, 2);
  const recreation = summarizeRows([...command.beaches, ...command.recreationFacilities, ...command.golfCourses], 3);
  const intro = !isTemplateCopy(destination.description)
    ? destination.description
    : coastal
    ? `Wake up in ${destination.city} with the water close enough to shape the pace of the day, not just the postcard.`
    : `Settle into ${destination.city} with the feeling that everyday life, not just sightseeing, is the real draw.`;
  const follow = !isTemplateCopy(destination.overview)
    ? destination.overview
    : neighborhoods.length > 0
    ? `The most compelling version of life here starts in places like ${formatList(neighborhoods)}, then expands into a wider rhythm of ${recreation.length > 0 ? formatList(recreation) : "walks, errands, meals, and repeatable local routines"}.`
    : `${destination.city} becomes more interesting once you stop evaluating it as a checklist and start reading it as a place for recurring routines, familiar streets, and slower decisions.`;
  const dek = !isTemplateCopy(destination.lifestyle)
    ? destination.lifestyle
    : cultural
    ? `${destination.city} blends local character, practical daily living, and relocation math into a destination that should feel more editorial than transactional.`
    : `${destination.city} works best when emotional fit and practical fit are evaluated together: daily rhythm, climate, housing, healthcare, and long-stay ease.`;
  const quote = command.intelligence.aiSummary || destination.lifestyle;

  return { intro, follow, dek, quote };
}

function buildDayMoments(command: CommandCenterData) {
  const neighborhood = command.neighborhoods[0];
  const secondNeighborhood = command.neighborhoods[1] ?? command.recreationFacilities[0];
  const afternoon = command.beaches[0] ?? command.golfCourses[0] ?? command.recreationFacilities[0];
  const evening = command.neighborhoods[0] ?? command.recreationFacilities[0];
  const weekend = [...command.beaches, ...command.recreationFacilities, ...command.golfCourses, ...command.airports].slice(0, 4);

  return {
    timeline: [
      {
        time: "7:30 AM",
        title: neighborhood ? `Start in ${neighborhood.name}` : "Start with the city center",
        detail: neighborhood?.value1 ?? `Ease into the day by walking through the part of ${command.destination.city} that is most likely to become your default morning loop.`,
      },
      {
        time: "9:30 AM",
        title: secondNeighborhood ? `Explore toward ${secondNeighborhood.name}` : "Explore before the day speeds up",
        detail: secondNeighborhood?.value2 ?? "Use the quieter morning window to judge sidewalks, pace, shade, noise, and whether daily errands feel pleasant rather than theoretical.",
      },
      {
        time: "1:00 PM",
        title: "Pause for the practical test",
        detail: `This is the hour to notice whether lunch, groceries, pharmacy access, and simple everyday logistics feel easy enough to repeat year-round in ${command.destination.city}.`,
      },
      {
        time: "4:00 PM",
        title: afternoon ? `Lean into ${afternoon.name}` : "Choose the lifestyle version of the city",
        detail: afternoon?.value1 ?? "Spend the afternoon validating the thing that will most shape your long-stay happiness: water access, golf, parks, galleries, or simply the texture of outdoor life.",
      },
      {
        time: "7:30 PM",
        title: evening ? `Return to ${evening.name}` : "End where you would actually linger",
        detail: evening?.value2 ?? `Evening is when ${command.destination.city} either starts to feel magnetic or purely functional. Watch how locals use the streets, not just how visitors do.`,
      },
    ],
    weekend,
  };
}

function buildLifeScenarios(command: CommandCenterData) {
  const costLead = command.costOfLiving[0];
  const housingLead = command.housingMetrics[0];
  const healthcareLead = command.healthcareFacilities[0];
  const internetLead = command.internetMetrics[0];
  const schoolLead = command.schools[0];

  return [
    {
      title: "Retiring here",
      accent: "from-amber-400/25 to-orange-500/10",
      summary: "Focus on comfort, healthcare, and the routines that still work beautifully after the novelty fades.",
      bullets: [
        healthcareLead ? healthcareLead.name : "Review healthcare access before treating the move as low-friction.",
        command.monthlyClimate.length > 0 ? `Climate now includes ${command.monthlyClimate.length} published monthly rows for long-stay planning.` : "Climate needs fuller publication before relying on seasonal assumptions.",
        housingLead ? `${housingLead.label}: ${formatMetricValue(housingLead) ?? "Not yet published"}` : "Housing costs still need direct validation.",
      ],
    },
    {
      title: "Working remotely",
      accent: "from-cyan-400/25 to-sky-500/10",
      summary: "Prioritize internet confidence, travel flexibility, and neighborhoods that support focused weekdays.",
      bullets: [
        internetLead ? `${internetLead.label}: ${formatMetricValue(internetLead) ?? "Not yet published"}` : "Connectivity still needs verified publishing.",
        command.airports[0] ? `Closest flight pattern starts with ${command.airports[0].name}.` : "Airport routing still needs verified publishing.",
        command.neighborhoods[0] ? `${command.neighborhoods[0].name} is a starting point for walkable day-to-day scouting.` : "Neighborhood-level work routines still need publication.",
      ],
    },
    {
      title: "Raising a family",
      accent: "from-emerald-400/25 to-teal-500/10",
      summary: "Look at schools, parks, healthcare, and whether the city supports a stable week, not just a beautiful weekend.",
      bullets: [
        schoolLead ? `Published school lead: ${schoolLead.name}.` : "School coverage still needs verified publishing.",
        command.recreationFacilities[0] ? `${command.recreationFacilities[0].name} adds an outdoor or community anchor.` : "Recreation inventory still needs verification.",
        healthcareLead ? `Healthcare lead: ${healthcareLead.name}.` : "Healthcare providers still need deeper publication.",
      ],
    },
    {
      title: "Living like a local",
      accent: "from-fuchsia-400/20 to-rose-500/10",
      summary: "Choose this lens when you care more about repeatable rituals than about tourist highlights.",
      bullets: [
        command.neighborhoods[0] ? `Begin with ${command.neighborhoods[0].name} to judge real daily flow.` : "Neighborhood texture still needs more publication.",
        command.foodMetrics[0] ? `${command.foodMetrics[0].label}: ${formatMetricValue(command.foodMetrics[0]) ?? "Not yet published"}` : "Food intelligence still needs verified publication.",
        command.resources.filter((resource) => resource.category === "local").length > 0 ? "Local source links are already published for deeper self-directed research." : "Local source coverage is still expanding.",
      ],
    },
    {
      title: "Buying a home",
      accent: "from-violet-400/20 to-indigo-500/10",
      summary: "Use this view when your move depends on district choice, seasonal pressure, and long-term ownership logic.",
      bullets: [
        housingLead ? `${housingLead.label}: ${formatMetricValue(housingLead) ?? "Not yet published"}` : "Housing data still needs direct market validation.",
        costLead ? `${costLead.label}: ${formatMetricValue(costLead) ?? "Not yet published"}` : "Budget assumptions still need refinement.",
        command.taxRules[0] ? `Tax starting point: ${command.taxRules[0].name}.` : "Tax structure still needs verified publication.",
      ],
    },
  ];
}

function buildMagazineDescription(command: CommandCenterData) {
  const city = command.destination.city;
  const country = command.destination.country;
  const neighborhoodA = command.neighborhoods[0]?.name;
  const neighborhoodB = command.neighborhoods[1]?.name;
  const beachOrRecreation = command.beaches[0]?.name ?? command.recreationFacilities[0]?.name;
  const foodAnchor = command.foodSpots[0]?.name;
  const healthcareAnchor = command.healthcareFacilities[0]?.name;
  const airportAnchor = command.airports[0]?.name;

  const opening = !isTemplateCopy(command.destination.description)
    ? command.destination.description
    : neighborhoodA
    ? `${city} feels most magnetic when you start walking through ${neighborhoodA}${neighborhoodB ? ` and drift toward ${neighborhoodB}` : ""}: stone streets, layered facades, and the kind of daily rhythm that makes errands feel like part of the experience.`
    : `${city} has the kind of atmosphere that shifts from postcard to possible once you slow down and read the streets like a resident instead of a visitor.`;

  const middle = !isTemplateCopy(command.destination.lifestyle)
    ? command.destination.lifestyle
    : beachOrRecreation || foodAnchor
    ? `The lifestyle test is practical and emotional at the same time: a late afternoon at ${beachOrRecreation ?? foodAnchor}, an easy dinner${foodAnchor ? ` at ${foodAnchor}` : ""}, and a realistic check on what ordinary weekdays actually feel like.`
    : `The lifestyle test is practical and emotional at the same time: test a normal weekday loop, then decide whether the city still feels compelling after the novelty fades.`;

  const closing = !isTemplateCopy(command.destination.overview)
    ? command.destination.overview
    : `${city}, ${country} becomes a serious relocation contender when the essentials also hold up${healthcareAnchor ? ` - healthcare anchored by ${healthcareAnchor}` : ""}${airportAnchor ? `, travel flow through ${airportAnchor}` : ""}, and routines you would be happy to repeat for years.`;

  return { opening, middle, closing };
}

function parseEvidencePoints(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/;|\||,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 4);
}

function buildRapidAnswers(command: CommandCenterData) {
  const metric = (rows: typeof command.quickMetrics, includes: string) =>
    rows.find((item) => (item.label ?? "").toLowerCase().includes(includes.toLowerCase()));

  const cost = metric(command.costOfLiving, "monthly") ?? command.costOfLiving[0];
  const internet = command.internetMetrics[0];
  const airport = command.airports[0];
  const healthcare = command.healthcareFacilities[0];
  const walkability = command.scorecard.find((item) => item.category.toLowerCase() === "walkability");
  const safety = command.scorecard.find((item) => item.category.toLowerCase() === "safety");
  const schools = command.schools[0];
  const taxes = command.taxRules[0];
  const visa = command.visaPrograms[0];
  const fallbackAnswer = "Use the destination source links below to validate this signal.";

  return [
    {
      question: "What is the practical monthly budget signal?",
      answer: cost ? `${cost.label}: ${formatMetricValue(cost) ?? "Not published"}` : fallbackAnswer,
    },
    {
      question: "How strong is healthcare access?",
      answer: healthcare ? `${healthcare.name}${healthcare.subtitle ? ` • ${healthcare.subtitle}` : ""}` : fallbackAnswer,
    },
    {
      question: "Can I rely on internet for remote work?",
      answer: internet ? `${internet.label}: ${formatMetricValue(internet) ?? "Not published"}` : fallbackAnswer,
    },
    {
      question: "How easy is airport connectivity?",
      answer: airport ? `${airport.name}${airport.value1 ? ` • ${airport.value1}` : ""}` : fallbackAnswer,
    },
    {
      question: "How walkable does the scorecard read?",
      answer: walkability && typeof walkability.score === "number" ? `${walkability.score}/100` : fallbackAnswer,
    },
    {
      question: "How does safety score right now?",
      answer: safety && typeof safety.score === "number" ? `${safety.score}/100` : fallbackAnswer,
    },
    {
      question: "What is the school/family signal?",
      answer: schools ? `${schools.name}${schools.subtitle ? ` • ${schools.subtitle}` : ""}` : fallbackAnswer,
    },
    {
      question: "What are the visa or residency starting points?",
      answer: visa ? `${visa.name}${visa.subtitle ? ` • ${visa.subtitle}` : ""}` : fallbackAnswer,
    },
    {
      question: "What is the tax posture to investigate first?",
      answer: taxes ? `${taxes.name}${taxes.subtitle ? ` • ${taxes.subtitle}` : ""}` : fallbackAnswer,
    },
    {
      question: "What climate clues are available?",
      answer: `Published monthly climate rows: ${command.monthlyClimate.length}`,
    },
  ];
}

function buildCoreRelocationQa(command: CommandCenterData) {
  const firstCost = command.costOfLiving.find((metric) => hasPublishedVerification(metric.verification));
  const firstHousing = command.housingMetrics.find((metric) => hasPublishedVerification(metric.verification));
  const firstNeighborhood = command.neighborhoods.find((row) => hasPublishedVerification(row.verification));
  const secondNeighborhood = command.neighborhoods.filter((row) => hasPublishedVerification(row.verification))[1];
  const firstHealthcare = command.healthcareFacilities.find((row) => hasPublishedVerification(row.verification));
  const firstAirport = command.airports.find((row) => hasPublishedVerification(row.verification));
  const firstInternet = command.internetMetrics.find((metric) => hasPublishedVerification(metric.verification));
  const walkability = command.scorecard.find((item) => item.category.toLowerCase() === "walkability");
  const fallbackAnswer = "Review the source links in this page to verify this category for your shortlist.";

  return [
    {
      title: "Cost",
      items: [
        {
          question: "Monthly budget anchor",
          answer: firstCost ? `${firstCost.label}: ${formatMetricValue(firstCost) ?? "Not published"}` : fallbackAnswer,
        },
        {
          question: "Housing signal",
          answer: firstHousing ? `${firstHousing.label}: ${formatMetricValue(firstHousing) ?? "Not published"}` : fallbackAnswer,
        },
      ],
    },
    {
      title: "Neighborhoods",
      items: [
        {
          question: "Where to start scouting",
          answer: firstNeighborhood ? firstNeighborhood.name : fallbackAnswer,
        },
        {
          question: "Second area to compare",
          answer: secondNeighborhood ? secondNeighborhood.name : "Compare with a second neighborhood from the map and source links below.",
        },
      ],
    },
    {
      title: "Healthcare",
      items: [
        {
          question: "Primary healthcare anchor",
          answer: firstHealthcare ? `${firstHealthcare.name}${firstHealthcare.subtitle ? ` • ${firstHealthcare.subtitle}` : ""}` : fallbackAnswer,
        },
      ],
    },
    {
      title: "Transportation",
      items: [
        {
          question: "Nearest airport cue",
          answer: firstAirport ? `${firstAirport.name}${firstAirport.value1 ? ` • ${firstAirport.value1}` : ""}` : fallbackAnswer,
        },
        {
          question: "Walkability score",
          answer: walkability && typeof walkability.score === "number" ? `${walkability.score}/100` : fallbackAnswer,
        },
      ],
    },
    {
      title: "Internet",
      items: [
        {
          question: "Remote work connectivity",
          answer: firstInternet ? `${firstInternet.label}: ${formatMetricValue(firstInternet) ?? "Not published"}` : fallbackAnswer,
        },
      ],
    },
  ];
}

function scoreTone(score: number | null) {
  if (typeof score !== "number") return "border-[var(--atlas-border)] bg-[rgba(255,255,255,0.82)] text-[var(--atlas-ink)]";
  if (score >= 85) return "border-emerald-300/55 bg-emerald-50 text-emerald-950";
  if (score >= 75) return "border-cyan-300/55 bg-cyan-50 text-cyan-950";
  return "border-amber-300/65 bg-amber-50 text-amber-950";
}

function confidenceWeight(level: VerificationMeta["confidenceLevel"] | undefined) {
  if (level === "high") return 1;
  if (level === "medium") return 0.7;
  return 0.4;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.32em] text-[var(--atlas-accent)]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold text-[var(--atlas-ink)] sm:text-5xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--atlas-muted)]">{description}</p>
    </div>
  );
}

function ScenicBreakpoint({
  imageUrl,
  city,
  caption,
}: {
  imageUrl: string | null;
  city: string;
  caption: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-8 py-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--atlas-border)] shadow-[0_30px_70px_-35px_rgba(37,31,22,0.55)]">
        <div className="relative h-[280px] sm:h-[360px] lg:h-[420px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${city} scenic view`}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(247,204,145,0.28),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(31,95,99,0.24),transparent_26%),linear-gradient(135deg,#111f21_0%,#1f3437_50%,#44351d_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#131f21]/70 via-[#131f21]/18 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.26em] text-[#f6dfb7]">Scouting lens</p>
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#f5ebdb]">{caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricGrid({
  metrics,
  emptyText,
}: {
  metrics: Array<{ label: string; value: string | null; verification?: { lastVerifiedAt?: string | null; verificationStatus?: string | null } | null }>;
  emptyText: string;
}) {
  const publishedMetrics = metrics.filter((metric) => {
    if (!hasPublishedVerification(metric.verification as VerificationMeta | null)) return false;
    return !hasNoVerifiedPlaceholder(toConsumerCopy(metric.value));
  });

  if (publishedMetrics.length === 0) {
    return <MissingDataState description={emptyText} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {publishedMetrics.map((metric, index) => (
        <article key={`${metric.label}-${index}`} className="rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-5 shadow-lg shadow-[rgba(39,32,22,0.14)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">{metric.label}</p>
          <p className="mt-3 text-xl font-semibold text-[var(--atlas-ink)]">{toConsumerCopy(metric.value)}</p>
          <p className="mt-2 text-xs text-[var(--atlas-muted)]">{formatVerificationLine(metric.verification)}</p>
        </article>
      ))}
    </div>
  );
}

function RecordList({
  rows,
  emptyDescription,
  city,
  country,
}: {
  rows: Array<{
    id: string;
    name: string;
    subtitle?: string | null;
    value1?: string | null;
    value2?: string | null;
    value3?: string | null;
    url?: string | null;
    verification?: VerificationMeta | null;
  }>;
  emptyDescription: string;
  city: string;
  country: string;
}) {
  const publishedRows = rows.filter((row) => hasPublishedVerification(row.verification));

  if (publishedRows.length === 0) {
    return <MissingDataState description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {publishedRows.map((row) => {
        const sourceHref = resolveSourceHref(row.url ?? row.verification?.sourceUrl, [row.name, city, country]);
        const hasListedSource = Boolean(sanitizeExternalSourceUrl(row.url ?? row.verification?.sourceUrl));

        return (
        <article key={row.id} className="rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.88)] p-5 shadow-lg shadow-[rgba(39,32,22,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--atlas-ink)]">{row.name}</h3>
              {row.subtitle ? <p className="mt-1 text-sm text-[var(--atlas-muted)]">{row.subtitle}</p> : null}
            </div>
            <SourceVerificationBadge verification={row.verification ?? defaultMissingVerification} />
          </div>
          <div className="mt-4 space-y-2 text-sm text-[var(--atlas-muted)]">
            {row.value1 && !hasNoVerifiedPlaceholder(toConsumerCopy(row.value1)) ? <p>{toConsumerCopy(row.value1)}</p> : null}
            {row.value2 && !hasNoVerifiedPlaceholder(toConsumerCopy(row.value2)) ? <p>{toConsumerCopy(row.value2)}</p> : null}
            {row.value3 && !hasNoVerifiedPlaceholder(toConsumerCopy(row.value3)) ? <p>{toConsumerCopy(row.value3)}</p> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-[rgba(31,95,99,0.34)] bg-[rgba(31,95,99,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.15)]"
            >
              {hasListedSource ? "Open source" : "Search official source"}
            </Link>
          </div>
        </article>
      );})}
    </div>
  );
}

function IntelligenceGuideSection({
  title,
  summary,
  items,
  city,
  country,
}: {
  title: string;
  summary: string;
  items: Array<{ label: string; value: string; note?: string; sourceUrl?: string | null }>;
  city: string;
  country: string;
}) {
  const visibleItems = items.filter((item) => !hasNoVerifiedPlaceholder(toConsumerCopy(item.value)));

  if (visibleItems.length === 0) return null;

  return (
    <article className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.82))] p-6 shadow-lg shadow-[rgba(39,32,22,0.14)]">
      <h3 className="text-2xl font-semibold text-[var(--atlas-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">{summary}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {visibleItems.map((item, index) => {
          const sourceHref = resolveSourceHref(item.sourceUrl, [item.label, title, city, country]);
          const hasListedSource = Boolean(sanitizeExternalSourceUrl(item.sourceUrl));

          return (
          <div key={`${title}-${item.label}-${index}`} className="rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-accent)]">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--atlas-ink)]">{toConsumerCopy(item.value)}</p>
            {item.note ? <p className="mt-1 text-xs leading-5 text-[var(--atlas-muted)]">{toConsumerCopy(item.note, item.note)}</p> : null}
            <Link
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-full border border-[rgba(31,95,99,0.34)] bg-[rgba(31,95,99,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.14)]"
            >
              {hasListedSource ? "Open source" : "Search official source"}
            </Link>
          </div>
        );})}
      </div>
    </article>
  );
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = await params;

  const command = await getDestinationCommandCenter(slug);
  const content = await getDestinationContent(slug);

  if (!command || !content?.destination) {
    return (
      <main className="min-h-screen px-8 py-24 text-[var(--atlas-ink)]">
        <div className="mx-auto max-w-5xl rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] p-12 text-center shadow-[var(--atlas-shadow)]">
          <h1 className="text-4xl font-semibold">Destination not found</h1>
          <p className="mt-4 text-[var(--atlas-muted)]">Try returning to the catalog and selecting another destination.</p>
        </div>
      </main>
    );
  }

  const destination = content.destination;
  const destinationImageSet = destination.images.filter((image) => Boolean(image.src && image.src.trim().length > 0));
  const heroImage = destinationImageSet[0]?.src ?? null;

  const scorecard = command.scorecard;
  const quickMetrics = command.quickMetrics.slice(0, 10).map((metric) => ({
    label: metric.label,
    value: formatMetricValue(metric),
    verification: metric.verification,
  }));
  const heroVerification = command.quickMetrics.find((metric) => metric.verification?.verificationStatus)?.verification
    ?? command.scorecard.find((item) => item.verification?.verificationStatus)?.verification
    ?? defaultMissingVerification;
  const heroFacts = quickMetrics
    .slice(0, 4)
    .filter((metric) => Boolean(metric.value))
    .map((metric) => `${metric.label}: ${metric.value}`)
    .join(" • ");

  const verificationForCount = (count: number, verification: VerificationMeta | undefined): VerificationMeta => {
    if (count > 0 && verification) return verification;
    return {
      verificationStatus: "in_progress",
      confidenceLevel: "low",
      notes: "No published records yet.",
      lastVerifiedAt: command.lastVerifiedAt,
    };
  };

  const evidenceMetrics = [
    {
      label: "Golf courses documented",
      value: String(command.golfCourses.length),
      verification: verificationForCount(command.golfCourses.length, command.golfCourses[0]?.verification),
    },
    {
      label: "Recreation facilities documented",
      value: String(command.recreationFacilities.length),
      verification: verificationForCount(command.recreationFacilities.length, command.recreationFacilities[0]?.verification),
    },
    {
      label: "Airports documented",
      value: String(command.airports.length),
      verification: verificationForCount(command.airports.length, command.airports[0]?.verification),
    },
    {
      label: "Visa/tax records documented",
      value: String(command.visaPrograms.length + command.taxRules.length),
      verification: verificationForCount(
        command.visaPrograms.length + command.taxRules.length,
        command.visaPrograms[0]?.verification ?? command.taxRules[0]?.verification,
      ),
    },
  ];

  const hasMatch = destination.match > 0;
  const mapSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}`;
  const quickFacts = command.intelligence.quickFacts;
  const planningSignals = command.intelligence.planningSignals;
  const comprehensiveSections = command.intelligence.comprehensiveSections;
  const editorial = buildEditorialOverview(command);
  const dayHere = buildDayMoments(command);
  const lifeScenarios = buildLifeScenarios(command);
  const conciseScenarios = lifeScenarios.slice(0, 3).map((scenario) => ({
    ...scenario,
    bullets: scenario.bullets.slice(0, 2),
  }));
  const magazine = buildMagazineDescription(command);
  const rapidAnswers = buildRapidAnswers(command);
  const conciseScorecard = scorecard.slice(0, 6);
  const conciseComprehensiveSections = comprehensiveSections.slice(0, 4);
  const coreQa = buildCoreRelocationQa(command);
  const scoreRows = scorecard.filter((item) => typeof item.score === "number");
  const scoreAverage = scoreRows.length > 0
    ? Math.round(scoreRows.reduce((total, item) => total + (item.score ?? 0), 0) / scoreRows.length)
    : null;
  const evidenceWeightTotal = scoreRows.length > 0
    ? scoreRows.reduce((total, item) => total + confidenceWeight(item.verification?.confidenceLevel), 0)
    : 0;
  const evidenceConfidencePct = scoreRows.length > 0
    ? Math.round((evidenceWeightTotal / scoreRows.length) * 100)
    : null;
  const storyTags = (destination.tags ?? []).slice(0, 6);
  const featuredResources = command.resources.slice(0, 3);
  const scenicImagePrimary = destinationImageSet[1]?.src ?? null;
  const scenicImageSecondary = destinationImageSet[2]?.src ?? null;
  const conciseQuickFacts = quickFacts.filter((fact) => !hasNoVerifiedPlaceholder(fact.value)).slice(0, 4);
  const visibleRapidAnswers = rapidAnswers.filter((item) => !hasNoVerifiedPlaceholder(item.answer));
  const visibleCoreQa = coreQa
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !hasNoVerifiedPlaceholder(item.answer)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_8%_8%,rgba(197,155,95,0.24),transparent_25%),radial-gradient(circle_at_92%_10%,rgba(31,95,99,0.13),transparent_30%),repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_16px),linear-gradient(180deg,#f8f4ec_0%,#f4eee1_46%,#f8f3ea_100%)] text-[var(--atlas-ink)]">
      <section className="relative overflow-hidden border-b border-[rgba(57,52,42,0.14)] px-8 py-20">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={`${destination.city} hero image`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,204,145,0.3),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(31,95,99,0.24),transparent_28%),linear-gradient(135deg,#0f1e20_0%,#1d2d30_50%,#3b3125_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1e20]/84 via-[#132a2c]/62 to-[#453623]/33" />
        <div className="absolute inset-0 bg-[#0f1e20]/38" />

        <div className="relative mx-auto max-w-7xl rounded-[2rem] border border-white/25 bg-[rgba(255,251,243,0.2)] p-8 shadow-xl shadow-[rgba(15,23,24,0.35)] backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f9e4bd]">{destination.country}{command.region ? ` • ${command.region}` : ""}</p>
              <h1 className="mt-4 text-5xl font-semibold text-[#fff8ef] sm:text-6xl">{destination.city}</h1>
              <p className="mt-4 text-lg leading-8 text-[#f2e8d9]">{heroFacts || editorial.intro}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#f2e8d9]">
                <SourceVerificationBadge verification={heroVerification} />
                <span className={`rounded-full border px-3 py-1 ${confidenceClass(command.dataConfidence)}`}>
                  {command.dataConfidence.toUpperCase()} confidence
                </span>
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                  Last update: {formatDate(command.lastVerifiedAt)}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/30 bg-[rgba(20,37,39,0.42)] p-6 text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-[#f2d9ad]">Horizon Match</p>
              {hasMatch ? (
                <p className="mt-2 text-4xl font-black text-[#fff3dd]">{Math.round(destination.match)}%</p>
              ) : (
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#f2e8d9]">
                  Complete Retirement DNA to calculate your personalized match.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <FavoriteButton slug={destination.slug} label="Save destination" />
            <Link
              href={`/compare?slugs=${encodeURIComponent(destination.slug)}`}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100"
            >
              Compare
            </Link>
            <Link
              href={mapSearchUrl}
              target="_blank"
              className="inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              Open map
            </Link>
            <ShareDestinationButton city={destination.city} />
          </div>

          <div className="mt-8">
            <MetricGrid
              metrics={quickMetrics}
              emptyText="Core metrics are shown here when destination records are published from the central data system."
            />
          </div>

          <div className="mt-6">
            <MetricGrid
              metrics={evidenceMetrics}
              emptyText="See source references below for currently published records."
            />
          </div>
        </div>
      </section>

      <DestinationStickyNav />

      <section id="decision-fast" className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,239,225,0.86))] p-8 shadow-[0_28px_56px_-34px_rgba(39,32,22,0.4)]">
          <SectionHeading
            eyebrow="Rapid relocation answers"
            title="What you actually need to know before planning a scouting trip"
            description="Short, concrete answers first. Use the deeper sections below to verify every signal with source-backed details."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleRapidAnswers.map((item) => (
              <article key={item.question} className="rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.76)] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">{item.question}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-ink)]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="qa-core" className="mx-auto max-w-7xl px-8 py-2">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_48px_-34px_rgba(39,32,22,0.42)] sm:p-8">
          <SectionHeading
            eyebrow="Core relocation Q&A"
            title="Concrete answers by topic"
            description="Use this as your fast decision board before reading deeper section detail."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCoreQa.map((group) => (
              <article key={group.title} className="rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">{group.title}</p>
                <div className="mt-3 space-y-3">
                  {group.items.map((item) => (
                    <div key={`${group.title}-${item.question}`} className="rounded-2xl border border-[var(--atlas-border)] bg-white/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-muted)]">{item.question}</p>
                      <p className="mt-1.5 text-sm leading-6 text-[var(--atlas-ink)]">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,239,225,0.86))] p-8 shadow-[0_28px_56px_-34px_rgba(39,32,22,0.4)]">
            <SectionHeading
              eyebrow="Editorial overview"
              title={`Why ${destination.city} makes the shortlist`}
              description="A concise read on atmosphere, routines, and practical fit."
            />
            <p className="mt-8 text-2xl font-semibold leading-10 text-[var(--atlas-ink)] sm:text-3xl">
              {editorial.intro}
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--atlas-muted)]">
              {editorial.follow}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {storyTags.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.76)] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[var(--atlas-muted)]">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {conciseQuickFacts.map((fact) => (
                <article key={fact.label} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">{fact.label}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--atlas-ink)]">{fact.value}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,221,0.84))] p-8 shadow-xl shadow-[rgba(39,32,22,0.2)]">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">What it is like, in real life</p>
              <p className="mt-5 text-lg leading-8 text-[var(--atlas-ink)]">{magazine.opening}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">{magazine.middle}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">{magazine.closing}</p>
              <p className="mt-4 rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)] px-4 py-3 text-xs leading-6 text-[var(--atlas-muted)]">
                Use this editorial lens to shortlist. Use the sections below to verify cost, healthcare, internet, safety, mobility, and neighborhood fit before you commit.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Start with these sources</p>
              <div className="mt-4 space-y-3">
                {featuredResources.length === 0 ? (
                  <MissingDataState description="Source links appear here as destination resource records are published." />
                ) : (
                  featuredResources.map((resource) => (
                    <Link key={resource.id} href={resource.url} target="_blank" className="block rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.75)] p-4 transition hover:border-[rgba(31,95,99,0.4)]">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-muted)]">{resource.category}</p>
                      <p className="mt-2 text-base font-semibold text-[var(--atlas-ink)]">{resource.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--atlas-muted)]">{resource.description ?? "Reference link"}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScenicBreakpoint
        imageUrl={scenicImagePrimary}
        city={destination.city}
        caption={`Pause the numbers and read the atmosphere: this is the visual texture you should validate in person before committing to ${destination.city}.`}
      />

      <section id="day-here" className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,239,225,0.86))] p-8 shadow-[0_28px_56px_-34px_rgba(39,32,22,0.4)]">
          <SectionHeading
            eyebrow="Signature feature"
            title="A Day In Your Life Here"
            description="Test whether your weekday reality would feel easy, healthy, and repeatable."
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              {dayHere.timeline.map((item) => (
                <article key={item.time} className="rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-cyan-400/35 bg-cyan-100/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-900">{item.time}</span>
                    <h3 className="text-lg font-semibold text-[var(--atlas-ink)]">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Weekend ideas</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {dayHere.weekend.length === 0 ? (
                    <MissingDataState description="Weekend anchors appear here as activity records are published." />
                  ) : (
                    dayHere.weekend.map((idea) => (
                      <article key={idea.id} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.78)] p-4">
                        <p className="text-base font-semibold text-[var(--atlas-ink)]">{idea.name}</p>
                        {idea.subtitle ? <p className="mt-1 text-sm text-[var(--atlas-muted)]">{idea.subtitle}</p> : null}
                        {idea.value1 ? <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">{idea.value1}</p> : null}
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">What to notice on a scouting trip</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--atlas-muted)]">
                  <li>Watch whether the city stays appealing between errands, not just between viewpoints.</li>
                  <li>Compare the old core to quieter edges so you understand tradeoffs in noise, parking, and pace.</li>
                  <li>Test the route from home candidate to groceries, pharmacy, coffee, waterfront, and healthcare.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="scenarios" className="mx-auto max-w-7xl px-8 py-12">
        <SectionHeading
          eyebrow="Life scenarios"
          title="Pick the relocation lens that matches your next chapter"
          description="Fewer cards, clearer tradeoffs. Use these lenses as quick decision scaffolding."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {conciseScenarios.map((scenario) => (
            <article key={scenario.title} className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.85))] p-6 shadow-lg shadow-[rgba(39,32,22,0.2)]">
              <h3 className="text-xl font-bold text-[var(--atlas-ink)]">{scenario.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{scenario.summary}</p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--atlas-muted)]">
                {scenario.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--atlas-accent)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="snapshot" className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,239,225,0.86))] p-8 shadow-[0_28px_56px_-34px_rgba(39,32,22,0.4)]">
          <SectionHeading
            eyebrow="Decision layer"
            title="Relocation guide and living here scorecard"
            description="Concrete metrics first, then source-backed context."
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {conciseScorecard.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3">
                  <MissingDataState description="Scorecards render here when category scoring records are published." />
                </div>
              ) : (
                conciseScorecard.map((item) => (
                  <article key={item.category} className={`rounded-[1.75rem] border p-5 ${scoreTone(item.score)}`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-[var(--atlas-ink)]">{item.category}</h3>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.86)] text-xl font-black text-[var(--atlas-ink)]">
                        {typeof item.score === "number" ? item.score : "-"}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--atlas-muted)]">{item.explanation ?? "See source references below for currently published records."}</p>
                    <p className="mt-3 text-xs leading-5 text-[var(--atlas-muted)]">{item.underlyingMeasurements ?? "Underlying measurements have not been published yet."}</p>
                    <div className="mt-4 rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Based on</p>
                      {parseEvidencePoints(item.underlyingMeasurements).length > 0 ? (
                        <ul className="mt-2 space-y-1.5 text-xs text-[var(--atlas-muted)]">
                          {parseEvidencePoints(item.underlyingMeasurements).map((point) => (
                            <li key={point} className="flex gap-2">
                              <span className="text-emerald-700">✓</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-[var(--atlas-muted)]">No detailed evidence points currently published.</p>
                      )}
                      <p className="mt-3 text-xs text-[var(--atlas-muted)]">
                        Confidence: {item.verification?.confidenceLevel ? item.verification.confidenceLevel.toUpperCase() : "LOW"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <SourceVerificationBadge verification={item.verification} />
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">How scores are calculated</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--atlas-muted)]">
                  <p>
                    Composite score = mean of all published category scores on this page.
                  </p>
                  <p>
                    Evidence confidence = average verification weight where High = 1.0, Medium = 0.7, and Low = 0.4.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--atlas-border)] bg-white/75 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Composite score</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--atlas-ink)]">{typeof scoreAverage === "number" ? `${scoreAverage}/100` : "Not published"}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--atlas-border)] bg-white/75 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Evidence confidence</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--atlas-ink)]">{typeof evidenceConfidencePct === "number" ? `${evidenceConfidencePct}%` : "Not published"}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-[var(--atlas-muted)]">
                  Interpretation bands: 85+ strong fit, 75-84 moderate fit, below 75 needs closer district-level validation.
                </p>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Highest-priority planning signals</p>
                <div className="mt-4 space-y-3">
                  {planningSignals.slice(0, 3).map((signal) => (
                    <article key={signal.label} className={`rounded-3xl border p-4 ${signal.tone === "strong" ? "border-emerald-300/50 bg-emerald-50" : "border-amber-300/55 bg-amber-50"}`}>
                      <p className={`text-xs uppercase tracking-[0.2em] ${signal.tone === "strong" ? "text-emerald-900" : "text-amber-900"}`}>{signal.label}</p>
                      <p className={`mt-2 text-sm leading-6 ${signal.tone === "strong" ? "text-emerald-800" : "text-amber-800"}`}>{signal.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {conciseComprehensiveSections.map((section, index) => (
              <IntelligenceGuideSection
                key={`${section.title}-${index}`}
                title={section.title}
                summary={section.summary}
                items={section.items}
                city={destination.city}
                country={destination.country}
              />
            ))}
          </div>

          <p className="mt-6 text-sm leading-7 text-[var(--atlas-muted)]">
            Need the full evidence stack? Continue to the detailed practical and source sections below.
          </p>
        </div>
      </section>

      <ScenicBreakpoint
        imageUrl={scenicImageSecondary}
        city={destination.city}
        caption="Use this visual layer to pressure-test fit: can you picture your actual routines here week after week, not just a beautiful weekend?"
      />

      <section id="monthly-weather" className="mx-auto max-w-7xl px-8 py-12">
        <SectionHeading
          eyebrow="Climate experience"
          title="One of the clearest ways to imagine real life here"
          description="Weather is not just a table. It shapes the months when the city feels energetic, restful, humid, bright, social, or easy to walk."
        />
        <div className="mt-8">
          <MonthlyClimatePanel rows={command.monthlyClimate} />
        </div>
      </section>

      <section id="homes" className="mx-auto max-w-7xl px-8 py-12">
        <SectionHeading
          eyebrow="Homes and neighborhoods"
          title="Read housing as a neighborhood decision, not just a price point"
          description="The city can be right while the wrong district ruins the move. Pair cost, housing, and neighborhood texture together."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Cost of living</p>
              <div className="mt-4">
                <MetricGrid
                  metrics={command.costOfLiving.map((metric) => ({
                    label: metric.label,
                    value: formatMetricValue(metric),
                    verification: metric.verification,
                  }))}
                  emptyText="See source references below for currently published records."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Housing metrics</p>
              <div className="mt-4">
                <MetricGrid
                  metrics={command.housingMetrics.map((metric) => ({
                    label: metric.label,
                    value: formatMetricValue(metric),
                    verification: metric.verification,
                  }))}
                  emptyText="See source references below for currently published records."
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.84))] p-6 shadow-xl shadow-[rgba(39,32,22,0.2)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Neighborhood explorer</p>
            <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">Look for the district that matches your ideal daily rhythm, not just the strongest photo backdrop.</p>
            <div className="mt-6">
              <NeighborhoodExplorer rows={command.neighborhoods} city={destination.city} country={destination.country} />
            </div>
          </div>
        </div>
      </section>

      <ScenicBreakpoint
        imageUrl={scenicImagePrimary}
        city={destination.city}
        caption="Neighborhood fit decides the move. Use this visual pause to compare density, architecture, green space, and day-to-day atmosphere before you commit to one district."
      />

      <section id="lifestyle" className="mx-auto max-w-7xl px-8 py-12">
        <SectionHeading
          eyebrow="Lifestyle intelligence"
          title="Daily life becomes real when healthcare, movement, and leisure appear together"
          description="This is the part of the move that answers whether the destination is practical enough to be repeatable, not just beautiful enough to be memorable."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Healthcare intelligence</p>
            <div className="mt-4">
              <GuideSpotExplorer rows={command.healthcareFacilities} sectionLabel="Healthcare" emptyDescription="See source references below for currently published records." city={destination.city} country={destination.country} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Transportation and access</p>
            <div className="mt-4">
              <GuideSpotExplorer rows={command.airports} sectionLabel="Transportation" emptyDescription="See source references below for currently published records." city={destination.city} country={destination.country} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.84))] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Golf, beaches, and recreation</p>
            <div className="mt-4 grid gap-6 xl:grid-cols-2">
              <div>
                <h3 className="mb-3 text-base font-semibold text-[var(--atlas-ink)]">Recreation</h3>
                <RecordList
                  rows={[...command.beaches, ...command.recreationFacilities].slice(0, 6)}
                  emptyDescription="See source references below for currently published records."
                  city={destination.city}
                  country={destination.country}
                />
              </div>
              <div>
                <h3 className="mb-3 text-base font-semibold text-[var(--atlas-ink)]">Golf</h3>
                <RecordList
                  rows={command.golfCourses}
                  emptyDescription="See source references below for currently published records."
                  city={destination.city}
                  country={destination.country}
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.84))] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Food and daily life</p>
            <div className="mt-4 space-y-6">
              <GuideSpotExplorer rows={command.foodSpots} sectionLabel="Food" emptyDescription="See source references below for currently published records." city={destination.city} country={destination.country} />
              <MetricGrid
                metrics={command.foodMetrics.map((metric) => ({
                  label: metric.label,
                  value: formatMetricValue(metric),
                  verification: metric.verification,
                }))}
                emptyText="See source references below for currently published records."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="practical" className="mx-auto max-w-7xl px-8 py-12">
        <SectionHeading
          eyebrow="Practical living"
          title="The move gets easier when the operational details are visible early"
          description="Use this layer to confirm internet, schools, tax and residency logic, and the tradeoffs that matter after the honeymoon phase."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Schools and family</p>
            <div className="mt-4">
              <RecordList
                rows={command.schools}
                emptyDescription="See source references below for currently published records."
                city={destination.city}
                country={destination.country}
              />
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Internet and remote work</p>
              <div className="mt-4">
                <MetricGrid
                  metrics={command.internetMetrics.map((metric) => ({
                    label: metric.label,
                    value: formatMetricValue(metric),
                    verification: metric.verification,
                  }))}
                  emptyText="See source references below for currently published records."
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Practical living directory</p>
              <div className="mt-4">
                <GuideSpotExplorer rows={command.practicalInfo} sectionLabel="Practical living" emptyDescription="See source references below for currently published records." city={destination.city} country={destination.country} />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Taxes, visas, and residency</p>
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="mb-3 text-base font-semibold text-[var(--atlas-ink)]">Visa programs</h3>
                <RecordList
                  rows={command.visaPrograms}
                  emptyDescription="See source references below for currently published records."
                  city={destination.city}
                  country={destination.country}
                />
              </div>
              <div>
                <h3 className="mb-3 text-base font-semibold text-[var(--atlas-ink)]">Tax rules</h3>
                <RecordList
                  rows={command.taxRules}
                  emptyDescription="See source references below for currently published records."
                  city={destination.city}
                  country={destination.country}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Safety and environment</p>
              <div className="mt-4">
                <MetricGrid
                  metrics={command.safetyMetrics.map((metric) => ({
                    label: metric.label,
                    value: formatMetricValue(metric),
                    verification: metric.verification,
                  }))}
                  emptyText="See source references below for currently published records."
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-300/55 bg-emerald-50 p-6">
              <h3 className="text-xl font-semibold text-emerald-950">Advantages</h3>
              {command.pros.length === 0 ? (
                <div className="mt-4">
                  <MissingDataState description="See source references below for currently published records." />
                </div>
              ) : (
                <ul className="mt-4 space-y-3 text-sm leading-7 text-emerald-900">
                  {command.pros.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[2rem] border border-amber-300/60 bg-amber-50 p-6">
              <h3 className="text-xl font-semibold text-amber-950">Tradeoffs</h3>
              {command.tradeoffs.length === 0 ? (
                <div className="mt-4">
                  <MissingDataState description="See source references below for currently published records." />
                </div>
              ) : (
                <ul className="mt-4 space-y-3 text-sm leading-7 text-amber-900">
                  {command.tradeoffs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <ScenicBreakpoint
        imageUrl={scenicImageSecondary}
        city={destination.city}
        caption="After costs, healthcare, internet, and transport are clear, this is the final test: does the city still feel like somewhere you would enjoy living for years?"
      />

      <section id="map-media" className="mx-auto max-w-7xl px-8 py-8">
        <SectionHeading
          eyebrow="Explore visually"
          title="Map the place, then browse the atmosphere"
          description="Use maps for practical orientation and media for emotional calibration. Both matter before a move."
        />
        <div className="mt-6 rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6 shadow-xl shadow-[rgba(39,32,22,0.2)]">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(`${destination.city}, ${destination.country}`)}&z=12&output=embed`}
            title={`${destination.city} map`}
            className="h-[420px] w-full rounded-2xl border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={mapSearchUrl} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Google Maps</Link>
            <Link href={`https://earth.google.com/web/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}`} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Google Earth</Link>
          </div>
        </div>

        <div className="mt-8">
          <DestinationGallery destination={destination} resources={command.resources} />
        </div>
      </section>

      <section id="resources" className="mx-auto max-w-7xl px-8 pb-16 pt-8">
        <SectionHeading
          eyebrow="Source library"
          title="Verified links for deeper self-directed research"
          description="The best relocation platforms let you keep going after the page ends. Use these links to validate the move yourself."
        />
        {command.resources.length === 0 ? (
          <div className="mt-6">
            <MissingDataState description="Research resources are shown here when links are published for this destination." />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {command.resources.map((resource) => (
              <article key={resource.id} className="rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] p-5 shadow-lg shadow-[rgba(39,32,22,0.2)]">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">{resource.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--atlas-ink)]">{resource.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">{resource.description ?? "Reference link"}</p>
                <p className="mt-2 text-xs text-[var(--atlas-muted)]">Source type: {resource.sourceType ?? "Unspecified"}</p>
                <p className="text-xs text-[var(--atlas-muted)]">Verified: {formatDate(resource.verifiedAt)}</p>
                <Link href={resource.url} target="_blank" className="mt-4 inline-flex rounded-full border border-[rgba(31,95,99,0.35)] bg-[rgba(31,95,99,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.15)]">
                  Open link
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
