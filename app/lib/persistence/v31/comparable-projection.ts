import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { KeyedChildModuleKey } from "./types";
import type { StoredDestinationState } from "./types";

export type ComparablePrimitive = null | string | number | boolean;
export interface ComparableObject {
  [key: string]: ComparableValue;
}
export type ComparableArray = readonly ComparableValue[];
export type ComparableValue = ComparablePrimitive | ComparableObject | ComparableArray;

export type ComparableProjection = ComparableObject;

export type ComparableScalarPolicy = "ordinary" | "url" | "boolean" | "yesNoBoolean" | "date" | "decimal" | "healthcareNumericUnknown";

type ComparableScalarValue = ComparablePrimitive;
type ComparableObjectInput = object;
type ComparableArrayInput = readonly ComparableInput[];
type ComparableInput = ComparableScalarValue | ComparableObjectInput | ComparableArrayInput;

const OPERATIONAL_METADATA_KEYS = new Set([
  "databaseUuid",
  "database_uuid",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
  "rowVersion",
  "row_version",
  "stateHash",
  "state_hash",
  "lastImportPlanId",
  "last_import_plan_id",
  "lastImportAt",
  "last_import_at",
  "auditId",
  "audit_id",
  "planId",
  "plan_id",
  "planHash",
  "plan_hash",
  "operationManifestHash",
  "operation_manifest_hash",
  "workbookHash",
  "workbook_hash",
  "contractSchemaVersion",
  "contract_schema_version",
  "preStateHash",
  "pre_state_hash",
  "canonicalPayloadHash",
  "canonical_payload_hash",
  "destinationId",
  "destination_id",
  "status",
  "warnings",
  "errors",
  "approvedScope",
]);

const KEYED_CHILD_MODULES = {
  facts: "factKey",
  scores: "scoreKey",
  neighborhoods: "neighborhoodKey",
  places: "placeKey",
  resources: "resourceKey",
  media: "mediaKey",
  propertyResources: "itemKey",
  moveChecklist: "checklistKey",
  eventsSeasonality: "eventSeasonalityKey",
  sources: "sourceKey",
} as const;

const URL_FIELDS = new Set(["url", "source_url", "image_url", "websiteUrl", "googleMapsUrl", "sourceUrl"]);

// verified/verifiedAt carry identical boolean/date semantics on every module's canonical type
// (confirmed: every DeterministicV31Canonical*State declares them as raw string|null) - a
// name-based policy here (mirroring URL_FIELDS) lets semantically-equal but differently-formatted
// representations (workbook "0"/"1" vs DB-stringified "false"/"true"; bare date vs full
// timestamptz) compare equal without changing what is actually stored.
const BOOLEAN_FIELDS = new Set(["verified"]);
const YES_NO_BOOLEAN_FIELDS = new Set(["privateCareAvailable", "transitSummary", "nonstopUsService"]);
const DECIMAL_FIELDS = new Set(["monthlyLow", "monthlyHigh", "avgHighTemp", "avgLowTemp", "precipitationMm", "humidityPct"]);
const DATE_FIELDS = new Set(["verifiedAt", "verified_at"]);

function normalizeStringValue(value: string): string | null {
  const normalized = value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  return normalized.length === 0 ? null : normalized;
}

function normalizeNumberValue(value: number): number | null {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Object.is(value, -0) ? 0 : value;
}

function normalizeUrlValue(value: string): string | null {
  const candidate = normalizeStringValue(value);
  if (candidate === null) {
    return null;
  }

  try {
    const parsed = new URL(candidate);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "http:" && protocol !== "https:") {
      return candidate;
    }

    const host = parsed.hostname.toLowerCase();
    const port = parsed.port;
    const defaultPort = protocol === "http:" ? "80" : "443";
    const effectiveHost = port && port !== defaultPort ? `${host}:${port}` : host;
    const pathname = parsed.pathname;
    const search = parsed.search;
    const hash = parsed.hash;

    if (pathname === "/" && search === "" && hash === "") {
      return `${protocol}//${effectiveHost}`;
    }

    return `${protocol}//${effectiveHost}${pathname}${search}${hash}`;
  } catch {
    return candidate;
  }
}

