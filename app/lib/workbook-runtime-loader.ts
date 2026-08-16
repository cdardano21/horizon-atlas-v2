import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CanonicalDestinationKnowledgeProfile } from "./canonical-destination-model";
import { loadFrozenWorkbookV31DeterministicImport, resolveDeterministicV31DestinationIdentity } from "./workbook-v31-deterministic-core";

export type PremiumWorkbookNormalizedDestinationData = {
  destinationKey: string;
  slug: string;
  city: string;
  country: string;
  title: string;
  subtitle: string;
  heroNarrative: string;
  overview: string;
  editorial: string;
  whyThisPlaceFeelsDistinct: string;
  dailyLife: string;
  climate: string;
  transportation: string;
  healthcare: string;
  costOfLiving: string;
  walkability: string;
  internet: string;
  safety: string;
  officialTourismUrl: string;
  googleMapsUrl: string;
  googleEarthUrl: string;
  wikipediaUrl: string;
  neighborhoods: Array<{
    name: string;
    summary?: string;
    housingCharacter?: string;
    walkabilityRating?: string;
    safetyRating?: string;
    transitRating?: string;
    googleMapsUrl?: string;
    sourceUrl?: string;
    verified?: boolean;
  }>;
  places: Array<{
    name: string;
    category: string;
    neighborhoodName?: string;
    description?: string;
    address?: string;
    websiteUrl?: string;
    googleMapsUrl?: string;
    sourceUrl?: string;
    verified?: boolean;
  }>;
  resources: Array<{
    category: string;
    label: string;
    url: string;
    provider?: string | null;
    sourceUrl?: string;
    verified?: boolean;
  }>;
  media: Array<{
    kind: string;
    url: string;
    altText: string;
    caption: string;
    isPrimary: boolean;
    sourceUrl?: string;
    attribution?: string;
    license?: string;
  }>;
  costRecords: Array<{
    category: string;
    monthlyLow?: number | null;
    monthlyHigh?: number | null;
    currency?: string;
    description?: string;
    householdType?: string;
    lifestyleTier?: string;
  }>;
  healthcareRecords: Array<Record<string, unknown>>;
  transportRecords: Array<Record<string, unknown>>;
  housingRecords: Array<Record<string, unknown>>;
  realityChecks: Array<Record<string, unknown>>;
  sources: Array<Record<string, unknown>>;
  premiumEditorialContent?: {
    heroIntroduction?: string;
    overviewArticle?: string;
    neighborhoodsArticle?: string;
    dailyLifeArticle?: string;
    climateArticle?: string;
    transportationArticle?: string;
    costOfLivingArticle?: string;
    healthcareArticle?: string;
    retirementGuide?: string;
    familyGuide?: string;
    digitalNomadGuide?: string;
    majorStrengths?: string[];
    majorDrawbacks?: string[];
    whyPeopleLoveIt?: string[];
    bestFor?: string[];
    prosAndCons?: {
      advantages?: string[];
      disadvantages?: string[];
    };
  };
  counts: {
    neighborhoods: number;
    places: number;
    resources: number;
    media: number;
    costRecords: number;
  };
  knowledgeProfile?: CanonicalDestinationKnowledgeProfile;
  source?: "runtime-loader";
};

const workbookCache = new Map<string, PremiumWorkbookNormalizedDestinationData | null>();
const shouldUseWorkbookRuntimeCache = () => process.env.NODE_ENV !== "test" && process.env.VITEST !== "true";

export const normalizeWorkbookHeaderName = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  const aliases: Record<string, string> = {
    "destination key": "destination_key",
    "destination id": "destination_id",
    "destination name": "destination_name",
    "destination slug": "slug",
    "destination slug url": "slug",
    "real place name": "real_place_name",
    "place name": "place_name",
    "place category": "place_category",
    "category key": "category_key",
    "resource category": "resource_category",
    "resource name": "resource_name",
    "resource type": "resource_type",
    "resource url": "url",
    "image url": "image_url",
    "media url": "media_url",
    "media type": "media_type",
    "is primary": "is_primary",
    "primary image": "is_primary",
    "monthly low": "monthly_low",
    "monthly high": "monthly_high",
    "household type": "household_type",
    "lifestyle tier": "lifestyle_tier",
    "housing character": "housing_character",
    "walkability rating": "walkability_rating",
    "safety rating": "safety_rating",
    "transit rating": "transit_rating",
    "google maps url": "google_maps_url",
    "google earth url": "google_earth_url",
    "wikipedia url": "wikipedia_url",
    "official tourism url": "official_tourism_url",
    "short description": "short_description",
    "long description": "long_description",
    "why this place feels distinct": "why_this_place_feels_distinct",
    "daily life": "daily_life",
    "cost of living": "cost_of_living",
    "healthcare insurance": "healthcare_insurance",
    "transport airports": "transport_airports",
    "housing property": "housing_property",
    "reality check": "reality_check",
    "source name": "source_name",
    "alt text": "alt_text",
    "formatted address": "formatted_address",
    "google maps": "google_maps_url",
  };

  const lowered = trimmed.toLowerCase();
  const alias = aliases[lowered];
  if (alias) return alias;

  return lowered.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
};

export const normalizeWorkbookPayload = (payload: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = { ...payload };

  for (const [key, value] of Object.entries(normalized)) {
    if (!Array.isArray(value)) continue;

    normalized[key] = value.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return item;
      }

      return Object.fromEntries(
        Object.entries(item as Record<string, unknown>).map(([headerName, cellValue]) => [normalizeWorkbookHeaderName(headerName), cellValue]),
      );
    });
  }

  return normalized;
};

const normalizeSlugValue = (value: string | null | undefined) => {
  if (!value) return "";
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const normalizeTextValue = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const splitFactListValue = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\n|\r|•|;|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getFactTextValue = (fact: Record<string, unknown>) => {
  const candidates = [fact.valueText, fact.value_text, fact.value, fact.text, fact.displayValue, fact.display_value, fact.factValue, fact.fact_value];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
    if (typeof candidate === "number") {
      return String(candidate);
    }
  }
  return "";
};

