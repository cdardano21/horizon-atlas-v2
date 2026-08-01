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
import { buildVisibleEditorialNarratives, getDestinationContent } from "../../lib/destination-content";
import { defaultMissingVerification, getDestinationCommandCenter } from "../../lib/destination-command-center";
import { getDestinationResearchProfile } from "../../lib/destination-research";
import type { CommandCenterData, NamedRecord, VerificationMeta } from "../../lib/destination-command-center";
import { toConsumerCopy } from "../../lib/consumer-copy";
import { getDestinationRelocationFrame } from "../../lib/destination-page-structure";
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

function firstNonEmptyText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return "";
}

function isWeakPlaceAnchor(value: string | null | undefined, city: string) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === city.trim().toLowerCase()) return true;
  return normalized.includes("not published")
    || normalized.includes("no verified")
    || normalized.includes("source expansion")
    || normalized.includes("framework")
    || normalized.includes("support portal")
    || normalized.includes("coastal / water access");
}

function pickPlaceAnchor(candidates: Array<string | null | undefined>, fallback: string, city: string) {
  for (const candidate of candidates) {
    if (!isWeakPlaceAnchor(candidate, city)) return candidate!.trim();
  }
  return fallback;
}

function getYouTubeThumbnail(videoUrl: string | null | undefined) {
  if (!videoUrl) return null;

  const watchMatch = videoUrl.match(/[?&]v=([^&]+)/);
  const shortMatch = videoUrl.match(/youtu\.be\/([^?&/]+)/);
  const embedMatch = videoUrl.match(/\/embed\/([^?&/]+)/);
  const videoId = watchMatch?.[1] ?? shortMatch?.[1] ?? embedMatch?.[1] ?? null;

  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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

function soundsRoboticNarrative(value: string | null | undefined) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes("residency context")
    || normalized.includes("tax context")
    || normalized.includes("dri signal")
    || normalized.includes("confidence")
    || normalized.includes("monthly spend")
    || normalized.includes("roughly eur")
    || value.length > 260;
}

function buildEditorialOverview(command: CommandCenterData) {
  const destination = command.destination;
  const cityKey = destination.city.trim().toLowerCase();
  const isCavtat = cityKey === "cavtat";
  const isHiroshima = cityKey === "hiroshima";
  const tags = destination.tags ?? [];
  const coastal = tags.includes("beach") || tags.includes("coast") || command.beaches.length > 0;
  const cultural = tags.includes("culture");
  const neighborhoods = summarizeRows(command.neighborhoods, 2);
  const recreation = summarizeRows([...command.beaches, ...command.recreationFacilities, ...command.golfCourses], 3);
  const airportAnchor = pickPlaceAnchor(
    [command.airports[0]?.name, destination.transportation],
    `${destination.city} airport network`,
    destination.city,
  );
  const healthcareAnchor = pickPlaceAnchor(
    [command.healthcareFacilities[0]?.name],
    `${destination.city} healthcare network`,
    destination.city,
  );
  const practicalAnchor = pickPlaceAnchor(
    [command.foodSpots[0]?.name, command.recreationFacilities[0]?.name, command.beaches[0]?.name, command.practicalInfo[0]?.name],
    `${destination.city} daily core`,
    destination.city,
  );
  const neighborhoodAnchor = neighborhoods.length > 1
    ? `${neighborhoods[0]} and ${neighborhoods[1]}`
    : neighborhoods[0] ?? `central ${destination.city}`;
  const humanIntroFallback = isCavtat
    ? "Cavtat is a small Adriatic harbor town on the Rat and Sustjepan peninsulas, just south of Dubrovnik, with palm-lined promenades and clear coves that keep daily life close to the water."
    : coastal
    ? `${destination.city} comes into focus when the day is built from ordinary pleasures: a market breakfast, a walk through ${neighborhoodAnchor}, and a route toward ${practicalAnchor} that still feels easy after a few days.`
    : `${destination.city} becomes legible when the rhythms of a day feel natural rather than staged: a morning in ${neighborhoodAnchor}, a meal around ${practicalAnchor}, and an evening that still seems worth repeating.`;
  const humanFollowFallback = isCavtat
    ? "Start with the harbor loop at breakfast, walk the pine-shaded paths above Luka Bay by midday, and stay out at sunset when the waterfront cafes fill with locals."
    : neighborhoods.length > 0
    ? `${destination.city} becomes compelling when the ordinary routines carry as much charm as the landmarks. Morning starts, neighborhood errands, and an afternoon spent ${formatList(recreation.slice(0, 2))} often tell you more than the postcard view.`
    : `${destination.city} reveals its real character when a full day holds together naturally: breakfast near ${practicalAnchor}, errands that feel effortless, and an evening plan that still feels worth repeating.`;
  const intro = isHiroshima
    ? "Hiroshima reveals itself in ordinary pleasures: river walks at the start of the day, tram rides that feel effortless, and neighborhoods where calm is built into the routine rather than staged for visitors."
    : !isTemplateCopy(destination.description) && !soundsRoboticNarrative(destination.description)
    ? destination.description
    : humanIntroFallback;
  const follow = isHiroshima
    ? "The city's rivers, gardens, and compact districts give it a rhythm unlike Japan's biggest metropolises. There is still energy here, but it arrives as neighborhood life, long lunches, and the comfort of everyday routines rather than relentless pace."
    : !isTemplateCopy(destination.overview) && !soundsRoboticNarrative(destination.overview)
    ? destination.overview
    : humanFollowFallback;
  const dek = isHiroshima
    ? "For relocation, Hiroshima works best as a balanced city: dependable transit, excellent medical access, and a daily cadence that feels calm enough to sustain a long stay without becoming sleepy."
    : !isTemplateCopy(destination.lifestyle)
    ? destination.lifestyle
    : cultural
    ? `${destination.city} mixes local character with practical long-stay logic.`
    : `${destination.city} works best when lifestyle and logistics are weighed together.`;
  const aiQuote = command.intelligence.aiSummary?.split(".")[0]?.trim();
  const quote = isCavtat
    ? "If Dubrovnik feels beautiful but intense, Cavtat gives you more breathing room without losing the Adriatic light, harbor life, or quick airport access."
    : isHiroshima
    ? "The best version of Hiroshima is not loud or glamorous; it is composed, practical, and quietly generous, the kind of place that becomes easier to love the longer you live in it."
    : aiQuote && !soundsRoboticNarrative(aiQuote)
    ? aiQuote
    : `${destination.city} is easiest to trust after a week of ordinary routines, from groceries and clinic access to evenings in ${practicalAnchor} that you genuinely want to repeat.`;

  return { intro, follow, dek, quote };
}

