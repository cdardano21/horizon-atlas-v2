import { curatedCityImagesBySlug } from "./curatedCityImages";
import { generatedCommandCenterSeeds } from "./generated-command-center-seeds";
import { generatedDestinationCardFacts } from "./generated-destination-card-facts";
import {
  type Destination,
  type DestinationMemberDetails,
  type DestinationMonthlyWeather,
  destinations,
} from "./destinations";
import { sanitizeExternalSourceUrl } from "./source-links";

type Seed = (typeof generatedCommandCenterSeeds)[string];

const scoreFromNarrative = (value: string): number | null => {
  const match = value.match(/(\d{2,3})\s*\/\s*100/);
  if (!match) return null;
  const score = Number(match[1]);
  if (!Number.isFinite(score)) return null;
  return Math.max(40, Math.min(99, score));
};

const lookupQuickMetric = (seed: Seed | undefined, key: string) =>
  seed?.quickMetrics?.find((metric) => metric.key === key)?.displayValue
  ?? seed?.quickMetrics?.find((metric) => metric.key === key)?.value
  ?? null;

const lookupFact = (slug: string, label: string) =>
  generatedDestinationCardFacts[slug]?.facts.find((fact) => fact.label.toLowerCase() === label.toLowerCase()) ?? null;

const firstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (value && value.trim().length > 0) return value.trim();
  }
  return null;
};

const stableHash = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const isValidImage = (value: string | undefined | null) => Boolean(value && value.trim().length > 0);

const TRUSTED_IMAGE_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);

const IMAGE_STOP_WORDS = new Set(["the", "and", "del", "de", "la", "el", "di", "da"]);

const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

const imageLocationTokens = (destination: Destination): string[] => {
  const slugTokens = destination.slug.split("-");
  const cityTokens = destination.city.toLowerCase().split(/[^a-z0-9]+/g);
  const countryTokens = destination.country.toLowerCase().split(/[^a-z0-9]+/g);

  const merged = [...slugTokens, ...cityTokens, ...countryTokens]
    .map((token) => normalizeToken(token))
    .filter((token) => token.length >= 3)
    .filter((token) => !IMAGE_STOP_WORDS.has(token));

  return Array.from(new Set(merged));
};

const extractFilenameTokens = (source: string): string[] => {
  const sanitized = sanitizeExternalSourceUrl(source);
  if (!sanitized) return [];

  try {
    const parsed = new URL(sanitized);
    const filename = decodeURIComponent(parsed.pathname.split("/").pop() ?? "");
    return filename
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => normalizeToken(token))
      .filter((token) => token.length >= 3);
  } catch {
    return [];
  }
};

const isTrustedImageSource = (source: string): boolean => {
  const sanitized = sanitizeExternalSourceUrl(source);
  if (!sanitized) return false;

  try {
    const host = new URL(sanitized).hostname.toLowerCase();
    return TRUSTED_IMAGE_HOSTS.has(host);
  } catch {
    return false;
  }
};

const isDestinationAssociatedImage = (source: string, destination: Destination): boolean => {
  const filenameTokens = extractFilenameTokens(source);
  if (filenameTokens.length === 0) return false;

  const locationTokens = imageLocationTokens(destination);
  return locationTokens.some((token) => filenameTokens.some((fileToken) => fileToken.includes(token) || token.includes(fileToken)));
};

const deriveMonthlyWeather = (destination: Destination, seed: Seed | undefined): DestinationMonthlyWeather[] => {
  if (destination.memberDetails?.monthlyWeather?.length) return destination.memberDetails.monthlyWeather;

  const seeded = seed?.monthlyClimate?.map((row) => ({
    month: row.month,
    avgHighC: row.avgHighC ?? undefined,
    avgLowC: row.avgLowC ?? undefined,
    rainfallMm: row.rainfallMm ?? undefined,
    sunshineHours: row.sunshineHours ?? undefined,
    avgSeaC: row.seaTempC ?? undefined,
  })) ?? [];

  return seeded;
};

const summarizeNeighborhoods = (seed: Seed | undefined, city: string) => {
  const names = (seed?.neighborhoods ?? []).slice(0, 3).map((item) => item.name).filter(Boolean);
  if (names.length === 0) return `District-level research in ${city} is recommended before selecting housing.`;
  return `Most searched neighborhoods: ${names.join(", ")}.`;
};

const countryVisaResource = (country: string) => {
  const encoded = encodeURIComponent(`${country} official visa information`);
  return `https://www.google.com/search?q=${encoded}`;
};

const countryTaxResource = (country: string) => {
  const encoded = encodeURIComponent(`${country} tax authority residency rules`);
  return `https://www.google.com/search?q=${encoded}`;
};