const findFactValue = (facts: Array<Record<string, unknown>> | undefined, aliases: string[]) => {
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());

  for (const fact of facts ?? []) {
    const factGroup = normalizeTextValue(String(fact.factGroup ?? fact.fact_group ?? fact.group ?? fact.group_name ?? "")).toLowerCase();
    const factKey = normalizeTextValue(String(fact.factKey ?? fact.fact_key ?? fact.key ?? fact.fact ?? "")).toLowerCase();
    const displayLabel = normalizeTextValue(String(fact.displayLabel ?? fact.display_label ?? fact.label ?? fact.name ?? fact.title ?? "")).toLowerCase();
    // Only match identity metadata (key/label/group) — matching against value text would let unrelated prose (e.g. "Metro, trams, buses...") satisfy aliases like "metro".
    const identityFields = [factGroup, factKey, displayLabel].filter(Boolean);
    if (normalizedAliases.some((alias) => identityFields.some((fieldValue) => fieldValue === alias || fieldValue.includes(alias)))) {
      return getFactTextValue(fact);
    }
  }

  return "";
};

const mergeFactsForKnowledgeProfile = (primaryFacts: Array<Record<string, unknown>> | undefined, fallbackFacts: Array<Record<string, unknown>> | undefined) => {
  const mergedFacts = [...(primaryFacts ?? []), ...(fallbackFacts ?? [])];
  const seen = new Set<string>();

  return mergedFacts.filter((fact) => {
    const signature = [
      normalizeTextValue(String(fact.factGroup ?? fact.fact_group ?? fact.group ?? fact.group_name ?? "")),
      normalizeTextValue(String(fact.factKey ?? fact.fact_key ?? fact.key ?? fact.fact ?? "")),
      normalizeTextValue(String(fact.displayLabel ?? fact.display_label ?? fact.label ?? fact.name ?? fact.title ?? "")),
      normalizeTextValue(String(fact.valueText ?? fact.value_text ?? fact.value ?? fact.text ?? fact.displayValue ?? fact.display_value ?? fact.factValue ?? fact.fact_value ?? "")),
    ].join("::").toLowerCase();

    if (!signature || seen.has(signature)) {
      return false;
    }

    seen.add(signature);
    return true;
  });
};

const buildKnowledgeProfileFromFacts = (facts: Array<Record<string, unknown>> | undefined): CanonicalDestinationKnowledgeProfile => {
  const population = normalizeTextValue(findFactValue(facts, ["population", "city_population", "resident_population", "population_size"]));
  const metroPopulation = normalizeTextValue(findFactValue(facts, ["metro_population", "metro_area_population", "metro"]));
  const elevation = normalizeTextValue(findFactValue(facts, ["elevation", "elevation_m", "elevation_ft"]));
  const timeZone = normalizeTextValue(findFactValue(facts, ["time_zone", "timezone"]));
  const climateClassification = normalizeTextValue(findFactValue(facts, ["climate_classification", "climate", "climate_type"]));
  const rainfall = normalizeTextValue(findFactValue(facts, ["rainfall", "avg_rainfall", "annual_rainfall"]));
  const sunshineHours = normalizeTextValue(findFactValue(facts, ["sunshine_hours", "sunshine", "avg_sunshine"]));
  const humidity = normalizeTextValue(findFactValue(facts, ["humidity", "avg_humidity"]));
  const walkability = normalizeTextValue(findFactValue(facts, ["walkability"]));
  const publicTransportation = normalizeTextValue(findFactValue(facts, ["public_transportation", "transport", "transit"]));
  const safety = normalizeTextValue(findFactValue(facts, ["safety"]));
  const internetSpeed = normalizeTextValue(findFactValue(facts, ["internet_speed", "internet", "connectivity"]));
  const costOfLiving = normalizeTextValue(findFactValue(facts, ["cost_of_living", "cost_level"]));
  const healthcareQuality = normalizeTextValue(findFactValue(facts, ["healthcare_quality", "healthcare_system"]));
  const majorAirports = splitFactListValue(findFactValue(facts, ["major_airports", "airports", "airport_access"]));
  const majorHospitals = splitFactListValue(findFactValue(facts, ["major_hospitals", "hospitals", "healthcare"]));
  const familySuitability = normalizeTextValue(findFactValue(facts, ["family_suitability", "family_friendly"]));
  const retirementSuitability = normalizeTextValue(findFactValue(facts, ["retirement_suitability", "retirement"]));
  const digitalNomadSuitability = normalizeTextValue(findFactValue(facts, ["digital_nomad_suitability", "digital_nomad"]));
  const visaInfo = normalizeTextValue(findFactValue(facts, ["visa_info", "visa"]));
  const residencyInfo = normalizeTextValue(findFactValue(facts, ["residency_info", "residency"]));

  return {
    population: population || undefined,
    metroPopulation: metroPopulation || undefined,
    elevation: elevation || undefined,
    timeZone: timeZone || undefined,
    climateClassification: climateClassification || undefined,
    rainfall: rainfall || undefined,
    sunshineHours: sunshineHours || undefined,
    humidity: humidity || undefined,
    walkability: walkability || undefined,
    publicTransportation: publicTransportation || undefined,
    safety: safety || undefined,
    internetSpeed: internetSpeed || undefined,
    costOfLiving: costOfLiving || undefined,
    healthcareQuality: healthcareQuality || undefined,
    majorAirports,
    majorHospitals,
    familySuitability: familySuitability || undefined,
    retirementSuitability: retirementSuitability || undefined,
    digitalNomadSuitability: digitalNomadSuitability || undefined,
    visaInfo: visaInfo || undefined,
    residencyInfo: residencyInfo || undefined,
  };
};

// The DESTINATIONS sheet stores population/metro_population/elevation_m/latitude/longitude as dedicated columns rather than DESTINATION_FACTS rows, so they must be merged in separately from the fact-derived profile above.
const applyIdentityKnowledgeProfileOverrides = (
  profile: CanonicalDestinationKnowledgeProfile,
  identity: { population?: string | null; metroPopulation?: string | null; elevationMeters?: string | null; latitude?: string | null; longitude?: string | null },
): CanonicalDestinationKnowledgeProfile => {
  const population = normalizeTextValue(identity.population ?? undefined);
  const metroPopulation = normalizeTextValue(identity.metroPopulation ?? undefined);
  const elevationMeters = normalizeTextValue(identity.elevationMeters ?? undefined);
  const latitude = normalizeTextValue(identity.latitude ?? undefined);
  const longitude = normalizeTextValue(identity.longitude ?? undefined);

  return {
    ...profile,
    population: population || profile.population,
    metroPopulation: metroPopulation || profile.metroPopulation,
    elevation: (elevationMeters && /^-?\d+(\.\d+)?$/.test(elevationMeters) ? `${Number.parseFloat(elevationMeters)} m` : elevationMeters) || profile.elevation,
    latitude: latitude || profile.latitude,
    longitude: longitude || profile.longitude,
  };
};


