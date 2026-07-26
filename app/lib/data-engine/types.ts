export type DataCategoryKey =
  | "monthly_weather"
  | "climate_averages"
  | "rainfall"
  | "humidity"
  | "sunshine_hours"
  | "uv_index"
  | "sea_temperature"
  | "air_quality"
  | "cost_of_living"
  | "grocery_prices"
  | "restaurant_prices"
  | "utility_costs"
  | "fuel_prices"
  | "rent_prices"
  | "home_purchase_prices"
  | "property_taxes"
  | "healthcare"
  | "hospitals"
  | "clinics"
  | "specialists"
  | "pharmacies"
  | "airports"
  | "airlines"
  | "airport_drive_times"
  | "transportation"
  | "walkability"
  | "internet_speeds"
  | "mobile_coverage"
  | "schools"
  | "international_schools"
  | "universities"
  | "golf_courses"
  | "pickleball"
  | "tennis"
  | "beaches"
  | "hiking"
  | "parks"
  | "museums"
  | "restaurants"
  | "coffee_shops"
  | "nightlife"
  | "crime_safety"
  | "visa_options"
  | "residency"
  | "tax_information"
  | "population"
  | "language"
  | "currency"
  | "time_zone"
  | "emergency_numbers"
  | "local_government"
  | "tourism"
  | "google_maps_links"
  | "youtube_links"
  | "rental_resources"
  | "real_estate_resources";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type DestinationIdentity = {
  slug: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
};

export type IngestionSourceDefinition = {
  key: string;
  name: string;
  baseUrl?: string;
  authEnv?: string[];
  documentationUrl?: string;
};

export type CategoryDefinition = {
  key: DataCategoryKey;
  label: string;
  primarySource: string;
  backupSource: string;
  licensing: string;
  updateFrequency: string;
  confidenceRule: string;
  verificationProcess: string;
  schemaTarget: string;
  importStrategy: string;
  refreshStrategy: string;
};

export type RawRecordEnvelope = {
  sourceKey: string;
  sourceRecordId: string;
  categoryKey: DataCategoryKey;
  destinationSlug: string;
  observedAt: string;
  payload: Record<string, unknown>;
};

export type NormalizedRecord = {
  destinationSlug: string;
  categoryKey: DataCategoryKey;
  sourceKey: string;
  sourceRecordId: string;
  observedAt: string;
  normalizedAt: string;
  confidenceLevel: ConfidenceLevel;
  payload: Record<string, unknown>;
  dedupeKey: string;
  recordHash: string;
};

export type ValidationIssue = {
  code: string;
  message: string;
  field?: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type ImportRunSummary = {
  runId: string;
  categoryKey: DataCategoryKey;
  sourceKey: string;
  destinationCount: number;
  rawCount: number;
  normalizedCount: number;
  dedupedCount: number;
  rejectedCount: number;
  startedAt: string;
  finishedAt?: string;
};

export type DataSourceAttribution = {
  sourceUrl?: string;
  sourceOrganization?: string;
  sourceType?: string;
  license?: string;
  retrievedAt: string;
};

export type ImportAdapterContext = {
  destination: DestinationIdentity;
  category: CategoryDefinition;
  source: IngestionSourceDefinition;
};

export type ImportAdapter = {
  sourceKey: string;
  supports: DataCategoryKey[];
  fetchRecords: (context: ImportAdapterContext) => Promise<RawRecordEnvelope[]>;
};
