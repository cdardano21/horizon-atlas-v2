import { describe, expect, it } from "vitest";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import { adaptWorkbookDestinationToIntelligenceV2Facts, buildIntelligenceV2FactsFromWorkbookImport } from "../workbook-v32-adapter";

const V32_MASTER_WORKBOOK_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Master_Workbook_v3.2_Pilot_Dataset.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

/** Builds a minimal, otherwise-empty canonical destination fixture for pure in-memory unit tests (no real workbook I/O). Only the modules the adapter reads are populated by callers. */
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

describe("workbook v3.2 -> Intelligence v2 adapter — Lisbon real fixture", () => {
  it("adapts the real Lisbon v3.2 workbook row into the exact approved fact values", async () => {
    const before = sha256(V32_MASTER_WORKBOOK_PATH);

    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(V32_MASTER_WORKBOOK_PATH);
    expect(workbookImport.validationErrors).toEqual([]);

    const result = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "lisbon-pt");
    expect(result).not.toBeNull();
    const { facts, mappingErrors } = result!;

    expect(mappingErrors).toEqual([]);

    // Layer 1
    expect(facts.entryAndStay.remoteWorkLegalUnderTouristStatus).toBe("UNKNOWN");
    expect(facts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable).toBe("YES");
    expect(facts.entryAndStay.retirementVisaProgramAvailable).toBe("YES");
    expect(facts.entryAndStay.spouseOrDependentInclusionSupported).toBe("YES");
    expect(facts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(facts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("NO");
    expect(facts.entryAndStay.touristEntryAllowed).toBe("YES");
    expect(facts.entryAndStay.touristStayLimitDays).toBe(90);
    expect(facts.entryAndStay.extendedStayOrLongStayVisaAvailable).toBe("YES");
    expect(facts.entryAndStay.permanentResidencyPathAvailable).toBe("YES");

    // Hard gates
    expect(facts.hardGates.beachAccess).toBe("NEARBY");
    expect(facts.hardGates.mountainOrSkiAccess).toBe("MOUNTAIN_SCENIC_ONLY");
    expect(facts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(facts.hardGates.lgbtqLegalProtectionStatus).toBe("LEGAL_PROTECTIONS_IN_PLACE");
    expect(facts.hardGates.safetyStandard).toBe("MODERATE_OR_BETTER");

    // Layer 2
    expect(facts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(facts.cost.estimatedMonthlyCostRange).toEqual({ low: 2495, high: 4610, currencyCode: "EUR" });

    // Layer 4
    expect(facts.financial.taxResidencyTriggerDays).toBe(184);
    expect(facts.financial.pensionTreatment).toBe("TREATY_DEPENDENT");
    expect(facts.financial.socialSecurityTreatment).toBe("TREATY_DEPENDENT");
    expect(facts.financial.iraTreatment).toBe("TREATY_DEPENDENT");
    expect(facts.financial.retirementAccount401kTreatment).toBe("TREATY_DEPENDENT");
    expect(facts.financial.usTaxTreatyInEffect).toBe("YES");
    expect(facts.financial.foreignTaxCreditAvailable).toBe("YES");
    expect(facts.financial.wealthTaxApplicable).toBe("YES");
    expect(facts.financial.propertyTaxAnnualRatePercent).toBe(0.3);
    expect(facts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
    expect(facts.financial.buyVsRentBreakEvenYears).toBeNull();

    const after = sha256(V32_MASTER_WORKBOOK_PATH);
    expect(after).toBe(before);
  });

  it("proves missing lifestyle scores stay missing/UNKNOWN, but does not suppress a genuinely-present exact-key match (walkability)", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(V32_MASTER_WORKBOOK_PATH);
    const result = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "lisbon-pt");
    const dimensionValues = result!.facts.lifestyleDimensions.dimensionValues;

    // Lisbon's real DESTINATION_SCORES rows are: retirement=90, walkability=91, lifestyle=94.
    // "walkability" is an exact match to the current engine dimension key, so it must be
    // included (not fabricated - it is genuinely already in the workbook). "retirement" and
    // "lifestyle" are NOT current engine Layer 3 dimension keys, so they are correctly excluded.
    expect(dimensionValues.walkability).toBe(91);
    expect(dimensionValues.retirement).toBeUndefined();
    expect(dimensionValues.lifestyle).toBeUndefined();

    // None of these new v3.2 SCORING_DIMENSIONS catalog rows have populated Lisbon score data yet.
    for (const missingKey of ["culture", "foodDining", "nightlife", "golf", "community", "languageEase"]) {
      expect(dimensionValues[missingKey]).toBeUndefined();
    }
    // The 4 enum-derived dimensions are never present in dimensionValues at all (the scorer
    // computes them directly from hardGates).
    for (const enumDerivedKey of ["beachLifestyle", "mountainOutdoorLifestyle", "healthcareQuality", "safetyQuality"]) {
      expect(dimensionValues[enumDerivedKey]).toBeUndefined();
    }
  });

  it("produces destination facts only - no UserProfileV2-side concepts leak into the output", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(V32_MASTER_WORKBOOK_PATH);
    const result = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "lisbon-pt");
    const facts = result!.facts as unknown as Record<string, unknown>;

    expect(Object.keys(facts).sort()).toEqual(["cost", "countryCode", "displayName", "entryAndStay", "financial", "hardGates", "id", "lifestyleDimensions", "notes"].sort());
    for (const forbiddenKey of ["budget", "stayDuration", "activityMode", "citizenship", "household", "tenureIntent", "hardRequirements", "lifestylePreferences", "intendsToWorkDuringStay"]) {
      expect(facts).not.toHaveProperty(forbiddenKey);
    }
  });

  it("does not run any evaluator - output contains raw facts only, never a verdict/status/score", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(V32_MASTER_WORKBOOK_PATH);
    const result = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "lisbon-pt");
    const serialized = JSON.stringify(result!.facts);
    for (const evaluatorLeakage of ["overallStatus", "exclusionReasonCodes", "totalScore", "dimensionContributions", "findings", "recommendationStatus"]) {
      expect(serialized).not.toContain(evaluatorLeakage);
    }
  });
});

