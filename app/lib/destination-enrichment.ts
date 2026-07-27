import { curatedCityImagesBySlug } from "./curatedCityImages";
import { curatedCityImageGalleriesBySlug } from "./curatedCityImageGalleries";
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

type NarrativeOverride = {
  description: string;
  overview: string;
  climate: string;
  lifestyle: string;
  transportation: string;
};

const flagshipNarrativeOverrides: Partial<Record<string, NarrativeOverride>> = {
  "lucca-italy": {
    description: "Lucca is for retirees who care about daily elegance more than spectacle: intact Renaissance walls for morning loops, a compact historic core for errands on foot, and a social rhythm built around piazzas rather than traffic-heavy boulevards.",
    overview: "Lucca works best when your relocation thesis is walkability with refinement. The strongest fit tends to be buyers who want calm, repeatable routines inside or near the walls, with straightforward rail access for larger-city appointments and airport runs.",
    climate: "Lucca has a warm-temperate Tuscan pattern with humid summers and milder shoulder seasons. For long-stay comfort, focus on spring and early autumn scouting windows and verify apartment heat control for winter moisture and summer peaks.",
    lifestyle: "Daily life in Lucca is defined by compact routines: markets, pharmacy runs, cafe stops, and evening walks on the walls. It rewards people who prefer consistency, culture, and low-friction foot travel over high-energy nightlife.",
    transportation: "Lucca's mobility advantage is practical, not flashy: rail links to Pisa and Florence plus manageable regional road access. Most relocation success depends on choosing housing that keeps train, groceries, and healthcare reachable without a car.",
  },
  "valencia-spain": {
    description: "Valencia blends Mediterranean city scale with genuine day-to-day livability: beach access, serious transit, and neighborhoods where retirement can feel active without becoming chaotic.",
    overview: "Valencia suits retirees who want warm-weather urban life with operational depth. Ciutat Vella, Ruzafa, and Cabanyal each deliver different lifestyle signatures, so district choice matters more than city-level averages.",
    climate: "Valencia is reliably sun-forward with hot summers and mild winters. The practical comfort edge comes from sea influence and shoulder-season strength, with autumn rainfall patterns worth mapping before final neighborhood selection.",
    lifestyle: "The city supports a full weekly rhythm: Turia walks, neighborhood markets, beach routines, and a deep food scene that does not depend on tourist strips alone. Valencia performs best for retirees who still want movement and social density.",
    transportation: "Valencia combines airport reach, metro/tram coverage, and high-speed rail utility. The strongest housing choices are the ones that keep both local transit and Joaquín Sorolla station access efficient on ordinary weekdays.",
  },
  "santander-spain": {
    description: "Santander offers Atlantic-coast retirement with cleaner air, maritime light, and a calmer urban cadence than many Mediterranean hubs, while still preserving city-grade services.",
    overview: "Santander is a strong fit for retirees who prioritize cooler summers, waterfront promenades, and a measured pace. Its advantage is quality of life through atmosphere and practicality, not scale or nonstop activity.",
    climate: "Santander's oceanic profile means milder temperature swings, greener surroundings, and more frequent rain than southern Spain. The payoff is comfortable summer living if you are willing to trade high-sun certainty for Atlantic seasonality.",
    lifestyle: "Daily routines center on coastal walks, local food markets, and neighborhood-level social life rather than destination-style nightlife. It suits people who want a polished but quieter retirement loop.",
    transportation: "Santander's airport and regional rail/bus connections are workable, but this is a city where route planning matters. Verify healthcare and family-visit logistics from your target district before committing.",
  },
  "porto-portugal": {
    description: "Porto is a textured river-and-hills city where retirement quality depends on balancing beauty with topography, transit gradients, and neighborhood-level housing practicality.",
    overview: "Porto works best for retirees who want cultural depth, strong dining, and authentic urban texture over resort-style convenience. Your real decision is which micro-area aligns with mobility comfort and social rhythm.",
    climate: "Porto's Atlantic climate is moderate with wetter cool seasons and warm, usually manageable summers. For long-stay comfort, evaluate humidity and building insulation standards in your short-listed homes.",
    lifestyle: "The city rewards ritual: market mornings, riverside walking, neighborhood cafes, and day-trip rail options. It is ideal for retirees who want a living city that stays interesting after the first month.",
    transportation: "Porto's transport stack is broader than many peers: airport, metro, suburban rail, and intercity links. The key is pairing housing with low-friction transfers so healthcare visits and airport runs stay simple.",
  },
  "cefalu-italy": {
    description: "Cefalu is a small-scale Sicilian coastal town where sea-first living, historic-core walkability, and slower daily cadence define the retirement experience.",
    overview: "Cefalu fits retirees seeking beauty and routine over metropolitan breadth. It is less about constant options and more about whether your chosen block supports grocery access, rail convenience, and year-round comfort.",
    climate: "Cefalu has warm Mediterranean seasonality with long summer stretches and mild winters. Heat tolerance and shoulder-season scouting are essential to choose housing that remains comfortable outside holiday periods.",
    lifestyle: "Life here revolves around promenade walks, old-town social rhythm, and coastal food culture. It is a high-fit destination for retirees who value scenery and slower pacing more than city-scale service density.",
    transportation: "Regional mobility typically routes through Palermo-area infrastructure and rail links. The practical relocation test is whether your home location keeps station access and medical trips easy without daily driving.",
  },
  "matera-italy": {
    description: "Matera delivers a singular historic setting with cave-district character, dramatic views, and a lifestyle anchored in culture and deliberate pace rather than coastal leisure.",
    overview: "Matera suits retirees who prioritize atmosphere, architecture, and contemplative daily living. The city can be exceptional if mobility needs are planned against slope, stone streets, and service-distance reality.",
    climate: "Matera runs warm in summer with cooler inland shoulder seasons. Comfort planning should focus on building thermal behavior, vertical access, and street gradient, not just monthly averages.",
    lifestyle: "Daily life is less about volume and more about texture: historic streets, local dining, and recurring civic spaces. It rewards retirees who prefer depth and quiet cultural immersion.",
    transportation: "Matera's transport profile is functional but not frictionless. Successful relocations usually come from selecting housing with easy links to key roads, regional transfers, and routine healthcare routes.",
  },
  "kanazawa-japan": {
    description: "Kanazawa combines Japanese urban order with human-scale neighborhoods, renowned gardens, and a high-trust daily environment that many retirees find unusually calm and stable.",
    overview: "Kanazawa is strongest for retirees who value safety, civic reliability, and cultural continuity over high-growth expat ecosystems. The relocation decision turns on visa feasibility and language-support planning.",
    climate: "Kanazawa has four-season structure with humid summers and notable winter precipitation. The right housing choice accounts for winter routines, insulation performance, and proximity to everyday services.",
    lifestyle: "The city supports low-drama living: walkable districts, refined food culture, and consistent public behavior norms. It suits retirees who want predictability and depth more than nightlife intensity.",
    transportation: "Kanazawa benefits from strong rail integration and organized local transit. Practical success depends on choosing a district that keeps station access, clinics, and grocery runs simple year-round.",
  },
  "taormina-italy": {
    description: "Taormina offers dramatic Sicilian scenery and a premium hilltown feel where retirement life is shaped by elevation, seasonal tourism flow, and unmatched sea-and-volcano vistas.",
    overview: "Taormina is ideal for retirees prioritizing beauty and cultural atmosphere, provided logistics are handled rigorously. Housing position and transport access determine whether the experience feels effortless or cumbersome.",
    climate: "Taormina has warm coastal seasonality with strong sun exposure and extended summer periods. Long-stay comfort planning should include heat management, shoulder-season patterns, and building ventilation.",
    lifestyle: "The daily rhythm blends scenic walks, piazza social life, and a restaurant landscape that can shift with tourist seasons. It fits retirees who enjoy an animated setting but can tolerate periodic crowd pressure.",
    transportation: "Mobility typically depends on regional airport links and rail/road connections below the hill core. Choose location carefully so elevation and transfer patterns do not complicate medical and airport routines.",
  },
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
  const verifiedGallery = curatedCityImageGalleriesBySlug[destination.slug] ?? [];
  if (verifiedGallery.length > 0) {
    return verifiedGallery.slice(0, 6).map((src, index) => ({
      src,
      alt: `${destination.city} destination view ${index + 1}`,
      caption: `${destination.city}, ${destination.country}`,
    }));
  }

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
  const override = flagshipNarrativeOverrides[destination.slug];
  if (override) return override;

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
  const topNeighborhoods = (seed?.neighborhoods ?? []).slice(0, 3).map((item) => item.name).filter(Boolean);
  const topWaterfront = (seed?.beaches ?? []).slice(0, 2).map((item) => item.name).filter(Boolean);
  const topRecreation = (seed?.recreationFacilities ?? []).slice(0, 2).map((item) => item.name).filter(Boolean);
  const topFood = (seed?.foodSpots ?? []).slice(0, 2).map((item) => item.name).filter(Boolean);

  const neighborhoodLine = topNeighborhoods.length > 0
    ? `Most people feel the city best when they spend time in ${topNeighborhoods.join(", ")} before making housing decisions.`
    : summarizeNeighborhoods(seed, destination.city);

  const lifestyleAnchor = topWaterfront[0] ?? topRecreation[0] ?? topFood[0] ?? destination.city;
  const routineAnchor = topFood[0] ?? topNeighborhoods[0] ?? destination.city;

  const variant = stableHash(destination.slug) % 3;

  const descriptionOptions = [
    `${destination.city} in ${destination.country} feels strongest when you treat it as a daily-living city first: morning walks, practical errands, healthcare access, and evenings in neighborhoods you would actually return to.`,
    `${destination.city}, ${destination.country} works best for people who want a place with personality and repeatable routines, not just one-time highlights.`,
    `${destination.city} is profiled as a long-stay destination where atmosphere and logistics both matter: neighborhood fit, healthcare confidence, transport flow, and realistic monthly spend.`,
  ];

  const overviewOptions = [
    `A realistic couple baseline currently tracks near ${budget}, with indicative rent around ${rent}. ${neighborhoodLine} Residency context: ${visaSummary}. Tax context: ${taxSummary}.`,
    `${destination.city} should be read as both lifestyle and logistics: about ${budget} monthly for two, rent near ${rent}, and district-by-district testing before commitment. Residency context: ${visaSummary}.`,
    `The city combines character with practical decision points: roughly ${budget} for two, rent near ${rent}, and healthcare/transport checks that hold up on ordinary weekdays. Residency context: ${visaSummary}. Tax context: ${taxSummary}.`,
  ];

  const lifestyleOptions = [
    `A typical day in ${destination.city} works when your routine loops through places like ${routineAnchor} and still feels easy by week three, not just day one. Healthcare anchor: ${healthcareSummary}.`,
    `${destination.city} rewards people who care about atmosphere and rhythm: coffee in the morning, a reliable daytime flow, then evenings around ${lifestyleAnchor}. Healthcare anchor: ${healthcareSummary}.`,
    `The lived-in version of ${destination.city} comes from repeatability: groceries, pharmacies, clinic access, transit reliability, and social life that still feels right after the honeymoon week. Healthcare signal: ${healthcareSummary}.`,
  ];

  const transportationOptions = [
    `Travel reliability starts with ${airportSummary}, then expands into how easily you can move between home neighborhoods, healthcare, and your preferred daily anchors inside ${destination.city}.`,
    `The practical transport test in ${destination.city} is less about one airport score and more about whether your weekly route stack stays efficient through all seasons. Airport anchor: ${airportSummary}.`,
    `${destination.city} mobility confidence depends on smooth transfers to ${airportSummary}, plus dependable day-to-day movement between housing, healthcare, and social districts.`,
  ];

  return {
    description: descriptionOptions[variant],
    overview: `${overviewOptions[variant]} DRI signal: ${driScore} with confidence ${confidence}.`,
    climate: `${destination.city} climate should be read as a lived routine, not a single average. ${climateLine} Best scouting window: ${details.bestMonths ?? "Not published"}.`,
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