// Mirrors write-port.ts's coerceReplaceModuleColumnValue exactly, so the comparison layer's idea
// of "equal" never diverges from what the write layer would actually persist. Narrative text
// (e.g. "Yes") is never invented into a boolean - it falls through to ordinary string comparison.
function normalizeBooleanValue(value: string, allowYesNo = false): ComparablePrimitive | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || (allowYesNo && normalized === "yes")) {
    return true;
  }
  if (normalized === "false" || normalized === "0" || (allowYesNo && normalized === "no")) {
    return false;
  }
  return normalizeStringValue(value);
}

function normalizeDecimalValue(value: string): ComparablePrimitive | null {
  const normalized = normalizeStringValue(value);
  if (normalized === null || !/^-?\d+(?:\.\d+)?$/.test(normalized)) {
    return normalized;
  }
  return Number(normalized).toFixed(6).replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
}

// The workbook only ever supplies a bare calendar date; the DB returns a full timestamptz over
// the REST API. Day-granularity is therefore the correct comparison boundary for this field - not
// an invented precision the source data never had. Unparseable values fall through unchanged
// rather than being coerced into a fabricated date.
function normalizeDateValue(value: string): ComparablePrimitive | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return normalizeStringValue(value);
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeScalarValue(value: ComparableInput, policy: ComparableScalarPolicy = "ordinary"): ComparablePrimitive | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    if (policy === "healthcareNumericUnknown" && value.trim().toUpperCase() === "UNKNOWN") {
      return null;
    }
    if (policy === "url") {
      return normalizeUrlValue(value);
    }
    if (policy === "boolean") {
      return normalizeBooleanValue(value);
    }
    if (policy === "yesNoBoolean") {
      return normalizeBooleanValue(value, true);
    }
    if (policy === "decimal") {
      return normalizeDecimalValue(value);
    }
    if (policy === "date") {
      return normalizeDateValue(value);
    }
    return normalizeStringValue(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return normalizeNumberValue(value);
  }

  return null;
}

function isComparableObjectValue(value: unknown): value is ComparableObjectInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function projectComparableObject(value: ComparableObjectInput): ComparableObject {
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !OPERATIONAL_METADATA_KEYS.has(key))
    .sort(([left], [right]) => left.localeCompare(right));

  const projected: ComparableObject = {};
  for (const [key, entry] of entries) {
    projected[key] = projectComparableValue(entry, getFieldPolicy(key));
  }

  return projected;
}

function getFieldPolicy(fieldName: string): ComparableScalarPolicy {
  if (fieldName === "typicalGpVisitCost" || fieldName === "typicalSpecialistCost") {
    return "healthcareNumericUnknown";
  }
  if (URL_FIELDS.has(fieldName)) {
    return "url";
  }
  if (BOOLEAN_FIELDS.has(fieldName)) {
    return "boolean";
  }
  if (YES_NO_BOOLEAN_FIELDS.has(fieldName)) {
    return "yesNoBoolean";
  }
  if (DECIMAL_FIELDS.has(fieldName)) {
    return "decimal";
  }
  if (DATE_FIELDS.has(fieldName)) {
    return "date";
  }
  return "ordinary";
}

export function projectComparableValue(value: ComparableInput | unknown, policy: ComparableScalarPolicy = "ordinary"): ComparableValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return normalizeScalarValue(value, policy);
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return normalizeScalarValue(value, policy);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => projectComparableValue(entry));
  }

  if (isComparableObjectValue(value)) {
    return projectComparableObject(value);
  }

  return null;
}

export function projectKeyedChildArray<T extends ComparableObjectInput>(value: readonly T[], keyField: string): ComparableArray {
  const sorted = [...value].sort((left, right) => {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKey = String(leftRecord[keyField] ?? "");
    const rightKey = String(rightRecord[keyField] ?? "");
    return leftKey.localeCompare(rightKey);
  });

  return sorted.map((entry) => projectComparableObject(entry));
}

export function projectOrderedArray<T>(value: readonly T[]): ComparableArray {
  return value.map((entry) => projectComparableValue(entry));
}

