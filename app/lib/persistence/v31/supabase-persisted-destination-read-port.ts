import type { PersistedDestinationReadPort, ReadResult } from "./persisted-destination-read-port";
import type { PersistedPresenceModuleKey, ResolvedDestinationIdentity } from "./types";
import type {
  PersistedRootRow,
  PersistedProfileRow,
  PersistedPresenceRow,
  PersistedKeyedChildrenRows,
  PersistedReplaceModulesRows,
  PersistedSingletonsRows,
} from "./normalize-persisted-destination-rows";
import { readHealthcareCostQualifiers, restoreHealthcareCostValue } from "./healthcare-cost-storage";

export interface PersistedDestinationSupabaseReadClient {
  readonly selectRows: (args: {
    readonly table: string;
    readonly select: string;
    readonly filters?: readonly { readonly column: string; readonly operator: string; readonly value: unknown }[];
  }) => Promise<readonly Record<string, unknown>[]>;
}

type ReadFailure = { readonly reason: "DB_READ_FAILED" };
type GroupedReadFailure = { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey };

type QueryResult<T> = ReadResult<T, ReadFailure>;
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : value == null ? null : null;
}

function pickMetadataString(row: Record<string, unknown>, key: string): string | null {
  const metadata = row.metadata;
  return isRecord(metadata) && typeof metadata[key] === "string" ? metadata[key] : null;
}

function pickBoolean(row: Record<string, unknown>, key: string): boolean | null {
  const value = row[key];
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return null;
}

function pickNumber(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];
  if (value == null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  throw new Error(`Unsupported numeric representation for ${key}`);
}

function createFailure(): ReadFailure {
  return { reason: "DB_READ_FAILED" };
}

function createGroupedFailure(module: PersistedPresenceModuleKey): GroupedReadFailure {
  return { reason: "DB_READ_FAILED", module };
}

function createReadResult<T>(value: T | null): QueryResult<T> {
  return { ok: true, value };
}

async function readSingleRow<T>(
  client: PersistedDestinationSupabaseReadClient,
  table: string,
  select: string,
  identity: ResolvedDestinationIdentity,
  transform: (row: Record<string, unknown>) => T,
  identityColumn = "destination_id",
): Promise<QueryResult<T | null>> {
  try {
    const rows = await client.selectRows({
      table,
      select,
      filters: [{ column: identityColumn, operator: "eq", value: identity.destinationId }],
    });

    if (rows.length === 0) {
      return createReadResult<T>(null);
    }
    if (rows.length > 1) {
      return { ok: false, error: createFailure() };
    }

    const [row] = rows;
    if (!isRecord(row)) {
      return { ok: false, error: createFailure() };
    }
    return createReadResult(transform(row));
  } catch {
    return { ok: false, error: createFailure() };
  }
}

async function readRows<T>(
  client: PersistedDestinationSupabaseReadClient,
  table: string,
  select: string,
  identity: ResolvedDestinationIdentity,
  transform: (row: Record<string, unknown>) => T,
  identityColumn = "destination_id",
  compareRows?: (left: Record<string, unknown>, right: Record<string, unknown>) => number,
): Promise<QueryResult<readonly T[]>> {
  try {
    const rows = await client.selectRows({
      table,
      select,
      filters: [{ column: identityColumn, operator: "eq", value: identity.destinationId }],
    });

    const mapped: T[] = [];
    const orderedRows = compareRows ? [...rows].sort(compareRows) : rows;
    for (const row of orderedRows) {
      if (!isRecord(row)) {
        return { ok: false, error: createFailure() };
      }
      mapped.push(transform(row));
    }
    return createReadResult(mapped);
  } catch {
    return { ok: false, error: createFailure() };
  }
}

