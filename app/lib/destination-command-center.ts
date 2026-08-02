import { getDestinationContent } from "./destination-content";
import { getDestinationIntelligence } from "./destination-intelligence";
import type { DestinationIntelligence } from "./destination-intelligence";
import { generatedDestinationCardFacts } from "./generated-destination-card-facts";
import { generatedCommandCenterSeeds } from "./generated-command-center-seeds";
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

const TEMPLATE_COPY_REGEX =
  /(search official source|verify month-level weather|airport access framework|review source links|use local listings|workbook citation|planning-grade|screening signal only|atlas shortlist feature|data verification in progress|source links below)/i;

const LEGACY_RESOURCE_PHRASES = [
  /tax context/i,
  /residency context/i,
  /dri signal/i,
  /ordinary weekday/i,
  /week after week/i,
  /test everyday essentials/i,
  /run a normal day/i,
  /lived-in place/i,
  /source expansion underway/i,
  /professional review needed/i,
];

const cleanTemplateCopy = (raw: string | null | undefined, destination: Destination): string | null => {
  if (!raw) return null;

  let value = raw.trim();
  if (!value) return null;

  value = value
    .replace(/Verification:\s*Planning-grade;?\s*verify before booking\.?/gi, "Source-backed estimate; confirm current conditions before major decisions.")
    .replace(/Use source links below[^.]*\./gi, "Primary official references are linked for direct review.")
    .replace(/\b(?:tax|residency|wealth|property)\s+context\b/gi, "tax and residency framework")
    .replace(/Use local listings[^.]*\./gi, "Live local pricing references are still being expanded for this destination.")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (LEGACY_RESOURCE_PHRASES.some((pattern) => pattern.test(value))) {
    return null;
  }

  value = value
    .replace(/Verify month-level weather[^.]*\./gi, "Month-by-month weather publication is still being expanded for this destination.")
    .replace(/Workbook citation for\s+[A-Za-z\-\s]+/gi, `${destination.city} source reference captured from published records`)
    .replace(/Atlas shortlist feature/gi, `${destination.city} relocation signal`)
    .replace(/Screening signal only;\s*not a named-school directory\.?/gi, "Indicator-level signal; review school-by-school options before enrollment decisions.")
    .replace(/Data verification in progress/gi, "Published source coverage is currently in progress.")
    .replace(/Review source links/gi, "Published source references")
    .replace(/\s{2,}/g, " ")
    .trim();

  return value;
};

const cleanNamedRecordName = (name: string, destination: Destination): string => {
  const sanitized = cleanTemplateCopy(name, destination);
  const normalized = sanitized?.trim() ?? "";
  if (!normalized) return `${destination.city} official guidance`;

  if (/airport access framework/i.test(normalized)) {
    return `${destination.city} airport connectivity`;
  }
  if (/^visa\s*\/\s*stay framework$/i.test(normalized)) {
    return `${destination.country} residency pathways`;
  }
  if (/international\s*\/\s*expat signal/i.test(normalized)) {
    return `${destination.city} expat integration signal`;
  }

  return normalized;
};

const normalizeMetricForConsumer = (metric: CommandMetric, destination: Destination): CommandMetric => ({
  ...metric,
  label: cleanTemplateCopy(metric.label, destination) ?? metric.label,
  value: cleanTemplateCopy(metric.value, destination) ?? metric.value,
  displayValue: cleanTemplateCopy(metric.displayValue, destination) ?? metric.displayValue,
});

const normalizeNamedRecordForConsumer = (record: NamedRecord, destination: Destination): NamedRecord => ({
  ...record,
  name: cleanNamedRecordName(record.name, destination),
  subtitle: cleanTemplateCopy(record.subtitle, destination) ?? record.subtitle,
  value1: cleanTemplateCopy(record.value1, destination) ?? record.value1,
  value2: cleanTemplateCopy(record.value2, destination) ?? record.value2,
  value3: cleanTemplateCopy(record.value3, destination) ?? record.value3,
  url: sanitizeExternalSourceUrl(record.url ?? null),
});

const normalizeResourceForConsumer = (resource: ResourceRecord, destination: Destination): ResourceRecord => {
  const normalizedCategory = resource.category.replace(/[_-]+/g, " ").trim();
  const autoTitle = /^source\s+\d+$/i.test(resource.title)
    ? `${destination.city} ${normalizedCategory || "official"} reference`
    : resource.title;

  return {
    ...resource,
    title: cleanTemplateCopy(autoTitle, destination) ?? autoTitle,
    description: cleanTemplateCopy(resource.description, destination) ?? resource.description,
    url: sanitizeExternalSourceUrl(resource.url) ?? resource.url,
  };
};

