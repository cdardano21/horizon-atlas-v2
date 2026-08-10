import { describe, expect, it } from "vitest";
import type {
  DeterministicV31CanonicalAccessibilityState,
  DeterministicV31CanonicalBureaucracySetupState,
  DeterministicV31CanonicalClimateMonth,
  DeterministicV31CanonicalCommunitySocialState,
  DeterministicV31CanonicalCostOfLivingItem,
  DeterministicV31CanonicalDailyLifePracticalityState,
  DeterministicV31CanonicalDestination,
  DeterministicV31CanonicalEnvironmentQualityState,
  DeterministicV31CanonicalEventsSeasonalityState,
  DeterministicV31CanonicalFact,
  DeterministicV31CanonicalFamilyEducationState,
  DeterministicV31CanonicalHealthcareState,
  DeterministicV31CanonicalHousingState,
  DeterministicV31CanonicalLanguageIntegrationState,
  DeterministicV31CanonicalLifestyleLawState,
  DeterministicV31CanonicalLgbtqInclusivityState,
  DeterministicV31CanonicalMedia,
  DeterministicV31CanonicalMoveChecklistState,
  DeterministicV31CanonicalNeighborhood,
  DeterministicV31CanonicalPetState,
  DeterministicV31CanonicalPlace,
  DeterministicV31CanonicalPropertyResource,
  DeterministicV31CanonicalRealityCheckEntry,
  DeterministicV31CanonicalRemoteWorkState,
  DeterministicV31CanonicalResource,
  DeterministicV31CanonicalRetirementAgingState,
  DeterministicV31CanonicalSafetyRisk,
  DeterministicV31CanonicalScore,
  DeterministicV31CanonicalSource,
  DeterministicV31CanonicalTaxFinanceState,
  DeterministicV31CanonicalTransportationState,
  DeterministicV31CanonicalVisaResidencyState,
  DeterministicV31CanonicalWorkBusinessState,
} from "./workbook-v31-deterministic-core";

const validFact: DeterministicV31CanonicalFact = {
  destination_key: "new-braunfels-tx-us",
  record_key: "fact-1",
  fact_group: "overview",
  fact_key: "climate",
  display_label: "Climate",
  value_text: "Warm",
  value_number: null,
  unit: null,
  qualitative_rating: null,
  stay_mode_key: null,
  display_order: null,
  source_name: "Workbook",
  source_url: null,
  verified: null,
  verified_at: null,
  confidence: null,
  notes: null,
  factKey: "climate",
  factGroup: "overview",
  valueText: "Warm",
  displayLabel: "Climate",
  sourceName: "Workbook",
};

const validScore: DeterministicV31CanonicalScore = {
  destination_key: "new-braunfels-tx-us",
  score_key: "retirement",
  score_value: "82",
  score_label: "Retirement",
  methodology_version: "v3.1",
  evidence_summary: null,
  source_url: null,
  verified: null,
  verified_at: null,
  scoreKey: "retirement",
  scoreValue: "82",
  scoreLabel: "Retirement",
  methodologyVersion: "v3.1",
};

const validNeighborhood: DeterministicV31CanonicalNeighborhood = {
  destination_key: "new-braunfels-tx-us",
  neighborhood_key: "nb-1",
  neighborhood_name: "Downtown",
  area_type: null,
  best_for: null,
  summary: null,
  housing_character: null,
  typical_rent_low: null,
  typical_rent_high: null,
  typical_home_price: null,
  walkability_rating: null,
  safety_rating: null,
  transit_rating: null,
  pros: null,
  cons: null,
  google_maps_url: null,
  source_url: null,
  verified: null,
  verified_at: null,
};

