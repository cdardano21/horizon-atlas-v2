import { getDestinationContent } from "./destination-content";
import { getDestinationIntelligence } from "./destination-intelligence";
import type { DestinationIntelligence } from "./destination-intelligence";
import { generatedDestinationCardFacts } from "./generated-destination-card-facts";
import { generatedCommandCenterSeeds } from "./generated-command-center-seeds";
import { isFlagshipDestination } from "./flagship-destinations";
import { LOCAL_COMMAND_CENTER_SEEDS, type LocalCommandCenterSeed } from "./local-command-center-seeds";
import { REGIONAL_COMMAND_CENTER_SEEDS } from "./regional-command-center-seeds";
import type { Destination } from "./destinations";
import { sanitizeExternalSourceUrl } from "./source-links";
import { isSupabaseConfigured, supabaseFetch } from "./supabase";

export type VerificationStatus = "verified" | "estimated" | "stale" | "in_progress";

export type VerificationMeta = {
  sourceUrl?: string | null;
  sourceOrganization?: string | null;
  sourceType?: string | null;
  confidenceLevel?: "high" | "medium" | "low" | null;
  verificationStatus?: VerificationStatus | null;
  lastVerifiedAt?: string | null;
  effectiveAt?: string | null;
  notes?: string | null;
};

export type CommandMetric = {
  key: string;
  label: string;
  value: string | null;
  unit?: string | null;
  displayValue?: string | null;
  group?: string | null;
  verification: VerificationMeta;
};

export type ScorecardEntry = {
  category: string;
  score: number | null;
  explanation: string | null;
  underlyingMeasurements: string | null;
  personalizedWeight: number | null;
  verification: VerificationMeta;
};

export type MonthlyClimateRow = {
  month: string;
  avgHighC: number | null;
  avgLowC: number | null;
  rainfallMm: number | null;
  rainyDays: number | null;
  humidityPct: number | null;
  sunshineHours: number | null;
  uvIndex: number | null;
  seaTempC: number | null;
  snowfallCm: number | null;
  windKph: number | null;
  verification: VerificationMeta;
};

export type NamedRecord = {
  id: string;
  name: string;
  subtitle?: string | null;
  value1?: string | null;
  value2?: string | null;
  value3?: string | null;
  url?: string | null;
  mapQuery?: string | null;
  mapZoom?: number | null;
  verification: VerificationMeta;
};

export type ResourceRecord = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  sourceType: string | null;
  verifiedAt: string | null;
};

export type CommandCenterData = {
  source: "local" | "supabase";
  destination: Destination;
  region: string | null;
  lastVerifiedAt: string | null;
  dataConfidence: "high" | "medium" | "low";
  intelligence: DestinationIntelligence;
  quickMetrics: CommandMetric[];
  scorecard: ScorecardEntry[];
  monthlyClimate: MonthlyClimateRow[];
  costOfLiving: CommandMetric[];
  housingMetrics: CommandMetric[];
  neighborhoods: NamedRecord[];
  healthcareFacilities: NamedRecord[];
  airports: NamedRecord[];
  golfCourses: NamedRecord[];
  recreationFacilities: NamedRecord[];
  beaches: NamedRecord[];
  foodSpots: NamedRecord[];
  schools: NamedRecord[];
  internetMetrics: CommandMetric[];
  visaPrograms: NamedRecord[];
  taxRules: NamedRecord[];
  safetyMetrics: CommandMetric[];
  foodMetrics: CommandMetric[];
  practicalInfo: NamedRecord[];
  pros: string[];
  tradeoffs: string[];
  resources: ResourceRecord[];
};

type DestinationCatalogRow = {
  id: string;
  region: string | null;
  updated_at: string | null;
  metadata: {
    dataConfidence?: "high" | "medium" | "low";
  } | null;
};

const missingVerification: VerificationMeta = {
  verificationStatus: "in_progress",
  confidenceLevel: "low",
  notes: "Record publication cycle active",
};