describe("workbook v3.2 -> Intelligence v2 adapter — multi-row VISA_RESIDENCY selection (generic, no hardcoded row numbers)", () => {
  it("selects the short-stay row for tourist-status facts and the long-term row for retirement/residence facts, purely via stay_mode_key", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-multi-row",
      visaResidency: [
        {
          destination_key: "synthetic-multi-row",
          record_key: "row-long",
          stay_mode_key: "LONG_TERM_PERMANENT",
          visa_free_days: null,
          visa_type: "Residence visa",
          permanent_residency_path: "Path exists",
          // @ts-expect-error additive v3.2 column not in the base canonical type
          retirement_visa_program_available: "Yes",
          // @ts-expect-error additive v3.2 column not in the base canonical type
          digital_nomad_visa_available: "Yes",
          // @ts-expect-error additive v3.2 column not in the base canonical type
          dependent_inclusion_supported: "Yes",
          // @ts-expect-error additive v3.2 column not in the base canonical type
          remote_work_legal_tourist_status: "No", // deliberately wrong-row value; must NOT be read for this fact
        },
        {
          destination_key: "synthetic-multi-row",
          record_key: "row-short",
          stay_mode_key: "SHORT_1_3_MONTHS",
          visa_free_days: "45",
          visa_type: "Visa-free short stay",
          permanent_residency_path: "N/A",
          // @ts-expect-error additive v3.2 column not in the base canonical type
          retirement_visa_program_available: "No", // deliberately wrong-row value; must NOT be read for this fact
          // @ts-expect-error additive v3.2 column not in the base canonical type
          remote_work_legal_tourist_status: "Yes",
        },
      ] as never,
    });

    const { facts } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.entryAndStay.touristStayLimitDays).toBe(45); // from the SHORT row
    expect(facts.entryAndStay.remoteWorkLegalUnderTouristStatus).toBe("YES"); // from the SHORT row
    expect(facts.entryAndStay.retirementVisaProgramAvailable).toBe("YES"); // from the LONG row
    expect(facts.entryAndStay.extendedStayOrLongStayVisaAvailable).toBe("YES"); // from the LONG row's visa_type
  });
});