function projectRecordKeyArray<T>(value: readonly T[]): ComparableArray {
  return [...projectOrderedArray(value)].sort((left: ComparableValue, right: ComparableValue) => {
    const leftKey = typeof left === "object" && left !== null && "itemKey" in left ? String(left.itemKey ?? "") : "";
    const rightKey = typeof right === "object" && right !== null && "itemKey" in right ? String(right.itemKey ?? "") : "";
    return leftKey.localeCompare(rightKey, undefined, { numeric: true });
  });
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

function pickFirst(record: Record<string, unknown>, fields: readonly string[]): unknown {
  for (const field of fields) {
    const value = record[field];
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  return null;
}

function pickNullableString(record: Record<string, unknown>, fields: readonly string[]): string | null {
  return toNullableString(pickFirst(record, fields));
}

export function projectKeyedChildComparableRow(module: KeyedChildModuleKey, value: unknown): ComparableObject {
  if (!isComparableObjectValue(value)) {
    return projectComparableObject({});
  }

  const record = value as Record<string, unknown>;

  switch (module) {
    case "facts":
      return projectComparableObject({
        factKey: pickNullableString(record, ["factKey", "fact_key"]),
        factGroup: pickNullableString(record, ["factGroup", "fact_group"]),
        valueText: pickNullableString(record, ["valueText", "value_text"]),
        displayLabel: pickNullableString(record, ["displayLabel", "display_label"]),
        sourceName: pickNullableString(record, ["sourceName", "source_name"]),
      });
    case "scores":
      // verified/verifiedAt are mutable parity fields, not identity - included here so a
      // verification-only change is classified UPDATE_CHILD instead of UNCHANGED_CHILD.
      return projectComparableObject({
        scoreKey: pickNullableString(record, ["scoreKey", "score_key"]),
        scoreValue: pickNullableString(record, ["scoreValue", "score_value"]),
        scoreLabel: pickNullableString(record, ["scoreLabel", "score_label"]),
        verified: pickNullableString(record, ["verified"]),
        verifiedAt: pickNullableString(record, ["verifiedAt", "verified_at"]),
      });
    case "neighborhoods":
      return projectComparableObject({
        neighborhoodKey: pickNullableString(record, ["neighborhoodKey", "neighborhood_key"]),
        name: pickNullableString(record, ["name", "neighborhood_name"]),
        summary: pickNullableString(record, ["summary"]),
        areaType: pickNullableString(record, ["areaType", "area_type"]),
        bestFor: pickNullableString(record, ["bestFor", "best_for"]),
        walkabilityRating: pickNullableString(record, ["walkabilityRating", "walkability_rating"]),
        safetyRating: pickNullableString(record, ["safetyRating", "safety_rating"]),
        transitRating: pickNullableString(record, ["transitRating", "transit_rating"]),
        housingCharacter: pickNullableString(record, ["housingCharacter", "housing_character"]),
        pros: pickNullableString(record, ["pros"]),
        cons: pickNullableString(record, ["cons"]),
        googleMapsUrl: pickNullableString(record, ["googleMapsUrl", "google_maps_url"]),
      });
    case "places":
      return projectComparableObject({
        placeKey: pickNullableString(record, ["placeKey", "place_key"]),
        category: pickNullableString(record, ["category", "category_key"]),
        name: pickNullableString(record, ["name", "place_name"]),
        description: pickNullableString(record, ["description"]),
        neighborhoodKey: pickNullableString(record, ["neighborhoodKey", "neighborhood_key"]),
        websiteUrl: pickNullableString(record, ["websiteUrl", "website_url"]),
        googleMapsUrl: pickNullableString(record, ["googleMapsUrl", "google_maps_url"]),
        sourceUrl: pickNullableString(record, ["sourceUrl", "source_url"]),
        address: pickNullableString(record, ["address"]),
        phone: pickNullableString(record, ["phone"]),
        displayOrder: pickNullableString(record, ["displayOrder", "display_order"]),
      });
    case "resources":
      return projectComparableObject({
        resourceKey: pickNullableString(record, ["resourceKey", "resource_key"]),
        category: pickNullableString(record, ["category", "resource_category"]),
        name: pickNullableString(record, ["name", "resource_name"]),
        url: pickNullableString(record, ["url"]),
      });
    case "media":
      return projectComparableObject({
        mediaKey: pickNullableString(record, ["mediaKey", "media_key"]),
        kind: pickNullableString(record, ["kind", "media_type"]),
        url: pickNullableString(record, ["url", "image_url"]),
        caption: pickNullableString(record, ["caption"]),
        altText: pickNullableString(record, ["altText", "subject"]),
        sourceName: pickNullableString(record, ["sourceName", "source_name"]),
        sourceUrl: pickNullableString(record, ["sourceUrl", "source_url"]),
        licenseNotes: pickNullableString(record, ["licenseNotes", "license_notes"]),
      });
    case "propertyResources":
      return projectComparableObject({
        itemKey: pickNullableString(record, ["itemKey", "resource_key"]),
        category: pickNullableString(record, ["category", "resource_type"]),
        name: pickNullableString(record, ["name", "resource_name"]),
        url: pickNullableString(record, ["url"]),
      });
    case "moveChecklist":
      return projectComparableObject({
        checklistKey: pickNullableString(record, ["checklistKey", "checklist_key"]),
        summary: pickNullableString(record, ["summary", "task"]),
        checklistNotes: pickNullableString(record, ["checklistNotes", "description"]),
      });
    case "eventsSeasonality":
      return projectComparableObject({
        eventSeasonalityKey: pickNullableString(record, ["eventSeasonalityKey", "event_season_key"]),
        summary: pickNullableString(record, ["summary", "description"]),
        seasonalityNotes: pickNullableString(record, ["seasonalityNotes", "weather_context"]),
      });
    case "sources":
      return projectComparableObject({
        sourceKey: pickNullableString(record, ["sourceKey", "source_key"]),
        name: pickNullableString(record, ["name", "source_name"]),
        url: pickNullableString(record, ["url", "source_url"]),
        type: pickNullableString(record, ["type", "source_type"]),
      });
  }
}

function toCanonicalFact(value: DeterministicV31CanonicalDestination["facts"][number]): ComparableObjectInput {
  return {
    factKey: value.factKey,
    factGroup: value.factGroup,
    valueText: value.valueText,
    displayLabel: value.displayLabel,
    sourceName: value.sourceName,
  };
}

function toCanonicalScore(value: DeterministicV31CanonicalDestination["scores"][number]): ComparableObjectInput {
  return {
    scoreKey: value.scoreKey,
    scoreValue: value.scoreValue,
    scoreLabel: value.scoreLabel,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalNeighborhood(value: DeterministicV31CanonicalDestination["neighborhoods"][number]): ComparableObjectInput {
  return {
    neighborhoodKey: value.neighborhood_key,
    name: value.neighborhood_name,
    summary: value.summary,
    areaType: value.area_type,
    bestFor: value.best_for,
    walkabilityRating: value.walkability_rating,
    safetyRating: value.safety_rating,
    transitRating: value.transit_rating,
    housingCharacter: value.housing_character,
    pros: value.pros,
    cons: value.cons,
    googleMapsUrl: value.google_maps_url,
  };
}

function toCanonicalPlace(value: DeterministicV31CanonicalDestination["places"][number]): ComparableObjectInput {
  return {
    placeKey: value.place_key,
    category: value.category_key,
    name: value.place_name,
    description: value.description,
    neighborhoodKey: value.neighborhood_key,
    websiteUrl: value.website_url,
    googleMapsUrl: value.google_maps_url,
    sourceUrl: value.source_url,
    address: value.address,
    phone: value.phone,
    displayOrder: value.display_order,
  };
}

function toCanonicalResource(value: DeterministicV31CanonicalDestination["resources"][number]): ComparableObjectInput {
  return {
    resourceKey: value.resource_key,
    category: value.resource_category,
    name: value.resource_name,
    url: value.url,
  };
}

function toCanonicalMedia(value: DeterministicV31CanonicalDestination["media"][number]): ComparableObjectInput {
  return {
    mediaKey: value.media_key,
    kind: value.media_type,
    url: value.image_url,
    caption: value.caption,
    altText: value.subject,
    sourceName: value.source_name,
    sourceUrl: value.source_url,
    licenseNotes: value.license_notes,
  };
}

function toCanonicalCostOfLivingItem(value: DeterministicV31CanonicalDestination["costOfLiving"][number]): ComparableObjectInput {
  return {
    itemKey: value.record_key,
    category: value.category,
    monthlyLow: value.monthly_low,
    monthlyHigh: value.monthly_high,
    currency: value.currency,
    householdType: value.household_type,
    lifestyleTier: value.lifestyle_tier,
    stayModeKey: value.stay_mode_key,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalClimateMonth(value: DeterministicV31CanonicalDestination["climateMonthly"][number]): ComparableObjectInput {
  return {
    monthKey: value.month,
    avgHighTemp: value.avg_high_c,
    avgLowTemp: value.avg_low_c,
    precipitationMm: value.rainfall_mm,
    humidityPct: value.humidity_pct,
  };
}

function toCanonicalHousingState(value: DeterministicV31CanonicalDestination["housing"][number]): ComparableObjectInput {
  return {
    summary: value.restrictions_summary,
    buyingSummary: value.buying_process_summary,
    rentalSummary: value.rental_rules_notes,
    stayModeKey: value.stay_mode_key,
    canForeignersBuy: value.can_foreigners_buy,
    residencyRequiredToBuy: value.residency_required_to_buy,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalPropertyResource(value: DeterministicV31CanonicalDestination["propertyResources"][number]): ComparableObjectInput {
  return {
    itemKey: value.resource_key,
    category: value.resource_type,
    name: value.resource_name,
    url: value.url,
  };
}

function toCanonicalHealthcareState(value: DeterministicV31CanonicalDestination["healthcare"][number]): ComparableObjectInput {
  return {
    summary: value.system_summary,
    publicAccessSummary: value.public_access_foreigners,
    insuranceSummary: value.international_insurance_notes,
    privateCareAvailable: value.private_care_available,
    topic: value.topic,
    englishSpeakingCare: value.english_speaking_care,
    typicalGpVisitCost: value.typical_gp_visit_cost,
    typicalSpecialistCost: value.typical_specialist_cost,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalVisaResidencyState(value: DeterministicV31CanonicalDestination["visaResidency"][number]): ComparableObjectInput {
  return {
    summary: value.visa_type,
    residencyPath: value.permanent_residency_path,
    citizenshipPath: value.citizenship_path,
    stayModeKey: value.stay_mode_key,
    travelerNationality: value.traveler_nationality,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalTaxFinanceState(value: DeterministicV31CanonicalDestination["taxesFinance"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    notes: value.income_tax_notes,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalLgbtqInclusivityState(value: DeterministicV31CanonicalDestination["lgbtqInclusivity"][number]): ComparableObjectInput {
  return {
    summary: value.evidence_summary,
    culturalNotes: value.community_scene,
    overallRating: value.overall_rating,
    legalProtections: value.legal_protections,
    socialAcceptance: value.social_acceptance,
    prideEvents: value.pride_events,
    nightlifeSocial: value.nightlife_social,
    healthcareAccess: value.healthcare_access,
    areasResources: value.areas_resources,
    safetyConsiderations: value.safety_considerations,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalSafetyRisk(value: DeterministicV31CanonicalDestination["safetyRisks"][number]): ComparableObjectInput {
  return {
    itemKey: value.record_key,
    topic: value.risk_type,
    severity: value.severity,
    summary: value.summary,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalTransportationState(value: DeterministicV31CanonicalDestination["transportation"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    airportSummary: value.name,
    transitSummary: value.public_transit_available,
    topic: value.topic,
    distanceKm: value.distance_km,
    typicalDriveMinutes: value.typical_drive_minutes,
    nonstopUsService: value.nonstop_us_service,
    carNeededRating: value.car_needed_rating,
    parkingNotes: value.parking_notes,
    rideshareNotes: value.rideshare_notes,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalRemoteWorkState(value: DeterministicV31CanonicalDestination["remoteWork"][number]): ComparableObjectInput {
  return {
    summary: value.remote_work_notes,
    internetSummary: value.avg_download_mbps,
    timezoneSummary: value.us_time_zone_fit,
    fiberAvailable: value.fiber_available,
    mobile5g: value.mobile_5g,
    utilityReliability: value.utility_reliability,
    coworkingSummary: value.coworking_summary,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalLanguageIntegrationState(value: DeterministicV31CanonicalDestination["languageIntegration"][number]): ComparableObjectInput {
  return {
    summary: value.integration_notes,
    englishSupport: value.can_function_in_english,
    primaryLanguage: value.primary_language,
    englishProficiency: value.english_proficiency,
    governmentEnglishAccess: value.government_english_access,
    medicalEnglishAccess: value.medical_english_access,
    languageResources: value.language_resources,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalPetState(value: DeterministicV31CanonicalDestination["pets"][number]): ComparableObjectInput {
  return {
    summary: value.pet_friendly_rentals,
    petFriendlyNotes: value.dog_parks_summary,
  };
}

function toCanonicalFamilyEducationState(value: DeterministicV31CanonicalDestination["familyEducation"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    schoolsSummary: value.universities,
  };
}

function toCanonicalCommunitySocialState(value: DeterministicV31CanonicalDestination["communitySocial"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    socialNotes: value.clubs_groups,
    expatPresence: value.expat_presence,
    volunteering: value.volunteering,
    easeMeetingPeople: value.ease_meeting_people,
    ageMix: value.age_mix,
    transientVsRooted: value.transient_vs_rooted,
    verified: value.verified,
    verifiedAt: value.verified_at,
  };
}

function toCanonicalAccessibilityState(value: DeterministicV31CanonicalDestination["accessibility"][number]): ComparableObjectInput {
  return {
    summary: value.mobility_notes,
    mobilityNotes: value.wheelchair_access,
  };
}

function toCanonicalBureaucracySetupState(value: DeterministicV31CanonicalDestination["bureaucracySetup"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    setupNotes: value.typical_documents,
  };
}

function toCanonicalWorkBusinessState(value: DeterministicV31CanonicalDestination["workBusiness"][number]): ComparableObjectInput {
  return {
    summary: value.employment_notes,
    remoteWorkNotes: value.remote_work_suitability,
  };
}

function toCanonicalRetirementAgingState(value: DeterministicV31CanonicalDestination["retirementAging"][number]): ComparableObjectInput {
  return {
    summary: value.retirement_notes,
    agingNotes: value.assisted_living,
  };
}

function toCanonicalLifestyleLawState(value: DeterministicV31CanonicalDestination["lifestyleLaws"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    legalNotes: value.important_rules,
  };
}

function toCanonicalLifestyleFeature(value: DeterministicV31CanonicalDestination["lifestyleFeatures"][number]): ComparableObjectInput {
  return {
    recordKey: value.record_key,
    featureGroup: value.feature_group,
    featureKey: value.feature_key,
    featureValue: value.feature_value,
    availabilityLevel: value.availability_level,
    proximityBand: value.proximity_band,
    displayLabel: value.display_label ?? value.display_name ?? null,
    evidenceSummary: value.evidence_summary,
    sourceName: value.source_name,
    sourceUrl: value.source_url,
    sourceAsOfDate: value.source_as_of_date,
    confidence: value.confidence,
    matchingEnabled: value.matching_enabled,
    displayEnabled: value.display_enabled,
    notes: value.notes,
  };
}

function toCanonicalRealityCheckEntry(value: DeterministicV31CanonicalDestination["realityCheck"][number]): ComparableObjectInput {
  return {
    itemKey: value.record_key,
    title: value.title,
    detail: value.detail,
    severity: value.severity,
  };
}

function toCanonicalMoveChecklistState(value: DeterministicV31CanonicalDestination["moveChecklist"][number]): ComparableObjectInput {
  return {
    checklistKey: value.checklist_key,
    summary: value.task,
    checklistNotes: value.description,
  };
}

function toCanonicalEnvironmentQualityState(value: DeterministicV31CanonicalDestination["environmentQuality"]): ComparableObjectInput {
  return {
    summary: value?.air_quality_summary ?? null,
    qualityNotes: value?.water_quality_summary ?? null,
  };
}

function toCanonicalDailyLifePracticalityState(value: DeterministicV31CanonicalDestination["dailyLifePracticality"]): ComparableObjectInput {
  return {
    summary: value?.grocery_access ?? null,
    practicalityNotes: value?.things_residents_wish_they_knew ?? null,
  };
}

function toCanonicalEventsSeasonalityState(value: DeterministicV31CanonicalDestination["eventsSeasonality"][number]): ComparableObjectInput {
  return {
    eventSeasonalityKey: value.event_season_key,
    summary: value.description,
    seasonalityNotes: value.weather_context,
  };
}

function toCanonicalSource(value: DeterministicV31CanonicalDestination["sources"][number]): ComparableObjectInput {
  return {
    sourceKey: value.source_key,
    name: value.source_name,
    url: value.source_url,
    type: value.source_type,
  };
}

function isCanonicalDestinationState(value: StoredDestinationState | DeterministicV31CanonicalDestination): value is DeterministicV31CanonicalDestination {
  const neighborhoods = value.neighborhoods;
  const places = value.places;
  const resources = value.resources;
  const sources = value.sources;
  const firstNeighborhood = neighborhoods[0];
  if (firstNeighborhood && typeof firstNeighborhood === "object" && "neighborhood_name" in firstNeighborhood) {
    return true;
  }
  const firstPlace = places[0];
  if (firstPlace && typeof firstPlace === "object" && "place_name" in firstPlace) {
    return true;
  }
  const firstResource = resources[0];
  if (firstResource && typeof firstResource === "object" && "resource_name" in firstResource) {
    return true;
  }
  const firstSource = sources[0];
  if (firstSource && typeof firstSource === "object" && "source_name" in firstSource) {
    return true;
  }
  return false;
}

export function projectStoredComparable(state: StoredDestinationState): ComparableProjection {
  const projection: ComparableObject = {
    identity: projectComparableObject({
      ...state.identity,
      beachAccess: state.identity.beachAccess ?? null,
      mountainOrSkiAccess: state.identity.mountainOrSkiAccess ?? null,
      countryCode: state.identity.countryCode ?? null,
      population: state.identity.population ?? null,
      metroPopulation: state.identity.metroPopulation ?? null,
      elevation: state.identity.elevation ?? null,
    }),
    editorial: projectComparableObject(state.editorial),
    facts: projectKeyedChildArray(state.facts, KEYED_CHILD_MODULES.facts),
    scores: projectKeyedChildArray(state.scores.map((entry) => projectKeyedChildComparableRow("scores", entry)), KEYED_CHILD_MODULES.scores),
    neighborhoods: projectKeyedChildArray(state.neighborhoods, KEYED_CHILD_MODULES.neighborhoods),
    places: projectKeyedChildArray(state.places, KEYED_CHILD_MODULES.places),
    resources: projectKeyedChildArray(state.resources.map((entry) => projectKeyedChildComparableRow("resources", entry)), KEYED_CHILD_MODULES.resources),
    media: projectKeyedChildArray(state.media, KEYED_CHILD_MODULES.media),
    costOfLiving: projectRecordKeyArray(state.costOfLiving),
    climateMonthly: projectOrderedArray(state.climateMonthly),
    housing: projectOrderedArray(state.housing),
    propertyResources: projectKeyedChildArray(state.propertyResources.map((entry) => projectKeyedChildComparableRow("propertyResources", entry)), KEYED_CHILD_MODULES.propertyResources),
    healthcare: projectOrderedArray(state.healthcare),
    visaResidency: projectOrderedArray(state.visaResidency),
    taxesFinance: projectOrderedArray(state.taxesFinance),
    lgbtqInclusivity: projectOrderedArray(state.lgbtqInclusivity),
    safetyRisks: projectRecordKeyArray(state.safetyRisks),
    transportation: projectOrderedArray(state.transportation),
    remoteWork: projectOrderedArray(state.remoteWork),
    languageIntegration: projectOrderedArray(state.languageIntegration),
    pets: projectOrderedArray(state.pets),
    familyEducation: projectOrderedArray(state.familyEducation),
    communitySocial: projectOrderedArray(state.communitySocial),
    accessibility: projectOrderedArray(state.accessibility),
    bureaucracySetup: projectOrderedArray(state.bureaucracySetup),
    workBusiness: projectOrderedArray(state.workBusiness),
    retirementAging: projectOrderedArray(state.retirementAging),
    lifestyleLaws: projectOrderedArray(state.lifestyleLaws),
    realityCheck: projectRecordKeyArray(state.realityCheck),
    moveChecklist: projectKeyedChildArray(state.moveChecklist, KEYED_CHILD_MODULES.moveChecklist),
    environmentQuality: state.environmentQuality === null ? null : projectComparableObject({ summary: state.environmentQuality.summary, qualityNotes: state.environmentQuality.qualityNotes }),
    dailyLifePracticality: state.dailyLifePracticality === null ? null : projectComparableObject({ summary: state.dailyLifePracticality.summary, practicalityNotes: state.dailyLifePracticality.practicalityNotes }),
    eventsSeasonality: projectKeyedChildArray(state.eventsSeasonality, KEYED_CHILD_MODULES.eventsSeasonality),
    sources: projectKeyedChildArray(state.sources, KEYED_CHILD_MODULES.sources),
    lifestyleFeatures: projectKeyedChildArray(state.lifestyleFeatures ?? [], "recordKey"),
  };

  return projection;
}

export function projectCanonicalComparable(state: DeterministicV31CanonicalDestination): ComparableProjection {
  const projection: ComparableObject = {
    identity: projectComparableObject({
      ...state.identity,
      beachAccess: state.destinationRow?.beach_access ?? null,
      mountainOrSkiAccess: state.destinationRow?.mountain_or_ski_access ?? null,
      countryCode: state.destinationRow?.country_code ?? null,
      population: state.identity.population ?? null,
      metroPopulation: state.identity.metroPopulation ?? null,
      elevation: state.identity.elevation ?? null,
    }),
    editorial: projectComparableObject(state.editorial),
    facts: projectKeyedChildArray(state.facts.map(toCanonicalFact), KEYED_CHILD_MODULES.facts),
    scores: projectKeyedChildArray(state.scores.map(toCanonicalScore), KEYED_CHILD_MODULES.scores),
    neighborhoods: projectKeyedChildArray(state.neighborhoods.map(toCanonicalNeighborhood), KEYED_CHILD_MODULES.neighborhoods),
    places: projectKeyedChildArray(state.places.map(toCanonicalPlace), KEYED_CHILD_MODULES.places),
    resources: projectKeyedChildArray(state.resources.map(toCanonicalResource), KEYED_CHILD_MODULES.resources),
    media: projectKeyedChildArray(state.media.map(toCanonicalMedia), KEYED_CHILD_MODULES.media),
    costOfLiving: projectRecordKeyArray(state.costOfLiving.map(toCanonicalCostOfLivingItem)),
    climateMonthly: projectOrderedArray(state.climateMonthly.map(toCanonicalClimateMonth)),
    housing: projectOrderedArray(state.housing.map(toCanonicalHousingState)),
    propertyResources: projectKeyedChildArray(state.propertyResources.map(toCanonicalPropertyResource), KEYED_CHILD_MODULES.propertyResources),
    healthcare: projectOrderedArray(state.healthcare.map(toCanonicalHealthcareState)),
    visaResidency: projectOrderedArray(state.visaResidency.map(toCanonicalVisaResidencyState)),
    taxesFinance: projectOrderedArray(state.taxesFinance.map(toCanonicalTaxFinanceState)),
    lgbtqInclusivity: projectOrderedArray(state.lgbtqInclusivity.map(toCanonicalLgbtqInclusivityState)),
    safetyRisks: projectRecordKeyArray(state.safetyRisks.map(toCanonicalSafetyRisk)),
    transportation: projectOrderedArray(state.transportation.map(toCanonicalTransportationState)),
    remoteWork: projectOrderedArray(state.remoteWork.map(toCanonicalRemoteWorkState)),
    languageIntegration: projectOrderedArray(state.languageIntegration.map(toCanonicalLanguageIntegrationState)),
    pets: projectOrderedArray(state.pets.map(toCanonicalPetState)),
    familyEducation: projectOrderedArray(state.familyEducation.map(toCanonicalFamilyEducationState)),
    communitySocial: projectOrderedArray(state.communitySocial.map(toCanonicalCommunitySocialState)),
    accessibility: projectOrderedArray(state.accessibility.map(toCanonicalAccessibilityState)),
    bureaucracySetup: projectOrderedArray(state.bureaucracySetup.map(toCanonicalBureaucracySetupState)),
    workBusiness: projectOrderedArray(state.workBusiness.map(toCanonicalWorkBusinessState)),
    retirementAging: projectOrderedArray(state.retirementAging.map(toCanonicalRetirementAgingState)),
    lifestyleLaws: projectOrderedArray(state.lifestyleLaws.map(toCanonicalLifestyleLawState)),
    realityCheck: projectRecordKeyArray(state.realityCheck.map(toCanonicalRealityCheckEntry)),
    moveChecklist: projectKeyedChildArray(state.moveChecklist.map(toCanonicalMoveChecklistState), KEYED_CHILD_MODULES.moveChecklist),
    environmentQuality: state.environmentQuality === null ? null : projectComparableValue(toCanonicalEnvironmentQualityState(state.environmentQuality)),
    dailyLifePracticality: state.dailyLifePracticality === null ? null : projectComparableValue(toCanonicalDailyLifePracticalityState(state.dailyLifePracticality)),
    eventsSeasonality: projectKeyedChildArray(state.eventsSeasonality.map(toCanonicalEventsSeasonalityState), KEYED_CHILD_MODULES.eventsSeasonality),
    sources: projectKeyedChildArray(state.sources.map(toCanonicalSource), KEYED_CHILD_MODULES.sources),
    lifestyleFeatures: projectKeyedChildArray((state.lifestyleFeatures ?? []).map(toCanonicalLifestyleFeature), "recordKey"),
  };

  return projection;
}

export function projectComparable(state: StoredDestinationState | DeterministicV31CanonicalDestination): ComparableProjection {
  if (isCanonicalDestinationState(state)) {
    return projectCanonicalComparable(state);
  }

  return projectStoredComparable(state);
}