const verificationFromRow = (row: Record<string, unknown>): VerificationMeta => ({
  sourceUrl: typeof row.source_url === "string" ? row.source_url : null,
  sourceOrganization: typeof row.source_organization === "string" ? row.source_organization : null,
  sourceType: typeof row.source_type === "string" ? row.source_type : null,
  confidenceLevel:
    row.confidence_level === "high" || row.confidence_level === "medium" || row.confidence_level === "low"
      ? row.confidence_level
      : null,
  verificationStatus:
    row.verification_status === "verified" ||
    row.verification_status === "estimated" ||
    row.verification_status === "stale" ||
    row.verification_status === "in_progress"
      ? row.verification_status
      : null,
  lastVerifiedAt: typeof row.last_verified_at === "string" ? row.last_verified_at : null,
  effectiveAt: typeof row.effective_at === "string" ? row.effective_at : null,
  notes: typeof row.notes === "string" ? row.notes : null,
});

const safeFetchJson = async <T>(path: string): Promise<T[]> => {
  try {
    const response = await supabaseFetch(path, { cache: "no-store" });
    if (!response.ok) return [];
    return (await response.json()) as T[];
  } catch {
    return [];
  }
};

const toMetric = (row: Record<string, unknown>): CommandMetric => {
  const valueRaw = row.value_numeric;
  const value = typeof valueRaw === "number" ? String(valueRaw) : typeof row.value_text === "string" ? row.value_text : null;

  return {
    key: typeof row.metric_key === "string" ? row.metric_key : "unknown",
    label: typeof row.metric_label === "string" ? row.metric_label : "Unknown metric",
    value,
    unit: typeof row.unit === "string" ? row.unit : null,
    displayValue: typeof row.display_value === "string" ? row.display_value : null,
    group: typeof row.metric_group === "string" ? row.metric_group : null,
    verification: verificationFromRow(row),
  };
};

const toNamedRecord = (row: Record<string, unknown>): NamedRecord => ({
  id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
  name: typeof row.name === "string" ? row.name : "Unnamed record",
  subtitle: typeof row.subtitle === "string" ? row.subtitle : null,
  value1: typeof row.value_1 === "string" ? row.value_1 : null,
  value2: typeof row.value_2 === "string" ? row.value_2 : null,
  value3: typeof row.value_3 === "string" ? row.value_3 : null,
  url: sanitizeExternalSourceUrl(typeof row.url === "string" ? row.url : null),
  mapQuery: typeof row.map_query === "string" ? row.map_query : null,
  mapZoom: typeof row.map_zoom === "number" ? row.map_zoom : null,
  verification: verificationFromRow(row),
});

const toResourceRecord = (row: Record<string, unknown>): ResourceRecord | null => {
  const sanitizedUrl = sanitizeExternalSourceUrl(typeof row.url === "string" ? row.url : null);
  if (!sanitizedUrl) return null;

  return {
    id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
    title: typeof row.title === "string" ? row.title : "Untitled resource",
    description: typeof row.description === "string" ? row.description : null,
    url: sanitizedUrl,
    category: typeof row.category === "string" ? row.category : "general",
    sourceType: typeof row.source_type === "string" ? row.source_type : null,
    verifiedAt: typeof row.last_verified_at === "string" ? row.last_verified_at : null,
  };
};

const FOOD_RESOURCE_CATEGORIES = new Set([
  "food",
  "restaurants",
  "restaurant",
  "coffee",
  "coffee_shops",
  "nightlife",
]);

const PRACTICAL_RESOURCE_CATEGORIES = new Set([
  "practical",
  "emergency",
  "local_government",
  "tourism",
  "maps",
  "youtube",
  "rental",
  "real_estate",
  "visa",
  "residency",
  "tax",
]);

const normalizedCategory = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_") : "";

const isFoodResourceCategory = (value: unknown): boolean => {
  const category = normalizedCategory(value);
  return category.length > 0 && Array.from(FOOD_RESOURCE_CATEGORIES).some((entry) => category.includes(entry));
};

const isPracticalResourceCategory = (value: unknown): boolean => {
  const category = normalizedCategory(value);
  return category.length > 0 && Array.from(PRACTICAL_RESOURCE_CATEGORIES).some((entry) => category.includes(entry));
};

const toNamedResourceRecord = (row: Record<string, unknown>, fallbackPrefix: string): NamedRecord => {
  const title = typeof row.title === "string" ? row.title : "Untitled resource";
  return {
    id: typeof row.id === "string" ? row.id : `${fallbackPrefix}-${toMetricKey(title)}`,
    name: title,
    subtitle: typeof row.description === "string" ? row.description : null,
    value1: typeof row.source_type === "string" ? row.source_type : null,
    url: sanitizeExternalSourceUrl(typeof row.url === "string" ? row.url : null),
    verification: verificationFromRow(row),
  };
};

const toMetricKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const fallbackVerification: VerificationMeta = {
  verificationStatus: "estimated",
  confidenceLevel: "medium",
  notes: "Generated from baseline destination intelligence while command-center records are being prepared.",
};

const factCategory = (label: string): string => {
  const normalized = label.toLowerCase();
  if (normalized.includes("airport")) return "airport";
  if (normalized.includes("health")) return "healthcare";
  if (normalized.includes("resid") || normalized.includes("visa")) return "visa";
  if (normalized.includes("tax")) return "tax";
  return "official";
};

const factResourcesForDestination = (destination: Destination, verifiedAt: string | null): ResourceRecord[] => {
  const facts = generatedDestinationCardFacts[destination.slug]?.facts ?? [];

  return facts
    .filter((fact) => Boolean(fact.sourceUrl))
    .map((fact, index) => ({
      id: `${destination.slug}-fact-resource-${index + 1}`,
      title: fact.label,
      description: fact.value,
      url: sanitizeExternalSourceUrl(fact.sourceUrl) ?? "",
      category: factCategory(fact.label),
      sourceType: "official_link",
      verifiedAt,
    }))
    .filter((resource) => resource.url.length > 0);
};

const buildFallbackCommandCenterData = (
  destination: Destination,
  source: "local" | "supabase",
  region: string | null,
  lastVerifiedAt: string | null,
  dataConfidence: "high" | "medium" | "low",
): CommandCenterData => {
  const intelligence = getDestinationIntelligence(destination);
  const weatherRows = destination.memberDetails?.monthlyWeather ?? [];

  const quickMetrics: CommandMetric[] = [];
  const scorecard: ScorecardEntry[] = [];

  const monthlyClimateFromDetails: MonthlyClimateRow[] = weatherRows.map((row) => ({
    month: row.month,
    avgHighC: typeof row.avgHighC === "number" ? row.avgHighC : null,
    avgLowC: typeof row.avgLowC === "number" ? row.avgLowC : null,
    rainfallMm: typeof row.rainfallMm === "number" ? row.rainfallMm : null,
    rainyDays: null,
    humidityPct: null,
    sunshineHours: typeof row.sunshineHours === "number" ? row.sunshineHours : null,
    uvIndex: null,
    seaTempC: typeof row.avgSeaC === "number" ? row.avgSeaC : null,
    snowfallCm: null,
    windKph: null,
    verification: fallbackVerification,
  }));

  const monthlyClimate: MonthlyClimateRow[] = monthlyClimateFromDetails;

  const costOfLiving: CommandMetric[] = [];
  const housingMetrics: CommandMetric[] = [];
  const safetyMetrics: CommandMetric[] = [];
  const internetMetrics: CommandMetric[] = [];

  const healthcareFacilities: NamedRecord[] =
    destination.memberDetails?.hospitals?.map((hospital, index) => ({
      id: `${destination.slug}-hospital-${index + 1}`,
      name: hospital.name,
      subtitle: hospital.note ?? null,
      value1: hospital.distance ?? null,
      mapQuery: hospital.name,
      mapZoom: 13,
      verification: fallbackVerification,
    })) ?? [];

  

  const airports: NamedRecord[] =
    destination.memberDetails?.airports?.map((airport, index) => ({
      id: `${destination.slug}-airport-${index + 1}`,
      name: airport.name,
      subtitle: airport.note ?? null,
      value1: airport.distance ?? null,
      mapQuery: airport.name,
      mapZoom: 11,
      verification: fallbackVerification,
    })) ?? [];

  const neighborhoods: NamedRecord[] = [];
  const beaches: NamedRecord[] = [];
  const recreationFacilities: NamedRecord[] = [];
  const golfCourses: NamedRecord[] = [];
  const foodSpots: NamedRecord[] = [];
  const schools: NamedRecord[] = [];
  const visaPrograms: NamedRecord[] = [];
  const taxRules: NamedRecord[] = [];
  const practicalInfo: NamedRecord[] = [];

  const factResources = factResourcesForDestination(destination, lastVerifiedAt);
  const resources: ResourceRecord[] = factResources;

  return {
    source,
    destination,
    region,
    lastVerifiedAt,
    dataConfidence,
    intelligence,
    quickMetrics,
    scorecard,
    monthlyClimate,
    costOfLiving,
    housingMetrics,
    neighborhoods,
    healthcareFacilities,
    airports,
    golfCourses,
    recreationFacilities,
    beaches,
    foodSpots,
    schools,
    internetMetrics,
    visaPrograms,
    taxRules,
    safetyMetrics,
    foodMetrics: [],
    practicalInfo,
    pros: [],
    tradeoffs: [],
    resources,
  };
};