describe("workbook v3.2 -> Intelligence v2 adapter — blank/UNKNOWN handling", () => {
  it("never coerces blank numeric fields to zero, blank TriState fields to NO, or blank scores to a fabricated value", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-blank",
      taxesFinance: [
        {
          destination_key: "synthetic-blank",
          record_key: "tax-blank",
          tax_residency_threshold_days: null,
          pension_treatment: null,
          us_tax_treaty_in_effect: null,
          foreign_tax_credit_available: null,
          wealth_tax_applicable: null,
        } as never,
      ],
      housing: [{ destination_key: "synthetic-blank", record_key: "housing-blank", property_tax_annual_rate_percent: null, purchase_transfer_tax_percent: null } as never],
      scores: [],
    });

    const { facts } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.financial.taxResidencyTriggerDays).toBeNull();
    expect(facts.financial.propertyTaxAnnualRatePercent).toBeNull();
    expect(facts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
    expect(facts.financial.usTaxTreatyInEffect).toBe("UNKNOWN");
    expect(facts.financial.wealthTaxApplicable).toBe("UNKNOWN");
    expect(facts.financial.pensionTreatment).toBe("UNKNOWN");
    expect(facts.lifestyleDimensions.dimensionValues).toEqual({});
  });
});

describe("workbook v3.2 -> Intelligence v2 adapter — invalid token handling", () => {
  it("rejects an invalid TriState token deterministically: UNKNOWN + a reported mapping error, never a silent guess", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-invalid",
      taxesFinance: [{ destination_key: "synthetic-invalid", record_key: "tax-invalid", wealth_tax_applicable: "Maybe" } as never],
    });

    const { facts, mappingErrors } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.financial.wealthTaxApplicable).toBe("UNKNOWN");
    expect(mappingErrors).toContainEqual(
      expect.objectContaining({ factPath: "financial.wealthTaxApplicable", rawValue: "Maybe" }),
    );
  });

  it("rejects an invalid enum token deterministically: falls back + a reported mapping error", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "synthetic-invalid-enum",
      destinationRow: { beach_access: "SOMEWHERE_ELSE" },
    });

    const { facts, mappingErrors } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.hardGates.beachAccess).toBe("UNKNOWN");
    expect(mappingErrors).toContainEqual(
      expect.objectContaining({ factPath: "hardGates.beachAccess", rawValue: "SOMEWHERE_ELSE" }),
    );
  });
});

describe("workbook v3.2 -> Intelligence v2 adapter — no cross-destination contamination", () => {
  it("only reads rows matching the requested destination_key, even when other destinations' rows are present in the same arrays", () => {
    const canonical = makeCanonicalFixture({
      destinationKey: "lisbon-pt",
      taxesFinance: [
        { destination_key: "summerlin-nv-us", record_key: "sum-tax", wealth_tax_applicable: "No" } as never,
        { destination_key: "lisbon-pt", record_key: "lis-tax", wealth_tax_applicable: "Yes" } as never,
      ],
      scores: [
        { destination_key: "new-braunfels-tx-us", score_key: "walkability", score_value: "10" } as never,
        { destination_key: "lisbon-pt", score_key: "walkability", score_value: "91" } as never,
      ],
    });

    const { facts } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);

    expect(facts.financial.wealthTaxApplicable).toBe("YES"); // Lisbon's row, not Summerlin's
    expect(facts.lifestyleDimensions.dimensionValues.walkability).toBe(91); // Lisbon's row, not New Braunfels'
  });
});