function buildDayMoments(command: CommandCenterData) {
  const city = command.destination.city;
  const country = command.destination.country;
  const cityKey = command.destination.city.trim().toLowerCase();
  const isCavtat = cityKey === "cavtat";
  const isHiroshima = cityKey === "hiroshima";
  const isKobe = cityKey === "kobe";
  const mapsSearch = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const youtubeSearch = (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const tiktokSearch = (query: string) => `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
  const cavtatVideos = {
    harborWalk: "https://www.youtube.com/watch?v=iw-ZCAXtBfo",
    oldTownBukovac: "https://www.youtube.com/watch?v=wpYk7KS2hk4",
    ratRacic: "https://www.youtube.com/watch?v=v6Z8O5nBuqM",
    townCenter: "https://www.youtube.com/watch?v=A8r4IgfcX4s",
    eveningWaterfront: "https://www.youtube.com/watch?v=Vsj-V3jvQQc",
  };
  const neighborhood = command.neighborhoods[0];
  const secondNeighborhood = command.neighborhoods[1] ?? command.recreationFacilities[0];
  const afternoon = command.beaches[0] ?? command.golfCourses[0] ?? command.recreationFacilities[0];
  const evening = command.neighborhoods[0] ?? command.recreationFacilities[0];
  const weekend = isCavtat
    ? [
      {
        id: "cavtat-harbor-old-town",
        name: "Harbor promenade + Old Town lanes",
        subtitle: "Morning walk-through",
        value1: "Begin at Cavtat Harbor, grab coffee on the palm-lined promenade, then cut into the Old Town stone lanes to compare tourist frontage with lived-in side streets.",
        sourceUrl: mapsSearch("Cavtat Harbor promenade"),
        videoUrl: cavtatVideos.harborWalk,
        tiktokUrl: tiktokSearch("Cavtat Harbor Old Town walk"),
      },
      {
        id: "cavtat-rat-racic",
        name: "Rat Peninsula + Racic Mausoleum",
        subtitle: "Midday climb and viewpoints",
        value1: "Walk the pine path up Rat Peninsula toward the Racic Mausoleum and test incline, shade, and bench spacing for realistic daily mobility.",
        sourceUrl: mapsSearch("Racic Mausoleum Cavtat"),
        videoUrl: cavtatVideos.ratRacic,
        tiktokUrl: tiktokSearch("Rat Peninsula Racic Mausoleum Cavtat"),
      },
      {
        id: "cavtat-bukovac-st-nicholas",
        name: "Bukovac House + St. Nicholas stop",
        subtitle: "Culture + everyday center",
        value1: "Use Bukovac House Museum and St. Nicholas Church as anchors, then time the walk back to groceries, pharmacy, and lunch to judge practical center-of-town flow.",
        sourceUrl: mapsSearch("Bukovac House Museum Cavtat"),
        videoUrl: cavtatVideos.oldTownBukovac,
        tiktokUrl: tiktokSearch("Bukovac House Museum Cavtat walk"),
      },
      {
        id: "cavtat-little-star-transfer",
        name: "Beach Bar Little Star + transfer reality",
        subtitle: "Evening atmosphere + access",
        value1: "End with a waterfront dinner stop near the rocky coves, then run an evening transfer check toward Dubrovnik/Airport to test real return friction.",
        sourceUrl: mapsSearch("Beach Bar Little Star Cavtat"),
        videoUrl: cavtatVideos.eveningWaterfront,
        tiktokUrl: tiktokSearch("Cavtat evening waterfront walk"),
      },
    ]
    : isHiroshima
    ? [
      {
        id: "hiroshima-peace-river-loop",
        name: "Peace Memorial Park + Motoyasu riverwalk",
        subtitle: "Morning orientation walk",
        value1: "Start at Peace Memorial Park, then continue along the Motoyasu and Honkawa riverbanks to understand how water and green space shape central daily life.",
        sourceUrl: mapsSearch("Hiroshima Peace Memorial Park"),
        videoUrl: youtubeSearch("Hiroshima Peace Memorial Park walking tour"),
        tiktokUrl: tiktokSearch("Hiroshima Peace Memorial Park river walk"),
      },
      {
        id: "hiroshima-hondori-kamiyacho",
        name: "Hondori + Kamiyacho",
        subtitle: "Daily errands and transit core",
        value1: "Walk the Hondori arcade and Kamiyacho area to test practical routines: groceries, pharmacies, banking, and tram transfers in the city center.",
        sourceUrl: mapsSearch("Hondori Shopping Street Hiroshima"),
        videoUrl: youtubeSearch("Hondori Hiroshima walk"),
        tiktokUrl: tiktokSearch("Hondori Hiroshima walking"),
      },
      {
        id: "hiroshima-okonomiyaki-nagarekawa",
        name: "Okonomimura + Nagarekawa",
        subtitle: "Evening food and street life",
        value1: "Have Hiroshima-style okonomiyaki around Okonomimura, then check the evening pace in Nagarekawa to see how lively the city feels after work hours.",
        sourceUrl: mapsSearch("Okonomimura Hiroshima"),
        videoUrl: youtubeSearch("Hiroshima okonomiyaki Okonomimura"),
        tiktokUrl: tiktokSearch("Okonomimura Hiroshima"),
      },
      {
        id: "hiroshima-miyajima-day-trip",
        name: "Miyajima day-trip rehearsal",
        subtitle: "Weekend quality-of-life test",
        value1: "Run the train-and-ferry route to Miyajima and back to confirm how realistic easy nature and culture excursions are from your weekday home base.",
        sourceUrl: mapsSearch("Miyajima Ferry Miyajimaguchi"),
        videoUrl: youtubeSearch("Miyajima day trip from Hiroshima"),
        tiktokUrl: tiktokSearch("Miyajima day trip Hiroshima"),
      },
    ]
    : [...command.beaches, ...command.recreationFacilities, ...command.golfCourses, ...command.airports].slice(0, 4).map((item) => ({
      ...item,
      sourceUrl: item.url ?? mapsSearch(`${item.name} ${city} ${country}`),
      videoUrl: youtubeSearch(`${item.name} ${city} walk through`),
      tiktokUrl: tiktokSearch(`${item.name} ${city} walk through`),
    }));

  const scoutingChecks = isCavtat
    ? [
      "From Cavtat Harbor, clock one full errand loop: pharmacy, groceries, bank/ATM, and back to the promenade in under an hour.",
      "Walk Rat Peninsula to the Racic Mausoleum in midday heat and score shade coverage and incline comfort honestly.",
      "Compare two dinner windows on the waterfront (6:30 PM and 8:30 PM) to assess noise, crowd mix, and table turnover speed.",
      "Run one daytime and one evening transfer toward Dubrovnik Airport to validate the advertised convenience in real conditions.",
    ]
    : isHiroshima
    ? [
      "Walk both sides of Peace Memorial Park and nearby bridges to judge whether the center feels calm or crowded at different hours.",
      "Ride multiple streetcar lines (including a transfer) to test how easy day-to-day movement feels without relying on taxis.",
      "Compare lunch and evening flows around Hondori/Kamiyacho and Nagarekawa to understand noise, crowding, and local rhythm.",
      "Do one full Miyajima rehearsal day to measure true door-to-door weekend effort from your target neighborhood.",
    ]
    : [
      "Watch whether the city stays appealing between errands, not just between viewpoints.",
      "Compare the old core to quieter edges so you understand tradeoffs in noise, parking, and pace.",
      "Test the route from home candidate to groceries, pharmacy, coffee, waterfront, and healthcare.",
    ];

  if (isCavtat) {
    return {
      timeline: [
        {
          time: "7:30 AM",
          title: "Morning: Cavtat Harbor + promenade coffee",
          detail: "Start on the palm-lined harbor promenade, watch service activity before crowds arrive, and check whether the waterfront still feels usable for everyday mornings rather than just vacation photos.",
          sourceLabel: "Map: Harbor promenade",
          sourceUrl: mapsSearch("Cavtat Harbor promenade"),
          tiktokUrl: tiktokSearch("Cavtat Harbor promenade"),
          youtubeLabel: "YouTube: Harbor walk",
          youtubeUrl: cavtatVideos.harborWalk,
          thumbnailIndex: 0,
        },
        {
          time: "9:30 AM",
          title: "Late morning: Old Town lanes + Bukovac House",
          detail: "Leave the seafront for Old Town back lanes, then pass Bukovac House Museum to see whether Cavtat's cultural core feels active and authentic beyond the promenade strip.",
          sourceLabel: "Map: Old Town + Bukovac House",
          sourceUrl: mapsSearch("Bukovac House Museum Cavtat"),
          tiktokUrl: tiktokSearch("Cavtat Old Town Bukovac House"),
          youtubeLabel: "YouTube: Old Town walk",
          youtubeUrl: cavtatVideos.oldTownBukovac,
          thumbnailIndex: 1,
        },
        {
          time: "1:00 PM",
          title: "Midday: Rat Peninsula to Racic Mausoleum",
          detail: "Climb the Rat Peninsula route toward the Racic Mausoleum and test incline, path quality, and shade under real heat; this reveals daily mobility fit far better than map distance.",
          sourceLabel: "Map: Rat Peninsula + Racic Mausoleum",
          sourceUrl: mapsSearch("Racic Mausoleum Cavtat"),
          tiktokUrl: tiktokSearch("Rat Peninsula Racic Mausoleum Cavtat"),
          youtubeLabel: "YouTube: Rat Peninsula route",
          youtubeUrl: cavtatVideos.ratRacic,
          thumbnailIndex: 2,
        },
        {
          time: "4:00 PM",
          title: "Afternoon: practical loop + St. Nicholas area",
          detail: "Return via the town center near St. Nicholas Church and complete a practical run (groceries, pharmacy, coffee) to verify if routines feel easy without a car.",
          sourceLabel: "Map: St. Nicholas area",
          sourceUrl: mapsSearch("Saint Nicholas Church Cavtat"),
          tiktokUrl: tiktokSearch("Cavtat St Nicholas Church"),
          youtubeLabel: "YouTube: town-center loop",
          youtubeUrl: cavtatVideos.townCenter,
          thumbnailIndex: 3,
        },
        {
          time: "7:30 PM",
          title: "Evening: waterfront dinner + transfer test",
          detail: "Finish near the rocky-cove waterfront (for example around the Little Star stretch), then test an evening transfer toward Dubrovnik/Airport to validate true door-to-door friction.",
          sourceLabel: "Map: Little Star waterfront",
          sourceUrl: mapsSearch("Beach Bar Little Star Cavtat"),
          tiktokUrl: tiktokSearch("Cavtat evening waterfront"),
          youtubeLabel: "YouTube: evening waterfront",
          youtubeUrl: cavtatVideos.eveningWaterfront,
          thumbnailIndex: 4,
        },
      ],
      weekend,
      scoutingChecks,
    };
  }

  if (isHiroshima) {
    return {
      timeline: [
        {
          time: "7:30 AM",
          title: "Morning: Peace Memorial Park + riverbanks",
          detail: "Start at Peace Memorial Park before the main crowds, then continue along the Motoyasu and Honkawa riverwalks to see how green space and water shape the center's daily pace.",
          sourceLabel: "Map: Peace Park and rivers",
          sourceUrl: mapsSearch("Hiroshima Peace Memorial Park"),
          tiktokUrl: tiktokSearch("Hiroshima Peace Memorial Park morning walk"),
          youtubeLabel: "YouTube: Peace Park walk",
          youtubeUrl: youtubeSearch("Hiroshima Peace Memorial Park walking tour"),
          thumbnailIndex: 0,
        },
        {
          time: "9:30 AM",
          title: "Late morning: Hondori + Kamiyacho practical loop",
          detail: "Walk Hondori and Kamiyacho for the real relocation test: groceries, pharmacies, banks, transit transfers, and whether the center still feels easy once you switch out of sightseeing mode.",
          sourceLabel: "Map: Hondori and Kamiyacho",
          sourceUrl: mapsSearch("Hondori Shopping Street Hiroshima"),
          tiktokUrl: tiktokSearch("Hondori Kamiyacho Hiroshima walk"),
          youtubeLabel: "YouTube: downtown walk",
          youtubeUrl: youtubeSearch("Hondori Hiroshima walk"),
          thumbnailIndex: 1,
        },
        {
          time: "1:00 PM",
          title: "Lunch: Hiroshima-style okonomiyaki",
          detail: "Use lunch at Okonomimura or a neighborhood okonomiyaki counter to gauge everyday food value, queue times, and how quickly you can settle into local routines.",
          sourceLabel: "Map: Okonomimura",
          sourceUrl: mapsSearch("Okonomimura Hiroshima"),
          tiktokUrl: tiktokSearch("Hiroshima style okonomiyaki"),
          youtubeLabel: "YouTube: okonomiyaki local spots",
          youtubeUrl: youtubeSearch("Hiroshima style okonomiyaki guide"),
          thumbnailIndex: 2,
        },
        {
          time: "4:00 PM",
          title: "Afternoon: Shukkeien or Hijiyama Park",
          detail: "Spend late afternoon in Shukkeien Garden or Hijiyama Park to check access to quieter green space within ordinary city life, not just on a weekend.",
          sourceLabel: "Map: parks and gardens",
          sourceUrl: mapsSearch("Shukkeien Garden Hiroshima"),
          tiktokUrl: tiktokSearch("Shukkeien Hiroshima"),
          youtubeLabel: "YouTube: Hiroshima parks",
          youtubeUrl: youtubeSearch("Shukkeien Hijiyama Park Hiroshima"),
          thumbnailIndex: 3,
        },
        {
          time: "7:30 PM",
          title: "Evening: Nagarekawa + tram ride home",
          detail: "End in Nagarekawa for dinner and nightlife atmosphere, then ride the streetcar back to your target district to test nighttime convenience and comfort.",
          sourceLabel: "Map: Nagarekawa",
          sourceUrl: mapsSearch("Nagarekawa Hiroshima"),
          tiktokUrl: tiktokSearch("Nagarekawa Hiroshima evening"),
          youtubeLabel: "YouTube: evening Hiroshima",
          youtubeUrl: youtubeSearch("Hiroshima night walk Nagarekawa"),
          thumbnailIndex: 4,
        },
      ],
      weekend,
      scoutingChecks,
    };
  }

  if (isKobe) {
    return {
      timeline: [
        {
          time: "7:30 AM",
          title: "Morning: Meriken Park and the harbor promenade",
          detail: "Start by the water to judge whether the harbor feels like an everyday amenity or just a backdrop. Compare the promenade's morning calm with the transit energy of nearby stations.",
          sourceLabel: "Map: Meriken Park",
          sourceUrl: mapsSearch("Meriken Park Kobe"),
          tiktokUrl: tiktokSearch("Kobe Meriken Park morning walk"),
          youtubeLabel: "YouTube: harbor walk",
          youtubeUrl: youtubeSearch("Kobe harbor walk"),
          thumbnailIndex: 0,
        },
        {
          time: "9:30 AM",
          title: "Late morning: Sannomiya and station-side errands",
          detail: "Test how easy it is to cover groceries, cafes, and transit transfers from the central core without needing a car or a long detour.",
          sourceLabel: "Map: Sannomiya",
          sourceUrl: mapsSearch("Sannomiya Kobe"),
          tiktokUrl: tiktokSearch("Kobe Sannomiya walk"),
          youtubeLabel: "YouTube: station-area walk",
          youtubeUrl: youtubeSearch("Kobe Sannomiya walking tour"),
          thumbnailIndex: 1,
        },
        {
          time: "1:00 PM",
          title: "Lunch: local food culture and neighborhood pacing",
          detail: "Use lunch to measure whether everyday dining feels exciting and practical at the same time, from basic noodle stops to the kind of neighborhood places that define a week.",
          sourceLabel: "Map: Kobe food streets",
          sourceUrl: mapsSearch("Kobe food street"),
          tiktokUrl: tiktokSearch("Kobe local food walk"),
          youtubeLabel: "YouTube: local food guide",
          youtubeUrl: youtubeSearch("Kobe food guide"),
          thumbnailIndex: 2,
        },
        {
          time: "4:00 PM",
          title: "Afternoon: Nunobiki or Rokko views",
          detail: "Take the slope or cable route to judge whether the city’s hills and viewpoints support a long-stay routine or simply create a scenic weekend outing.",
          sourceLabel: "Map: Nunobiki or Rokko",
          sourceUrl: mapsSearch("Nunobiki Herb Garden Kobe"),
          tiktokUrl: tiktokSearch("Kobe Nunobiki walk"),
          youtubeLabel: "YouTube: hillside walk",
          youtubeUrl: youtubeSearch("Kobe Nunobiki walk"),
          thumbnailIndex: 3,
        },
        {
          time: "7:30 PM",
          title: "Evening: harbor dinner and transit home",
          detail: "Finish with a harbor-side dinner and then a transit ride back toward your target neighborhood to assess how the city feels after dark and after a full day.",
          sourceLabel: "Map: Kobe harbor dinner",
          sourceUrl: mapsSearch("Kobe harbor dinner"),
          tiktokUrl: tiktokSearch("Kobe harbor evening walk"),
          youtubeLabel: "YouTube: evening harbor walk",
          youtubeUrl: youtubeSearch("Kobe evening harbor walk"),
          thumbnailIndex: 4,
        },
      ],
      weekend: [
        {
          id: "kobe-meriken-harbor",
          name: "Meriken Park + harbor loop",
          subtitle: "Harbor-based starter",
          value1: "Use the waterfront to test how often the city feels calm and social in the same hour.",
          sourceUrl: mapsSearch("Meriken Park Kobe"),
          videoUrl: youtubeSearch("Kobe Meriken Park walk"),
          tiktokUrl: tiktokSearch("Kobe harbor walk"),
        },
        {
          id: "kobe-kitano-cafe",
          name: "Kitano district + local cafés",
          subtitle: "Neighborhood texture",
          value1: "See whether the hilly districts still feel practical once you factor in steps, cafés, and everyday errands.",
          sourceUrl: mapsSearch("Kitano district Kobe"),
          videoUrl: youtubeSearch("Kobe Kitano district"),
          tiktokUrl: tiktokSearch("Kobe Kitano walk"),
        },
        {
          id: "kobe-nunobiki-rokko",
          name: "Nunobiki or Rokko viewpoints",
          subtitle: "Day-trip quality test",
          value1: "Measure whether the hills add drama to daily life or make the city feel harder to use than the headline appeal suggests.",
          sourceUrl: mapsSearch("Nunobiki Herb Garden Kobe"),
          videoUrl: youtubeSearch("Kobe Nunobiki walk"),
          tiktokUrl: tiktokSearch("Kobe Rokko viewpoint"),
        },
      ],
      scoutingChecks: [
        "Compare a morning harbor loop with a later station-area errand run to judge whether the city feels coherent from more than one side of the day.",
        "Measure how often the hills, stairs, and transit transfers affect a normal day rather than just a scenic outing.",
        "Test whether the food scene feels useful for everyday life, not just impressive on a weekend.",
      ],
    };
  }

  return {
    timeline: [
      {
        time: "7:30 AM",
        title: neighborhood ? `Start in ${neighborhood.name}` : "Start with the city center",
        detail: neighborhood?.value1 ?? `Ease into the day in the part of ${command.destination.city} most likely to become your default morning loop.`,
        sourceLabel: "Map",
        sourceUrl: mapsSearch(`${neighborhood?.name ?? `${city} city center`} ${city} ${country}`),
        tiktokUrl: tiktokSearch(`${neighborhood?.name ?? city} ${city} walk`),
        youtubeLabel: "YouTube walk-through",
        youtubeUrl: youtubeSearch(`${neighborhood?.name ?? city} ${city} walking tour`),
        thumbnailIndex: 0,
      },
      {
        time: "9:30 AM",
        title: secondNeighborhood ? `Explore toward ${secondNeighborhood.name}` : "Explore before the day speeds up",
        detail: secondNeighborhood?.value2 ?? "Use the quieter morning window to test sidewalks, pace, shade, and noise.",
        sourceLabel: "Map",
        sourceUrl: mapsSearch(`${secondNeighborhood?.name ?? city} ${city} ${country}`),
        tiktokUrl: tiktokSearch(`${secondNeighborhood?.name ?? city} ${city} walk`),
        youtubeLabel: "YouTube walk-through",
        youtubeUrl: youtubeSearch(`${secondNeighborhood?.name ?? city} ${city} neighborhood walk`),
        thumbnailIndex: 1,
      },
      {
        time: "1:00 PM",
        title: "Pause for the practical test",
        detail: `Check whether lunch, groceries, and pharmacy runs feel easy enough to repeat year-round in ${command.destination.city}.`,
        sourceLabel: "Map",
        sourceUrl: mapsSearch(`grocery pharmacy ${city} ${country}`),
        tiktokUrl: tiktokSearch(`${city} grocery pharmacy walk`),
        youtubeLabel: "YouTube walk-through",
        youtubeUrl: youtubeSearch(`${city} daily errands walk`),
        thumbnailIndex: 2,
      },
      {
        time: "4:00 PM",
        title: afternoon ? `Lean into ${afternoon.name}` : "Choose the lifestyle version of the city",
        detail: afternoon?.value1 ?? "Use the afternoon to test water access, parks, galleries, or outdoor life.",
        sourceLabel: "Map",
        sourceUrl: mapsSearch(`${afternoon?.name ?? city} ${city} ${country}`),
        tiktokUrl: tiktokSearch(`${afternoon?.name ?? city} ${city} walk`),
        youtubeLabel: "YouTube walk-through",
        youtubeUrl: youtubeSearch(`${afternoon?.name ?? city} ${city} travel guide`),
        thumbnailIndex: 3,
      },
      {
        time: "7:30 PM",
        title: evening ? `Return to ${evening.name}` : "End where you would actually linger",
        detail: evening?.value2 ?? `Evening is the real test: watch how locals use the streets after dark.`,
        sourceLabel: "Map",
        sourceUrl: mapsSearch(`${evening?.name ?? city} ${city} ${country} evening`),
        tiktokUrl: tiktokSearch(`${evening?.name ?? city} evening walk`),
        youtubeLabel: "YouTube walk-through",
        youtubeUrl: youtubeSearch(`${evening?.name ?? city} evening walk`),
        thumbnailIndex: 4,
      },
    ],
    weekend,
    scoutingChecks,
  };
}

function buildLifeScenarios(command: CommandCenterData) {
  const cityKey = command.destination.city.trim().toLowerCase();
  const isHiroshima = cityKey === "hiroshima";

  if (isHiroshima) {
    return [
      {
        title: "Retiring here",
        accent: "from-amber-400/25 to-orange-500/10",
        summary: "Calm riverside living with strong healthcare and easy daily mobility.",
        bullets: [
          "Peace Memorial Park and the downtown rivers make everyday walks feel restorative rather than rushed.",
          "Major hospitals and specialist care are accessible within the wider Hiroshima metro, with practical tram and rail links.",
          "Compared with Tokyo or Osaka, Hiroshima often feels more manageable for long-stay routines and lower daily friction.",
        ],
      },
      {
        title: "Working remotely",
        accent: "from-cyan-400/25 to-sky-500/10",
        summary: "Streetcar-friendly districts and compact daily loops support focused weekdays.",
        bullets: [
          "Hondori, Kamiyacho, and surrounding neighborhoods make errands and cowork-style cafe work straightforward.",
          "The tram network and JR access reduce dependency on a car for most weekday movement.",
          "Shinkansen links from Hiroshima Station keep Osaka, Kyoto, and Fukuoka realistic for business trips.",
        ],
      },
      {
        title: "Raising a family",
        accent: "from-emerald-400/25 to-teal-500/10",
        summary: "Parks, schools, and a calmer urban rhythm than Japan's biggest metros.",
        bullets: [
          "Families often value the balance between city services and quieter residential streets near the center.",
          "Regular access to parks, river paths, and culture keeps weekend planning easy.",
          "School and language options still need neighborhood-by-neighborhood verification before committing.",
        ],
      },
      {
        title: "Living like a local",
        accent: "from-fuchsia-400/20 to-rose-500/10",
        summary: "Tram rides, river walks, and neighborhood okonomiyaki over headline sightseeing.",
        bullets: [
          "A normal week often includes local markets, short tram hops, and evening meals in familiar spots.",
          "Hiroshima-style okonomiyaki is part of daily food culture, not just a one-time visitor experience.",
          "Miyajima is close enough to feel like a regular weekend option, not a once-a-year trip.",
        ],
      },
      {
        title: "Buying a home",
        accent: "from-violet-400/20 to-indigo-500/10",
        summary: "District choice matters more than city-level averages.",
        bullets: [
          "Focus first on tram access, flood awareness by river zone, and day-to-day walkability.",
          "Compare central convenience districts with quieter edges for space, noise, and pricing tradeoffs.",
          "Run a weekday-only test before deciding, especially for commute and healthcare access patterns.",
        ],
      },
    ];
  }

  const costLead = command.costOfLiving[0];
  const housingLead = command.housingMetrics[0];
  const healthcareLead = command.healthcareFacilities[0];
  const internetLead = command.internetMetrics[0];
  const schoolLead = command.schools[0];

  return [
    {
      title: "Living here",
      accent: "from-amber-400/25 to-orange-500/10",
      summary: "Comfort first. Then healthcare, routine, and repeatability.",
      bullets: [
        healthcareLead ? healthcareLead.name : "Review healthcare access before treating the move as low-friction.",
        command.monthlyClimate.length > 0 ? `Climate now includes ${command.monthlyClimate.length} published monthly rows for long-stay planning.` : "Climate needs fuller publication before relying on seasonal assumptions.",
        housingLead ? `${housingLead.label}: ${formatMetricValue(housingLead) ?? "Not yet published"}` : "Housing costs still need direct validation.",
      ],
    },
    {
      title: "Working remotely",
      accent: "from-cyan-400/25 to-sky-500/10",
      summary: "Internet, travel flow, and a neighborhood that can handle focused weekdays.",
      bullets: [
        internetLead ? `${internetLead.label}: ${formatMetricValue(internetLead) ?? "Not yet published"}` : "Connectivity still needs verified publishing.",
        command.airports[0] ? `Closest flight pattern starts with ${command.airports[0].name}.` : "Airport routing still needs verified publishing.",
        command.neighborhoods[0] ? `${command.neighborhoods[0].name} is a starting point for walkable day-to-day scouting.` : "Neighborhood-level work routines still need publication.",
      ],
    },
    {
      title: "Raising a family",
      accent: "from-emerald-400/25 to-teal-500/10",
      summary: "Schools, parks, healthcare, and whether the city supports a stable week.",
      bullets: [
        schoolLead ? `Published school lead: ${schoolLead.name}.` : "School coverage still needs verified publishing.",
        command.recreationFacilities[0] ? `${command.recreationFacilities[0].name} adds an outdoor or community anchor.` : "Recreation inventory still needs verification.",
        healthcareLead ? `Healthcare lead: ${healthcareLead.name}.` : "Healthcare providers still need deeper publication.",
      ],
    },
    {
      title: "Living like a local",
      accent: "from-fuchsia-400/20 to-rose-500/10",
      summary: "Repeatable rituals over tourist highlights.",
      bullets: [
        command.neighborhoods[0] ? `Begin with ${command.neighborhoods[0].name} to judge real daily flow.` : "Neighborhood texture still needs more publication.",
        command.foodMetrics[0] ? `${command.foodMetrics[0].label}: ${formatMetricValue(command.foodMetrics[0]) ?? "Not yet published"}` : "Food intelligence still needs verified publication.",
        command.resources.filter((resource) => resource.category === "local").length > 0 ? "Local source links are already published for deeper self-directed research." : "Local source coverage is still expanding.",
      ],
    },
    {
      title: "Buying a home",
      accent: "from-violet-400/20 to-indigo-500/10",
      summary: "District choice, seasonality, and long-term ownership logic.",
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
  const cityKey = city.trim().toLowerCase();
  const isCavtat = cityKey === "cavtat";
  const isHiroshima = cityKey === "hiroshima";
  const neighborhoodA = command.neighborhoods[0]?.name;
  const neighborhoodB = command.neighborhoods[1]?.name;
  const beachOrRecreation = command.beaches[0]?.name ?? command.recreationFacilities[0]?.name;
  const foodAnchor = command.foodSpots[0]?.name;
  const healthcareAnchor = command.healthcareFacilities[0]?.name;
  const airportAnchor = command.airports[0]?.name;

  const opening = isHiroshima
    ? "Hiroshima feels composed in a way that catches people off guard. The Peace Memorial Park matters, but the city's real character shows up in river walks, tram rides, and neighborhood routines that feel more lived-in than performative."
    : !isTemplateCopy(command.destination.description) && !soundsRoboticNarrative(command.destination.description)
    ? command.destination.description
    : isCavtat
    ? "Cavtat opens slowly and beautifully: morning coffee on the harbor, stone paths above clear water, and evenings that feel social without feeling crowded."
    : neighborhoodA
    ? `${city} starts to work when you move between ${neighborhoodA}${neighborhoodB ? ` and ${neighborhoodB}` : ""}.`
    : `${city} shifts from postcard to possible once you slow down.`;

  const middle = isHiroshima
    ? "What makes it work is the texture of everyday life: a coffee stop near Hondori, a slow lunch in a local district, an afternoon along the river or in Shukkeien, and an evening that ends comfortably rather than theatrically."
    : !isTemplateCopy(command.destination.lifestyle) && !soundsRoboticNarrative(command.destination.lifestyle)
    ? command.destination.lifestyle
    : isCavtat
    ? "The real draw is rhythm: a compact waterfront for daily walks, pine-shaded coastal paths when you want quiet, and an easy hop to Dubrovnik when you want more energy."
    : beachOrRecreation || foodAnchor
    ? `A late afternoon at ${beachOrRecreation ?? foodAnchor} tells you almost everything you need to know.`
    : `Test a normal weekday loop, then decide whether the city still feels compelling.`;

  const closing = isHiroshima
    ? "For relocation, Hiroshima often lands in a rare sweet spot. It is calmer and more manageable than Tokyo or Osaka, yet still richly urban, with enough culture, transit, and weekend access to keep life interesting without feeling overpacked."
    : !isTemplateCopy(command.destination.overview) && !soundsRoboticNarrative(command.destination.overview)
    ? command.destination.overview
    : isCavtat
    ? "Cavtat works best for people who want coastal charm with less friction: near enough to Dubrovnik for services and flights, but calm enough to feel like home by week two."
    : `${city}, ${country} becomes compelling when the essentials hold up${healthcareAnchor ? ` - healthcare anchored by ${healthcareAnchor}` : ""}${airportAnchor ? `, travel through ${airportAnchor}` : ""}.`;

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
  const cityKey = command.destination.city.trim().toLowerCase();
  if (cityKey === "hiroshima") {
    return [
      {
        question: "What does daily life actually feel like?",
        answer: "Calm and practical: riverside walks, short streetcar rides, and compact neighborhood routines centered around Hondori, Kamiyacho, and nearby residential districts.",
      },
      {
        question: "How strong is healthcare access?",
        answer: "Hiroshima has strong hospital coverage for a midsize city, with both general and specialist care available across the metro area.",
      },
      {
        question: "Is public transportation good enough without a car?",
        answer: "Yes for most central routines. The tram network, JR lines, and bus coverage make day-to-day movement straightforward in core districts.",
      },
      {
        question: "How easy is longer-distance travel?",
        answer: "Hiroshima Station's Shinkansen links are excellent, and Hiroshima Airport supports broader domestic and international routing.",
      },
      {
        question: "What is the food culture like?",
        answer: "Local food culture is a genuine strength, especially Hiroshima-style okonomiyaki, seafood, and neighborhood izakaya dining.",
      },
      {
        question: "Does it feel too busy or too quiet?",
        answer: "Most people find it balanced: noticeably calmer than Tokyo or Osaka, but still active enough to avoid feeling sleepy.",
      },
      {
        question: "Which areas are good for a first scouting stay?",
        answer: "Start around central access zones near Hondori/Kamiyacho, then compare with quieter residential pockets to match your pace preference.",
      },
      {
        question: "Is Miyajima realistically part of regular life?",
        answer: "Yes. The train-and-ferry route is easy enough that many residents treat Miyajima as a normal weekend excursion.",
      },
      {
        question: "What are the main climate realities?",
        answer: "Summers are hot and humid; spring and autumn are especially comfortable; winters are cool but usually manageable for active daily life.",
      },
      {
        question: "Who is Hiroshima best for?",
        answer: "People who want a cultured Japanese city with strong infrastructure and a calmer, more livable rhythm than mega-city life.",
      },
    ];
  }

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
  const cityKey = command.destination.city.trim().toLowerCase();
  if (cityKey === "hiroshima") {
    return [
      {
        title: "Cost",
        items: [
          {
            question: "Monthly budget anchor",
            answer: "Model a practical midsize-city budget, then pressure-test rent and utilities in your target district during a weekday scouting run.",
          },
          {
            question: "Housing signal",
            answer: "Compare tram-access convenience areas with quieter residential streets; pricing and pace can shift quickly by micro-location.",
          },
        ],
      },
      {
        title: "Neighborhoods",
        items: [
          {
            question: "Where to start scouting",
            answer: "Begin around the central core near Hondori and Kamiyacho, then branch into calmer residential zones to compare daily rhythm.",
          },
          {
            question: "Second area to compare",
            answer: "Add a riverside residential area with strong tram access so you can compare evening noise, errands, and walkability.",
          },
        ],
      },
      {
        title: "Healthcare",
        items: [
          {
            question: "Primary healthcare anchor",
            answer: "Hiroshima offers strong metro-level healthcare for its size; verify specialist availability and language support for your exact needs.",
          },
        ],
      },
      {
        title: "Transportation",
        items: [
          {
            question: "Nearest airport cue",
            answer: "Hiroshima Airport is the main air gateway, while Hiroshima Station and the Shinkansen handle most intercity mobility with less friction.",
          },
          {
            question: "Walkability score",
            answer: "Core districts are highly walkable when paired with the streetcar network for longer hops.",
          },
        ],
      },
      {
        title: "Internet",
        items: [
          {
            question: "Remote work connectivity",
            answer: "Connectivity is generally reliable in central neighborhoods; validate your exact building and plan before signing a lease.",
          },
        ],
      },
    ];
  }

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

function humanizeScoreExplanation(category: string, explanation: string | null | undefined) {
  const text = (explanation ?? "").trim();
  const normalized = text.toLowerCase();

  if (text.length > 0 && !normalized.includes("dri") && !normalized.includes("comparative model") && !normalized.includes("place-quality weighting")) {
    return text;
  }

  const key = category.toLowerCase();
  if (key.includes("lifestyle")) return "How comfortably everyday life feels once you have settled into the city rather than just visited it.";
  if (key.includes("safety")) return "How secure the city feels on ordinary streets, at different hours, and as part of daily routines.";
  if (key.includes("clean")) return "How well the public realm holds up in everyday use, from sidewalks to parks to neighborhood streets.";
  if (key.includes("walk")) return "How naturally errands, cafés, and social life can happen on foot without turning every trip into a project.";
  if (key.includes("health")) return "How easily hospitals, pharmacies, and specialist care stay reachable when you actually need them.";
  if (key.includes("cost") || key.includes("afford")) return "How realistic ongoing spending feels once housing, food, transit, and daily life are all included.";
  return "How this category holds up when you picture real, long-stay living rather than a weekend visit.";
}

function humanizeScoreEvidence(
  underlying: string | null | undefined,
  confidence: VerificationMeta["confidenceLevel"] | undefined,
) {
  const text = (underlying ?? "").trim();
  const normalized = text.toLowerCase();
  if (text.length > 0 && !normalized.includes("model input")) {
    return text;
  }

  if (confidence === "high") return "Source confidence: Verified across current, usable sources.";
  if (confidence === "medium") return "Source confidence: Well-supported, with a few details still worth confirming locally.";
  return "Source confidence: Best treated as a planning guide until more local verification is completed.";
}

type PracticalTopLink = {
  name: string;
  category: "Restaurant" | "Shopping" | "Service";
  note: string;
  href: string;
};

const PRACTICAL_TOP_CATEGORIES: PracticalTopLink["category"][] = ["Restaurant", "Shopping", "Service"];

function buildPracticalTopLinks(city: string, country: string): PracticalTopLink[] {
  const cityKey = city.trim().toLowerCase();
  const mapsLink = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, ${city}, ${country}`)}`;

  if (cityKey === "cavtat") {
    return [
      {
        name: "Restaurant Bugenvila",
        category: "Restaurant",
        note: "Fine-dining waterfront option in the harbor zone.",
        href: mapsLink("Restaurant Bugenvila"),
      },
      {
        name: "Dalmatino",
        category: "Restaurant",
        note: "Popular old-town style dining choice for scouting dinner flow.",
        href: mapsLink("Dalmatino Cavtat"),
      },
      {
        name: "Konoba Galija",
        category: "Restaurant",
        note: "Classic seafood konoba near the promenade loop.",
        href: mapsLink("Konoba Galija Cavtat"),
      },
      {
        name: "Leut Restaurant",
        category: "Restaurant",
        note: "Harbor-adjacent option to test central evening noise and pacing.",
        href: mapsLink("Leut Restaurant Cavtat"),
      },
      {
        name: "Studenac Market",
        category: "Shopping",
        note: "Core grocery baseline for daily errands.",
        href: mapsLink("Studenac Market Cavtat"),
      },
      {
        name: "Tommy Supermarket",
        category: "Shopping",
        note: "Useful alternate grocery route for price and selection comparison.",
        href: mapsLink("Tommy Supermarket Cavtat"),
      },
      {
        name: "Cavtat Old Town shops",
        category: "Shopping",
        note: "General retail strip for walkability and practical access checks.",
        href: mapsLink("Cavtat old town shops"),
      },
      {
        name: "Ljekarna pharmacy",
        category: "Service",
        note: "Pharmacy access anchor for routine living confidence.",
        href: mapsLink("Ljekarna Cavtat pharmacy"),
      },
      {
        name: "Hrvatska posta",
        category: "Service",
        note: "Post-office and basic admin errand point.",
        href: mapsLink("Hrvatska posta Cavtat"),
      },
      {
        name: "OTP Banka branch / ATM",
        category: "Service",
        note: "Banking and ATM reliability check for daily operations.",
        href: mapsLink("OTP Banka Cavtat"),
      },
    ];
  }

  return [];
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
        <article key={`${metric.label}-${index}`} className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(255,255,255,0.5)] bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(247,239,225,0.86))] p-5 shadow-[0_22px_52px_-34px_rgba(39,32,22,0.35)] backdrop-blur-md transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(39,32,22,0.42)]">
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
        );
      })}
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
          );
        })}
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
  const researchProfile = getDestinationResearchProfile(destination);
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
  const retirementAdvantages = command.intelligence.retirementAdvantages;
  const retirementTradeoffs = command.intelligence.retirementTradeoffs;
  const briefingSections = command.intelligence.briefingSections;
  const editorialFallback = buildEditorialOverview(command);
  const dayHereFallback = buildDayMoments(command);
  const lifeScenariosFallback = buildLifeScenarios(command);
  const magazineFallback = buildMagazineDescription(command);
  const rapidAnswersFallback = buildRapidAnswers(command);
  const coreQaFallback = buildCoreRelocationQa(command);
  const practicalTopLinksFallback = buildPracticalTopLinks(destination.city, destination.country);
  const visibleNarratives = buildVisibleEditorialNarratives(destination, researchProfile, editorialFallback);
  const editorial = visibleNarratives.editorial;
  const dayHere = destination.dayMoments && (destination.dayMoments.timeline.length > 0 || (destination.dayMoments.weekend?.length ?? 0) > 0 || (destination.dayMoments.scoutingChecks?.length ?? 0) > 0)
    ? {
      timeline: destination.dayMoments.timeline.length > 0 ? destination.dayMoments.timeline : dayHereFallback.timeline,
      weekend: destination.dayMoments.weekend?.length ? destination.dayMoments.weekend : dayHereFallback.weekend,
      scoutingChecks: destination.dayMoments.scoutingChecks?.length ? destination.dayMoments.scoutingChecks : dayHereFallback.scoutingChecks,
    }
    : dayHereFallback;
  const lifeScenarios = lifeScenariosFallback;
  const relocationFrame = getDestinationRelocationFrame(destination.city);
  const conciseScenarios = lifeScenarios.slice(0, 3).map((scenario) => ({
    ...scenario,
    bullets: scenario.bullets.slice(0, 2),
  }));
  const magazine = visibleNarratives.magazine;
  const rapidAnswers = destination.rapidAnswers?.length ? destination.rapidAnswers : rapidAnswersFallback;
  const conciseScorecard = scorecard.slice(0, 6);
  const conciseComprehensiveSections = comprehensiveSections.slice(0, 4);
  const coreQa = destination.coreRelocationQa?.length ? destination.coreRelocationQa : coreQaFallback;
  const scoreRows = scorecard.filter((item) => typeof item.score === "number");
  const scoreAverage = scoreRows.length > 0
    ? Math.round(scoreRows.reduce((total, item) => total + (item.score ?? 0), 0) / scoreRows.length)
    : null;
  const verificationStatusLine = formatVerificationLine(heroVerification);
  const dataConfidenceLabel = command.dataConfidence === "high"
    ? "Verified data"
    : command.dataConfidence === "medium"
    ? "Planning-grade data"
    : "Directional data";
  const verificationReadiness = command.dataConfidence === "high"
    ? "Ready for planning"
    : command.dataConfidence === "medium"
    ? "Planning-ready with minor gaps"
    : "Directional read, final validation underway";
  const storyTags = (destination.tags ?? []).slice(0, 6);
  const featuredResources = command.resources.slice(0, 2);
  const scenicImagePrimary = destinationImageSet[1]?.src ?? null;
  const scenicImageSecondary = destinationImageSet[2]?.src ?? null;
  const topBackdropImage = scenicImagePrimary ?? scenicImageSecondary ?? heroImage;
  const heroStoryBackdropImage = scenicImageSecondary ?? scenicImagePrimary ?? heroImage;
  const conciseQuickFacts = quickFacts.filter((fact) => !hasNoVerifiedPlaceholder(fact.value)).slice(0, 3);
  const visibleCoreQa = coreQa
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !hasNoVerifiedPlaceholder(item.answer)).slice(0, 1),
    }))
    .filter((group) => group.items.length > 0)
    .slice(0, 3);
  const heroScorePillars = conciseScorecard.slice(0, 3);
  const costOfLivingCards = command.costOfLiving.map((metric) => ({
    label: metric.label,
    value: formatMetricValue(metric),
    verification: metric.verification,
  }));
  const costMetricKeys = new Set(command.costOfLiving.map((metric) => metric.key.trim().toLowerCase()));
  const costMetricLabels = new Set(command.costOfLiving.map((metric) => metric.label.trim().toLowerCase()));
  const distinctHousingMetrics = command.housingMetrics.filter((metric) => {
    const key = metric.key.trim().toLowerCase();
    const label = metric.label.trim().toLowerCase();
    return !costMetricKeys.has(key) && !costMetricLabels.has(label);
  });
  const housingCards = distinctHousingMetrics.map((metric) => ({
    label: metric.label,
    value: formatMetricValue(metric),
    verification: metric.verification,
  }));
  const hasPublishedNeighborhoods = command.neighborhoods.some((row) => hasPublishedVerification(row.verification));
  const practicalTopLinks = destination.practicalTopLinks?.length ? destination.practicalTopLinks : practicalTopLinksFallback;
  const mapsSearchHref = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const researchSummary = researchProfile ? [
    researchProfile.overview,
    researchProfile.feel,
    researchProfile.whyPeopleLoveIt,
    researchProfile.climate,
    researchProfile.costOfLiving,
  ].filter(Boolean) : [];
  const practicalMapPins = [
    ...practicalTopLinks.slice(0, 6).map((item) => ({
      label: item.name,
      detail: item.category,
      href: item.href,
    })),
    ...command.practicalInfo.slice(0, 3).map((item) => ({
      label: item.name,
      detail: item.subtitle ?? "Practical",
      href: mapsSearchHref(item.mapQuery ?? `${item.name}, ${destination.city}, ${destination.country}`),
    })),
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_8%_8%,rgba(197,155,95,0.24),transparent_25%),radial-gradient(circle_at_92%_10%,rgba(31,95,99,0.13),transparent_30%),repeating-linear-gradient(135deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_2px,transparent_2px,transparent_16px),linear-gradient(180deg,#f8f4ec_0%,#f4eee1_46%,#f8f3ea_100%)] text-[var(--atlas-ink)]">
      <section className="relative overflow-hidden border-b border-[rgba(57,52,42,0.14)] px-8 py-20">
        {topBackdropImage ? (
          <Image
            src={topBackdropImage}
            alt={`${destination.city} scenic hero background`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,204,145,0.3),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(31,95,99,0.24),transparent_28%),linear-gradient(135deg,#0f1e20_0%,#1d2d30_50%,#3b3125_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1e20]/62 via-[#132a2c]/45 to-[#453623]/24" />
        <div className="absolute inset-0 bg-[#0f1e20]/20" />

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/28 bg-[rgba(8,18,20,0.28)] shadow-xl shadow-[rgba(15,23,24,0.35)] backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1e20]/58 via-[#112a2d]/45 to-[#1d3842]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(247,204,145,0.18),transparent_35%),linear-gradient(180deg,rgba(9,18,19,0.14)_0%,rgba(9,18,19,0.38)_100%)]" />

          <div className="relative p-8 sm:p-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f9e4bd]">{destination.country}{command.region ? ` • ${command.region}` : ""}</p>
              <h1 className="mt-4 text-5xl font-semibold text-[#fff8ef] sm:text-6xl">{destination.city}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#f2e8d9]">{editorial.intro}</p>
              <div className="mt-5 max-w-4xl rounded-[1.5rem] border border-white/20 bg-[rgba(255,255,255,0.12)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#f8e3b4]">Why this place feels distinct</p>
                <p className="mt-2 text-base font-medium leading-8 text-[#fff7eb]">{editorial.follow}</p>
                <p className="mt-3 text-sm leading-7 text-[#f8efd9]/90">{editorial.dek}</p>
              </div>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-[#f8efd9]/92">{editorial.quote}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-[#f1dfbe]">
                <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1">Story first</span>
                <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1">Data backed</span>
                <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1">Photo-led</span>
                <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1">Scouting ready</span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#f2e8d9]">
                <SourceVerificationBadge verification={heroVerification} />
                <span className={`rounded-full border px-3 py-1 ${confidenceClass(command.dataConfidence)}`}>
                  {dataConfidenceLabel}
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

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/16 text-[#fff7ec] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)]">
              {scenicImagePrimary ? (
                <Image
                  src={scenicImagePrimary}
                  alt={`${destination.city} waterfront`}
                  fill
                  sizes="(min-width: 1280px) 760px, 100vw"
                  className="object-cover object-center"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(8,18,20,0.75),rgba(8,18,20,0.42),rgba(22,44,50,0.62))]" />
              <div className="relative p-6 backdrop-blur-[1.5px]">
              <p className="mt-4 text-2xl font-semibold leading-10 sm:text-[2rem]">
                {relocationFrame?.heroBody ?? editorial.follow}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#f8efd9]/88">
                {relocationFrame ? editorial.follow : magazine.middle}
              </p>
              </div>
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
        </div>
      </section>

      <DestinationStickyNav />

      <section id="qa-core" className="mx-auto max-w-7xl px-8 py-2">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_48px_-34px_rgba(39,32,22,0.42)] sm:p-8">
          <SectionHeading
            eyebrow="Core relocation Q&A"
            title="Concrete answers by topic"
            description="A quick read, not a full report."
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

      <section id="gallery" className="mx-auto max-w-7xl px-8 pb-4 pt-4">
        <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(247,239,225,0.86))] p-4 shadow-[0_24px_50px_-34px_rgba(39,32,22,0.34)] sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Photo-led view</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--atlas-ink)] sm:text-3xl">Let the place speak first</h2>
            </div>
            <Link href="#map-media" className="hidden rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.35)] hover:text-[var(--atlas-accent)] sm:inline-flex">
              See map and gallery below
            </Link>
          </div>
          <DestinationGallery destination={destination} resources={command.resources} />
        </div>
      </section>

      <section id="story" className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-[2.75rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.98),rgba(247,239,225,0.9))] p-8 shadow-[0_34px_70px_-42px_rgba(39,32,22,0.42)] sm:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
            <div>
            <SectionHeading
              eyebrow="Editorial overview"
              title={`${destination.city} as a relocation decision`}
              description="A concise read on how the place works once the honeymoon fades."
            />
            <p className="mt-8 text-2xl font-semibold leading-10 text-[var(--atlas-ink)] sm:text-3xl">
              {relocationFrame?.heroBody ?? editorial.intro}
            </p>
            <div className="mt-6 rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] p-6 shadow-[0_18px_35px_-24px_rgba(39,32,22,0.28)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">How the place actually works</p>
              <p className="mt-4 text-lg leading-8 text-[var(--atlas-ink)]">{editorial.follow}</p>
              <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">{editorial.dek}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {storyTags.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.76)] px-4 py-2 text-xs uppercase tracking-[0.24em] text-[var(--atlas-muted)]">
                  {tag}
                </span>
              ))}
            </div>

            {relocationFrame ? (
              <div className="mt-10 rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Relocation frame</p>
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {relocationFrame.sections.map((section) => (
                    <article key={section.title} className="rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.88)] p-4">
                      <h3 className="text-base font-semibold text-[var(--atlas-ink)]">{section.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">{section.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {conciseQuickFacts.map((fact) => (
                <article key={fact.label} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">{fact.label}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--atlas-ink)]">{fact.value}</p>
                </article>
              ))}
            </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,221,0.84))] p-8 shadow-xl shadow-[rgba(39,32,22,0.2)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">What it feels like</p>
                <p className="mt-5 text-lg leading-8 text-[var(--atlas-ink)]">{magazine.opening}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">{magazine.closing}</p>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Source starters</p>
                <div className="mt-4 space-y-3">
                  {featuredResources.length === 0 ? (
                    <MissingDataState description="Source links appear here as destination resource records are published." />
                  ) : (
                    featuredResources.map((resource) => (
                      <Link key={resource.id} href={resource.url} target="_blank" className="block rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.75)] p-4 transition hover:border-[rgba(31,95,99,0.4)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--atlas-muted)]">{resource.category}</p>
                        <p className="mt-2 text-base font-semibold text-[var(--atlas-ink)]">{resource.title}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="research" className="mx-auto max-w-7xl px-8 py-12">
        <div className="rounded-[2.75rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.98),rgba(247,239,225,0.9))] p-8 shadow-[0_34px_70px_-42px_rgba(39,32,22,0.42)] sm:p-10">
          <SectionHeading
            eyebrow="Retirement intelligence report"
            title={`${destination.city} for a long-stay move`}
            description="A practical profile of fit, friction, and decision signals, grounded in the destination record before any generic travel copy."
          />

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Why this place can work well</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {retirementAdvantages.map((item, index) => (
                    <article key={`${item}-${index}`} className="rounded-[1.5rem] border border-emerald-200/70 bg-emerald-50/70 p-4">
                      <p className="text-sm leading-7 text-emerald-900">{item}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">What to watch closely</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {retirementTradeoffs.map((item, index) => (
                    <article key={`${item}-${index}`} className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/70 p-4">
                      <p className="text-sm leading-7 text-amber-900">{item}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Daily rhythm and district logic</p>
                <div className="mt-4 space-y-3">
                  {briefingSections.map((section) => (
                    <article key={section.title} className="rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.82)] p-4">
                      <h3 className="text-base font-semibold text-[var(--atlas-ink)]">{section.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">{section.summary}</p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--atlas-muted)]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--atlas-accent)]" /><span>{bullet}</span></li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Planning signals</p>
                <div className="mt-4 space-y-3">
                  {planningSignals.slice(0, 4).map((signal) => (
                    <article key={signal.label} className={`rounded-[1.5rem] border p-4 ${signal.tone === "strong" ? "border-emerald-300/50 bg-emerald-50" : "border-amber-300/55 bg-amber-50"}`}>
                      <p className={`text-[11px] uppercase tracking-[0.2em] ${signal.tone === "strong" ? "text-emerald-900" : "text-amber-900"}`}>{signal.label}</p>
                      <p className={`mt-2 text-sm leading-6 ${signal.tone === "strong" ? "text-emerald-800" : "text-amber-800"}`}>{signal.detail}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Quick facts</p>
                <div className="mt-4 space-y-3">
                  {conciseQuickFacts.map((fact) => (
                    <div key={fact.label} className="rounded-[1.25rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.82)] p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-accent)]">{fact.label}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">{fact.value}</p>
                    </div>
                  ))}
                </div>
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
            title={`${destination.city} scouting-day walkthrough`}
            description="A concrete route to test routine, access, and atmosphere in one realistic day."
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              {dayHere.timeline.map((item, index) => {
                const thumbSrc = destinationImageSet[item.thumbnailIndex ?? index]?.src ?? scenicImagePrimary ?? heroImage;
                return (
                <article key={item.time} className="rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-cyan-400/35 bg-cyan-100/80 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-900">{item.time}</span>
                        <h3 className="text-lg font-semibold text-[var(--atlas-ink)]">{item.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">{item.detail}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.sourceUrl ? (
                          <Link
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-full border border-[rgba(31,95,99,0.3)] bg-[rgba(31,95,99,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.14)]"
                          >
                            {item.sourceLabel ?? "Map source"}
                          </Link>
                        ) : null}
                        {item.tiktokUrl ? (
                          <Link
                            href={item.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-full border border-[rgba(15,15,15,0.24)] bg-[rgba(15,15,15,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgb(34,34,34)] transition hover:bg-[rgba(15,15,15,0.12)]"
                          >
                            TikTok
                          </Link>
                        ) : null}
                        {item.youtubeUrl ? (
                          <Link
                            href={item.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-full border border-[rgba(180,35,35,0.26)] bg-[rgba(180,35,35,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(138,37,37)] transition hover:bg-[rgba(180,35,35,0.14)]"
                          >
                            {item.youtubeLabel ?? "YouTube walk-through"}
                          </Link>
                        ) : null}
                        {item.youtubeUrl ? (
                          <span className="inline-flex rounded-full border border-[rgba(180,35,35,0.24)] bg-[rgba(180,35,35,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgb(138,37,37)]">
                            Walk-through video
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {thumbSrc && item.youtubeUrl ? (
                      <Link
                        href={item.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block w-full shrink-0 sm:w-[170px]"
                      >
                        <div className="overflow-hidden rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)] p-1.5">
                          <div className="relative h-[92px] w-full overflow-hidden rounded-xl">
                            <Image
                              src={thumbSrc}
                              alt={`${destination.city} activity preview`}
                              fill
                              sizes="170px"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[rgb(138,37,37)]">Open YouTube walk-through</p>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                </article>
              );})}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Weekend ideas</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {dayHere.weekend.length === 0 ? (
                    <MissingDataState description="Weekend anchors appear here as activity records are published." />
                  ) : (
                    dayHere.weekend.map((idea, index) => {
                      const ideaThumbSrc = getYouTubeThumbnail(idea.videoUrl)
                        ?? destinationImageSet[(index + 1) % Math.max(1, destinationImageSet.length)]?.src
                        ?? scenicImagePrimary
                        ?? heroImage;
                      const previewHref = idea.videoUrl ?? idea.tiktokUrl ?? idea.sourceUrl;
                      return (
                      <article key={idea.id} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.78)] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-[var(--atlas-ink)]">{idea.name}</p>
                            {idea.subtitle ? <p className="mt-1 text-sm text-[var(--atlas-muted)]">{idea.subtitle}</p> : null}
                            {idea.value1 ? <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">{idea.value1}</p> : null}
                          </div>
                          {ideaThumbSrc && previewHref ? (
                            <Link
                              href={previewHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block shrink-0"
                            >
                              <div className="relative h-[72px] w-[96px] overflow-hidden rounded-xl border border-[var(--atlas-border)] bg-white/70">
                                <Image
                                  src={ideaThumbSrc}
                                  alt={`${destination.city} weekend preview`}
                                  fill
                                  sizes="96px"
                                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                              </div>
                            </Link>
                          ) : null}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {idea.sourceUrl ? (
                            <Link
                              href={idea.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-full border border-[rgba(31,95,99,0.3)] bg-[rgba(31,95,99,0.08)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.14)]"
                            >
                              Open map
                            </Link>
                          ) : null}
                        {idea.tiktokUrl ? (
                          <Link
                            href={idea.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded-full border border-[rgba(15,15,15,0.24)] bg-[rgba(15,15,15,0.06)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[rgb(34,34,34)] transition hover:bg-[rgba(15,15,15,0.12)]"
                          >
                            TikTok
                          </Link>
                          ) : null}
                          {idea.videoUrl ? (
                            <Link
                              href={idea.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex rounded-full border border-[rgba(180,35,35,0.26)] bg-[rgba(180,35,35,0.08)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgb(138,37,37)] transition hover:bg-[rgba(180,35,35,0.14)]"
                            >
                              YouTube
                            </Link>
                          ) : null}
                          {idea.videoUrl ? (
                            <span className="inline-flex rounded-full border border-[rgba(180,35,35,0.24)] bg-[rgba(180,35,35,0.06)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[rgb(138,37,37)]">
                              Walk-through video
                            </span>
                          ) : null}
                        </div>
                      </article>
                      );})
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">What to notice on a scouting trip</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--atlas-muted)]">
                  {dayHere.scoutingChecks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
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
            title="Relocation scorecard"
            description="Fast signal first, details only where they matter."
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
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
                    <div className="mt-4">
                      <SourceVerificationBadge verification={item.verification} />
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">How we validate this destination</p>
                <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">Composite score blends published category signals. Verification status tells you whether this page is fully verified or still directional.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--atlas-border)] bg-white/75 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Composite score</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--atlas-ink)]">{typeof scoreAverage === "number" ? `${scoreAverage}/100` : "Not published"}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--atlas-border)] bg-white/75 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">Verification status</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--atlas-ink)]">{verificationReadiness}</p>
                    <p className="mt-1 text-xs text-[var(--atlas-muted)]">{verificationStatusLine}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-[var(--atlas-muted)]">85+ strong fit, 75-84 moderate, below 75 needs closer validation.</p>
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
            {conciseComprehensiveSections.slice(0, 2).map((section, index) => (
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
            Use the practical and source sections below only if you need the full evidence stack.
          </p>
        </div>
      </section>

      <ScenicBreakpoint
        imageUrl={scenicImageSecondary}
        city={destination.city}
        caption="Use this visual layer to pressure-test fit: can you picture your actual routines here after a few ordinary weeks, not just a beautiful weekend?"
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
                  metrics={costOfLivingCards}
                  emptyText="See source references below for currently published records."
                />
              </div>
            </div>

            {housingCards.length > 0 ? (
              <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Housing metrics</p>
                <div className="mt-4">
                  <MetricGrid
                    metrics={housingCards}
                    emptyText="See source references below for currently published records."
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.84))] p-6 shadow-xl shadow-[rgba(39,32,22,0.2)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Neighborhood explorer</p>
            {hasPublishedNeighborhoods ? (
              <>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">Look for the district that matches your ideal daily rhythm, not just the strongest photo backdrop.</p>
                <div className="mt-6">
                  <NeighborhoodExplorer rows={command.neighborhoods} city={destination.city} country={destination.country} />
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">Published district cards are still being finalized. Use this quick on-the-ground checklist so the section stays useful now.</p>
                <div className="mt-5 space-y-3 text-sm text-[var(--atlas-muted)]">
                  <p className="rounded-2xl border border-[var(--atlas-border)] bg-white/70 p-3">Run one daytime errand loop and one evening walk loop from your target block to test lighting, noise, and foot traffic.</p>
                  <p className="rounded-2xl border border-[var(--atlas-border)] bg-white/70 p-3">Time grocery, pharmacy, and waterfront access on foot to check whether routines stay easy without a car.</p>
                  <p className="rounded-2xl border border-[var(--atlas-border)] bg-white/70 p-3">Check slope and stair load between harbor level and uphill streets, especially in midday heat.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.city} old town neighborhoods`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full border border-[rgba(31,95,99,0.34)] bg-[rgba(31,95,99,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.14)]"
                  >
                    Open district map search
                  </Link>
                </div>
              </>
            )}
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
          title="How the city works beyond the postcard"
          description="Use this layer to check whether the place feels easy to repeat, not just beautiful to visit."
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
          title="Practical details"
          description="Confirm the essentials that matter after the honeymoon phase."
        />

        {practicalTopLinks.length > 0 ? (
          <div className="mt-5 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-accent)]">Quick jump: Top 10 practical links</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRACTICAL_TOP_CATEGORIES.map((category) => {
                const count = practicalTopLinks.filter((item) => item.category === category).length;
                const id = `practical-top-${category.toLowerCase()}`;
                return (
                  <Link
                    key={`quick-${category}`}
                    href={`#${id}`}
                    className="inline-flex rounded-full border border-[rgba(31,95,99,0.38)] bg-[rgba(31,95,99,0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.2)]"
                  >
                    {category} ({count})
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

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

            {practicalTopLinks.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Top 10: restaurants, shopping, and services</p>
                <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">Clickable short-list for practical scouting in {destination.city}. Use these as route anchors, not endorsements.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PRACTICAL_TOP_CATEGORIES.map((category) => {
                    const count = practicalTopLinks.filter((item) => item.category === category).length;
                    const id = `practical-top-${category.toLowerCase()}`;
                    return (
                      <Link
                        key={category}
                        href={`#${id}`}
                        className="inline-flex rounded-full border border-[rgba(31,95,99,0.34)] bg-[rgba(31,95,99,0.1)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.16)]"
                      >
                        {category} ({count})
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-4">
                  {PRACTICAL_TOP_CATEGORIES.map((category) => {
                    const id = `practical-top-${category.toLowerCase()}`;
                    const items = practicalTopLinks.filter((item) => item.category === category);
                    if (items.length === 0) return null;

                    return (
                      <section key={category} id={id} className="scroll-mt-28">
                        <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-accent)]">{category}</p>
                        <div className="grid gap-3">
                          {items.map((item) => {
                            const index = practicalTopLinks.findIndex((entry) => entry.name === item.name);
                            return (
                              <article key={`${item.category}-${item.name}`} className="rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.82)] p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">#{index + 1} • {item.category}</p>
                                  <Link
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex rounded-full border border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.16)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.22)]"
                                  >
                                    Open in Maps
                                  </Link>
                                </div>
                                <p className="mt-2 text-sm font-semibold text-[var(--atlas-ink)]">{item.name}</p>
                                <p className="mt-1 text-xs leading-6 text-[var(--atlas-muted)]">{item.note}</p>
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            ) : null}
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
          title="Map it, then feel it"
          description="Use maps for orientation and media for atmosphere."
        />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-6 shadow-xl shadow-[rgba(39,32,22,0.2)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Practical pinboard</p>
            <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">Quick-launch real-world checks instead of a second duplicate map view.</p>
            <div className="mt-4 grid gap-3">
              {practicalMapPins.length === 0 ? (
                <MissingDataState description="Map pin shortcuts appear here as practical records are published." />
              ) : (
                practicalMapPins.map((pin) => (
                  <Link
                    key={`${pin.label}-${pin.href}`}
                    href={pin.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-[var(--atlas-border)] bg-white/80 px-4 py-3 text-sm transition hover:border-[rgba(31,95,99,0.4)]"
                  >
                    <span className="font-semibold text-[var(--atlas-ink)]">{pin.label}</span>
                    <span className="text-xs uppercase tracking-[0.16em] text-[var(--atlas-muted)]">{pin.detail}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-6 shadow-xl shadow-[rgba(39,32,22,0.2)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Orientation tools</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={mapSearchUrl} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Open city map</Link>
              <Link href={mapsSearchHref(`grocery pharmacy ${destination.city} ${destination.country}`)} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Errand loop map</Link>
              <Link href={mapsSearchHref(`restaurants ${destination.city} ${destination.country}`)} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Restaurant cluster</Link>
              <Link href={`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} live webcam`)}`} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Live webcams</Link>
              <Link href={`https://earth.google.com/web/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}`} target="_blank" className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]">Google Earth</Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--atlas-muted)]">This section now focuses on actionable place checks, while the Homes section keeps the embedded district map.</p>
          </div>
        </div>

        <div className="mt-8">
          <DestinationGallery destination={destination} resources={command.resources} />
        </div>
      </section>

      <section id="resources" className="mx-auto max-w-7xl px-8 pb-16 pt-8">
        <SectionHeading
          eyebrow="Source library"
          title="Verified links"
          description="Use these links to validate the move yourself."
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
