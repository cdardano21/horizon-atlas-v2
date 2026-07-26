import { getDestinationContent } from "./destination-content";
import { getDestinationIntelligence } from "./destination-intelligence";
import type { DestinationIntelligence } from "./destination-intelligence";
import { generatedCommandCenterSeeds } from "./generated-command-center-seeds";
import { isFlagshipDestination } from "./flagship-destinations";
import { LOCAL_COMMAND_CENTER_SEEDS, type LocalCommandCenterSeed } from "./local-command-center-seeds";
import { REGIONAL_COMMAND_CENTER_SEEDS } from "./regional-command-center-seeds";
import type { Destination } from "./destinations";
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
  url: typeof row.url === "string" ? row.url : null,
  mapQuery: typeof row.map_query === "string" ? row.map_query : null,
  mapZoom: typeof row.map_zoom === "number" ? row.map_zoom : null,
  verification: verificationFromRow(row),
});

const toResourceRecord = (row: Record<string, unknown>): ResourceRecord => ({
  id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
  title: typeof row.title === "string" ? row.title : "Untitled resource",
  description: typeof row.description === "string" ? row.description : null,
  url: typeof row.url === "string" ? row.url : "",
  category: typeof row.category === "string" ? row.category : "general",
  sourceType: typeof row.source_type === "string" ? row.source_type : null,
  verifiedAt: typeof row.last_verified_at === "string" ? row.last_verified_at : null,
});

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
    url: typeof row.url === "string" ? row.url : null,
    verification: verificationFromRow(row),
  };
};

const toMetricKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const fallbackVerification: VerificationMeta = {
  verificationStatus: "estimated",
  confidenceLevel: "medium",
  notes: "Generated from baseline destination intelligence while command-center records are being prepared.",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const hasTag = (destination: Destination, tag: string): boolean =>
  destination.tags?.some((entry) => entry.toLowerCase() === tag.toLowerCase()) ?? false;

const searchUrl = (destination: Destination, topic: string): string =>
  `https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} ${topic}`)}`;

const climateProfile = (destination: Destination) => {
  const coastal = hasTag(destination, "beach") || hasTag(destination, "coast") || hasTag(destination, "summer escape");
  if (coastal) {
    return {
      winterHigh: 14,
      summerHigh: 30,
      winterLow: 8,
      summerLow: 22,
      seaOffset: 2,
      rainfallBase: 35,
      rainfallSwing: 20,
    };
  }

  return {
    winterHigh: 6,
    summerHigh: 26,
    winterLow: 0,
    summerLow: 16,
    seaOffset: 0,
    rainfallBase: 45,
    rainfallSwing: 15,
  };
};

const buildSyntheticClimate = (destination: Destination, verification: VerificationMeta): MonthlyClimateRow[] => {
  const profile = climateProfile(destination);
  return monthNames.map((month, index) => {
    const radians = ((index - 1) / 12) * Math.PI * 2;
    const high = Math.round(((profile.summerHigh - profile.winterHigh) / 2) * Math.sin(radians) + ((profile.summerHigh + profile.winterHigh) / 2));
    const low = Math.round(((profile.summerLow - profile.winterLow) / 2) * Math.sin(radians) + ((profile.summerLow + profile.winterLow) / 2));
    const rainfall = Math.max(15, Math.round(profile.rainfallBase + profile.rainfallSwing * Math.cos(radians)));
    const sunshine = Math.max(120, Math.round(210 + 85 * Math.sin(radians)));
    const uv = Math.max(2, Math.min(10, Math.round(6 + 3 * Math.sin(radians))));
    const seaTemp = profile.seaOffset > 0 ? Math.round(low + profile.seaOffset) : null;

    return {
      month,
      avgHighC: high,
      avgLowC: low,
      rainfallMm: rainfall,
      rainyDays: Math.max(3, Math.round(rainfall / 8)),
      humidityPct: Math.max(45, Math.min(78, Math.round(64 + 8 * Math.cos(radians)))),
      sunshineHours: sunshine,
      uvIndex: uv,
      seaTempC: seaTemp,
      snowfallCm: low <= 1 ? Math.max(0, Math.round((2 - low) * 1.4)) : 0,
      windKph: Math.max(8, Math.round(12 + 3 * Math.cos(radians))),
      verification,
    };
  });
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
  const isCoastal = hasTag(destination, "beach") || hasTag(destination, "coast");
  const isValue = hasTag(destination, "value");
  const hospitalCount = destination.memberDetails?.hospitals?.length ?? 0;
  const airportCount = destination.memberDetails?.airports?.length ?? 0;
  const schoolCount = destination.memberDetails?.amenities?.schools ?? destination.memberDetails?.amenities?.englishSchools ?? 0;
  const golfCount = (destination.memberDetails?.golf?.publicCourses ?? 0) + (destination.memberDetails?.golf?.privateCourses ?? 0);
  const restaurantCount = destination.memberDetails?.amenities?.restaurants ?? 0;
  const baselineMonthly = isValue ? 2100 : 2900;
  const baselineHousing = isValue ? 950 : 1650;

  const quickMetrics: CommandMetric[] = intelligence.quickFacts.map((fact) => ({
    key: toMetricKey(fact.label),
    label: fact.label,
    value: fact.value,
    displayValue: fact.value,
    verification: fallbackVerification,
  }));

  const scorecard: ScorecardEntry[] = intelligence.livingHereScorecard.map((item, index) => ({
    category: item.category,
    score: item.score,
    explanation: item.context,
    underlyingMeasurements: index === 0 ? "Weighted relocation-fit baseline" : "Baseline model estimate",
    personalizedWeight: null,
    verification: fallbackVerification,
  }));

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

  const monthlyClimate: MonthlyClimateRow[] = monthlyClimateFromDetails.length > 0
    ? monthlyClimateFromDetails
    : buildSyntheticClimate(destination, fallbackVerification);

  const scoreByCategory = new Map(scorecard.map((item) => [item.category.toLowerCase(), item]));
  const scoreToMetric = (category: string, label: string, key: string): CommandMetric | null => {
    const score = scoreByCategory.get(category.toLowerCase());
    if (!score || typeof score.score !== "number") return null;
    return {
      key,
      label,
      value: String(score.score),
      unit: "/100",
      displayValue: `${score.score}/100`,
      verification: fallbackVerification,
    };
  };

  const costOfLiving = [
    scoreToMetric("Cost of Living", "Cost of living fit", "cost_of_living_fit"),
    scoreToMetric("Overall Match", "Overall relocation fit", "overall_relocation_fit"),
  ].filter((item): item is CommandMetric => item !== null);

  const housingMetrics = [
    scoreToMetric("Overall Match", "Housing and ownership viability", "housing_viability"),
    {
      key: "indicative_monthly_rent",
      label: "Indicative monthly rent",
      value: String(baselineHousing),
      unit: "EUR",
      displayValue: `EUR ${baselineHousing.toLocaleString()} / month`,
      verification: fallbackVerification,
    },
  ].filter((item): item is CommandMetric => item !== null);

  if (!costOfLiving.some((item) => item.key === "estimated_monthly_budget")) {
    costOfLiving.push({
      key: "estimated_monthly_budget",
      label: "Estimated monthly budget",
      value: String(baselineMonthly),
      unit: "EUR",
      displayValue: `EUR ${baselineMonthly.toLocaleString()} / month`,
      verification: fallbackVerification,
    });
  }

  if (!costOfLiving.some((item) => item.key === "estimated_monthly_budget_couple")) {
    const couple = Math.round(baselineMonthly * 1.55);
    costOfLiving.push({
      key: "estimated_monthly_budget_couple",
      label: "Estimated monthly budget for two",
      value: String(couple),
      unit: "EUR",
      displayValue: `EUR ${couple.toLocaleString()} / month`,
      verification: fallbackVerification,
    });
  }

  const safetyMetrics = [
    scoreToMetric("Safety", "Safety score", "safety_score"),
  ].filter((item): item is CommandMetric => item !== null);

  const internetMetrics = [
    scoreToMetric("Internet", "Internet score", "internet_score"),
    scoreToMetric("Digital Nomad", "Digital nomad score", "digital_nomad_score"),
  ].filter((item): item is CommandMetric => item !== null);

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

  if (healthcareFacilities.length === 0) {
    healthcareFacilities.push(
      {
        id: `${destination.slug}-healthcare-primary`,
        name: `${destination.city} Regional Medical Center`,
        subtitle: `Primary hospital cluster serving ${destination.city}`,
        value1: "Emergency and specialist care",
        value2: "Use source links to compare public and private options",
        url: searchUrl(destination, "regional hospital emergency care"),
        mapQuery: `${destination.city} hospital`,
        mapZoom: 12,
        verification: fallbackVerification,
      },
      {
        id: `${destination.slug}-healthcare-secondary`,
        name: `${destination.city} Family Care Network`,
        subtitle: "Primary care and outpatient coverage",
        value1: "Family medicine and routine diagnostics",
        value2: "Cross-check insurers accepted by local providers",
        url: searchUrl(destination, "primary care clinic network"),
        mapQuery: `${destination.city} medical clinic`,
        mapZoom: 12,
        verification: fallbackVerification,
      },
    );
  }

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

  if (airports.length === 0) {
    airports.push({
      id: `${destination.slug}-airport-primary`,
      name: `${destination.city} International Gateway`,
      subtitle: `Primary airport access for ${destination.city}`,
      value1: airportCount > 0 ? `${airportCount} mapped airport connection${airportCount > 1 ? "s" : ""}` : "Scheduled regional and international service",
      value2: "Review route depth and transfer timings",
      url: searchUrl(destination, "international airport routes"),
      mapQuery: `${destination.city} airport`,
      mapZoom: 10,
      verification: fallbackVerification,
    });
  }

  const neighborhoods: NamedRecord[] = [
    {
      id: `${destination.slug}-neighborhood-core`,
      name: `${destination.city} Central District`,
      subtitle: "Walkable core with daily essentials",
      value1: destination.lifestyle,
      value2: "Good first pass for errands, cafes, and transit rhythm",
      url: searchUrl(destination, "city center neighborhoods"),
      mapQuery: `${destination.city} city center`,
      mapZoom: 13,
      verification: fallbackVerification,
    },
    {
      id: `${destination.slug}-neighborhood-residential`,
      name: `${destination.city} Residential Quarter`,
      subtitle: "Long-stay housing and calmer streets",
      value1: destination.overview,
      value2: "Useful for budget and comfort tradeoff checks",
      url: searchUrl(destination, "residential neighborhoods housing"),
      mapQuery: `${destination.city} residential district`,
      mapZoom: 13,
      verification: fallbackVerification,
    },
    {
      id: `${destination.slug}-neighborhood-lifestyle`,
      name: isCoastal ? `${destination.city} Waterfront Zone` : `${destination.city} Lifestyle Corridor`,
      subtitle: isCoastal ? "Coastal promenade and leisure strip" : "Dining, culture, and after-hours activity",
      value1: destination.transportation,
      value2: "Compare livability between daytime and evening patterns",
      url: searchUrl(destination, isCoastal ? "waterfront district" : "cultural district nightlife"),
      mapQuery: `${destination.city} ${isCoastal ? "waterfront" : "old town"}`,
      mapZoom: 13,
      verification: fallbackVerification,
    },
  ];

  const beaches: NamedRecord[] = [
    {
      id: `${destination.slug}-beach-primary`,
      name: isCoastal ? `${destination.city} Main Beachfront` : `${destination.city} Waterfront Park` ,
      subtitle: isCoastal ? "Primary beach access corridor" : "Water-access recreation zone",
      value1: isCoastal ? "Swimmable coastline and promenade" : "Riverfront, lakefront, or harbor walk",
      value2: "Best used for morning and sunset routine checks",
      url: searchUrl(destination, isCoastal ? "best beaches" : "waterfront park"),
      mapQuery: `${destination.city} ${isCoastal ? "beach" : "waterfront"}`,
      mapZoom: 12,
      verification: fallbackVerification,
    },
    {
      id: `${destination.slug}-beach-secondary`,
      name: isCoastal ? `${destination.city} Scenic Coastline` : `${destination.city} Outdoor Escape Loop`,
      subtitle: "Secondary weekend anchor",
      value1: "Pair with nearby cafe and grocery route for realism",
      value2: "Useful for quality-of-life pressure testing",
      url: searchUrl(destination, "weekend outdoor activities"),
      mapQuery: `${destination.city} scenic viewpoint`,
      mapZoom: 11,
      verification: fallbackVerification,
    },
  ];

  const recreationFacilities: NamedRecord[] = [
    {
      id: `${destination.slug}-recreation-fitness`,
      name: `${destination.city} Fitness and Sports Complex`,
      subtitle: "Daily activity and wellness anchor",
      value1: "Gyms, classes, and community sports programming",
      value2: "Compare monthly membership options",
      url: searchUrl(destination, "fitness center membership"),
      mapQuery: `${destination.city} fitness center`,
      mapZoom: 12,
      verification: fallbackVerification,
    },
    {
      id: `${destination.slug}-recreation-outdoor`,
      name: `${destination.city} Outdoor Recreation Network`,
      subtitle: "Parks, trails, and open-air activity",
      value1: "Supports daily walking and low-friction routines",
      value2: "Review lighting and safety after dusk",
      url: searchUrl(destination, "parks trails recreation"),
      mapQuery: `${destination.city} parks`,
      mapZoom: 11,
      verification: fallbackVerification,
    },
  ];

  const golfCourses: NamedRecord[] = [
    {
      id: `${destination.slug}-golf-primary`,
      name: `${destination.city} Golf Club Circuit`,
      subtitle: golfCount > 0 ? `${golfCount} mapped public/private options` : "Local and regional golf options",
      value1: "Review green fees, transport time, and membership terms",
      value2: "Best evaluated with weekday tee availability",
      url: searchUrl(destination, "golf courses green fees"),
      mapQuery: `${destination.city} golf course`,
      mapZoom: 11,
      verification: fallbackVerification,
    },
  ];

  const foodSpots: NamedRecord[] = [
    {
      id: `${destination.slug}-food-market`,
      name: `${destination.city} Local Market District`,
      subtitle: "Daily groceries and casual dining",
      value1: restaurantCount > 0 ? `${restaurantCount.toLocaleString()} restaurants tracked in current dataset` : "Strong local food rotation potential",
      value2: "Validate weekday lunch and dinner price range",
      url: searchUrl(destination, "food market restaurants"),
      mapQuery: `${destination.city} food market`,
      mapZoom: 13,
      verification: fallbackVerification,
    },
    {
      id: `${destination.slug}-food-cafe`,
      name: `${destination.city} Cafe and Bistro Corridor`,
      subtitle: "Neighborhood cafe and remote-work options",
      value1: "Good proxy for social rhythm and routine comfort",
      value2: "Check opening hours by season",
      url: searchUrl(destination, "best cafes local bistros"),
      mapQuery: `${destination.city} cafe`,
      mapZoom: 13,
      verification: fallbackVerification,
    },
  ];

  const schools: NamedRecord[] = [
    {
      id: `${destination.slug}-school-primary`,
      name: `${destination.city} International and Local Schools`,
      subtitle: schoolCount > 0 ? `${schoolCount.toLocaleString()} schools signaled in member data` : "Primary and secondary school options",
      value1: "Review curriculum, language support, and admissions windows",
      value2: "Compare commute duration from target neighborhoods",
      url: searchUrl(destination, "international schools admissions"),
      mapQuery: `${destination.city} schools`,
      mapZoom: 12,
      verification: fallbackVerification,
    },
  ];

  const visaPrograms: NamedRecord[] = [
    {
      id: `${destination.slug}-visa-primary`,
      name: `${destination.country} residency pathways for ${destination.city}`,
      subtitle: "Long-stay and retirement route overview",
      value1: "Confirm eligibility, income thresholds, and renewal cadence",
      value2: "Cross-check appointment wait times before committing move dates",
      url: searchUrl(destination, "official residency visa requirements"),
      verification: fallbackVerification,
    },
  ];

  const taxRules: NamedRecord[] = [
    {
      id: `${destination.slug}-tax-primary`,
      name: `${destination.country} personal tax residency framework`,
      subtitle: "Baseline tax planning signal",
      value1: "Verify residency-day count and filing obligations",
      value2: "Model pension, investment, and social-security treatment",
      url: searchUrl(destination, "official tax residency rules"),
      verification: fallbackVerification,
    },
  ];

  const practicalInfo: NamedRecord[] = [
    {
      id: `${destination.slug}-practical-government`,
      name: `${destination.city} municipal services portal`,
      subtitle: "Official city services and resident guidance",
      value1: "Use for utilities, permits, and local administration",
      value2: "Cross-reference language availability for onboarding",
      url: searchUrl(destination, "official city government services"),
      verification: fallbackVerification,
    },
    {
      id: `${destination.slug}-practical-orientation`,
      name: `${destination.city} relocation orientation resources`,
      subtitle: "Transit, neighborhoods, and daily logistics",
      value1: "Shortlist checklists for first 90 days",
      value2: "Validate banking, telecom, and healthcare setup sequence",
      url: searchUrl(destination, "relocation guide resident checklist"),
      verification: fallbackVerification,
    },
  ];

  const resources: ResourceRecord[] = Object.entries(intelligence.resources)
    .flatMap(([category, items]) => items.map((item, index) => ({
      id: `${destination.slug}-${category}-${index + 1}`,
      title: item.label,
      description: item.note,
      url: item.href,
      category,
      sourceType: "research_link",
      verifiedAt: lastVerifiedAt,
    })));

  if (resources.length === 0) {
    resources.push(
      {
        id: `${destination.slug}-resource-housing`,
        title: `${destination.city} housing and rentals`,
        description: "Housing listings and district-level pricing context",
        url: searchUrl(destination, "housing rentals neighborhoods"),
        category: "rentals",
        sourceType: "search_link",
        verifiedAt: lastVerifiedAt,
      },
      {
        id: `${destination.slug}-resource-healthcare`,
        title: `${destination.city} healthcare services`,
        description: "Hospitals, clinics, and urgent care resources",
        url: searchUrl(destination, "healthcare hospitals clinics"),
        category: "healthcare",
        sourceType: "search_link",
        verifiedAt: lastVerifiedAt,
      },
      {
        id: `${destination.slug}-resource-transport`,
        title: `${destination.city} transit and airport access`,
        description: "Airport and local mobility planning resources",
        url: searchUrl(destination, "airport transit routes"),
        category: "relocation",
        sourceType: "search_link",
        verifiedAt: lastVerifiedAt,
      },
    );
  }

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
    foodMetrics: [
      {
        key: "restaurant_scene_strength",
        label: "Restaurant scene strength",
        value: String(Math.max(68, Math.min(96, 70 + Math.min(18, Math.round(restaurantCount / 120))))),
        unit: "/100",
        displayValue: `${Math.max(68, Math.min(96, 70 + Math.min(18, Math.round(restaurantCount / 120))))}/100`,
        verification: fallbackVerification,
      },
    ],
    practicalInfo,
    pros: intelligence.retirementAdvantages,
    tradeoffs: intelligence.retirementTradeoffs,
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

const applyLocalSeedOverride = (
  base: CommandCenterData,
  seed?: LocalCommandCenterSeed,
): CommandCenterData => {
  if (!seed) return base;

  const hasSeedQuickMetrics = Array.isArray(seed.quickMetrics) && seed.quickMetrics.length > 0;
  const hasSeedScorecard = Array.isArray(seed.scorecard) && seed.scorecard.length > 0;

  return {
    ...base,
    region: seed.region ?? base.region,
    lastVerifiedAt: seed.lastVerifiedAt ?? base.lastVerifiedAt,
    dataConfidence: seed.dataConfidence ?? base.dataConfidence,
    quickMetrics: hasSeedQuickMetrics
      ? [...(seed.quickMetrics ?? [])]
      : base.quickMetrics,
    scorecard: hasSeedScorecard
      ? [...(seed.scorecard ?? [])]
      : base.scorecard,
    monthlyClimate: mergeUnique(seed.monthlyClimate, base.monthlyClimate, (item) => item.month.toLowerCase()),
    costOfLiving: mergeUnique(seed.costOfLiving, base.costOfLiving, (item) => item.key),
    housingMetrics: mergeUnique(seed.housingMetrics, base.housingMetrics, (item) => item.key),
    neighborhoods: mergeUnique(seed.neighborhoods, base.neighborhoods, (item) => item.id || item.name.toLowerCase()),
    healthcareFacilities: mergeUnique(seed.healthcareFacilities, base.healthcareFacilities, (item) => item.id || item.name.toLowerCase()),
    airports: mergeUnique(seed.airports, base.airports, (item) => item.id || item.name.toLowerCase()),
    golfCourses: mergeUnique(seed.golfCourses, base.golfCourses, (item) => item.id || item.name.toLowerCase()),
    recreationFacilities: mergeUnique(seed.recreationFacilities, base.recreationFacilities, (item) => item.id || item.name.toLowerCase()),
    beaches: mergeUnique(seed.beaches, base.beaches, (item) => item.id || item.name.toLowerCase()),
    foodSpots: mergeUnique(seed.foodSpots, base.foodSpots, (item) => item.id || item.name.toLowerCase()),
    schools: mergeUnique(seed.schools, base.schools, (item) => item.id || item.name.toLowerCase()),
    internetMetrics: mergeUnique(seed.internetMetrics, base.internetMetrics, (item) => item.key),
    visaPrograms: mergeUnique(seed.visaPrograms, base.visaPrograms, (item) => item.id || item.name.toLowerCase()),
    taxRules: mergeUnique(seed.taxRules, base.taxRules, (item) => item.id || item.name.toLowerCase()),
    safetyMetrics: mergeUnique(seed.safetyMetrics, base.safetyMetrics, (item) => item.key),
    foodMetrics: mergeUnique(seed.foodMetrics, base.foodMetrics, (item) => item.key),
    practicalInfo: mergeUnique(seed.practicalInfo, base.practicalInfo, (item) => item.id || item.name.toLowerCase()),
    pros: mergeUnique(seed.pros, base.pros, (item) => item.toLowerCase()),
    tradeoffs: mergeUnique(seed.tradeoffs, base.tradeoffs, (item) => item.toLowerCase()),
    resources: mergeUnique(seed.resources, base.resources, (item) => item.id || `${item.category}-${item.title}`.toLowerCase()),
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
    resources: resourceRows.map((row) => toResourceRecord(row)),
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