const validDestination: DeterministicV31CanonicalDestination = {
  identity: {
    destinationKey: "new-braunfels-tx-us",
    slug: "new-braunfels-texas",
    name: "New Braunfels",
    city: "New Braunfels",
    country: "United States",
  },
  editorial: {
    shortDescription: "A vibrant Texas Hill Country city",
    longDescription: null,
    currency: "USD",
    primaryLanguage: "English",
    timeZone: "CDT",
  },
  facts: [validFact],
  scores: [validScore],
  neighborhoods: [validNeighborhood],
  places: [] as DeterministicV31CanonicalPlace[],
  resources: [] as DeterministicV31CanonicalResource[],
  media: [] as DeterministicV31CanonicalMedia[],
  costOfLiving: [] as DeterministicV31CanonicalCostOfLivingItem[],
  climateMonthly: [] as DeterministicV31CanonicalClimateMonth[],
  housing: [] as DeterministicV31CanonicalHousingState[],
  propertyResources: [] as DeterministicV31CanonicalPropertyResource[],
  healthcare: [] as DeterministicV31CanonicalHealthcareState[],
  visaResidency: [] as DeterministicV31CanonicalVisaResidencyState[],
  taxesFinance: [] as DeterministicV31CanonicalTaxFinanceState[],
  lgbtqInclusivity: [] as DeterministicV31CanonicalLgbtqInclusivityState[],
  safetyRisks: [] as DeterministicV31CanonicalSafetyRisk[],
  transportation: [] as DeterministicV31CanonicalTransportationState[],
  remoteWork: [] as DeterministicV31CanonicalRemoteWorkState[],
  languageIntegration: [] as DeterministicV31CanonicalLanguageIntegrationState[],
  pets: [] as DeterministicV31CanonicalPetState[],
  familyEducation: [] as DeterministicV31CanonicalFamilyEducationState[],
  communitySocial: [] as DeterministicV31CanonicalCommunitySocialState[],
  accessibility: [] as DeterministicV31CanonicalAccessibilityState[],
  bureaucracySetup: [] as DeterministicV31CanonicalBureaucracySetupState[],
  workBusiness: [] as DeterministicV31CanonicalWorkBusinessState[],
  retirementAging: [] as DeterministicV31CanonicalRetirementAgingState[],
  lifestyleLaws: [] as DeterministicV31CanonicalLifestyleLawState[],
  realityCheck: [] as DeterministicV31CanonicalRealityCheckEntry[],
  moveChecklist: [] as DeterministicV31CanonicalMoveChecklistState[],
  environmentQuality: null as DeterministicV31CanonicalEnvironmentQualityState | null,
  dailyLifePracticality: null as DeterministicV31CanonicalDailyLifePracticalityState | null,
  eventsSeasonality: [] as DeterministicV31CanonicalEventsSeasonalityState[],
  sources: [] as DeterministicV31CanonicalSource[],
};

const nullAccepted: DeterministicV31CanonicalFact["value_text"] = null;
const stringAccepted: DeterministicV31CanonicalFact["value_text"] = "warm";
const destinationKeyAccepted: DeterministicV31CanonicalNeighborhood["destination_key"] = validDestination.identity.destinationKey;

// @ts-expect-error Missing required field should fail.
const missingRequiredField: DeterministicV31CanonicalFact = {
  destination_key: "new-braunfels-tx-us",
  record_key: null,
  fact_group: null,
  fact_key: null,
  display_label: null,
  value_text: null,
  value_number: null,
  unit: null,
  qualitative_rating: null,
  stay_mode_key: null,
  display_order: null,
  source_name: null,
  source_url: null,
  verified: null,
  verified_at: null,
  confidence: null,
  notes: null,
  factKey: null,
  factGroup: null,
  valueText: null,
  displayLabel: null,
};

const inventedField: DeterministicV31CanonicalFact = {
  ...validFact,
  // @ts-expect-error Invented field should fail.
  inventedField: "unexpected",
};

// @ts-expect-error Wrong field type should fail.
const wrongFieldType: DeterministicV31CanonicalFact["factKey"] = 1;

const wrongCardinality: DeterministicV31CanonicalDestination["facts"] = {
  // @ts-expect-error Wrong module cardinality should fail.
  destination_key: null,
};

// @ts-expect-error Null should be accepted only where runtime emits null.
const nullOnlyAccepted: DeterministicV31CanonicalFact["value_text"] = 0;

describe("workbook v3.1 canonical type contract", () => {
  it("compiles the canonical contract and its negative cases", () => {
    expect(validDestination.identity.destinationKey).toBe("new-braunfels-tx-us");
    expect(nullAccepted).toBeNull();
    expect(stringAccepted).toBe("warm");
    expect(destinationKeyAccepted).toBe("new-braunfels-tx-us");
  });
});

void validDestination;
void nullAccepted;
void stringAccepted;
void destinationKeyAccepted;
