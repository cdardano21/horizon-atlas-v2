import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";
import type { CanonicalDestinationKey, StoredDestinationState } from "../index";
import { projectCanonicalComparable, projectComparable, projectComparableObject, projectComparableValue, projectKeyedChildArray, projectKeyedChildComparableRow, projectOrderedArray, projectStoredComparable } from "../comparable-projection";

const asDestinationKey = (value: string): CanonicalDestinationKey => value as CanonicalDestinationKey;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      if (nested && typeof nested === "object") {
        deepFreeze(nested);
      }
    }
  }
  return value;
}

function createCanonicalFact(overrides: Partial<DeterministicV31CanonicalDestination["facts"][number]> = {}): DeterministicV31CanonicalDestination["facts"][number] {
  return {
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
    sourceName: null,
    ...overrides,
  };
}

function createCanonicalScore(overrides: Partial<DeterministicV31CanonicalDestination["scores"][number]> = {}): DeterministicV31CanonicalDestination["scores"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    score_key: null,
    score_value: null,
    score_label: null,
    methodology_version: null,
    evidence_summary: null,
    source_url: null,
    verified: null,
    verified_at: null,
    scoreKey: null,
    scoreValue: null,
    scoreLabel: null,
    methodologyVersion: null,
    ...overrides,
  };
}

function createCanonicalNeighborhood(overrides: Partial<DeterministicV31CanonicalDestination["neighborhoods"][number]> = {}): DeterministicV31CanonicalDestination["neighborhoods"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    neighborhood_key: null,
    neighborhood_name: null,
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
    ...overrides,
  };
}

function createCanonicalPlace(overrides: Partial<DeterministicV31CanonicalDestination["places"][number]> = {}): DeterministicV31CanonicalDestination["places"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    place_key: null,
    neighborhood_key: null,
    category_key: null,
    place_name: null,
    subcategory: null,
    description: null,
    address: null,
    latitude: null,
    longitude: null,
    price_level: null,
    website_url: null,
    google_maps_url: null,
    phone: null,
    best_for: null,
    display_order: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    confidence: null,
    ...overrides,
  };
}

function createCanonicalResource(overrides: Partial<DeterministicV31CanonicalDestination["resources"][number]> = {}): DeterministicV31CanonicalDestination["resources"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    resource_key: null,
    resource_category: null,
    resource_name: null,
    description: null,
    url: null,
    official: null,
    stay_mode_key: null,
    display_order: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalMedia(overrides: Partial<DeterministicV31CanonicalDestination["media"][number]> = {}): DeterministicV31CanonicalDestination["media"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    media_key: null,
    media_type: null,
    image_url: null,
    caption: null,
    subject: null,
    primary_image: null,
    gallery_order: null,
    license_notes: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    confidence: null,
    ...overrides,
  };
}