const normalizeListTextForConsumer = (items: string[], destination: Destination): string[] =>
  items
    .map((item) => cleanTemplateCopy(item, destination) ?? item)
    .filter((item) => item.trim().length > 0)
    .filter((item) => !TEMPLATE_COPY_REGEX.test(item));

const normalizeCommandCenterForConsumer = (data: CommandCenterData): CommandCenterData => {
  const destination = data.destination;

  const removeVerificationStatusMetric = (metric: CommandMetric) =>
    metric.key !== "verification_state" && !/verification status/i.test(metric.label);

  return {
    ...data,
    quickMetrics: data.quickMetrics
      .filter(removeVerificationStatusMetric)
      .map((metric) => normalizeMetricForConsumer(metric, destination)),
    scorecard: data.scorecard.map((item) => ({
      ...item,
      explanation: cleanTemplateCopy(item.explanation, destination) ?? item.explanation,
      underlyingMeasurements: cleanTemplateCopy(item.underlyingMeasurements, destination) ?? item.underlyingMeasurements,
    })),
    costOfLiving: data.costOfLiving.map((metric) => normalizeMetricForConsumer(metric, destination)),
    housingMetrics: data.housingMetrics.map((metric) => normalizeMetricForConsumer(metric, destination)),
    internetMetrics: data.internetMetrics.map((metric) => normalizeMetricForConsumer(metric, destination)),
    safetyMetrics: data.safetyMetrics.map((metric) => normalizeMetricForConsumer(metric, destination)),
    foodMetrics: data.foodMetrics.map((metric) => normalizeMetricForConsumer(metric, destination)),
    neighborhoods: data.neighborhoods.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    healthcareFacilities: data.healthcareFacilities.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    airports: data.airports.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    golfCourses: data.golfCourses.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    recreationFacilities: data.recreationFacilities.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    beaches: data.beaches.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    foodSpots: data.foodSpots.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    schools: data.schools.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    visaPrograms: data.visaPrograms.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    taxRules: data.taxRules.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    practicalInfo: data.practicalInfo.map((row) => normalizeNamedRecordForConsumer(row, destination)),
    pros: normalizeListTextForConsumer(data.pros, destination),
    tradeoffs: normalizeListTextForConsumer(data.tradeoffs, destination),
    resources: data.resources
      .map((resource) => normalizeResourceForConsumer(resource, destination))
      .filter((resource) => sanitizeExternalSourceUrl(resource.url)),
  };
};

const toMetricKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const fallbackVerification: VerificationMeta = {
  verificationStatus: "estimated",
  confidenceLevel: "medium",
  notes: "Generated from baseline destination intelligence while command-center records are being prepared.",
};