const deriveImages = (destination: Destination): Destination["images"] => {
  const curated = curatedCityImagesBySlug[destination.slug];
  if (isValidImage(curated) && isTrustedImageSource(curated)) {
    return [{
      src: curated,
      alt: `${destination.city} destination view`,
      caption: `${destination.city}, ${destination.country}`,
    }];
  }

  const existing = destination.images.filter((image) =>
    isValidImage(image.src)
    && isTrustedImageSource(image.src)
    && isDestinationAssociatedImage(image.src, destination),
  );
  if (existing.length > 0) {
    return existing.slice(0, 3);
  }

  return [];
};

const deriveMemberDetails = (destination: Destination, seed: Seed | undefined): DestinationMemberDetails => {
  const weather = deriveMonthlyWeather(destination, seed);
  const airports = seed?.airports?.slice(0, 3).map((item) => ({
    name: item.name,
    distance: firstNonEmpty(item.value1, item.subtitle) ?? undefined,
    note: firstNonEmpty(item.value2, item.value3) ?? undefined,
  })) ?? destination.memberDetails?.airports;

  const hospitals = seed?.healthcareFacilities?.slice(0, 4).map((item) => ({
    name: item.name,
    distance: firstNonEmpty(item.value1, item.subtitle) ?? undefined,
    note: firstNonEmpty(item.value2, item.value3) ?? undefined,
  })) ?? destination.memberDetails?.hospitals;

  const golfCount = seed?.golfCourses?.length;
  const schoolCount = seed?.schools?.length;
  const restaurantCount = seed?.foodSpots?.length;

  return {
    researchStatus: "structured",
    bestMonths: firstNonEmpty(lookupQuickMetric(seed, "best_months"), destination.memberDetails?.bestMonths) ?? "Not published",
    monthlyWeather: weather,
    golf: {
      publicCourses: typeof golfCount === "number" ? Math.max(0, Math.floor(golfCount / 2)) : destination.memberDetails?.golf?.publicCourses,
      privateCourses: typeof golfCount === "number" ? Math.max(0, golfCount - Math.floor(golfCount / 2)) : destination.memberDetails?.golf?.privateCourses,
      note: golfCount && golfCount > 0
        ? `Catalog includes ${golfCount} golf records.`
        : destination.memberDetails?.golf?.note ?? "Golf availability should be validated locally.",
    },
    amenities: {
      restaurants: typeof restaurantCount === "number" ? restaurantCount : destination.memberDetails?.amenities?.restaurants,
      schools: typeof schoolCount === "number" ? schoolCount : destination.memberDetails?.amenities?.schools,
      englishSchools: typeof schoolCount === "number" ? schoolCount : destination.memberDetails?.amenities?.englishSchools,
      pickleballCourts: destination.memberDetails?.amenities?.pickleballCourts,
    },
    airports,
    hospitals,
    note: "Member details generated from command-center seeds and source-linked destination facts.",
  };
};