const mergeUnique = <T>(seedItems: T[] | undefined, baseItems: T[], getKey: (item: T) => string): T[] => {
  if (!seedItems || seedItems.length === 0) return baseItems;
  const seen = new Set<string>();
  const merged: T[] = [];
  for (const item of [...seedItems, ...baseItems]) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
};

const hasPublishedVerification = (verification?: VerificationMeta | null): boolean => {
  const status = verification?.verificationStatus;
  if (status !== "verified" && status !== "estimated" && status !== "stale") {
    return false;
  }

  const hasSourceUrl = Boolean(sanitizeExternalSourceUrl(verification?.sourceUrl ?? null));
  const hasSourceOrg = typeof verification?.sourceOrganization === "string" && verification.sourceOrganization.trim().length > 0;
  return hasSourceUrl || hasSourceOrg;
};

const filterPublishedMetrics = (items?: CommandMetric[]): CommandMetric[] =>
  (items ?? []).filter((item) => hasPublishedVerification(item.verification));

const filterPublishedScorecard = (items?: ScorecardEntry[]): ScorecardEntry[] =>
  (items ?? []).filter((item) => hasPublishedVerification(item.verification));

const filterPublishedClimate = (items?: MonthlyClimateRow[]): MonthlyClimateRow[] =>
  (items ?? []).filter((item) => hasPublishedVerification(item.verification));

const filterPublishedNamedRecords = (items?: NamedRecord[]): NamedRecord[] =>
  (items ?? []).filter((item) => {
    if (!hasPublishedVerification(item.verification)) return false;
    if (item.url && !sanitizeExternalSourceUrl(item.url)) return false;
    return true;
  });

const filterPublishedResources = (items?: ResourceRecord[]): ResourceRecord[] =>
  (items ?? [])
    .map((item) => {
      const sanitizedUrl = sanitizeExternalSourceUrl(item.url);
      if (!sanitizedUrl) return null;
      return {
        ...item,
        url: sanitizedUrl,
      };
    })
    .filter((item): item is ResourceRecord => item !== null);

const mergeWithSeedAuthority = <T>(
  seedItems: T[] | undefined,
  baseItems: T[],
  getKey: (item: T) => string,
  authoritativeMissing: boolean,
): T[] => {
  if (Array.isArray(seedItems)) {
    return mergeUnique(seedItems, baseItems, getKey);
  }
  return authoritativeMissing ? [] : baseItems;
};