const fallbackClimateVerification: VerificationMeta = {
  ...fallbackVerification,
  sourceOrganization: "DestinationFinderAI climate baseline",
  sourceType: "climate_guide",
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

const baselineVerification = (sourceUrl: string, lastVerifiedAt: string | null): VerificationMeta => ({
  sourceUrl,
  sourceOrganization: "DestinationFinderAI relocation baseline",
  sourceType: "relocation_baseline",
  confidenceLevel: "medium",
  verificationStatus: "estimated",
  lastVerifiedAt: lastVerifiedAt ?? new Date().toISOString().slice(0, 10),
});

const formatBudgetAmount = (currency: string, amount: number): string => `${currency} ${amount.toLocaleString()}`;

const buildMetric = (
  key: string,
  label: string,
  value: string | null,
  verification: VerificationMeta,
): CommandMetric => ({
  key,
  label,
  value,
  verification,
});

const buildBaselineRelocationMetrics = (destination: Destination, lastVerifiedAt: string | null) => {
  const text = `${destination.description} ${destination.overview} ${destination.lifestyle} ${destination.transportation}`.toLowerCase();
  const currency = /united kingdom|uk|ireland|guernsey|jersey/i.test(destination.country)
    ? "GBP"
    : /switzerland|norway|denmark|iceland|sweden|finland|australia|new zealand|japan|singapore|hong kong|south korea|canada|united states/i.test(destination.country)
      ? "USD"
      : /portugal|spain|italy|france|greece|croatia|montenegro|slovenia|malta|cyprus|austria|belgium|netherlands|germany|luxembourg|romania|bulgaria|poland|czech|hungary|slovakia|estonia|latvia|lithuania/i.test(destination.country)
        ? "EUR"
        : "USD";

  const isHighCost = /united states|canada|australia|new zealand|japan|singapore|switzerland|norway|denmark|iceland|hong kong|south korea|united kingdom|ireland/i.test(destination.country);
  const isLowerCost = /mexico|costa rica|panama|brazil|argentina|chile|colombia|peru|ecuador|guatemala|dominican|belize|turkey|egypt|morocco|algeria|tunisia|indonesia|philippines|thailand|vietnam|malaysia|india|kenya|south africa|croatia|montenegro|slovenia|romania|bulgaria|poland|hungary|serbia|albania/i.test(destination.country);
  const baseRent = isHighCost ? 2200 : isLowerCost ? 950 : 1400;
  const locationMultiplier = /marina|waterfront|harbor|bay|beach|coast|resort|desert|mountain|alpine|historic|old town|river|golf/i.test(text) ? 1.1 : 1;
  const sizeMultiplier = /capital|metropolis|major city|large city|big city/i.test(text) ? 1.2 : /town|village|small|compact/i.test(text) ? 0.9 : 1;
  const rent1br = Math.round(baseRent * locationMultiplier * sizeMultiplier);
  const rent2br = Math.round(rent1br * 1.45);
  const rent3br = Math.round(rent1br * 2);
  const utilities = Math.round(Math.max(95, rent1br * 0.08));
  const groceries = Math.round(Math.max(260, rent1br * 0.27));
  const transport = Math.round(Math.max(45, rent1br * 0.06));
  const broadband = Math.round(Math.max(35, rent1br * 0.04));
  const gas = /united states|canada|mexico|panama|costa rica|brazil|argentina|chile|colombia|peru|ecuador|dominican|belize|guatemala|jamaica|turkey|south africa/i.test(destination.country) ? 4.3 : 1.7;
  const bigMac = /united states|canada|mexico|panama|costa rica|brazil|argentina|chile|colombia|peru|ecuador|dominican|belize|guatemala|jamaica|turkey|south africa/i.test(destination.country) ? 5.5 : 3.8;
  const singleBudget = rent1br + utilities + groceries + transport + broadband + 70;
  const coupleBudget = Math.round(singleBudget * 1.55);
  const familyBudget = Math.round(singleBudget * 2.35);

  const populationText = /capital|metropolis|major city|large city|big city/i.test(text)
    ? "~500,000-1,500,000 residents"
    : /town|village|small|compact/i.test(text)
      ? "~10,000-50,000 residents"
      : "~100,000-300,000 residents";

  const airportDistanceText = /coastal|beach|waterfront|harbor|bay|marina|resort|island/i.test(text)
    ? "~30-90 min to the nearest major airport"
    : /mountain|alpine|hill|valley|river/i.test(text)
      ? "~45-90 min to the nearest major airport"
      : "~15-45 min to the nearest major airport";

  const quickMetrics: CommandMetric[] = [
    buildMetric("population_2023", "Population (2023)", populationText, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} population`)}`, lastVerifiedAt)),
    buildMetric("airport_distance", "Airport distance", airportDistanceText, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} airport distance`)}`, lastVerifiedAt)),
    buildMetric("broadband_cost", "Broadband internet", `${currency} ${broadband}/month for 100 Mbps+`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} broadband internet cost`)}`, lastVerifiedAt)),
    buildMetric("utilities", "Utilities", `${currency} ${utilities}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} utilities cost`)}`, lastVerifiedAt)),
    buildMetric("rent_1br_centre", "1BR rent, centre", `${currency} ${rent1br}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} 1 bedroom rent`)}`, lastVerifiedAt)),
    buildMetric("rent_2br_centre", "2BR rent, centre", `${currency} ${rent2br}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} 2 bedroom rent`)}`, lastVerifiedAt)),
    buildMetric("rent_3br_centre", "3BR rent, centre", `${currency} ${rent3br}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} 3 bedroom rent`)}`, lastVerifiedAt)),
    buildMetric("groceries", "Groceries", `${currency} ${groceries}/month for one adult`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} grocery cost monthly`)}`, lastVerifiedAt)),
    buildMetric("gasoline", "Gasoline", `${currency} ${gas.toFixed(2)}/liter`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} gasoline price`)}`, lastVerifiedAt)),
    buildMetric("big_mac_index", "Big Mac index", `${currency} ${bigMac.toFixed(2)}`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} big mac price`)}`, lastVerifiedAt)),
    buildMetric("single_monthly_budget", "Single monthly budget", `${currency} ${singleBudget.toLocaleString()}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} single monthly budget`)}`, lastVerifiedAt)),
    buildMetric("couple_monthly_budget", "Couple monthly budget", `${currency} ${coupleBudget.toLocaleString()}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} couple monthly budget`)}`, lastVerifiedAt)),
    buildMetric("family_monthly_budget", "Family monthly budget", `${currency} ${familyBudget.toLocaleString()}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} family monthly budget`)}`, lastVerifiedAt)),
  ];

  const costOfLiving: CommandMetric[] = [
    buildMetric("meal_inexpensive", "Meal at inexpensive restaurant", `${currency} ${Math.max(10, Math.round(bigMac * 0.65)).toString()}`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} meal cost`)}`, lastVerifiedAt)),
    buildMetric("meal_two_midrange", "Dinner for two, mid-range", `${currency} ${Math.max(35, Math.round(bigMac * 1.4 + 25)).toString()}`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} dinner for two cost`)}`, lastVerifiedAt)),
    buildMetric("monthly_transport", "Monthly public transport pass", `${currency} ${transport}`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} monthly transport cost`)}`, lastVerifiedAt)),
    buildMetric("utilities", "Utilities", `${currency} ${utilities}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} utilities cost`)}`, lastVerifiedAt)),
    buildMetric("broadband", "Broadband 100 Mbps+", `${currency} ${broadband}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} broadband cost`)}`, lastVerifiedAt)),
    buildMetric("groceries", "Groceries", `${currency} ${groceries}/month for one adult`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} groceries monthly`)}`, lastVerifiedAt)),
  ];

  const housingMetrics: CommandMetric[] = [
    buildMetric("rent_1br_center", "1 bedroom apartment, city centre", `${currency} ${rent1br}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} 1 bedroom apartment`)}`, lastVerifiedAt)),
    buildMetric("rent_2br_center", "2 bedroom apartment, city centre", `${currency} ${rent2br}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} 2 bedroom apartment`)}`, lastVerifiedAt)),
    buildMetric("rent_3br_center", "3 bedroom apartment, city centre", `${currency} ${rent3br}/month`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} 3 bedroom apartment`)}`, lastVerifiedAt)),
    buildMetric("buy_center_sqm", "Buy apartment, city centre", `${currency} ${Math.round(rent1br * 22)}/m²`, baselineVerification(`https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} property price sqm`)}`, lastVerifiedAt)),
  ];

  const pros = [] as string[];
  const tradeoffs = [] as string[];

  if (/waterfront|harbor|marina|bay|beach|coast|sea|river/i.test(text)) {
    pros.push(`Strong ${/harbor|marina|bay|waterfront/i.test(text) ? "waterfront" : "coastal"} identity and lifestyle texture`);
    tradeoffs.push("Peak-season demand and tourism can lift prices around the most attractive edges");
  }

  if (/historic|old town|castle|museum|architecture|church|square/i.test(text)) {
    pros.push("Distinct local character and a strong sense of place");
    tradeoffs.push("Older districts may involve steps, narrow streets, or less convenient parking");
  }

  if (/desert|mountain|alpine|hill|valley|forest|nature/i.test(text)) {
    pros.push("Outdoor access and scenic daily life are part of the draw");
    tradeoffs.push("Weather, topography, or remoteness can make everyday logistics less frictionless");
  }

  if (pros.length === 0) {
    pros.push(`A practical, lived-in rhythm is usually the key to making ${destination.city} work well`);
  }

  if (tradeoffs.length === 0) {
    tradeoffs.push(`The best fit usually comes from choosing the right district rather than assuming the city feels uniform`);
  }

  return { quickMetrics, costOfLiving, housingMetrics, pros, tradeoffs };
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
    verification: {
      ...fallbackClimateVerification,
      lastVerifiedAt,
    },
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

  const quickMetrics = mergeWithSeedAuthority(
    seedQuickMetrics,
    baseQuickMetrics,
    (item) => item.key,
    authoritativeMissing,
  );

  const scorecard = mergeWithSeedAuthority(
    seedScorecard,
    baseScorecard,
    (item) => item.category.toLowerCase(),
    authoritativeMissing,
  );

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
  const localSeed = LOCAL_COMMAND_CENTER_SEEDS[slug];

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
    return normalizeCommandCenterForConsumer(fallbackGenerated);
  }

  const catalogRows = await safeFetchJson<DestinationCatalogRow>(
    `/rest/v1/destinations_catalog?select=id,region,updated_at,metadata&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );

  const catalog = catalogRows[0];
  if (!catalog?.id) return normalizeCommandCenterForConsumer(fallbackGenerated);

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

  return normalizeCommandCenterForConsumer({
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
  });
}

export const defaultMissingVerification = missingVerification;
