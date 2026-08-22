import { describe, expect, it } from "vitest";
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../workbook-v32-adapter";
import { normalizeHealthcareStandard, normalizeMonthlyCostRange, selectBuyTopicHousingRow, toTriState, type WorkbookAdapterMappingError } from "../workbook-v32-normalization";

/**
 * Phase 12.2 — focused hardening tests for the three Batch #1 data-convention
 * issues found in the read-only review: (A) COST_OF_LIVING total_monthly
 * rollup double-counting, (B) Excel-boolean "1"/"0" TriState dialect, and
 * (C) HOUSING_PROPERTY rent/buy row selection.
 */

function makeCanonicalFixture(overrides: Partial<DeterministicV31CanonicalDestination> & { destinationKey: string }): DeterministicV31CanonicalDestination {
  const { destinationKey, ...rest } = overrides;
  return {
    identity: { destinationKey, slug: null, name: null, city: null, country: null },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    destinationRow: {},
    facts: [],
    scores: [],
    neighborhoods: [],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [],
    climateMonthly: [],
    housing: [],
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
    sources: [],
    ...rest,
  } as DeterministicV31CanonicalDestination;
}

describe("Issue A — COST_OF_LIVING total_monthly rollup handling", () => {
  it("A. component + total_monthly: range is the component sum only, never component + rollup", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    const range = normalizeMonthlyCostRange(
      [
        { householdType: "single", lifestyleTier: "comfortable", category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" },
        { householdType: "single", lifestyleTier: "comfortable", category: "groceries", monthlyLow: "300", monthlyHigh: "500", currency: "USD" },
        { householdType: "single", lifestyleTier: "comfortable", category: "total_monthly", monthlyLow: "1350", monthlyHigh: "2450", currency: "USD" },
      ],
      "COST_OF_LIVING",
      errors,
    );
    expect(range).toEqual({ low: 1300, high: 2500, currencyCode: "USD" });
  });

  it("B. component-only (existing Lisbon/Summerlin shape): unchanged", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    const range = normalizeMonthlyCostRange(
      [
        { householdType: "single", lifestyleTier: "comfortable", category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" },
        { householdType: "single", lifestyleTier: "comfortable", category: "groceries", monthlyLow: "300", monthlyHigh: "500", currency: "USD" },
      ],
      "COST_OF_LIVING",
      errors,
    );
    expect(range).toEqual({ low: 1300, high: 2500, currencyCode: "USD" });
    expect(errors).toEqual([]);
  });

  it("C. total_monthly only (no component rows): returns null (UNKNOWN), never invents components from the rollup", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    const range = normalizeMonthlyCostRange(
      [{ householdType: "single", lifestyleTier: "comfortable", category: "total_monthly", monthlyLow: "1350", monthlyHigh: "2450", currency: "USD" }],
      "COST_OF_LIVING",
      errors,
    );
    expect(range).toBeNull();
  });

  it("reports an informational reconciliation diagnostic when the component sum materially diverges from the stored rollup, without changing the computed range", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    const range = normalizeMonthlyCostRange(
      [
        { householdType: "single", lifestyleTier: "comfortable", category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" },
        { householdType: "single", lifestyleTier: "comfortable", category: "total_monthly", monthlyLow: "500", monthlyHigh: "5000", currency: "USD" },
      ],
      "COST_OF_LIVING",
      errors,
    );
    expect(range).toEqual({ low: 1000, high: 2000, currencyCode: "USD" }); // component-only, rollup never trusted/added
    expect(errors).toContainEqual(expect.objectContaining({ factPath: "cost.estimatedMonthlyCostRange", message: expect.stringContaining("Informational") }));
  });

  it("does not report a reconciliation diagnostic when the rollup and components closely agree", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    normalizeMonthlyCostRange(
      [
        { householdType: "single", lifestyleTier: "comfortable", category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" },
        { householdType: "single", lifestyleTier: "comfortable", category: "total_monthly", monthlyLow: "1010", monthlyHigh: "1990", currency: "USD" },
      ],
      "COST_OF_LIVING",
      errors,
    );
    expect(errors).toEqual([]);
  });
});