export function createSupabasePersistedDestinationReadPort(
  client: PersistedDestinationSupabaseReadClient,
): PersistedDestinationReadPort {
  return {
    async readRoot(identity) {
      return readSingleRow(client, "destinations_catalog", "id,destination_key,slug,city,country,beach_access,mountain_or_ski_access,country_code,population,metro_population,elevation", identity, (row) => ({
        destinationId: String(row.id ?? row.destination_id ?? ""),
        destinationKey: String(row.destination_key ?? ""),
        slug: pickString(row, "slug"),
        name: null,
        city: pickString(row, "city"),
        country: pickString(row, "country"),
        beachAccess: pickString(row, "beach_access"),
        mountainOrSkiAccess: pickString(row, "mountain_or_ski_access"),
        countryCode: pickString(row, "country_code"),
        population: row.population == null ? null : String(row.population),
        metroPopulation: row.metro_population == null ? null : String(row.metro_population),
        elevation: row.elevation == null ? null : String(row.elevation),
      } as PersistedRootRow), "id");
    },

    async readProfile(identity) {
      return readSingleRow(client, "premium_destination_profiles", "destination_id,destination_key,identity_name,summary,overview,currency,primary_language,time_zone,profile_storage_version", identity, (row) => ({
        destinationId: String(row.destination_id ?? ""),
        destinationKey: String(row.destination_key ?? ""),
        profileStorageVersion: row.profile_storage_version == null ? null : Number(row.profile_storage_version),
        identityName: pickString(row, "identity_name"),
        shortDescription: pickString(row, "summary"),
        longDescription: pickString(row, "overview"),
        currency: pickString(row, "currency"),
        primaryLanguage: pickString(row, "primary_language"),
        timeZone: pickString(row, "time_zone"),
      } as PersistedProfileRow));
    },

    async readPresence(identity) {
      return readRows(client, "premium_destination_module_presence", "destination_id,destination_key,module_key", identity, (row) => ({
        destinationId: String(row.destination_id ?? ""),
        destinationKey: String(row.destination_key ?? ""),
        module: String(row.module_key ?? "") as PersistedPresenceModuleKey,
      } as PersistedPresenceRow));
    },

    async readKeyedChildren(identity) {
      const queries = [
        ["facts", "premium_destination_facts", "destination_id,destination_key,fact_key,fact_type,title,body,source_ref", "facts"],
        ["scores", "premium_destination_scores", "destination_id,destination_key,score_key,score_name,score_value,weight,higher_is_better,verified,verified_at", "scores"],
        ["neighborhoods", "premium_neighborhoods", "destination_id,destination_key,neighborhood_key,neighborhood_name,area_type,best_for,summary,housing_character,walkability_rating,safety_rating,transit_rating,pros,cons,google_maps_url", "neighborhoods"],
        ["places", "premium_places", "destination_id,destination_key,place_key,category_key,place_name,description,neighborhood_key,website_url,google_maps_url,source_url,address,phone,display_order", "places"],
        ["resources", "premium_resources", "destination_id,destination_key,resource_key,resource_category,resource_name,url", "resources"],
        ["media", "premium_media", "destination_id,destination_key,media_key,media_type,url,caption,alt_text,is_primary,sort_order,verified,source_name,source_url,metadata", "media"],
        ["propertyResources", "premium_property_resources", "destination_id,destination_key,record_key,resource_type,resource_name,url", "propertyResources"],
        ["moveChecklist", "premium_move_checklist", "destination_id,destination_key,checklist_key,summary,checklist_notes", "moveChecklist"],
        ["eventsSeasonality", "premium_events_seasonality", "destination_id,destination_key,event_seasonality_key,summary,seasonality_notes", "eventsSeasonality"],
        ["sources", "premium_sources", "destination_id,destination_key,source_key,source_name,source_url,source_type", "sources"],
      ] as const;

      const results = await Promise.all(
        queries.map(async ([moduleName, table, select, field]) => {
          const queryResult = await readRows(client, table, select, identity, (row) => {
            switch (field) {
              case "facts":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  factKey: String(row.fact_key ?? ""),
                  factGroup: pickString(row, "fact_type"),
                  valueText: pickString(row, "body"),
                  displayLabel: pickString(row, "title"),
                  sourceName: pickString(row, "source_ref"),
                };
              case "scores":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  scoreKey: String(row.score_key ?? ""),
                  scoreValue: row.score_value == null ? null : String(row.score_value),
                  scoreLabel: pickString(row, "score_name"),
                  methodologyVersion: null,
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "neighborhoods":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  neighborhoodKey: String(row.neighborhood_key ?? ""),
                  name: pickString(row, "neighborhood_name"),
                  summary: pickString(row, "summary"),
                  areaType: pickString(row, "area_type"),
                  bestFor: pickString(row, "best_for"),
                  walkabilityRating: pickString(row, "walkability_rating"),
                  safetyRating: pickString(row, "safety_rating"),
                  transitRating: pickString(row, "transit_rating"),
                  housingCharacter: pickString(row, "housing_character"),
                  pros: pickString(row, "pros"),
                  cons: pickString(row, "cons"),
                  googleMapsUrl: pickString(row, "google_maps_url"),
                };
              case "places":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  placeKey: String(row.place_key ?? ""),
                  category: pickString(row, "category_key"),
                  name: pickString(row, "place_name"),
                  description: pickString(row, "description"),
                  neighborhoodKey: pickString(row, "neighborhood_key"),
                  websiteUrl: pickString(row, "website_url"),
                  googleMapsUrl: pickString(row, "google_maps_url"),
                  sourceUrl: pickString(row, "source_url"),
                  address: pickString(row, "address"),
                  phone: pickString(row, "phone"),
                  displayOrder: row.display_order == null ? null : String(row.display_order),
                };
              case "resources":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  resourceKey: String(row.resource_key ?? ""),
                  category: pickString(row, "resource_category"),
                  name: pickString(row, "resource_name"),
                  url: pickString(row, "url"),
                };
              case "media":
                const mediaMetadata = isRecord(row.metadata) ? row.metadata : {};
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  mediaKey: String(row.media_key ?? ""),
                  kind: pickString(row, "media_type"),
                  url: pickString(row, "url"),
                  caption: pickString(row, "caption"),
                  altText: pickString(row, "alt_text"),
                  isPrimary: row.is_primary == null ? null : String(row.is_primary),
                  sortOrder: row.sort_order == null ? null : String(row.sort_order),
                  verified: row.verified == null ? null : String(row.verified),
                  sourceName: pickString(row, "source_name"),
                  sourceUrl: pickString(row, "source_url"),
                  licenseNotes: pickString(mediaMetadata, "licenseNotes"),
                };
              case "propertyResources":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  itemKey: String(row.record_key ?? ""),
                  category: pickString(row, "resource_type"),
                  name: pickString(row, "resource_name"),
                  url: pickString(row, "url"),
                };
              case "moveChecklist":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  checklistKey: String(row.checklist_key ?? ""),
                  summary: pickString(row, "summary"),
                  checklistNotes: pickString(row, "checklist_notes"),
                };
              case "eventsSeasonality":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  eventSeasonalityKey: String(row.event_seasonality_key ?? ""),
                  summary: pickString(row, "summary"),
                  seasonalityNotes: pickString(row, "seasonality_notes"),
                };
              case "sources":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  sourceKey: String(row.source_key ?? ""),
                  name: pickString(row, "source_name"),
                  url: pickString(row, "source_url"),
                  type: pickString(row, "source_type"),
                };
              default:
                throw new Error(`Unhandled keyed-child module: ${String(moduleName)}`);
            }
          });

          return { moduleName, queryResult };
        }),
      );

      let facts: PersistedKeyedChildrenRows["facts"] = [];
      let scores: PersistedKeyedChildrenRows["scores"] = [];
      let neighborhoods: PersistedKeyedChildrenRows["neighborhoods"] = [];
      let places: PersistedKeyedChildrenRows["places"] = [];
      let resources: PersistedKeyedChildrenRows["resources"] = [];
      let media: PersistedKeyedChildrenRows["media"] = [];
      let propertyResources: PersistedKeyedChildrenRows["propertyResources"] = [];
      let moveChecklist: PersistedKeyedChildrenRows["moveChecklist"] = [];
      let eventsSeasonality: PersistedKeyedChildrenRows["eventsSeasonality"] = [];
      let sources: PersistedKeyedChildrenRows["sources"] = [];
      const moduleOrder = ["facts", "scores", "neighborhoods", "places", "resources", "media", "propertyResources", "moveChecklist", "eventsSeasonality", "sources"] as const;

      for (const moduleKey of moduleOrder) {
        const match = results.find((entry) => entry.moduleName === moduleKey);
        if (!match) {
          return { ok: false, error: createGroupedFailure(moduleKey as PersistedPresenceModuleKey) };
        }
        if (!match.queryResult.ok) {
          return { ok: false, error: createGroupedFailure(moduleKey as PersistedPresenceModuleKey) };
        }
        if (moduleKey === "facts") {
          facts = match.queryResult.value as PersistedKeyedChildrenRows["facts"];
          continue;
        }
        if (moduleKey === "scores") {
          scores = match.queryResult.value as PersistedKeyedChildrenRows["scores"];
          continue;
        }
        if (moduleKey === "neighborhoods") {
          neighborhoods = match.queryResult.value as unknown as PersistedKeyedChildrenRows["neighborhoods"];
          continue;
        }
        if (moduleKey === "places") {
          places = match.queryResult.value as PersistedKeyedChildrenRows["places"];
          continue;
        }
        if (moduleKey === "resources") {
          resources = match.queryResult.value as PersistedKeyedChildrenRows["resources"];
          continue;
        }
        if (moduleKey === "media") {
          media = match.queryResult.value as PersistedKeyedChildrenRows["media"];
          continue;
        }
        if (moduleKey === "propertyResources") {
          propertyResources = match.queryResult.value as PersistedKeyedChildrenRows["propertyResources"];
          continue;
        }
        if (moduleKey === "moveChecklist") {
          moveChecklist = match.queryResult.value as PersistedKeyedChildrenRows["moveChecklist"];
          continue;
        }
        if (moduleKey === "eventsSeasonality") {
          eventsSeasonality = match.queryResult.value as PersistedKeyedChildrenRows["eventsSeasonality"];
          continue;
        }
        sources = match.queryResult.value as PersistedKeyedChildrenRows["sources"];
      }

      const value: PersistedKeyedChildrenRows = {
        facts,
        scores,
        neighborhoods,
        places,
        resources,
        media,
        propertyResources,
        moveChecklist,
        eventsSeasonality,
        sources,
      };

      return { ok: true, value };
    },

    async readReplaceModules(identity) {
      const queries = [
        ["costOfLiving", "premium_cost_of_living", "destination_id,destination_key,record_key,category,monthly_low,monthly_high,currency,household_type,lifestyle_tier,stay_mode_key,verified,verified_at", "costOfLiving"],
        ["climateMonthly", "premium_climate_monthly", "destination_id,destination_key,record_key,month_key,avg_high_temp,avg_low_temp,precipitation_mm,humidity_pct", "climateMonthly"],
        ["housing", "premium_housing_property", "destination_id,destination_key,record_key,restrictions_summary,buying_process_summary,rental_rules_notes,stay_mode_key,can_foreigners_buy,residency_required_to_buy,verified,verified_at", "housing"],
        ["healthcare", "premium_healthcare_insurance", "destination_id,destination_key,record_key,system_summary,public_access_foreigners,international_insurance_notes,private_care_available,topic,english_speaking_care,typical_gp_visit_cost,typical_specialist_cost,metadata,verified,verified_at", "healthcare"],
        ["visaResidency", "premium_visa_residency", "destination_id,destination_key,record_key,visa_type,permanent_residency_path,citizenship_path,stay_mode_key,traveler_nationality,verified,verified_at", "visaResidency"],
        ["taxesFinance", "premium_taxes_finance", "destination_id,destination_key,record_key,summary,notes,verified,verified_at", "taxesFinance"],
        ["lgbtqInclusivity", "premium_lgbtq_inclusivity", "destination_id,destination_key,position,summary,cultural_notes,overall_rating,legal_protections,social_acceptance,pride_events,nightlife_social,healthcare_access,areas_resources,safety_considerations,verified,verified_at", "lgbtqInclusivity"],
        ["safetyRisks", "premium_safety_risks", "destination_id,destination_key,record_key,topic,severity,summary,verified,verified_at", "safetyRisks"],
        ["transportation", "premium_transport_airports", "destination_id,destination_key,record_key,summary,name,public_transit_available,topic,distance_km,typical_drive_minutes,nonstop_us_service,car_needed_rating,parking_notes,rideshare_notes,verified,verified_at,metadata", "transportation"],
        ["remoteWork", "premium_connectivity_remote_work", "destination_id,destination_key,record_key,remote_work_notes,avg_download_mbps,us_time_zone_fit,fiber_available,mobile_5g,utility_reliability,coworking_summary,verified,verified_at", "remoteWork"],
        ["languageIntegration", "premium_language_integration", "destination_id,destination_key,position,summary,english_support,primary_language,english_proficiency,government_english_access,medical_english_access,language_resources,verified,verified_at", "languageIntegration"],
        ["pets", "premium_pets", "destination_id,destination_key,position,summary,pet_friendly_notes", "pets"],
        ["familyEducation", "premium_family_education", "destination_id,destination_key,position,summary,schools_summary", "familyEducation"],
        ["communitySocial", "premium_community_social", "destination_id,destination_key,position,summary,social_notes,expat_presence,volunteering,ease_meeting_people,age_mix,transient_vs_rooted,verified,verified_at", "communitySocial"],
        ["accessibility", "premium_accessibility", "destination_id,destination_key,position,summary,mobility_notes", "accessibility"],
        ["bureaucracySetup", "premium_bureaucracy_setup", "destination_id,destination_key,position,summary,setup_notes", "bureaucracySetup"],
        ["workBusiness", "premium_work_business", "destination_id,destination_key,position,summary,remote_work_notes", "workBusiness"],
        ["retirementAging", "premium_retirement_aging", "destination_id,destination_key,position,summary,aging_notes", "retirementAging"],
        ["lifestyleLaws", "premium_lifestyle_laws", "destination_id,destination_key,position,summary,legal_notes", "lifestyleLaws"],
        ["realityCheck", "premium_reality_check", "destination_id,destination_key,record_key,title,detail,severity", "realityCheck"],
        ["lifestyleFeatures", "premium_lifestyle_features", "destination_id,destination_key,record_key,feature_group,feature_key,feature_value,availability_level,proximity_band,display_label,evidence_summary,source_name,source_url,source_as_of_date,confidence,matching_enabled,display_enabled,notes", "lifestyleFeatures"],
      ] as const;

      const results = await Promise.all(
        queries.map(async ([moduleName, table, select, field]) => {
          const queryResult = await readRows(client, table, select, identity, (row) => {
            switch (field) {
              case "costOfLiving":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  itemKey: String(row.record_key ?? ""),
                  category: pickString(row, "category"),
                  monthlyLow: row.monthly_low == null ? null : String(row.monthly_low),
                  monthlyHigh: row.monthly_high == null ? null : String(row.monthly_high),
                  currency: pickString(row, "currency"),
                  householdType: pickString(row, "household_type"),
                  lifestyleTier: pickString(row, "lifestyle_tier"),
                  stayModeKey: pickString(row, "stay_mode_key"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "climateMonthly":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  monthKey: String(row.month_key ?? ""),
                  avgHighTemp: row.avg_high_temp == null ? null : String(row.avg_high_temp),
                  avgLowTemp: row.avg_low_temp == null ? null : String(row.avg_low_temp),
                  precipitationMm: row.precipitation_mm == null ? null : String(row.precipitation_mm),
                  humidityPct: row.humidity_pct == null ? null : String(row.humidity_pct),
                };
              case "housing":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "restrictions_summary"),
                  buyingSummary: pickString(row, "buying_process_summary"),
                  rentalSummary: pickString(row, "rental_rules_notes"),
                  stayModeKey: pickString(row, "stay_mode_key"),
                  canForeignersBuy: pickString(row, "can_foreigners_buy"),
                  residencyRequiredToBuy: pickString(row, "residency_required_to_buy"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "healthcare":
                const costQualifiers = readHealthcareCostQualifiers(row.metadata);
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "system_summary"),
                  publicAccessSummary: pickString(row, "public_access_foreigners"),
                  insuranceSummary: pickString(row, "international_insurance_notes"),
                  privateCareAvailable: pickBoolean(row, "private_care_available"),
                  topic: pickString(row, "topic"),
                  englishSpeakingCare: pickString(row, "english_speaking_care"),
                  typicalGpVisitCost: restoreHealthcareCostValue(row.typical_gp_visit_cost, costQualifiers.typical_gp_visit_cost_qualifier),
                  typicalSpecialistCost: restoreHealthcareCostValue(row.typical_specialist_cost, costQualifiers.typical_specialist_cost_qualifier),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "visaResidency":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "visa_type"),
                  residencyPath: pickString(row, "permanent_residency_path"),
                  citizenshipPath: pickString(row, "citizenship_path"),
                  stayModeKey: pickString(row, "stay_mode_key"),
                  travelerNationality: pickString(row, "traveler_nationality"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "taxesFinance":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "summary"),
                  notes: pickString(row, "notes"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "lgbtqInclusivity":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  culturalNotes: pickString(row, "cultural_notes"),
                  overallRating: pickString(row, "overall_rating"),
                  legalProtections: pickString(row, "legal_protections"),
                  socialAcceptance: pickString(row, "social_acceptance"),
                  prideEvents: pickString(row, "pride_events"),
                  nightlifeSocial: pickString(row, "nightlife_social"),
                  healthcareAccess: pickString(row, "healthcare_access"),
                  areasResources: pickString(row, "areas_resources"),
                  safetyConsiderations: pickString(row, "safety_considerations"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "safetyRisks":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  itemKey: String(row.record_key ?? ""),
                  topic: pickString(row, "topic"),
                  severity: pickString(row, "severity"),
                  summary: pickString(row, "summary"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "transportation":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "summary"),
                  airportSummary: pickString(row, "name"),
                  transitSummary: pickMetadataString(row, "transit_summary_qualifier") ?? (row.public_transit_available == null ? null : String(row.public_transit_available)),
                  topic: pickString(row, "topic"),
                  distanceKm: row.distance_km == null ? null : String(row.distance_km),
                  typicalDriveMinutes: row.typical_drive_minutes == null ? null : String(row.typical_drive_minutes),
                  nonstopUsService: pickMetadataString(row, "nonstop_us_service_qualifier") ?? (row.nonstop_us_service == null ? null : String(row.nonstop_us_service)),
                  carNeededRating: pickString(row, "car_needed_rating"),
                  parkingNotes: pickString(row, "parking_notes"),
                  rideshareNotes: pickString(row, "rideshare_notes"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "remoteWork":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "remote_work_notes"),
                  internetSummary: row.avg_download_mbps == null ? null : String(row.avg_download_mbps),
                  timezoneSummary: pickString(row, "us_time_zone_fit"),
                  fiberAvailable: pickString(row, "fiber_available"),
                  mobile5g: pickString(row, "mobile_5g"),
                  utilityReliability: pickString(row, "utility_reliability"),
                  coworkingSummary: pickString(row, "coworking_summary"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "languageIntegration":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  englishSupport: pickString(row, "english_support"),
                  primaryLanguage: pickString(row, "primary_language"),
                  englishProficiency: pickString(row, "english_proficiency"),
                  governmentEnglishAccess: pickString(row, "government_english_access"),
                  medicalEnglishAccess: pickString(row, "medical_english_access"),
                  languageResources: pickString(row, "language_resources"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "pets":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  petFriendlyNotes: pickString(row, "pet_friendly_notes"),
                };
              case "familyEducation":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  schoolsSummary: pickString(row, "schools_summary"),
                };
              case "communitySocial":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  socialNotes: pickString(row, "social_notes"),
                  expatPresence: pickString(row, "expat_presence"),
                  volunteering: pickString(row, "volunteering"),
                  easeMeetingPeople: pickString(row, "ease_meeting_people"),
                  ageMix: pickString(row, "age_mix"),
                  transientVsRooted: pickString(row, "transient_vs_rooted"),
                  verified: row.verified == null ? null : String(row.verified),
                  verifiedAt: pickString(row, "verified_at"),
                };
              case "accessibility":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  mobilityNotes: pickString(row, "mobility_notes"),
                };
              case "bureaucracySetup":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  setupNotes: pickString(row, "setup_notes"),
                };
              case "workBusiness":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  remoteWorkNotes: pickString(row, "remote_work_notes"),
                };
              case "retirementAging":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  agingNotes: pickString(row, "aging_notes"),
                };
              case "lifestyleLaws":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  position: pickNumber(row, "position") ?? 0,
                  summary: pickString(row, "summary"),
                  legalNotes: pickString(row, "legal_notes"),
                };
              case "realityCheck":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  itemKey: String(row.record_key ?? ""),
                  title: pickString(row, "title"),
                  detail: pickString(row, "detail"),
                  severity: pickString(row, "severity"),
                };
              case "lifestyleFeatures":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  recordKey: String(row.record_key ?? ""),
                  featureGroup: pickString(row, "feature_group"),
                  featureKey: pickString(row, "feature_key"),
                  featureValue: pickString(row, "feature_value"),
                  availabilityLevel: pickString(row, "availability_level"),
                  proximityBand: pickString(row, "proximity_band"),
                  displayLabel: pickString(row, "display_label"),
                  evidenceSummary: pickString(row, "evidence_summary"),
                  sourceName: pickString(row, "source_name"),
                  sourceUrl: pickString(row, "source_url"),
                  sourceAsOfDate: pickString(row, "source_as_of_date"),
                  confidence: pickString(row, "confidence"),
                  matchingEnabled: row.matching_enabled == null ? null : String(row.matching_enabled),
                  displayEnabled: row.display_enabled == null ? null : String(row.display_enabled),
                  notes: pickString(row, "notes"),
                };
              default:
                throw new Error(`Unhandled replace module: ${String(moduleName)}`);
            }
          }, "destination_id", (left, right) => String(left.record_key ?? "").localeCompare(String(right.record_key ?? ""), undefined, { numeric: true }));

          return { moduleName, queryResult };
        }),
      );

      let costOfLiving: PersistedReplaceModulesRows["costOfLiving"] = [];
      let climateMonthly: PersistedReplaceModulesRows["climateMonthly"] = [];
      let housing: PersistedReplaceModulesRows["housing"] = [];
      let healthcare: PersistedReplaceModulesRows["healthcare"] = [];
      let visaResidency: PersistedReplaceModulesRows["visaResidency"] = [];
      let taxesFinance: PersistedReplaceModulesRows["taxesFinance"] = [];
      let lgbtqInclusivity: PersistedReplaceModulesRows["lgbtqInclusivity"] = [];
      let safetyRisks: PersistedReplaceModulesRows["safetyRisks"] = [];
      let transportation: PersistedReplaceModulesRows["transportation"] = [];
      let remoteWork: PersistedReplaceModulesRows["remoteWork"] = [];
      let languageIntegration: PersistedReplaceModulesRows["languageIntegration"] = [];
      let pets: PersistedReplaceModulesRows["pets"] = [];
      let familyEducation: PersistedReplaceModulesRows["familyEducation"] = [];
      let communitySocial: PersistedReplaceModulesRows["communitySocial"] = [];
      let accessibility: PersistedReplaceModulesRows["accessibility"] = [];
      let bureaucracySetup: PersistedReplaceModulesRows["bureaucracySetup"] = [];
      let workBusiness: PersistedReplaceModulesRows["workBusiness"] = [];
      let retirementAging: PersistedReplaceModulesRows["retirementAging"] = [];
      let lifestyleLaws: PersistedReplaceModulesRows["lifestyleLaws"] = [];
      let realityCheck: PersistedReplaceModulesRows["realityCheck"] = [];
      let lifestyleFeatures: PersistedReplaceModulesRows["lifestyleFeatures"] = [];
      const moduleOrder = [
        "costOfLiving",
        "climateMonthly",
        "housing",
        "healthcare",
        "visaResidency",
        "taxesFinance",
        "lgbtqInclusivity",
        "safetyRisks",
        "transportation",
        "remoteWork",
        "languageIntegration",
        "pets",
        "familyEducation",
        "communitySocial",
        "accessibility",
        "bureaucracySetup",
        "workBusiness",
        "retirementAging",
        "lifestyleLaws",
        "realityCheck",
        "lifestyleFeatures",
      ] as const;

      for (const moduleKey of moduleOrder) {
        const match = results.find((entry) => entry.moduleName === moduleKey);
        if (!match) {
          return { ok: false, error: createGroupedFailure(moduleKey as PersistedPresenceModuleKey) };
        }
        if (!match.queryResult.ok) {
          return { ok: false, error: createGroupedFailure(moduleKey as PersistedPresenceModuleKey) };
        }
        if (moduleKey === "costOfLiving") {
          costOfLiving = match.queryResult.value as PersistedReplaceModulesRows["costOfLiving"];
          continue;
        }
        if (moduleKey === "climateMonthly") {
          climateMonthly = match.queryResult.value as PersistedReplaceModulesRows["climateMonthly"];
          continue;
        }
        if (moduleKey === "housing") {
          housing = match.queryResult.value as PersistedReplaceModulesRows["housing"];
          continue;
        }
        if (moduleKey === "healthcare") {
          healthcare = match.queryResult.value as PersistedReplaceModulesRows["healthcare"];
          continue;
        }
        if (moduleKey === "visaResidency") {
          visaResidency = match.queryResult.value as PersistedReplaceModulesRows["visaResidency"];
          continue;
        }
        if (moduleKey === "taxesFinance") {
          taxesFinance = match.queryResult.value as PersistedReplaceModulesRows["taxesFinance"];
          continue;
        }
        if (moduleKey === "lgbtqInclusivity") {
          lgbtqInclusivity = match.queryResult.value as PersistedReplaceModulesRows["lgbtqInclusivity"];
          continue;
        }
        if (moduleKey === "safetyRisks") {
          safetyRisks = match.queryResult.value as PersistedReplaceModulesRows["safetyRisks"];
          continue;
        }
        if (moduleKey === "transportation") {
          transportation = match.queryResult.value as PersistedReplaceModulesRows["transportation"];
          continue;
        }
        if (moduleKey === "remoteWork") {
          remoteWork = match.queryResult.value as PersistedReplaceModulesRows["remoteWork"];
          continue;
        }
        if (moduleKey === "languageIntegration") {
          languageIntegration = match.queryResult.value as PersistedReplaceModulesRows["languageIntegration"];
          continue;
        }
        if (moduleKey === "pets") {
          pets = match.queryResult.value as PersistedReplaceModulesRows["pets"];
          continue;
        }
        if (moduleKey === "familyEducation") {
          familyEducation = match.queryResult.value as PersistedReplaceModulesRows["familyEducation"];
          continue;
        }
        if (moduleKey === "communitySocial") {
          communitySocial = match.queryResult.value as PersistedReplaceModulesRows["communitySocial"];
          continue;
        }
        if (moduleKey === "accessibility") {
          accessibility = match.queryResult.value as PersistedReplaceModulesRows["accessibility"];
          continue;
        }
        if (moduleKey === "bureaucracySetup") {
          bureaucracySetup = match.queryResult.value as PersistedReplaceModulesRows["bureaucracySetup"];
          continue;
        }
        if (moduleKey === "workBusiness") {
          workBusiness = match.queryResult.value as PersistedReplaceModulesRows["workBusiness"];
          continue;
        }
        if (moduleKey === "retirementAging") {
          retirementAging = match.queryResult.value as PersistedReplaceModulesRows["retirementAging"];
          continue;
        }
        if (moduleKey === "lifestyleLaws") {
          lifestyleLaws = match.queryResult.value as PersistedReplaceModulesRows["lifestyleLaws"];
          continue;
        }
        if (moduleKey === "lifestyleFeatures") {
          lifestyleFeatures = match.queryResult.value as PersistedReplaceModulesRows["lifestyleFeatures"];
          continue;
        }
        realityCheck = match.queryResult.value as PersistedReplaceModulesRows["realityCheck"];
      }

      const value: PersistedReplaceModulesRows = {
        costOfLiving,
        climateMonthly,
        housing,
        healthcare,
        visaResidency,
        taxesFinance,
        lgbtqInclusivity,
        safetyRisks,
        transportation,
        remoteWork,
        languageIntegration,
        pets,
        familyEducation,
        communitySocial,
        accessibility,
        bureaucracySetup,
        workBusiness,
        retirementAging,
        lifestyleLaws,
        realityCheck,
        lifestyleFeatures,
      };

      return { ok: true, value };
    },

    async readSingletons(identity) {
      const queries = [
        ["environmentQuality", "premium_environment_quality", "destination_id,destination_key,summary,quality_notes", "environmentQuality"],
        ["dailyLifePracticality", "premium_daily_life_practicality", "destination_id,destination_key,summary,practicality_notes", "dailyLifePracticality"],
      ] as const;

      const results = await Promise.all(
        queries.map(async ([moduleName, table, select, field]) => {
          const queryResult = await readRows(client, table, select, identity, (row) => {
            switch (field) {
              case "environmentQuality":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "summary"),
                  qualityNotes: pickString(row, "quality_notes"),
                };
              case "dailyLifePracticality":
                return {
                  destinationId: String(row.destination_id ?? ""),
                  destinationKey: String(row.destination_key ?? ""),
                  summary: pickString(row, "summary"),
                  practicalityNotes: pickString(row, "practicality_notes"),
                };
              default:
                throw new Error(`Unhandled singleton module: ${String(moduleName)}`);
            }
          });

          return { moduleName, queryResult };
        }),
      );

      let environmentQuality: PersistedSingletonsRows["environmentQuality"] = [];
      let dailyLifePracticality: PersistedSingletonsRows["dailyLifePracticality"] = [];
      for (const [moduleName, , , field] of queries) {
        const matched = results.find((entry) => entry.moduleName === moduleName);
        if (!matched) {
          return { ok: false, error: createGroupedFailure(moduleName as PersistedPresenceModuleKey) };
        }
        if (!matched.queryResult.ok) {
          return { ok: false, error: createGroupedFailure(moduleName as PersistedPresenceModuleKey) };
        }
        if (field === "environmentQuality") {
          environmentQuality = matched.queryResult.value as PersistedSingletonsRows["environmentQuality"];
          continue;
        }
        dailyLifePracticality = matched.queryResult.value as PersistedSingletonsRows["dailyLifePracticality"];
      }

      const value: PersistedSingletonsRows = {
        environmentQuality,
        dailyLifePracticality,
      };

      return { ok: true, value };
    },
  };
}
