import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { StoredDestinationState } from "./types";

export type ComparablePrimitive = null | string | number | boolean;
export interface ComparableObject {
  [key: string]: ComparableValue;
}
export type ComparableArray = readonly ComparableValue[];
export type ComparableValue = ComparablePrimitive | ComparableObject | ComparableArray;

export type ComparableProjection = ComparableObject;

export type ComparableScalarPolicy = "ordinary" | "url";

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

function normalizeScalarValue(value: ComparableInput, policy: ComparableScalarPolicy = "ordinary"): ComparablePrimitive | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    if (policy === "url") {
      return normalizeUrlValue(value);
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
  return URL_FIELDS.has(fieldName) ? "url" : "ordinary";
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
    methodologyVersion: value.methodologyVersion,
  };
}

function toCanonicalNeighborhood(value: DeterministicV31CanonicalDestination["neighborhoods"][number]): ComparableObjectInput {
  return {
    neighborhoodKey: value.neighborhood_key,
    name: value.neighborhood_name,
    summary: value.summary,
    areaType: value.area_type,
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
  };
}

function toCanonicalCostOfLivingItem(value: DeterministicV31CanonicalDestination["costOfLiving"][number]): ComparableObjectInput {
  return {
    itemKey: value.record_key,
    category: value.category,
    monthlyLow: value.monthly_low,
    monthlyHigh: value.monthly_high,
    currency: value.currency,
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
  };
}

function toCanonicalVisaResidencyState(value: DeterministicV31CanonicalDestination["visaResidency"][number]): ComparableObjectInput {
  return {
    summary: value.visa_type,
    residencyPath: value.permanent_residency_path,
    citizenshipPath: value.citizenship_path,
  };
}

function toCanonicalTaxFinanceState(value: DeterministicV31CanonicalDestination["taxesFinance"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    notes: value.income_tax_notes,
  };
}

function toCanonicalLgbtqInclusivityState(value: DeterministicV31CanonicalDestination["lgbtqInclusivity"][number]): ComparableObjectInput {
  return {
    summary: value.evidence_summary,
    culturalNotes: value.community_scene,
  };
}

function toCanonicalSafetyRisk(value: DeterministicV31CanonicalDestination["safetyRisks"][number]): ComparableObjectInput {
  return {
    itemKey: value.record_key,
    topic: value.risk_type,
    severity: value.severity,
    summary: value.summary,
  };
}

function toCanonicalTransportationState(value: DeterministicV31CanonicalDestination["transportation"][number]): ComparableObjectInput {
  return {
    summary: value.summary,
    airportSummary: value.name,
    transitSummary: value.public_transit_available,
  };
}

function toCanonicalRemoteWorkState(value: DeterministicV31CanonicalDestination["remoteWork"][number]): ComparableObjectInput {
  return {
    summary: value.remote_work_notes,
    internetSummary: value.avg_download_mbps,
    timezoneSummary: value.us_time_zone_fit,
  };
}

function toCanonicalLanguageIntegrationState(value: DeterministicV31CanonicalDestination["languageIntegration"][number]): ComparableObjectInput {
  return {
    summary: value.integration_notes,
    englishSupport: value.can_function_in_english,
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
    identity: projectComparableObject(state.identity),
    editorial: projectComparableObject(state.editorial),
    facts: projectKeyedChildArray(state.facts, KEYED_CHILD_MODULES.facts),
    scores: projectKeyedChildArray(state.scores, KEYED_CHILD_MODULES.scores),
    neighborhoods: projectKeyedChildArray(state.neighborhoods, KEYED_CHILD_MODULES.neighborhoods),
    places: projectKeyedChildArray(state.places, KEYED_CHILD_MODULES.places),
    resources: projectKeyedChildArray(state.resources, KEYED_CHILD_MODULES.resources),
    media: projectKeyedChildArray(state.media, KEYED_CHILD_MODULES.media),
    costOfLiving: projectOrderedArray(state.costOfLiving),
    climateMonthly: projectOrderedArray(state.climateMonthly),
    housing: projectOrderedArray(state.housing),
    propertyResources: projectKeyedChildArray(state.propertyResources, KEYED_CHILD_MODULES.propertyResources),
    healthcare: projectOrderedArray(state.healthcare),
    visaResidency: projectOrderedArray(state.visaResidency),
    taxesFinance: projectOrderedArray(state.taxesFinance),
    lgbtqInclusivity: projectOrderedArray(state.lgbtqInclusivity),
    safetyRisks: projectOrderedArray(state.safetyRisks),
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
    realityCheck: projectOrderedArray(state.realityCheck),
    moveChecklist: projectKeyedChildArray(state.moveChecklist, KEYED_CHILD_MODULES.moveChecklist),
    environmentQuality: state.environmentQuality === null ? null : projectComparableValue(state.environmentQuality),
    dailyLifePracticality: state.dailyLifePracticality === null ? null : projectComparableValue(state.dailyLifePracticality),
    eventsSeasonality: projectKeyedChildArray(state.eventsSeasonality, KEYED_CHILD_MODULES.eventsSeasonality),
    sources: projectKeyedChildArray(state.sources, KEYED_CHILD_MODULES.sources),
  };

  return projection;
}