function createCanonicalCostOfLivingItem(overrides: Partial<DeterministicV31CanonicalDestination["costOfLiving"][number]> = {}): DeterministicV31CanonicalDestination["costOfLiving"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    record_key: null,
    household_type: null,
    lifestyle_tier: null,
    category: null,
    monthly_low: null,
    monthly_high: null,
    currency: null,
    included_notes: null,
    stay_mode_key: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalHousingState(overrides: Partial<DeterministicV31CanonicalDestination["housing"][number]> = {}): DeterministicV31CanonicalDestination["housing"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    record_key: null,
    housing_topic: null,
    stay_mode_key: null,
    can_foreigners_buy: null,
    residency_required_to_buy: null,
    restrictions_summary: null,
    typical_condo_price: null,
    typical_house_price: null,
    typical_villa_price: null,
    price_per_sqm: null,
    currency: null,
    property_tax_notes: null,
    transfer_tax_notes: null,
    closing_cost_notes: null,
    hoa_condo_fee_notes: null,
    foreigner_mortgage_notes: null,
    typical_down_payment_pct: null,
    rental_rules_notes: null,
    buying_process_summary: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalPropertyResource(overrides: Partial<DeterministicV31CanonicalDestination["propertyResources"][number]> = {}): DeterministicV31CanonicalDestination["propertyResources"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    resource_key: null,
    transaction_type: null,
    resource_name: null,
    resource_type: null,
    url: null,
    official: null,
    description: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalHealthcareState(overrides: Partial<DeterministicV31CanonicalDestination["healthcare"][number]> = {}): DeterministicV31CanonicalDestination["healthcare"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    record_key: null,
    topic: null,
    private_care_available: null,
    public_access_foreigners: null,
    english_speaking_care: null,
    typical_gp_visit_cost: null,
    typical_specialist_cost: null,
    currency: null,
    medicare_applicability: null,
    international_insurance_notes: null,
    emergency_number: null,
    pharmacy_notes: null,
    system_summary: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalTaxFinanceState(overrides: Partial<DeterministicV31CanonicalDestination["taxesFinance"][number]> = {}): DeterministicV31CanonicalDestination["taxesFinance"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    record_key: null,
    topic: null,
    summary: null,
    retirement_income_notes: null,
    income_tax_notes: null,
    capital_gains_notes: null,
    property_tax_notes: null,
    vat_sales_tax_notes: null,
    inheritance_wealth_notes: null,
    us_tax_treaty_notes: null,
    bank_account_foreigner_notes: null,
    currency_notes: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalSafetyRisk(overrides: Partial<DeterministicV31CanonicalDestination["safetyRisks"][number]> = {}): DeterministicV31CanonicalDestination["safetyRisks"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    record_key: null,
    seasonality: null,
    risk_type: null,
    severity: null,
    summary: null,
    mitigation_notes: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    ...overrides,
  };
}

function createCanonicalEnvironmentQualityState(overrides: Partial<NonNullable<DeterministicV31CanonicalDestination["environmentQuality"]>> = {} as NonNullable<DeterministicV31CanonicalDestination["environmentQuality"]>): DeterministicV31CanonicalDestination["environmentQuality"] {
  return {
    destination_key: "new-braunfels-tx-us",
    air_quality_metric: null,
    air_quality_summary: null,
    water_reliability: null,
    water_quality_summary: null,
    heat_humidity_comfort: null,
    noise_summary: null,
    light_pollution_summary: null,
    mosquito_pest_pressure: null,
    wildfire_smoke_exposure: null,
    drought_water_stress: null,
    environmental_notes: null,
    source_name: null,
    source_url: null,
    verified: null,
    verified_at: null,
    confidence: null,
    last_updated_at: null,
    ...overrides,
  };
}

function createCanonicalDailyLifePracticalityState(overrides: Partial<NonNullable<DeterministicV31CanonicalDestination["dailyLifePracticality"]>> = {} as NonNullable<DeterministicV31CanonicalDestination["dailyLifePracticality"]>): DeterministicV31CanonicalDestination["dailyLifePracticality"] {
  return {
    destination_key: "new-braunfels-tx-us",
    car_need: null,
    driving_difficulty: null,
    parking_difficulty: null,
    grocery_access: null,
    pharmacy_access: null,
    fitness_wellness_access: null,
    banking_practicality: null,
    card_payment_acceptance: null,
    cash_usage: null,
    mobile_payment_usage: null,
    delivery_services: null,
    emergency_services_summary: null,
    senior_services_summary: null,
    childcare_access: null,
    newcomer_friction: null,
    things_residents_wish_they_knew: null,
    source_url: null,
    verified: null,
    last_updated_at: null,
    ...overrides,
  };
}

function createCanonicalSource(overrides: Partial<DeterministicV31CanonicalDestination["sources"][number]> = {}): DeterministicV31CanonicalDestination["sources"][number] {
  return {
    destination_key: "new-braunfels-tx-us",
    source_key: null,
    source_name: null,
    source_url: null,
    source_type: null,
    publisher: null,
    accessed_at: null,
    verified: null,
    confidence: null,
    notes: null,
    ...overrides,
  };
}

function createState(overrides: Partial<StoredDestinationState> = {}): StoredDestinationState {
  const base: StoredDestinationState = {
    identity: {
      destinationKey: asDestinationKey("new-braunfels-tx-us"),
      slug: "new-braunfels",
      name: "New Braunfels",
      city: "New Braunfels",
      country: "United States",
    },
    editorial: {
      shortDescription: "A vibrant Hill Country city",
      longDescription: "A vibrant Hill Country city",
      currency: "USD",
      primaryLanguage: "English",
      timeZone: "Central",
    },
    facts: [
      {
        factKey: "fact-1" as StoredDestinationState["facts"][number]["factKey"],
        factGroup: "overview",
        valueText: "Popular with retirees",
        displayLabel: "Overview",
        sourceName: "Workbook editorial research",
      },
    ],
    scores: [
      {
        scoreKey: "score-1" as StoredDestinationState["scores"][number]["scoreKey"],
        scoreValue: "8.4",
        scoreLabel: "Overall",
        methodologyVersion: "v3.1",
      },
    ],
    neighborhoods: [],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [],
    climateMonthly: [],
    housing: [
      {
        summary: "Strong market",
        buyingSummary: null,
        rentalSummary: null,
      },
    ],
    propertyResources: [],
    healthcare: [],
    visaResidency: [],
    taxesFinance: [],
    lgbtqInclusivity: [],
    safetyRisks: [],
    transportation: [],
    remoteWork: [],
    languageIntegration: [],
    pets: [],
    familyEducation: [],
    communitySocial: [],
    accessibility: [],
    bureaucracySetup: [],
    workBusiness: [],
    retirementAging: [],
    lifestyleLaws: [],
    realityCheck: [],
    moveChecklist: [],
    environmentQuality: null,
    dailyLifePracticality: null,
    eventsSeasonality: [],
    sources: [
      {
        sourceKey: "source-1" as StoredDestinationState["sources"][number]["sourceKey"],
        name: "Workbook",
        url: "https://Example.com/Source",
        type: "official",
      },
    ],
  };

  return {
    ...base,
    ...overrides,
    identity: {
      ...base.identity,
      ...(overrides.identity ?? {}),
    },
    editorial: {
      ...base.editorial,
      ...(overrides.editorial ?? {}),
    },
  } as StoredDestinationState;
}

describe("Phase 3A.1 comparable projection", () => {
  it("projects comparable values with the existing scalar semantics", () => {
    expect(projectComparableValue("  Café\r\nCity  ")).toEqual("Café\nCity");
    expect(projectComparableValue(0)).toEqual(0);
    expect(projectComparableValue(false)).toEqual(false);
    expect(projectComparableValue(null)).toEqual(null);
    expect(projectComparableValue(undefined)).toEqual(null);
    expect(projectComparableValue("https://Example.com/Path", "url")).toEqual("https://example.com/Path");
  });

  it("projects comparable objects without mutating input", () => {
    const input = {
      shortDescription: "  Café\r\nCity  ",
      nested: { b: 2, a: 1 },
      items: [{ value: "  inner  " }],
      specialBoolean: false,
    };
    const before = structuredClone(input);

    const result = projectComparableObject(input);

    expect(result).toEqual({
      items: [{ value: "inner" }],
      nested: { a: 1, b: 2 },
      shortDescription: "Café\nCity",
      specialBoolean: false,
    });
    expect(input).toEqual(before);
  });

  it("projects keyed child arrays by stable key and preserves deterministic ordering", () => {
    const input = [
      { factKey: "fact-2", factGroup: "overview", valueText: "Second", displayLabel: "Second", sourceName: "Workbook" },
      { factKey: "fact-1", factGroup: "overview", valueText: "First", displayLabel: "First", sourceName: "Workbook" },
    ];
    const before = structuredClone(input);

    const result = projectKeyedChildArray(input, "factKey");

    expect(result).toEqual([
      { factKey: "fact-1", factGroup: "overview", valueText: "First", displayLabel: "First", sourceName: "Workbook" },
      { factKey: "fact-2", factGroup: "overview", valueText: "Second", displayLabel: "Second", sourceName: "Workbook" },
    ]);
    expect(input).toEqual(before);
  });

  it("projects ordered arrays without changing their order", () => {
    const input = [{ value: "  first  " }, { value: "second" }];
    const before = structuredClone(input);

    const result = projectOrderedArray(input);

    expect(result).toEqual([{ value: "first" }, { value: "second" }]);
    expect(input).toEqual(before);
  });

  it("produces identical projections for identical state", () => {
    const first = createState();
    const second = createState();
    expect(projectComparable(first)).toEqual(projectComparable(second));
  });

  it("ignores object insertion order while preserving semantics", () => {
    const first = createState({
      editorial: {
        shortDescription: "A vibrant Hill Country city",
        longDescription: "A vibrant Hill Country city",
        currency: "USD",
        primaryLanguage: "English",
        timeZone: "Central",
      },
    });
    const second = createState();
    expect(projectComparable(first)).toEqual(projectComparable(second));
  });

  it("sorts keyed child arrays deterministically by stable key", () => {
    const first = createState({
      facts: [
        {
          factKey: "fact-2" as StoredDestinationState["facts"][number]["factKey"],
          factGroup: "overview",
          valueText: "Second",
          displayLabel: "Second",
          sourceName: "Workbook",
        },
        {
          factKey: "fact-1" as StoredDestinationState["facts"][number]["factKey"],
          factGroup: "overview",
          valueText: "First",
          displayLabel: "First",
          sourceName: "Workbook",
        },
      ],
    });

    const second = createState({
      facts: [
        {
          factKey: "fact-1" as StoredDestinationState["facts"][number]["factKey"],
          factGroup: "overview",
          valueText: "First",
          displayLabel: "First",
          sourceName: "Workbook",
        },
        {
          factKey: "fact-2" as StoredDestinationState["facts"][number]["factKey"],
          factGroup: "overview",
          valueText: "Second",
          displayLabel: "Second",
          sourceName: "Workbook",
        },
      ],
    });

    expect(projectComparable(first)).toEqual(projectComparable(second));
  });

  it("preserves ordering for non-keyed arrays", () => {
    const first = createState({
      costOfLiving: [
        { itemKey: "food", category: "Food", monthlyLow: "1000", monthlyHigh: "1500", currency: "USD" },
        { itemKey: "rent", category: "Rent", monthlyLow: "2000", monthlyHigh: "3000", currency: "USD" },
      ],
    });
    const second = createState({
      costOfLiving: [
        { itemKey: "rent", category: "Rent", monthlyLow: "2000", monthlyHigh: "3000", currency: "USD" },
        { itemKey: "food", category: "Food", monthlyLow: "1000", monthlyHigh: "1500", currency: "USD" },
      ],
    });

    expect(projectComparable(first)).not.toEqual(projectComparable(second));
  });

  it("normalizes whitespace-only scalars to null and preserves semantic differences", () => {
    const first = createState({ editorial: { shortDescription: "   ", longDescription: "A vibrant Hill Country city", currency: "USD", primaryLanguage: "English", timeZone: "Central" } });
    const second = createState({ editorial: { shortDescription: null, longDescription: "A vibrant Hill Country city", currency: "USD", primaryLanguage: "English", timeZone: "Central" } });
    expect(projectComparable(first)).toEqual(projectComparable(second));
  });

  it("normalizes CRLF and Unicode equivalently", () => {
    const first = createState({ editorial: { shortDescription: "Café\r\nCity", longDescription: "A vibrant Hill Country city", currency: "USD", primaryLanguage: "English", timeZone: "Central" } });
    const second = createState({ editorial: { shortDescription: "Cafe\u0301\nCity", longDescription: "A vibrant Hill Country city", currency: "USD", primaryLanguage: "English", timeZone: "Central" } });
    expect(projectComparable(first)).toEqual(projectComparable(second));
  });

  it("distinguishes zero and null and false and null", () => {
    const nullState = createState();
    const zeroState = createState();
    const falseState = createState();
    const editorialNull = nullState.editorial as unknown as Record<string, unknown>;
    const editorialZero = zeroState.editorial as unknown as Record<string, unknown>;
    const editorialFalse = falseState.editorial as unknown as Record<string, unknown>;
    editorialNull.shortDescription = null;
    editorialZero.shortDescription = 0 as unknown as string;
    editorialFalse.shortDescription = false as unknown as string;
    expect(projectComparable(nullState)).not.toEqual(projectComparable(zeroState));
    expect(projectComparable(nullState)).not.toEqual(projectComparable(falseState));
  });

  it("distinguishes case changes and URL path changes", () => {
    const first = createState({ sources: [{ sourceKey: "source-1" as StoredDestinationState["sources"][number]["sourceKey"], name: "Workbook", url: "https://Example.com/Path", type: "official" }] });
    const second = createState({ sources: [{ sourceKey: "source-1" as StoredDestinationState["sources"][number]["sourceKey"], name: "Workbook", url: "https://example.com/other", type: "official" }] });
    expect(projectComparable(first)).not.toEqual(projectComparable(second));
  });

  it("does not mutate input and preserves readonly semantics", () => {
    const original = createState();
    const frozen = deepFreeze(structuredClone(original));
    const before = structuredClone(frozen);
    const projection = projectComparable(frozen);
    expect(frozen).toEqual(before);
    expect(projection).toBeDefined();
  });

  it("produces identical projections across repeated calls", () => {
    const state = createState();
    const first = projectComparable(state);
    const second = projectComparable(state);
    expect(first).toEqual(second);
  });

  it("projects canonical and stored state through the same semantic seam", () => {
    const canonicalFixture = {
      identity: {
        destinationKey: "new-braunfels-tx-us",
        slug: "new-braunfels",
        name: "New Braunfels",
        city: "New Braunfels",
        country: "United States",
      },
      editorial: {
        shortDescription: "  Cafe\u0301\r\nCity  ",
        longDescription: null,
        currency: "USD",
        primaryLanguage: "English",
        timeZone: null,
        specialBoolean: false,
        specialNumber: 0,
      },
      facts: [createCanonicalFact({ factKey: "fact-1", factGroup: "overview", valueText: "Popular with retirees", displayLabel: "Overview", sourceName: "Workbook editorial research" })],
      scores: [createCanonicalScore({ scoreKey: "score-1", scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v3.1" })],
      neighborhoods: [createCanonicalNeighborhood({ neighborhood_key: "neighborhood-1", neighborhood_name: "Historic", summary: "Walkable", area_type: "urban" })],
      places: [createCanonicalPlace({ place_key: "place-1", category_key: "food", place_name: "Downtown", description: "Historic district" })],
      resources: [createCanonicalResource({ resource_key: "resource-1", resource_category: "health", resource_name: "Clinic", url: "HTTPS://Example.COM:443/" })],
      media: [createCanonicalMedia({ media_key: "media-1", media_type: "photo", image_url: "HTTPS://Example.COM:443/", caption: "View", subject: "Downtown" })],
      costOfLiving: [createCanonicalCostOfLivingItem({ record_key: "food", category: "Food", monthly_low: "1000", monthly_high: "1500", currency: "USD" })],
      climateMonthly: [],
      housing: [createCanonicalHousingState({ restrictions_summary: "Strong market", buying_process_summary: null, rental_rules_notes: null })],
      propertyResources: [createCanonicalPropertyResource({ resource_key: "property-1", resource_type: "real-estate", resource_name: "Property", url: "https://Example.com/Property" })],
      healthcare: [createCanonicalHealthcareState({ system_summary: "Accessible", public_access_foreigners: null, international_insurance_notes: null })],
      visaResidency: [],
      taxesFinance: [createCanonicalTaxFinanceState({ summary: "Simple", income_tax_notes: null })],
      lgbtqInclusivity: [],
      safetyRisks: [createCanonicalSafetyRisk({ record_key: "risk-1", risk_type: "heat", severity: "moderate", summary: "Hot summers" })],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: createCanonicalEnvironmentQualityState({ air_quality_summary: "Good", water_quality_summary: null }),
      dailyLifePracticality: createCanonicalDailyLifePracticalityState({ grocery_access: "Nearby", things_residents_wish_they_knew: null }),
      eventsSeasonality: [],
      sources: [createCanonicalSource({ source_key: "source-1", source_name: "Workbook", source_url: "HTTPS://Example.COM:443/", source_type: "official" })],
    } as DeterministicV31CanonicalDestination & {
      editorial: DeterministicV31CanonicalDestination["editorial"] & { specialBoolean: boolean; specialNumber: number };
    };

    const storedFixture = {
      identity: {
        destinationKey: "new-braunfels-tx-us" as CanonicalDestinationKey,
        slug: "new-braunfels",
        name: "New Braunfels",
        city: "New Braunfels",
        country: "United States",
      },
      editorial: {
        shortDescription: "  Café\nCity  ",
        longDescription: null,
        currency: "USD",
        primaryLanguage: "English",
        timeZone: null,
        specialBoolean: false,
        specialNumber: 0,
      },
      facts: [{ factKey: "fact-1" as StoredDestinationState["facts"][number]["factKey"], factGroup: "overview", valueText: "Popular with retirees", displayLabel: "Overview", sourceName: "Workbook editorial research" }],
      scores: [{ scoreKey: "score-1" as StoredDestinationState["scores"][number]["scoreKey"], scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v3.1" }],
      neighborhoods: [{ neighborhoodKey: "neighborhood-1" as StoredDestinationState["neighborhoods"][number]["neighborhoodKey"], name: "Historic", summary: "Walkable", areaType: "urban" }],
      places: [{ placeKey: "place-1" as StoredDestinationState["places"][number]["placeKey"], category: "food", name: "Downtown", description: "Historic district", neighborhoodKey: null, websiteUrl: null, googleMapsUrl: null, sourceUrl: null, address: null, phone: null, displayOrder: null }],
      resources: [{ resourceKey: "resource-1" as StoredDestinationState["resources"][number]["resourceKey"], category: "health", name: "Clinic", url: "https://example.com/" }],
      media: [{ mediaKey: "media-1" as StoredDestinationState["media"][number]["mediaKey"], kind: "photo", url: "https://example.com/", caption: "View", altText: "Downtown" }],
      costOfLiving: [{ itemKey: "food", category: "Food", monthlyLow: "1000", monthlyHigh: "1500", currency: "USD" }],
      climateMonthly: [],
      housing: [{ summary: "Strong market", buyingSummary: null, rentalSummary: null }],
      propertyResources: [{ itemKey: "property-1" as StoredDestinationState["propertyResources"][number]["itemKey"], category: "real-estate", name: "Property", url: "https://example.com/Property" }],
      healthcare: [{ summary: "Accessible", publicAccessSummary: null, insuranceSummary: null }],
      visaResidency: [],
      taxesFinance: [{ summary: "Simple", notes: null }],
      lgbtqInclusivity: [],
      safetyRisks: [{ itemKey: "risk-1" as StoredDestinationState["safetyRisks"][number]["itemKey"], topic: "heat", severity: "moderate", summary: "Hot summers" }],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: { summary: "Good", qualityNotes: null },
      dailyLifePracticality: { summary: "Nearby", practicalityNotes: null },
      eventsSeasonality: [],
      sources: [{ sourceKey: "source-1" as StoredDestinationState["sources"][number]["sourceKey"], name: "Workbook", url: "https://example.com/", type: "official" }],
    } satisfies StoredDestinationState & {
      editorial: StoredDestinationState["editorial"] & { specialBoolean: boolean; specialNumber: number };
    };

    expect(projectCanonicalComparable(canonicalFixture)).toEqual(projectStoredComparable(storedFixture));
    expect(projectComparable(canonicalFixture)).toEqual(projectComparable(storedFixture));
  });

  it("projects canonical and stored keyed-child rows to the same comparable shape for every keyed-child module", () => {
    const fixtures: ReadonlyArray<{ module: import("../types").KeyedChildModuleKey; canonical: Record<string, unknown>; stored: Record<string, unknown> }> = [
      { module: "facts", canonical: { fact_key: "fact-1", fact_group: "group", value_text: "Value", display_label: "Label", source_name: "Source" }, stored: { factKey: "fact-1", factGroup: "group", valueText: "Value", displayLabel: "Label", sourceName: "Source" } },
      { module: "scores", canonical: { score_key: "score-1", score_value: "8.4", score_label: "Overall", methodology_version: "v31" }, stored: { scoreKey: "score-1", scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v31" } },
      { module: "neighborhoods", canonical: { neighborhood_key: "hood-1", neighborhood_name: "Old Town", summary: "Center", area_type: "urban" }, stored: { neighborhoodKey: "hood-1", name: "Old Town", summary: "Center", areaType: "urban" } },
      { module: "places", canonical: { place_key: "place-1", category_key: "food", place_name: "Bluefin", description: "Seafood", neighborhood_key: "hood-1", website_url: "https://example.com", google_maps_url: "https://maps.example.com", source_url: "https://source.example.com", address: "123 Main", phone: "+1 111", display_order: "1" }, stored: { placeKey: "place-1", category: "food", name: "Bluefin", description: "Seafood", neighborhoodKey: "hood-1", websiteUrl: "https://example.com", googleMapsUrl: "https://maps.example.com", sourceUrl: "https://source.example.com", address: "123 Main", phone: "+1 111", displayOrder: "1" } },
      { module: "resources", canonical: { resource_key: "resource-1", resource_category: "government", resource_name: "City Hall", url: "https://city.example.com" }, stored: { resourceKey: "resource-1", category: "government", name: "City Hall", url: "https://city.example.com" } },
      { module: "media", canonical: { media_key: "media-1", media_type: "image", image_url: "https://img.example.com/a.jpg", caption: "Main square", subject: "Square" }, stored: { mediaKey: "media-1", kind: "image", url: "https://img.example.com/a.jpg", caption: "Main square", altText: "Square" } },
      { module: "propertyResources", canonical: { resource_key: "property-1", resource_type: "agent", resource_name: "Local Realty", url: "https://realty.example.com" }, stored: { itemKey: "property-1", category: "agent", name: "Local Realty", url: "https://realty.example.com" } },
      { module: "moveChecklist", canonical: { checklist_key: "check-1", task: "Open bank account", description: "Bring passport" }, stored: { checklistKey: "check-1", summary: "Open bank account", checklistNotes: "Bring passport" } },
      { module: "eventsSeasonality", canonical: { event_season_key: "season-1", description: "Summer high season", weather_context: "Hot and dry" }, stored: { eventSeasonalityKey: "season-1", summary: "Summer high season", seasonalityNotes: "Hot and dry" } },
      { module: "sources", canonical: { source_key: "source-1", source_name: "Tourism Board", source_url: "https://source.example.com", source_type: "official" }, stored: { sourceKey: "source-1", name: "Tourism Board", url: "https://source.example.com", type: "official" } },
    ];

    for (const fixture of fixtures) {
      expect(projectKeyedChildComparableRow(fixture.module, fixture.canonical)).toEqual(projectKeyedChildComparableRow(fixture.module, fixture.stored));
    }
  });

  it("treats score methodologyVersion as non-comparable metadata", () => {
    const canonicalScore = {
      score_key: "score-1",
      score_value: "8.4",
      score_label: "Overall",
      methodology_version: "v3.1",
    };

    const storedScore = {
      scoreKey: "score-1",
      scoreValue: "8.4",
      scoreLabel: "Overall",
      methodologyVersion: null,
    };

    expect(projectKeyedChildComparableRow("scores", canonicalScore)).toEqual(projectKeyedChildComparableRow("scores", storedScore));
  });

  it("treats place optional null and undefined fields as semantically equivalent", () => {
    const canonicalPlace = {
      place_key: "place-1",
      category_key: "food",
      place_name: "Bluefin",
      description: null,
      neighborhood_key: null,
      website_url: undefined,
      google_maps_url: null,
      source_url: undefined,
      address: undefined,
      phone: null,
      display_order: null,
    };

    const storedPlace = {
      placeKey: "place-1",
      category: "food",
      name: "Bluefin",
      description: null,
      neighborhoodKey: null,
      websiteUrl: null,
      googleMapsUrl: null,
      sourceUrl: null,
      address: null,
      phone: null,
      displayOrder: null,
    };

    expect(projectKeyedChildComparableRow("places", canonicalPlace)).toEqual(projectKeyedChildComparableRow("places", storedPlace));
  });

  it("produces identical comparable output in a fresh Node process", () => {
    const fixtureDir = path.resolve(process.cwd(), "app/lib/persistence/v31/__tests__/fixtures");
    const fixturePath = path.join(fixtureDir, "phase3a1-state.json");
    const expectedPath = path.resolve(process.cwd(), "tmp/phase3a1-projection.json");
    const fixture = {
      state: createState(),
    };
    const fixtureContents = JSON.stringify(fixture, null, 2);
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(fixturePath, fixtureContents, "utf8");

    const tmpDir = path.resolve(process.cwd(), "tmp");
    mkdirSync(tmpDir, { recursive: true });
    const scriptPath = path.resolve(tmpDir, "phase3a1-projection-run.mjs");
    const modulePath = path.resolve(process.cwd(), "app/lib/persistence/v31/comparable-projection.ts");
    const script = `
      import { readFileSync, writeFileSync } from 'node:fs';
      import { projectComparable } from ${JSON.stringify(modulePath)};
      const fixturePath = ${JSON.stringify(fixturePath)};
      const outputPath = ${JSON.stringify(expectedPath)};
      const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
      const output = JSON.stringify(projectComparable(fixture.state));
      writeFileSync(outputPath, output);
      console.log(output);
    `;
    writeFileSync(scriptPath, script, "utf8");

    const result = spawnSync(process.execPath, ["--experimental-strip-types", scriptPath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    const output = result.stdout.trim();
    const persisted = readFileSync(expectedPath, "utf8");
    expect(persisted).toBe(output);

    rmSync(expectedPath, { force: true });
    rmSync(scriptPath, { force: true });
    rmSync(fixturePath, { force: true });
  });
});