describe("Issue B — Excel-boolean TriState dialect", () => {
  it("D. TriState \"1\" -> YES", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(toTriState("1", "test.fact", "TEST", errors)).toBe("YES");
    expect(errors).toEqual([]);
  });

  it("E. TriState \"0\" -> NO", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(toTriState("0", "test.fact", "TEST", errors)).toBe("NO");
    expect(errors).toEqual([]);
  });

  it("F. TriState text Yes/No/Unknown: unchanged", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(toTriState("Yes", "test.fact", "TEST", errors)).toBe("YES");
    expect(toTriState("No", "test.fact", "TEST", errors)).toBe("NO");
    expect(toTriState("Unknown", "test.fact", "TEST", errors)).toBe("UNKNOWN");
    expect(toTriState(null, "test.fact", "TEST", errors)).toBe("UNKNOWN");
    expect(errors).toEqual([]);
  });

  it("G. malformed TriState tokens remain UNKNOWN + a reported mapping diagnostic", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(toTriState("2", "test.fact", "TEST", errors)).toBe("UNKNOWN");
    expect(toTriState("maybe", "test.fact", "TEST", errors)).toBe("UNKNOWN");
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatchObject({ factPath: "test.fact", rawValue: "2" });
    expect(errors[1]).toMatchObject({ factPath: "test.fact", rawValue: "maybe" });
  });

  it("does not accept speculative truthy/falsy tokens outside the proven contract", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    for (const token of ["true", "false", "y", "n", "on", "off"]) {
      expect(toTriState(token, "test.fact", "TEST", errors)).toBe("UNKNOWN");
    }
    expect(errors).toHaveLength(6);
  });

  it("H. healthcare boolean TRUE dialect (\"1\") -> GOOD_PRIVATE_AVAILABLE", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(normalizeHealthcareStandard("1", "hardGates.healthcareStandard", "HEALTHCARE_INSURANCE", errors)).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(errors).toEqual([]);
  });

  it("I. healthcare boolean FALSE dialect (\"0\") -> same result as existing No policy (BASIC_ACCESS)", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(normalizeHealthcareStandard("0", "hardGates.healthcareStandard", "HEALTHCARE_INSURANCE", errors)).toBe("BASIC_ACCESS");
    expect(normalizeHealthcareStandard("No", "hardGates.healthcareStandard", "HEALTHCARE_INSURANCE", errors)).toBe("BASIC_ACCESS");
    expect(errors).toEqual([]);
  });

  it("healthcare normalization reports a mapping diagnostic for a malformed value, consistent with toTriState", () => {
    const errors: WorkbookAdapterMappingError[] = [];
    expect(normalizeHealthcareStandard("maybe", "hardGates.healthcareStandard", "HEALTHCARE_INSURANCE", errors)).toBe("UNKNOWN");
    expect(errors).toContainEqual(expect.objectContaining({ factPath: "hardGates.healthcareStandard", rawValue: "maybe" }));
  });
});

describe("Issue C — HOUSING_PROPERTY buy-topic row selection", () => {
  it("selectBuyTopicHousingRow prefers the buy-topic row (Batch #1 dialect: \"buy\")", () => {
    const rentRow = { housing_topic: "rent", marker: "rent-row" };
    const buyRow = { housing_topic: "buy", marker: "buy-row" };
    expect(selectBuyTopicHousingRow([rentRow, buyRow])).toEqual(buyRow);
  });

  it("selectBuyTopicHousingRow recognizes the golden single-row dialect (\"Buying property\") case-insensitively", () => {
    const onlyRow = { housing_topic: "Buying property", marker: "only-row" };
    expect(selectBuyTopicHousingRow([onlyRow])).toEqual(onlyRow);
  });

  it("falls back to the first row when no recognized buy-topic label exists (defensive, no destination-specific branching)", () => {
    const onlyRow = { housing_topic: "something-else", marker: "only-row" };
    expect(selectBuyTopicHousingRow([onlyRow])).toEqual(onlyRow);
    expect(selectBuyTopicHousingRow([])).toBeNull();
  });

  it("J. multi-row housing: buy-specific facts (property_tax_annual_rate_percent etc.) come from the BUY row, not the RENT row", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-multi-housing",
      housing: [
        {
          destination_key: "synthetic-multi-housing",
          record_key: "housing-rent",
          housing_topic: "rent",
          can_foreigners_buy: "No", // deliberately wrong-row value; must NOT be read
          property_purchase_grants_residency_path: null,
          property_tax_annual_rate_percent: null,
          purchase_transfer_tax_percent: null,
        } as never,
        {
          destination_key: "synthetic-multi-housing",
          record_key: "housing-buy",
          housing_topic: "buy",
          can_foreigners_buy: "Yes",
          property_purchase_grants_residency_path: "No",
          property_tax_annual_rate_percent: "0.75",
          purchase_transfer_tax_percent: "2.5",
        } as never,
      ],
    });

    const { facts } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(facts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("NO");
    expect(facts.financial.propertyTaxAnnualRatePercent).toBe(0.75);
    expect(facts.financial.propertyPurchaseOrTransferTaxPercent).toBe(2.5);
  });

  it("K. single-row housing (Lisbon/Summerlin-style \"Buying property\" topic): unchanged", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-single-housing",
      housing: [
        {
          destination_key: "synthetic-single-housing",
          record_key: "housing-only",
          housing_topic: "Buying property",
          can_foreigners_buy: "Yes",
          property_purchase_grants_residency_path: "No",
          property_tax_annual_rate_percent: "0.3",
          purchase_transfer_tax_percent: null,
        } as never,
      ],
    });

    const { facts } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(facts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("NO");
    expect(facts.financial.propertyTaxAnnualRatePercent).toBe(0.3);
    expect(facts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
  });

  it("boolean-dialect purchase facts resolve correctly through the full adapter (Issue B x Issue C combined)", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-boolean-housing",
      housing: [
        {
          destination_key: "synthetic-boolean-housing",
          record_key: "housing-buy",
          housing_topic: "buy",
          can_foreigners_buy: "1", // Excel TRUE, as exposed by the real parser
          property_purchase_grants_residency_path: "0", // Excel FALSE
        } as never,
      ],
      healthcare: [{ destination_key: "synthetic-boolean-housing", record_key: "health-1", private_care_available: "1" } as never],
    });

    const { facts, mappingErrors } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(facts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("NO");
    expect(facts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    // No TriState/boolean-related mapping errors - only the unrelated, expected
    // "no household_type" note from this fixture's deliberately-empty costOfLiving array.
    expect(mappingErrors.filter((e) => e.factPath !== "cost.householdSizeAssumedForEstimate")).toEqual([]);
  });
});