const workbookFileNames = [
  "DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx",
  "DestinationFinderAI_Master_Workbook_v3.0_Workbook_Only_No_Fallback.xlsx",
  "DestinationFinderAI_Master_Workbook_v3.0_Workbook_Only_No_Fallback copy.xlsx",
  "DestinationFinderAI_Master_Workbook_v3.0_Workbook_Only.xlsx",
  "DestinationFinderAI_Master_Workbook_v3.0.xlsx",
  "81Horizon-Atlas-CLEAN.xlsx",
  "81Horizon-Atlas-CLEAN copy.xlsx",
  "DestinationFinderAI_Master_Schema_v2.0_Premium_3-Destination_Pilot 3.xlsx",
  "DestinationFinderAI_Master_Schema_v2.0_Premium_3-Destination_Pilot 3 copy.xlsx",
];

const isLikelyWorkbookFile = (fileName: string) => {
  const normalized = fileName.toLowerCase();
  return normalized.endsWith(".xlsx") && /destinationfinderai|horizon-atlas|premium|workbook/i.test(normalized);
};

const findWorkbookPath = () => {
  const workspaceRoot = process.cwd();
  const repoRoot = path.resolve(workspaceRoot, "..");
  const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
  const candidateRoots = [
    process.env.PREMIUM_WORKBOOK_PATH,
    workspaceRoot,
    repoRoot,
    path.resolve(workspaceRoot, "..", ".."),
    path.resolve(workspaceRoot, "..", "..", ".."),
    path.resolve(currentFileDir, "..", ".."),
    path.resolve(currentFileDir, "..", "..", ".."),
    path.resolve(currentFileDir, "..", "..", "..", ".."),
  ].filter((value, index, values) => Boolean(value) && values.indexOf(value) === index) as string[];
  const visitedDirectories = new Set<string>();
  const searchQueue = candidateRoots.slice();

  const checkDirectory = (root: string): string | null => {
    if (!root || visitedDirectories.has(root)) return null;
    visitedDirectories.add(root);

    for (const fileName of workbookFileNames) {
      const candidate = path.join(root, fileName);
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    try {
      const entries = readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !isLikelyWorkbookFile(entry.name)) continue;
        const candidate = path.join(root, entry.name);
        if (existsSync(candidate)) {
          return candidate;
        }
      }
    } catch {
      /* ignore */
    }

    for (const subdirectory of ["data", "backups", "backup", "archives", "archive", "workbooks", "documents", "downloads"]) {
      const subdirectoryPath = path.join(root, subdirectory);
      if (!existsSync(subdirectoryPath)) continue;
      for (const fileName of workbookFileNames) {
        const candidate = path.join(subdirectoryPath, fileName);
        if (existsSync(candidate)) {
          return candidate;
        }
      }

      try {
        const subEntries = readdirSync(subdirectoryPath, { withFileTypes: true });
        for (const entry of subEntries) {
          if (!entry.isFile() || !isLikelyWorkbookFile(entry.name)) continue;
          const candidate = path.join(subdirectoryPath, entry.name);
          if (existsSync(candidate)) {
            return candidate;
          }
        }
      } catch {
        /* ignore */
      }
    }

    return null;
  };

  while (searchQueue.length > 0) {
    const currentRoot = searchQueue.shift();
    if (!currentRoot) continue;
    const foundCandidate = checkDirectory(currentRoot);
    if (foundCandidate) {
      return foundCandidate;
    }

    try {
      const entries = readdirSync(currentRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const childPath = path.join(currentRoot, entry.name);
        if ([".git", "node_modules", ".next", "dist", "coverage"].includes(entry.name)) continue;
        searchQueue.push(childPath);
      }
    } catch {
      /* ignore */
    }
  }

  return null;
};

const getPythonExecutable = () => {
  const workspaceRoot = process.cwd();
  const candidates = [
    path.resolve(workspaceRoot, ".python-deps", "venv", "bin", "python"),
    path.resolve(workspaceRoot, ".venv", "bin", "python"),
    process.env.PYTHON,
    "python3",
    "python",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.includes("/")) {
      if (existsSync(candidate)) return candidate;
      continue;
    }
    return candidate;
  }

  return "python3";
};

const normalizeMatchCandidate = (value: string | null | undefined) => normalizeSlugValue(value);

const getTokenScore = (targetSlug: string, candidate: string) => {
  const targetTokens = new Set(normalizeSlugValue(targetSlug).split("-").filter(Boolean));
  const candidateTokens = normalizeSlugValue(candidate).split("-").filter(Boolean);
  const overlap = candidateTokens.filter((token) => targetTokens.has(token)).length;
  return overlap;
};

const matchesWorkbookRowToDestination = (row: Record<string, unknown>, destinationKey: string, destinationSlug: string) => {
  const destinationCandidates = [destinationKey, destinationSlug]
    .map((value) => normalizeSlugValue(value))
    .filter(Boolean);

  if (destinationCandidates.length === 0) {
    return true;
  }

  const rowCandidates = [
    row.destination_key,
    row.destinationKey,
    row.destination_id,
    row.slug,
    row.destination_slug,
    row.destination_name,
    row.city,
    row.name,
  ]
    .map((value) => normalizeSlugValue(String(value ?? "")))
    .filter(Boolean);

  if (rowCandidates.length === 0) {
    return true;
  }

  return destinationCandidates.some((destinationCandidate) => rowCandidates.some((rowCandidate) => {
    if (rowCandidate === destinationCandidate) return true;
    if (rowCandidate.startsWith(destinationCandidate) || destinationCandidate.startsWith(rowCandidate)) return true;
    return rowCandidate.includes(destinationCandidate) || destinationCandidate.includes(rowCandidate);
  }));
};

const selectWorkbookDestination = (workbookData: Record<string, unknown>, slug: string) => {
  const destinations = Array.isArray(workbookData.destinations) ? workbookData.destinations as Array<Record<string, unknown>> : [];
  if (destinations.length === 0) {
    return null;
  }

  const normalizedSlug = normalizeSlugValue(slug);
  if (!normalizedSlug) {
    return null;
  }

  const scored = destinations
    .map((destination) => {
      const candidateSlug = normalizeMatchCandidate(String(destination.slug ?? destination.destination_key ?? destination.destination_name ?? destination.city ?? ""));
      const city = normalizeMatchCandidate(String(destination.city ?? ""));
      const name = normalizeMatchCandidate(String(destination.destination_name ?? destination.city ?? ""));
      const country = normalizeMatchCandidate(String(destination.country ?? ""));
      const haystacks = [candidateSlug, city, name, `${city}-${country}`.replace(/^-|-$/g, ""), `${name}-${country}`.replace(/^-|-$/g, "")].filter(Boolean);

      let score = 0;
      if (normalizedSlug && haystacks.some((haystack) => haystack === normalizedSlug)) score += 100;
      if (normalizedSlug && haystacks.some((haystack) => haystack.includes(normalizedSlug) || normalizedSlug.includes(haystack))) score += 60;
      if (normalizedSlug && haystacks.some((haystack) => normalizedSlug.startsWith(haystack) || haystack.startsWith(normalizedSlug))) score += 40;
      for (const haystack of haystacks) {
        score += getTokenScore(normalizedSlug, haystack) * 8;
      }

      return { destination, score };
    })
    .sort((left, right) => right.score - left.score);

  const bestMatch = scored.find((item) => item.score >= 40);
  return bestMatch?.destination ?? null;
};