const applyLocalSeedOverride = (
  base: CommandCenterData,
  seed?: LocalCommandCenterSeed,
  options?: { authoritativeMissing?: boolean },
): CommandCenterData => {
  if (!seed) return base;

  const authoritativeMissing = options?.authoritativeMissing ?? false;
  const seedQuickMetrics = filterPublishedMetrics(seed.quickMetrics);
  const seedScorecard = filterPublishedScorecard(seed.scorecard);

  const baseQuickMetrics = filterPublishedMetrics(base.quickMetrics);
  const baseScorecard = filterPublishedScorecard(base.scorecard);

  const quickMetrics = seed.quickMetrics
    ? seedQuickMetrics
    : authoritativeMissing
      ? []
      : baseQuickMetrics;

  const scorecard = seed.scorecard
    ? seedScorecard
    : authoritativeMissing
      ? []
      : baseScorecard;

  return {
    ...base,
    region: seed.region ?? base.region,
    lastVerifiedAt: seed.lastVerifiedAt ?? base.lastVerifiedAt,
    dataConfidence: seed.dataConfidence ?? base.dataConfidence,
    quickMetrics,
    scorecard,
    monthlyClimate: mergeWithSeedAuthority(
      filterPublishedClimate(seed.monthlyClimate),
      filterPublishedClimate(base.monthlyClimate),
      (item) => item.month.toLowerCase(),
      authoritativeMissing,
    ),
    costOfLiving: mergeWithSeedAuthority(
      filterPublishedMetrics(seed.costOfLiving),
      filterPublishedMetrics(base.costOfLiving),
      (item) => item.key,
      authoritativeMissing,
    ),
    housingMetrics: mergeWithSeedAuthority(
      filterPublishedMetrics(seed.housingMetrics),
      filterPublishedMetrics(base.housingMetrics),
      (item) => item.key,
      authoritativeMissing,
    ),
    neighborhoods: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.neighborhoods),
      filterPublishedNamedRecords(base.neighborhoods),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    healthcareFacilities: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.healthcareFacilities),
      filterPublishedNamedRecords(base.healthcareFacilities),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    airports: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.airports),
      filterPublishedNamedRecords(base.airports),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    golfCourses: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.golfCourses),
      filterPublishedNamedRecords(base.golfCourses),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    recreationFacilities: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.recreationFacilities),
      filterPublishedNamedRecords(base.recreationFacilities),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    beaches: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.beaches),
      filterPublishedNamedRecords(base.beaches),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    foodSpots: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.foodSpots),
      filterPublishedNamedRecords(base.foodSpots),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    schools: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.schools),
      filterPublishedNamedRecords(base.schools),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    internetMetrics: mergeWithSeedAuthority(
      filterPublishedMetrics(seed.internetMetrics),
      filterPublishedMetrics(base.internetMetrics),
      (item) => item.key,
      authoritativeMissing,
    ),
    visaPrograms: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.visaPrograms),
      filterPublishedNamedRecords(base.visaPrograms),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    taxRules: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.taxRules),
      filterPublishedNamedRecords(base.taxRules),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    safetyMetrics: mergeWithSeedAuthority(
      filterPublishedMetrics(seed.safetyMetrics),
      filterPublishedMetrics(base.safetyMetrics),
      (item) => item.key,
      authoritativeMissing,
    ),
    foodMetrics: mergeWithSeedAuthority(
      filterPublishedMetrics(seed.foodMetrics),
      filterPublishedMetrics(base.foodMetrics),
      (item) => item.key,
      authoritativeMissing,
    ),
    practicalInfo: mergeWithSeedAuthority(
      filterPublishedNamedRecords(seed.practicalInfo),
      filterPublishedNamedRecords(base.practicalInfo),
      (item) => item.id || item.name.toLowerCase(),
      authoritativeMissing,
    ),
    pros: mergeUnique(seed.pros, base.pros, (item) => item.toLowerCase()),
    tradeoffs: mergeUnique(seed.tradeoffs, base.tradeoffs, (item) => item.toLowerCase()),
    resources: mergeWithSeedAuthority(
      filterPublishedResources(seed.resources),
      filterPublishedResources(base.resources),
      (item) => item.id || `${item.category}-${item.title}`.toLowerCase(),
      authoritativeMissing,
    ),
  };
};