export function projectCanonicalComparable(state: DeterministicV31CanonicalDestination): ComparableProjection {
  const projection: ComparableObject = {
    identity: projectComparableObject(state.identity),
    editorial: projectComparableObject(state.editorial),
    facts: projectKeyedChildArray(state.facts.map(toCanonicalFact), KEYED_CHILD_MODULES.facts),
    scores: projectKeyedChildArray(state.scores.map(toCanonicalScore), KEYED_CHILD_MODULES.scores),
    neighborhoods: projectKeyedChildArray(state.neighborhoods.map(toCanonicalNeighborhood), KEYED_CHILD_MODULES.neighborhoods),
    places: projectKeyedChildArray(state.places.map(toCanonicalPlace), KEYED_CHILD_MODULES.places),
    resources: projectKeyedChildArray(state.resources.map(toCanonicalResource), KEYED_CHILD_MODULES.resources),
    media: projectKeyedChildArray(state.media.map(toCanonicalMedia), KEYED_CHILD_MODULES.media),
    costOfLiving: projectOrderedArray(state.costOfLiving.map(toCanonicalCostOfLivingItem)),
    climateMonthly: projectOrderedArray(state.climateMonthly.map(toCanonicalClimateMonth)),
    housing: projectOrderedArray(state.housing.map(toCanonicalHousingState)),
    propertyResources: projectKeyedChildArray(state.propertyResources.map(toCanonicalPropertyResource), KEYED_CHILD_MODULES.propertyResources),
    healthcare: projectOrderedArray(state.healthcare.map(toCanonicalHealthcareState)),
    visaResidency: projectOrderedArray(state.visaResidency.map(toCanonicalVisaResidencyState)),
    taxesFinance: projectOrderedArray(state.taxesFinance.map(toCanonicalTaxFinanceState)),
    lgbtqInclusivity: projectOrderedArray(state.lgbtqInclusivity.map(toCanonicalLgbtqInclusivityState)),
    safetyRisks: projectOrderedArray(state.safetyRisks.map(toCanonicalSafetyRisk)),
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
    realityCheck: projectOrderedArray(state.realityCheck.map(toCanonicalRealityCheckEntry)),
    moveChecklist: projectKeyedChildArray(state.moveChecklist.map(toCanonicalMoveChecklistState), KEYED_CHILD_MODULES.moveChecklist),
    environmentQuality: state.environmentQuality === null ? null : projectComparableValue(toCanonicalEnvironmentQualityState(state.environmentQuality)),
    dailyLifePracticality: state.dailyLifePracticality === null ? null : projectComparableValue(toCanonicalDailyLifePracticalityState(state.dailyLifePracticality)),
    eventsSeasonality: projectKeyedChildArray(state.eventsSeasonality.map(toCanonicalEventsSeasonalityState), KEYED_CHILD_MODULES.eventsSeasonality),
    sources: projectKeyedChildArray(state.sources.map(toCanonicalSource), KEYED_CHILD_MODULES.sources),
  };

  return projection;
}

export function projectComparable(state: StoredDestinationState | DeterministicV31CanonicalDestination): ComparableProjection {
  if (isCanonicalDestinationState(state)) {
    return projectCanonicalComparable(state);
  }

  return projectStoredComparable(state);
}