const loadDeterministicV31WorkbookDestinationData = async (slug: string): Promise<PremiumWorkbookNormalizedDestinationData | null> => {
  try {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    if (!importResult.canonicalDestinations?.length) {
      return null;
    }

    const normalizedSlug = normalizeSlugValue(slug);
    const resolvedIdentity = resolveDeterministicV31DestinationIdentity({
      requestedIdentity: normalizedSlug,
      destinations: importResult.destinations.map((destination) => ({ destination_key: destination.destinationKey, slug: destination.slug })),
      destinationAliases: importResult.diagnostics?.aliasResolution ? Object.entries(importResult.diagnostics.aliasResolution).map(([alias, destinationKey]) => ({ destination_key: destinationKey, alias_value: alias, active: "1" })) : [],
    });

    if (!resolvedIdentity.ok || !resolvedIdentity.value) {
      return null;
    }

    const canonicalDestination = importResult.canonicalDestinations.find((destination) => destination.identity.destinationKey === resolvedIdentity.value)
      ?? importResult.canonicalDestinations.find((destination) => {
        const candidateValues = [normalizedSlug, resolvedIdentity.value, destination.identity.slug, destination.identity.name, destination.identity.city, destination.identity.country]
          .map((value) => normalizeSlugValue(String(value ?? "")))
          .filter(Boolean);
        return candidateValues.some((candidate) => candidate === normalizedSlug || candidate === normalizeSlugValue(resolvedIdentity.value ?? "") || candidate.includes(normalizedSlug) || normalizedSlug.includes(candidate));
      });
    if (!canonicalDestination) {
      return null;
    }

    const canonicalFacts = Array.isArray((canonicalDestination as { facts?: unknown }).facts)
      ? ((canonicalDestination as { facts?: Array<Record<string, unknown>> }).facts ?? [])
      : [];
    const importDestinationFacts = Array.isArray((importResult.destinations.find((destination) => destination.destinationKey === resolvedIdentity.value) as { facts?: unknown } | undefined)?.facts)
      ? ((importResult.destinations.find((destination) => destination.destinationKey === resolvedIdentity.value) as { facts?: Array<Record<string, unknown>> }).facts ?? [])
      : [];
    const knowledgeProfile = applyIdentityKnowledgeProfileOverrides(
      buildKnowledgeProfileFromFacts(mergeFactsForKnowledgeProfile(canonicalFacts, importDestinationFacts)),
      canonicalDestination.identity,
    );

    const city = normalizeTextValue(canonicalDestination.identity.city);
    const country = normalizeTextValue(canonicalDestination.identity.country);
    const title = normalizeTextValue(canonicalDestination.identity.name);
    const subtitle = [city || title, country].filter(Boolean).join(", ");

    return {
      destinationKey: canonicalDestination.identity.destinationKey,
      slug: normalizeSlugValue(canonicalDestination.identity.slug || slug) || normalizedSlug || slug,
      city,
      country,
      title,
      subtitle,
      heroNarrative: normalizeTextValue(canonicalDestination.editorial.shortDescription),
      overview: normalizeTextValue(canonicalDestination.editorial.longDescription),
      editorial: normalizeTextValue(canonicalDestination.editorial.longDescription),
      whyThisPlaceFeelsDistinct: "",
      dailyLife: "",
      climate: "",
      transportation: "",
      healthcare: "",
      costOfLiving: "",
      walkability: "",
      internet: "",
      safety: "",
      officialTourismUrl: "",
      googleMapsUrl: "",
      googleEarthUrl: "",
      wikipediaUrl: "",
      neighborhoods: (canonicalDestination.neighborhoods ?? []).map((item) => ({
        name: normalizeTextValue(item.neighborhood_name),
        summary: normalizeTextValue(item.summary),
        housingCharacter: normalizeTextValue(item.housing_character),
        walkabilityRating: normalizeTextValue(item.walkability_rating),
        safetyRating: normalizeTextValue(item.safety_rating),
        transitRating: normalizeTextValue(item.transit_rating),
        googleMapsUrl: normalizeTextValue(item.google_maps_url),
        sourceUrl: normalizeTextValue(item.source_url),
        verified: normalizeTextValue(item.verified) === "1" || normalizeTextValue(item.verified).toLowerCase() === "true",
      })).filter((item) => item.name),
      places: (canonicalDestination.places ?? []).map((item) => ({
        name: normalizeTextValue(item.place_name),
        category: normalizeTextValue(item.category_key),
        neighborhoodName: normalizeTextValue(item.neighborhood_key),
        description: normalizeTextValue(item.description),
        address: normalizeTextValue(item.address),
        websiteUrl: normalizeTextValue(item.website_url),
        googleMapsUrl: normalizeTextValue(item.google_maps_url),
        sourceUrl: normalizeTextValue(item.source_url),
        verified: normalizeTextValue(item.verified) === "1" || normalizeTextValue(item.verified).toLowerCase() === "true",
      })).filter((item) => item.name),
      resources: (canonicalDestination.resources ?? []).map((item) => ({
        category: normalizeTextValue(item.resource_category),
        label: normalizeTextValue(item.resource_name),
        url: normalizeTextValue(item.url),
        provider: normalizeTextValue(item.source_name) || null,
        sourceUrl: normalizeTextValue(item.source_url),
        verified: normalizeTextValue(item.verified) === "1" || normalizeTextValue(item.verified).toLowerCase() === "true",
      })).filter((item) => item.label || item.url),
      media: (canonicalDestination.media ?? []).map((item) => ({
        kind: normalizeTextValue(item.media_type) || "image",
        url: normalizeTextValue(item.image_url),
        altText: normalizeTextValue(item.caption) || normalizeTextValue(item.subject),
        caption: normalizeTextValue(item.caption) || normalizeTextValue(item.subject),
        isPrimary: normalizeTextValue(item.primary_image) === "1" || normalizeTextValue(item.primary_image).toLowerCase() === "true",
        sourceUrl: normalizeTextValue(item.source_url),
        attribution: normalizeTextValue(item.source_name) || normalizeTextValue(item.license_notes),
        license: normalizeTextValue(item.license_notes),
      })).filter((item) => item.url),
      costRecords: (canonicalDestination.costOfLiving ?? []).map((item) => ({
        category: normalizeTextValue(item.category),
        monthlyLow: Number.parseFloat(normalizeTextValue(item.monthly_low)) || null,
        monthlyHigh: Number.parseFloat(normalizeTextValue(item.monthly_high)) || null,
        currency: normalizeTextValue(item.currency) || "USD",
        description: normalizeTextValue(item.included_notes),
        householdType: normalizeTextValue(item.household_type),
        lifestyleTier: normalizeTextValue(item.lifestyle_tier),
      })).filter((item) => item.category),
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      premiumEditorialContent: {
        heroIntroduction: normalizeTextValue(canonicalDestination.editorial.shortDescription),
        overviewArticle: normalizeTextValue(canonicalDestination.editorial.longDescription),
      },
      counts: {
        neighborhoods: canonicalDestination.neighborhoods?.length ?? 0,
        places: canonicalDestination.places?.length ?? 0,
        resources: canonicalDestination.resources?.length ?? 0,
        media: canonicalDestination.media?.length ?? 0,
        costRecords: canonicalDestination.costOfLiving?.length ?? 0,
      },
      knowledgeProfile,
      source: "runtime-loader",
    };
  } catch {
    return null;
  }
};