export async function getDestinationCommandCenter(slug: string): Promise<CommandCenterData | null> {
  const content = await getDestinationContent(slug);
  if (!content?.destination) return null;
  const generatedSeed = generatedCommandCenterSeeds[slug];
  const regionalSeed = REGIONAL_COMMAND_CENTER_SEEDS[slug];
  const localSeed = isFlagshipDestination(slug) ? LOCAL_COMMAND_CENTER_SEEDS[slug] : undefined;

  const fallbackGenerated = applyLocalSeedOverride(
    applyLocalSeedOverride(
      applyLocalSeedOverride(
        buildFallbackCommandCenterData(
          content.destination,
          content.source,
          null,
          null,
          "medium",
        ),
        generatedSeed,
        { authoritativeMissing: true },
      ),
      regionalSeed,
    ),
    localSeed,
  );

  if (!isSupabaseConfigured()) {
    return fallbackGenerated;
  }

  const catalogRows = await safeFetchJson<DestinationCatalogRow>(
    `/rest/v1/destinations_catalog?select=id,region,updated_at,metadata&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );

  const catalog = catalogRows[0];
  if (!catalog?.id) return fallbackGenerated;

  const destinationId = catalog.id;

  const [
    coreMetricsRows,
    scoreRows,
    climateRows,
    costRows,
    housingRows,
    neighborhoodRows,
    healthcareRows,
    airportRows,
    golfRows,
    recreationRows,
    beachRows,
    schoolRows,
    internetRows,
    visaRows,
    taxRows,
    safetyRows,
    foodRows,
    prosConsRows,
    resourceRows,
  ] = await Promise.all([
    safeFetchJson<Record<string, unknown>>(`/rest/v1/destination_core_metrics?select=*&destination_id=eq.${destinationId}&order=metric_group.asc,metric_label.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/destination_scores?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,category.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/monthly_climate?select=*&destination_id=eq.${destinationId}&order=month_index.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/cost_of_living_items?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,item_label.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/housing_market_metrics?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,metric_label.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/neighborhoods?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/healthcare_facilities?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/airports?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/golf_courses?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/recreation_facilities?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/beaches?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/schools?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/internet_metrics?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,metric_label.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/visa_programs?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/tax_rules?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,name.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/safety_metrics?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,metric_label.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/restaurants_or_food_metrics?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,metric_label.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/destination_pros_cons?select=*&destination_id=eq.${destinationId}&order=sort_order.asc`),
    safeFetchJson<Record<string, unknown>>(`/rest/v1/destination_resources?select=*&destination_id=eq.${destinationId}&order=sort_order.asc,title.asc`),
  ]);

  const scorecard: ScorecardEntry[] = scoreRows.map((row) => ({
    category: typeof row.category === "string" ? row.category : "Unknown",
    score: typeof row.score === "number" ? row.score : null,
    explanation: typeof row.explanation === "string" ? row.explanation : null,
    underlyingMeasurements: typeof row.underlying_measurements === "string" ? row.underlying_measurements : null,
    personalizedWeight: typeof row.personalized_weight === "number" ? row.personalized_weight : null,
    verification: verificationFromRow(row),
  }));

  const monthlyClimate: MonthlyClimateRow[] = climateRows.map((row) => ({
    month: typeof row.month_name === "string" ? row.month_name : "Unknown",
    avgHighC: typeof row.avg_high_c === "number" ? row.avg_high_c : null,
    avgLowC: typeof row.avg_low_c === "number" ? row.avg_low_c : null,
    rainfallMm: typeof row.rainfall_mm === "number" ? row.rainfall_mm : null,
    rainyDays: typeof row.rainy_days === "number" ? row.rainy_days : null,
    humidityPct: typeof row.humidity_pct === "number" ? row.humidity_pct : null,
    sunshineHours: typeof row.sunshine_hours === "number" ? row.sunshine_hours : null,
    uvIndex: typeof row.uv_index === "number" ? row.uv_index : null,
    seaTempC: typeof row.sea_temp_c === "number" ? row.sea_temp_c : null,
    snowfallCm: typeof row.snowfall_cm === "number" ? row.snowfall_cm : null,
    windKph: typeof row.wind_kph === "number" ? row.wind_kph : null,
    verification: verificationFromRow(row),
  }));

  const pros = prosConsRows
    .filter((row) => row.kind === "pro" && typeof row.statement === "string")
    .map((row) => row.statement as string);
  const tradeoffs = prosConsRows
    .filter((row) => row.kind === "tradeoff" && typeof row.statement === "string")
    .map((row) => row.statement as string);

  const foodSpotsFromResources = resourceRows
    .filter((row) => isFoodResourceCategory(row.category))
    .map((row) => toNamedResourceRecord(row, "food-resource"));

  const practicalInfoFromResources = resourceRows
    .filter((row) => isPracticalResourceCategory(row.category))
    .map((row) => toNamedResourceRecord(row, "practical-resource"));

  const supabaseData: CommandCenterData = {
    source: "supabase",
    destination: content.destination,
    region: catalog.region,
    lastVerifiedAt: catalog.updated_at,
    dataConfidence: catalog.metadata?.dataConfidence ?? "low",
    intelligence: getDestinationIntelligence(content.destination),
    quickMetrics: coreMetricsRows.map((row) => toMetric(row)),
    scorecard,
    monthlyClimate,
    costOfLiving: costRows.map((row) => toMetric(row)),
    housingMetrics: housingRows.map((row) => toMetric(row)),
    neighborhoods: neighborhoodRows.map((row) => toNamedRecord(row)),
    healthcareFacilities: healthcareRows.map((row) => toNamedRecord(row)),
    airports: airportRows.map((row) => toNamedRecord(row)),
    golfCourses: golfRows.map((row) => toNamedRecord(row)),
    recreationFacilities: recreationRows.map((row) => toNamedRecord(row)),
    beaches: beachRows.map((row) => toNamedRecord(row)),
    foodSpots: foodSpotsFromResources,
    schools: schoolRows.map((row) => toNamedRecord(row)),
    internetMetrics: internetRows.map((row) => toMetric(row)),
    visaPrograms: visaRows.map((row) => toNamedRecord(row)),
    taxRules: taxRows.map((row) => toNamedRecord(row)),
    safetyMetrics: safetyRows.map((row) => toMetric(row)),
    foodMetrics: foodRows.map((row) => toMetric(row)),
    practicalInfo: practicalInfoFromResources,
    pros,
    tradeoffs,
    resources: resourceRows
      .map((row) => toResourceRecord(row))
      .filter((row): row is ResourceRecord => row !== null),
  };

  const factualSupabaseData = supabaseData;

  const fallbackForDatasetGaps = applyLocalSeedOverride(
    applyLocalSeedOverride(
      applyLocalSeedOverride(
        buildFallbackCommandCenterData(
          content.destination,
          "supabase",
          catalog.region,
          catalog.updated_at,
          catalog.metadata?.dataConfidence ?? "medium",
        ),
        generatedSeed,
        { authoritativeMissing: true },
      ),
      regionalSeed,
    ),
    localSeed,
  );

  const fallbackIfEmpty = <T>(current: T[], fallback: T[]): T[] => (current.length > 0 ? current : fallback);

  return {
    ...factualSupabaseData,
    quickMetrics: fallbackIfEmpty(factualSupabaseData.quickMetrics, fallbackForDatasetGaps.quickMetrics),
    scorecard: fallbackIfEmpty(factualSupabaseData.scorecard, fallbackForDatasetGaps.scorecard),
    monthlyClimate: fallbackIfEmpty(supabaseData.monthlyClimate, fallbackForDatasetGaps.monthlyClimate),
    costOfLiving: fallbackIfEmpty(factualSupabaseData.costOfLiving, fallbackForDatasetGaps.costOfLiving),
    housingMetrics: fallbackIfEmpty(factualSupabaseData.housingMetrics, fallbackForDatasetGaps.housingMetrics),
    neighborhoods: fallbackIfEmpty(factualSupabaseData.neighborhoods, fallbackForDatasetGaps.neighborhoods),
    healthcareFacilities: fallbackIfEmpty(supabaseData.healthcareFacilities, fallbackForDatasetGaps.healthcareFacilities),
    airports: fallbackIfEmpty(supabaseData.airports, fallbackForDatasetGaps.airports),
    golfCourses: fallbackIfEmpty(factualSupabaseData.golfCourses, fallbackForDatasetGaps.golfCourses),
    recreationFacilities: fallbackIfEmpty(factualSupabaseData.recreationFacilities, fallbackForDatasetGaps.recreationFacilities),
    beaches: fallbackIfEmpty(factualSupabaseData.beaches, fallbackForDatasetGaps.beaches),
    foodSpots: fallbackIfEmpty(factualSupabaseData.foodSpots, fallbackForDatasetGaps.foodSpots),
    schools: fallbackIfEmpty(factualSupabaseData.schools, fallbackForDatasetGaps.schools),
    internetMetrics: fallbackIfEmpty(factualSupabaseData.internetMetrics, fallbackForDatasetGaps.internetMetrics),
    visaPrograms: fallbackIfEmpty(factualSupabaseData.visaPrograms, fallbackForDatasetGaps.visaPrograms),
    taxRules: fallbackIfEmpty(factualSupabaseData.taxRules, fallbackForDatasetGaps.taxRules),
    safetyMetrics: fallbackIfEmpty(factualSupabaseData.safetyMetrics, fallbackForDatasetGaps.safetyMetrics),
    foodMetrics: fallbackIfEmpty(factualSupabaseData.foodMetrics, fallbackForDatasetGaps.foodMetrics),
    practicalInfo: fallbackIfEmpty(factualSupabaseData.practicalInfo, fallbackForDatasetGaps.practicalInfo),
    pros: fallbackIfEmpty(supabaseData.pros, fallbackForDatasetGaps.pros),
    tradeoffs: fallbackIfEmpty(supabaseData.tradeoffs, fallbackForDatasetGaps.tradeoffs),
    resources: fallbackIfEmpty(supabaseData.resources, fallbackForDatasetGaps.resources),
    dataConfidence: factualSupabaseData.quickMetrics.length > 0 || factualSupabaseData.scorecard.length > 0
      ? supabaseData.dataConfidence
      : fallbackForDatasetGaps.dataConfidence,
  };
}

export const defaultMissingVerification = missingVerification;