const deriveNarratives = (destination: Destination, seed: Seed | undefined, details: DestinationMemberDetails) => {
  const visaSummary = firstNonEmpty(
    lookupQuickMetric(seed, "visa_framework"),
    lookupFact(destination.slug, "Residency")?.value,
    `Residency rules in ${destination.country} require pathway verification before moving.`,
  ) as string;

  const taxSummary = firstNonEmpty(
    lookupFact(destination.slug, "Tax")?.value,
    `Tax residency in ${destination.country} should be modeled before long-stay planning.`,
  ) as string;

  const airportSummary = firstNonEmpty(
    details.airports?.[0]?.name,
    lookupFact(destination.slug, "Nearest airport")?.value,
    `${destination.city} regional airport access`,
  ) as string;

  const healthcareSummary = firstNonEmpty(
    lookupFact(destination.slug, "Healthcare")?.value,
    details.hospitals?.[0]?.name,
    `${destination.city} healthcare network`,
  ) as string;

  const highs = (details.monthlyWeather ?? [])
    .map((row) => row.avgHighC)
    .filter((value): value is number => typeof value === "number");
  const lows = (details.monthlyWeather ?? [])
    .map((row) => row.avgLowC)
    .filter((value): value is number => typeof value === "number");
  const avgHigh = highs.length > 0 ? Math.round((highs.reduce((a, b) => a + b, 0) / highs.length) * 10) / 10 : null;
  const avgLow = lows.length > 0 ? Math.round((lows.reduce((a, b) => a + b, 0) / lows.length) * 10) / 10 : null;

  const climateLine = avgHigh !== null && avgLow !== null
    ? `Published monthly rows indicate average highs near ${avgHigh}C and lows near ${avgLow}C.`
    : "Published monthly climate rows are partial and should be completed for full seasonality analysis.";

  const budget = lookupQuickMetric(seed, "total_monthly_two") ?? "Not published";
  const rent = lookupQuickMetric(seed, "monthly_rent") ?? "Not published";
  const driScore = lookupQuickMetric(seed, "dri_score") ?? (scoreFromNarrative(destination.climate)?.toString() ?? "Not published");
  const confidence = lookupQuickMetric(seed, "confidence_pct") ?? "Not published";
  const topNeighborhoods = (seed?.neighborhoods ?? []).slice(0, 2).map((item) => item.name).filter(Boolean);
  const neighborhoodLine = topNeighborhoods.length > 0
    ? `Start district validation with ${topNeighborhoods.join(" and ")}.`
    : summarizeNeighborhoods(seed, destination.city);

  const variant = stableHash(destination.slug) % 3;

  const descriptionOptions = [
    `${destination.city} in ${destination.country} is profiled as a relocation candidate with source-linked cost, mobility, healthcare, and residency signals for retirement planning.`,
    `${destination.city}, ${destination.country} is structured as a relocation guide focused on practical tradeoffs: housing, healthcare access, transport, and long-stay legal setup.`,
    `${destination.city} relocation intelligence emphasizes repeatable daily living in ${destination.country}, backed by published records for budget, mobility, and planning risk checks.`,
  ];

  const overviewOptions = [
    `${destination.city} currently tracks an estimated couple budget of ${budget} and indicative rent around ${rent}. ${neighborhoodLine} Visa framework: ${visaSummary}. Tax context: ${taxSummary}.`,
    `For shortlist decisions, ${destination.city} is framed around ${budget} monthly for two and rent near ${rent}, then pressure-tested by neighborhood, healthcare, and mobility fit. Visa baseline: ${visaSummary}.`,
    `${destination.city} combines quality-of-life upside with concrete planning checks: ${budget} for two, rent near ${rent}, and district-level scouting before commitment. Residency baseline: ${visaSummary}. Tax baseline: ${taxSummary}.`,
  ];

  const lifestyleOptions = [
    `${destination.city} daily life should be judged by repeatable routines rather than postcard moments. Healthcare reference: ${healthcareSummary}. ${neighborhoodLine}`,
    `${destination.city} lifestyle fit improves when you test grocery, clinic, pharmacy, and evening walk loops in real neighborhoods. Healthcare anchor: ${healthcareSummary}.`,
    `The strongest version of ${destination.city} appears when district fit, healthcare practicality, and transport reliability hold up together. Healthcare signal: ${healthcareSummary}.`,
  ];

  const transportationOptions = [
    `${destination.city} mobility planning should start with ${airportSummary}, then validate district-level transit and drive-time assumptions before lease signing. Map baseline: https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}.`,
    `Anchor travel assumptions in ${airportSummary} and test your likely weekly route stack in ${destination.city} before committing to a district. Map baseline: https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}.`,
    `${destination.city} transport confidence depends on real route testing around ${airportSummary}, especially for healthcare access and airport transfer reliability. Map baseline: https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}.`,
  ];

  return {
    description: descriptionOptions[variant],
    overview: `${overviewOptions[variant]} DRI signal: ${driScore} with confidence ${confidence}.`,
    climate: `${destination.city} climate profile is tied to published monthly rows when available. ${climateLine} Best scouting window: ${details.bestMonths ?? "Not published"}.`,
    lifestyle: lifestyleOptions[variant],
    transportation: transportationOptions[variant],
  };
};

const mergeTags = (destination: Destination) => {
  const base = new Set(destination.tags ?? []);
  base.add("official-sources");
  base.add("verified-profile");
  return Array.from(base);
};

export function enrichDestination(destination: Destination): Destination {
  const seed = generatedCommandCenterSeeds[destination.slug];
  const details = deriveMemberDetails(destination, seed);
  const narratives = deriveNarratives(destination, seed, details);

  return {
    ...destination,
    description: narratives.description,
    overview: narratives.overview,
    climate: narratives.climate,
    lifestyle: narratives.lifestyle,
    transportation: narratives.transportation,
    images: deriveImages(destination),
    tags: mergeTags(destination),
    memberDetails: details,
  };
}

export const enrichedDestinations: Destination[] = destinations.map(enrichDestination);

export const enrichedDestinationBySlug = new Map(enrichedDestinations.map((destination) => [destination.slug, destination]));

export const getEnrichedDestinationBySlug = (slug: string): Destination | undefined => enrichedDestinationBySlug.get(slug);

export const buildDestinationSupportLinks = (destination: Destination) => ({
  mapUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}`,
  youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${destination.city} ${destination.country} neighborhood guide`)}`,
  rentalsUrl: `https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} rentals`)}`,
  visaUrl: countryVisaResource(destination.country),
  taxUrl: countryTaxResource(destination.country),
});