export async function loadPremiumWorkbookDestinationData(slug: string): Promise<PremiumWorkbookNormalizedDestinationData | null> {
  const normalizedSlug = normalizeSlugValue(slug);
  if (!normalizedSlug) {
    return null;
  }

  const workbookPath = findWorkbookPath();
  const cacheKey = `${normalizedSlug}:${workbookPath ?? "__missing__"}`;
  if (shouldUseWorkbookRuntimeCache()) {
    const cached = workbookCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  const deterministicWorkbookData = await loadDeterministicV31WorkbookDestinationData(normalizedSlug);
  if (deterministicWorkbookData) {
    if (shouldUseWorkbookRuntimeCache()) {
      workbookCache.set(cacheKey, deterministicWorkbookData);
    }
    return deterministicWorkbookData;
  }

  if (!workbookPath) {
    if (shouldUseWorkbookRuntimeCache()) {
      workbookCache.set(cacheKey, null);
    }
    return null;
  }

  const pythonExecutable = getPythonExecutable();
  const script = `
import json
import re
import sys
from pathlib import Path
import openpyxl

workbook_path = Path(sys.argv[1])
slug_filter = (sys.argv[2] if len(sys.argv) > 2 else "").strip().lower()

wb = openpyxl.load_workbook(workbook_path, data_only=True, read_only=True)

sheet_names = {name: wb[name] for name in wb.sheetnames if name in wb.sheetnames}


def normalize_text(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", normalize_text(value).lower()).strip("-")


def as_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        text = value.strip().lower()
        return text in {"true", "yes", "1", "y"}
    return bool(value)


def normalize_header_name(value):
    text = normalize_text(value)
    if not text:
        return ""
    aliases = {
        "destination key": "destination_key",
        "destination id": "destination_id",
        "destination name": "destination_name",
        "destination slug": "slug",
        "real place name": "real_place_name",
        "place name": "place_name",
        "place category": "place_category",
        "category key": "category_key",
        "resource category": "resource_category",
        "resource name": "resource_name",
        "resource type": "resource_type",
        "resource url": "url",
        "image url": "image_url",
        "media url": "media_url",
        "media type": "media_type",
        "is primary": "is_primary",
        "primary image": "is_primary",
        "monthly low": "monthly_low",
        "monthly high": "monthly_high",
        "household type": "household_type",
        "lifestyle tier": "lifestyle_tier",
        "housing character": "housing_character",
        "walkability rating": "walkability_rating",
        "safety rating": "safety_rating",
        "transit rating": "transit_rating",
        "google maps url": "google_maps_url",
        "google earth url": "google_earth_url",
        "wikipedia url": "wikipedia_url",
        "official tourism url": "official_tourism_url",
        "short description": "short_description",
        "long description": "long_description",
        "why this place feels distinct": "why_this_place_feels_distinct",
        "daily life": "daily_life",
        "cost of living": "cost_of_living",
        "healthcare insurance": "healthcare_insurance",
        "transport airports": "transport_airports",
        "housing property": "housing_property",
        "reality check": "reality_check",
        "source name": "source_name",
        "alt text": "alt_text",
        "formatted address": "formatted_address",
        "google maps": "google_maps_url",
    }
    lowered = text.lower()
    if lowered in aliases:
        return aliases[lowered]
    return re.sub(r"[^a-z0-9]+", "_", lowered).strip("_")


def normalize_row(row):
    return {k: (v if not isinstance(v, str) else v.strip()) for k, v in row.items()}


def read_sheet(sheet_name):
    if sheet_name not in wb.sheetnames:
        return []
    ws = wb[sheet_name]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [normalize_header_name(cell) for cell in rows[0]]
    data = []
    for raw_row in rows[1:]:
        if not any(normalize_text(cell) for cell in raw_row):
            continue
        record = {}
        for index, value in enumerate(raw_row):
            if index < len(headers):
                record[headers[index]] = value
        data.append(record)
    return data


def build_destination_row(row):
    return {
        "destination_key": normalize_text(row.get("destination_key") or row.get("destination_id") or row.get("destination") or row.get("slug") or row.get("destination_slug") or ""),
        "slug": normalize_text(row.get("slug") or row.get("destination_slug") or row.get("destination_key") or row.get("destination_name") or row.get("city") or ""),
        "destination_name": normalize_text(row.get("destination_name") or row.get("destination_name") or row.get("name") or row.get("city") or row.get("title") or ""),
        "city": normalize_text(row.get("city") or row.get("destination_name") or row.get("name") or ""),
        "country": normalize_text(row.get("country") or row.get("country_name") or row.get("country_code") or row.get("region") or ""),
        "short_description": normalize_text(row.get("short_description") or row.get("description") or row.get("overview") or row.get("long_description") or ""),
        "long_description": normalize_text(row.get("long_description") or row.get("description") or row.get("overview") or row.get("short_description") or ""),
        "hero_narrative": normalize_text(row.get("hero_narrative") or row.get("short_description") or row.get("long_description") or ""),
        "overview": normalize_text(row.get("overview") or row.get("summary") or row.get("long_description") or row.get("short_description") or ""),
        "editorial": normalize_text(row.get("editorial") or row.get("long_description") or row.get("overview") or row.get("short_description") or ""),
        "population": normalize_text(row.get("population") or ""),
        "metro_population": normalize_text(row.get("metro_population") or row.get("metro") or ""),
        "elevation_m": normalize_text(row.get("elevation_m") or row.get("elevation") or ""),
        "time_zone": normalize_text(row.get("time_zone") or row.get("timezone") or ""),
        "why_this_place_feels_distinct": normalize_text(row.get("why_this_place_feels_distinct") or row.get("overview") or ""),
        "daily_life": normalize_text(row.get("daily_life") or row.get("lifestyle") or ""),
        "climate": normalize_text(row.get("climate") or row.get("climate_summary") or ""),
        "transportation": normalize_text(row.get("transportation") or row.get("transportation_summary") or ""),
        "healthcare": normalize_text(row.get("healthcare") or row.get("healthcare_summary") or ""),
        "cost_of_living": normalize_text(row.get("cost_of_living") or row.get("cost_summary") or ""),
        "walkability": normalize_text(row.get("walkability") or row.get("walkability_summary") or ""),
        "internet": normalize_text(row.get("internet") or row.get("connectivity") or ""),
        "safety": normalize_text(row.get("safety") or row.get("safety_summary") or ""),
        "official_tourism_url": normalize_text(row.get("official_tourism_url") or row.get("official_url") or row.get("source_url") or row.get("website_url") or ""),
        "google_maps_url": normalize_text(row.get("google_maps_url") or row.get("maps_url") or row.get("google_maps") or ""),
        "google_earth_url": normalize_text(row.get("google_earth_url") or row.get("earth_url") or ""),
        "wikipedia_url": normalize_text(row.get("wikipedia_url") or row.get("wikipedia") or ""),
    }


destination_rows = [build_destination_row(row) for row in read_sheet("DESTINATIONS")]

neighborhood_rows = []
for row in read_sheet("NEIGHBORHOODS"):
    neighborhood_rows.append({
        "destination_key": normalize_text(row.get("destination_key") or row.get("destination") or row.get("destination_id") or row.get("destinationId") or ""),
        "name": normalize_text(row.get("neighborhood_name") or row.get("name") or row.get("title") or ""),
        "summary": normalize_text(row.get("summary") or row.get("description") or ""),
        "housing_character": normalize_text(row.get("housing_character") or row.get("housing") or ""),
        "walkability_rating": normalize_text(row.get("walkability_rating") or row.get("walkability") or ""),
        "safety_rating": normalize_text(row.get("safety_rating") or row.get("safety") or ""),
        "transit_rating": normalize_text(row.get("transit_rating") or row.get("transit") or ""),
        "google_maps_url": normalize_text(row.get("google_maps_url") or row.get("maps_url") or ""),
        "source_url": normalize_text(row.get("source_url") or row.get("source") or ""),
        "verified": as_bool(row.get("verified") or False),
    })

place_rows = []
for row in read_sheet("PLACES"):
    place_rows.append({
        "destination_key": normalize_text(row.get("destination_key") or row.get("destination") or row.get("destination_id") or row.get("destinationId") or ""),
        "name": normalize_text(row.get("real_place_name") or row.get("place_name") or row.get("name") or row.get("title") or ""),
        "category": normalize_text(row.get("category_key") or row.get("place_category") or row.get("category") or row.get("subcategory") or "Place"),
        "neighborhood_name": normalize_text(row.get("neighborhood_key") or row.get("neighborhood_name") or row.get("neighborhood") or ""),
        "description": normalize_text(row.get("description") or row.get("notes") or ""),
        "address": normalize_text(row.get("address") or row.get("formatted_address") or ""),
        "website_url": normalize_text(row.get("website_url") or row.get("source_url") or row.get("url") or ""),
        "google_maps_url": normalize_text(row.get("google_maps_url") or row.get("maps_url") or ""),
        "source_url": normalize_text(row.get("source_url") or row.get("source_name") or ""),
        "verified": as_bool(row.get("verified") or False),
    })

resource_rows = []
for row in read_sheet("RESOURCES"):
    resource_rows.append({
        "destination_key": normalize_text(row.get("destination_key") or row.get("destination") or row.get("destination_id") or row.get("destinationId") or ""),
        "category": normalize_text(row.get("resource_category") or row.get("category") or row.get("resource_type") or "resource"),
        "label": normalize_text(row.get("resource_name") or row.get("name") or row.get("title") or "Resource"),
        "url": normalize_text(row.get("url") or row.get("source_url") or row.get("website_url") or ""),
        "provider": normalize_text(row.get("source_name") or row.get("provider") or ""),
        "source_url": normalize_text(row.get("source_url") or row.get("url") or ""),
        "verified": as_bool(row.get("verified") or False),
    })

media_rows = []
for row in read_sheet("MEDIA"):
    media_rows.append({
        "destination_key": normalize_text(row.get("destination_key") or row.get("destination") or row.get("destination_id") or row.get("destinationId") or ""),
        "kind": normalize_text(row.get("media_type") or row.get("type") or "image"),
        "url": normalize_text(row.get("image_url") or row.get("media_url") or row.get("url") or ""),
        "alt_text": normalize_text(row.get("alt_text") or row.get("altText") or row.get("caption") or row.get("subject") or ""),
        "caption": normalize_text(row.get("caption") or row.get("subject") or row.get("alt_text") or ""),
        "is_primary": as_bool(row.get("primary_image") or row.get("is_primary") or row.get("isPrimary") or False),
    })

cost_rows = []
for row in read_sheet("COST_OF_LIVING"):
    cost_rows.append({
        "destination_key": normalize_text(row.get("destination_key") or row.get("destination") or row.get("destination_id") or row.get("destinationId") or ""),
        "category": normalize_text(row.get("category") or row.get("label") or row.get("name") or "Living cost"),
        "monthly_low": row.get("monthly_low") if row.get("monthly_low") is not None else row.get("low") if row.get("low") is not None else None,
        "monthly_high": row.get("monthly_high") if row.get("monthly_high") is not None else row.get("high") if row.get("high") is not None else None,
        "currency": normalize_text(row.get("currency") or "USD"),
        "description": normalize_text(row.get("description") or row.get("included_notes") or row.get("summary") or ""),
        "household_type": normalize_text(row.get("household_type") or row.get("household") or ""),
        "lifestyle_tier": normalize_text(row.get("lifestyle_tier") or row.get("tier") or ""),
    })

healthcare_rows = []
for row in read_sheet("HEALTHCARE_INSURANCE"):
    healthcare_rows.append(normalize_row(row))

transport_rows = []
for row in read_sheet("TRANSPORT_AIRPORTS"):
    transport_rows.append(normalize_row(row))

housing_rows = []
for row in read_sheet("HOUSING_PROPERTY"):
    housing_rows.append(normalize_row(row))

reality_rows = []
for row in read_sheet("REALITY_CHECK"):
    reality_rows.append(normalize_row(row))

sources = []
for row in read_sheet("SOURCES"):
    sources.append(normalize_row(row))

premium_editorial = {
    "heroIntroduction": normalize_text(next((row.get("short_description") for row in destination_rows if row.get("short_description")), "")),
    "overviewArticle": normalize_text(next((row.get("long_description") for row in destination_rows if row.get("long_description")), "")),
    "majorStrengths": [],
    "majorDrawbacks": [],
}


def choose_destination_row(rows):
    if not rows:
        return {}
    if not slug_filter:
        return rows[0]
    normalized_slug = slug_filter.lower()
    for row in rows:
        row_slug = normalize_text(row.get("destination_key") or row.get("slug") or row.get("destination_name") or row.get("city") or "")
        if not row_slug:
            continue
        normalized_row_slug = row_slug.lower()
        if normalized_row_slug == normalized_slug or normalized_row_slug.startswith(normalized_slug) or normalized_slug.startswith(normalized_row_slug):
            return row
    return rows[0]


def parse_numeric(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = normalize_text(value)
    if not text:
        return None
    try:
        return float(text.replace(",", ""))
    except ValueError:
        return None


def infer_climate_classification(value):
    text = normalize_text(value).lower()
    if "humid subtropical" in text:
        return "Humid subtropical"
    if "continental" in text:
        return "Continental"
    if "subtropical" in text:
        return "Subtropical"
    if "mediterranean" in text:
        return "Mediterranean"
    if "arid" in text:
        return "Arid"
    if "tropical" in text:
        return "Tropical"
    return ""


def extract_hospital_names(texts):
    names = []
    pattern = re.compile(r"([A-Z][A-Za-z0-9 .&'/-]+(?:Hospital|Hospitals))")
    for raw_text in texts:
        for match in pattern.findall(normalize_text(raw_text)):
            if match and match not in names:
                names.append(match)
    return names

selected_destination = choose_destination_row(destination_rows)
destination_key = normalize_text(selected_destination.get("destination_key") or selected_destination.get("slug") or "")
climate_facts = [row for row in read_sheet("DESTINATION_FACTS") if normalize_text(row.get("destination_key")) == destination_key and normalize_text(row.get("fact_group")) == "climate"]
climate_text = next((normalize_text(row.get("value_text")) for row in climate_facts if normalize_text(row.get("value_text"))), "")
climate_monthly_rows = [row for row in read_sheet("CLIMATE_MONTHLY") if normalize_text(row.get("destination_key")) == destination_key]
rainfall_values = [parse_numeric(row.get("rainfall_mm")) for row in climate_monthly_rows if parse_numeric(row.get("rainfall_mm")) is not None]
sunshine_values = [parse_numeric(row.get("sunshine_hours")) for row in climate_monthly_rows if parse_numeric(row.get("sunshine_hours")) is not None]
humidity_values = [parse_numeric(row.get("humidity_pct")) for row in climate_monthly_rows if parse_numeric(row.get("humidity_pct")) is not None]
healthcare_rows = [row for row in read_sheet("HEALTHCARE_INSURANCE") if normalize_text(row.get("destination_key")) == destination_key]
transport_rows = [row for row in read_sheet("TRANSPORT_AIRPORTS") if normalize_text(row.get("destination_key")) == destination_key]

knowledge_profile = {
    "population": normalize_text(selected_destination.get("population") or ""),
    "metroPopulation": normalize_text(selected_destination.get("metro_population") or ""),
    "elevation": f"{int(parse_numeric(selected_destination.get('elevation_m')))} m" if parse_numeric(selected_destination.get('elevation_m')) is not None else "",
    "timeZone": normalize_text(selected_destination.get("time_zone") or ""),
    "climateClassification": infer_climate_classification(climate_text),
    "rainfall": f"{round(sum(rainfall_values) / len(rainfall_values))} mm/month" if rainfall_values else "",
    "sunshineHours": f"{round(sum(sunshine_values) / len(sunshine_values))} hrs/month" if sunshine_values else "",
    "humidity": f"{round(sum(humidity_values) / len(humidity_values))}%" if humidity_values else "",
    "majorAirports": [normalize_text(row.get("name")) for row in transport_rows if normalize_text(row.get("topic")) == "airport" and normalize_text(row.get("name"))],
    "majorHospitals": extract_hospital_names([row.get("system_summary") for row in healthcare_rows] + [row.get("source_name") for row in healthcare_rows]),
}

payload = {
    "destinations": destination_rows,
    "neighborhoods": neighborhood_rows,
    "places": place_rows,
    "resources": resource_rows,
    "media": media_rows,
    "cost_records": cost_rows,
    "healthcare_records": healthcare_rows,
    "transport_records": transport_rows,
    "housing_records": housing_rows,
    "reality_checks": reality_rows,
    "sources": sources,
    "premium_editorial": premium_editorial,
    "knowledge_profile": knowledge_profile,
}

print(json.dumps(payload, ensure_ascii=False))
`;

  try {
    const { execFileSync } = await import("node:child_process");
    const output = execFileSync(pythonExecutable, ["-c", script, workbookPath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const parsed = normalizeWorkbookPayload(JSON.parse(output) as Record<string, unknown>);
    const selectedDestination = selectWorkbookDestination(parsed, slug);
    if (!selectedDestination) {
      if (shouldUseWorkbookRuntimeCache()) {
        workbookCache.set(cacheKey, null);
      }
      return null;
    }

    const destinationKey = String(selectedDestination.destination_key ?? selectedDestination.slug ?? selectedDestination.destination_name ?? "");
    const destinationSlug = normalizeSlugValue(String(selectedDestination.slug ?? selectedDestination.destination_key ?? selectedDestination.destination_name ?? ""));
    const filteredNeighborhoods = Array.isArray(parsed.neighborhoods)
      ? (parsed.neighborhoods as Array<Record<string, unknown>>).filter((item) => matchesWorkbookRowToDestination(item, destinationKey, destinationSlug))
      : [];
    const filteredPlaces = Array.isArray(parsed.places)
      ? (parsed.places as Array<Record<string, unknown>>).filter((item) => matchesWorkbookRowToDestination(item, destinationKey, destinationSlug))
      : [];
    const filteredResources = Array.isArray(parsed.resources)
      ? (parsed.resources as Array<Record<string, unknown>>).filter((item) => matchesWorkbookRowToDestination(item, destinationKey, destinationSlug))
      : [];
    const filteredMedia = Array.isArray(parsed.media)
      ? (parsed.media as Array<Record<string, unknown>>).filter((item) => matchesWorkbookRowToDestination(item, destinationKey, destinationSlug))
      : [];
    const filteredCosts = Array.isArray(parsed.cost_records)
      ? (parsed.cost_records as Array<Record<string, unknown>>).filter((item) => matchesWorkbookRowToDestination(item, destinationKey, destinationSlug))
      : [];

    const subtitleCity = String(selectedDestination.city ?? selectedDestination.destination_name ?? "");
    const subtitleCountry = String(selectedDestination.country ?? "");
    const subtitle = subtitleCountry ? `${subtitleCity}, ${subtitleCountry}` : subtitleCity;

    const normalizedDestination: PremiumWorkbookNormalizedDestinationData = {
      destinationKey,
      slug: destinationSlug || normalizedSlug,
      city: subtitleCity,
      country: subtitleCountry,
      title: String(selectedDestination.destination_name ?? selectedDestination.city ?? ""),
      subtitle,
      heroNarrative: String(selectedDestination.hero_narrative ?? selectedDestination.short_description ?? ""),
      overview: String(selectedDestination.overview ?? selectedDestination.long_description ?? selectedDestination.short_description ?? ""),
      editorial: String(selectedDestination.editorial ?? selectedDestination.long_description ?? selectedDestination.short_description ?? ""),
      whyThisPlaceFeelsDistinct: String(selectedDestination.why_this_place_feels_distinct ?? selectedDestination.overview ?? ""),
      dailyLife: String(selectedDestination.daily_life ?? ""),
      climate: String(selectedDestination.climate ?? ""),
      transportation: String(selectedDestination.transportation ?? ""),
      healthcare: String(selectedDestination.healthcare ?? ""),
      costOfLiving: String(selectedDestination.cost_of_living ?? ""),
      walkability: String(selectedDestination.walkability ?? ""),
      internet: String(selectedDestination.internet ?? ""),
      safety: String(selectedDestination.safety ?? ""),
      officialTourismUrl: String(selectedDestination.official_tourism_url ?? ""),
      googleMapsUrl: String(selectedDestination.google_maps_url ?? ""),
      googleEarthUrl: String(selectedDestination.google_earth_url ?? ""),
      wikipediaUrl: String(selectedDestination.wikipedia_url ?? ""),
      neighborhoods: filteredNeighborhoods.map((item) => ({
        name: String(item.name ?? ""),
        summary: String(item.summary ?? ""),
        housingCharacter: String(item.housing_character ?? ""),
        walkabilityRating: String(item.walkability_rating ?? ""),
        safetyRating: String(item.safety_rating ?? ""),
        transitRating: String(item.transit_rating ?? ""),
        googleMapsUrl: String(item.google_maps_url ?? ""),
        sourceUrl: String(item.source_url ?? ""),
        verified: Boolean(item.verified),
      })).filter((item) => item.name),
      places: filteredPlaces.map((item) => ({
        name: String(item.name ?? ""),
        category: String(item.category ?? "Place"),
        neighborhoodName: String(item.neighborhood_name ?? ""),
        description: String(item.description ?? ""),
        address: String(item.address ?? ""),
        websiteUrl: String(item.website_url ?? ""),
        googleMapsUrl: String(item.google_maps_url ?? ""),
        sourceUrl: String(item.source_url ?? ""),
        verified: Boolean(item.verified),
      })).filter((item) => item.name),
      resources: filteredResources.map((item) => ({
        category: String(item.category ?? "resource"),
        label: String(item.label ?? item.resource_name ?? "Resource"),
        url: String(item.url ?? ""),
        provider: String(item.provider ?? "") || null,
        sourceUrl: String(item.source_url ?? ""),
        verified: Boolean(item.verified),
      })).filter((item) => item.label || item.url),
      media: filteredMedia.map((item) => ({
        kind: String(item.kind ?? "image"),
        url: String(item.url ?? ""),
        altText: String(item.alt_text ?? item.caption ?? ""),
        caption: String(item.caption ?? ""),
        isPrimary: Boolean(item.is_primary),
      })).filter((item) => item.url),
      costRecords: filteredCosts.map((item) => ({
        category: String(item.category ?? "Living cost"),
        monthlyLow: typeof item.monthly_low === "number" ? item.monthly_low : null,
        monthlyHigh: typeof item.monthly_high === "number" ? item.monthly_high : null,
        currency: String(item.currency ?? "USD"),
        description: String(item.description ?? ""),
        householdType: String(item.household_type ?? ""),
        lifestyleTier: String(item.lifestyle_tier ?? ""),
      })).filter((item) => item.category),
      healthcareRecords: Array.isArray(parsed.healthcare_records) ? (parsed.healthcare_records as Array<Record<string, unknown>>) : [],
      transportRecords: Array.isArray(parsed.transport_records) ? (parsed.transport_records as Array<Record<string, unknown>>) : [],
      housingRecords: Array.isArray(parsed.housing_records) ? (parsed.housing_records as Array<Record<string, unknown>>) : [],
      realityChecks: Array.isArray(parsed.reality_checks) ? (parsed.reality_checks as Array<Record<string, unknown>>) : [],
      sources: Array.isArray(parsed.sources) ? (parsed.sources as Array<Record<string, unknown>>) : [],
      premiumEditorialContent: parsed.premium_editorial && typeof parsed.premium_editorial === "object"
        ? parsed.premium_editorial as PremiumWorkbookNormalizedDestinationData["premiumEditorialContent"]
        : undefined,
      knowledgeProfile: parsed.knowledge_profile && typeof parsed.knowledge_profile === "object"
        ? parsed.knowledge_profile as CanonicalDestinationKnowledgeProfile
        : undefined,
      counts: {
        neighborhoods: filteredNeighborhoods.length,
        places: filteredPlaces.length,
        resources: filteredResources.length,
        media: filteredMedia.length,
        costRecords: filteredCosts.length,
      },
      source: "runtime-loader",
    };

    if (shouldUseWorkbookRuntimeCache()) {
      workbookCache.set(cacheKey, normalizedDestination);
    }
    return normalizedDestination;
  } catch {
    if (shouldUseWorkbookRuntimeCache()) {
      workbookCache.set(cacheKey, null);
    }
    return null;
  }
}
