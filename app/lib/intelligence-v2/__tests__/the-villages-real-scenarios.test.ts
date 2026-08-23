import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport, type IntelligenceV2DestinationFacts } from "../workbook-v32-adapter";
import { evaluateDestinationForProfile } from "../orchestrator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

/**
 * Phase 12.5 — real The Villages (the-villages-fl-us) workbook facts run
 * through the REAL four-layer engine for representative U.S.-domestic
 * profiles (no mocks in the chain: real parser -> real adapter -> real
 * orchestrator).
 *
 * This is validation, not tuning: every assertion below pins the engine's
 * actual observed output for the given profile. The Villages is a domestic
 * (US-US) relocation and USD->USD, so no FxRateTable is required or passed.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let villagesFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "the-villages-fl-us");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  villagesFacts = adapted!.facts;
});

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 5500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

function run(profile: UserProfileV2) {
  return evaluateDestinationForProfile(profile, villagesFacts);
}

describe("The Villages real four-layer scenarios — no mocks in the chain (real workbook -> real parser -> real adapter -> real orchestrator)", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  it("real The Villages facts loaded from the workbook match the expected post-enrichment values", () => {
    expect(villagesFacts.countryCode).toBe("US");
    expect(villagesFacts.hardGates.beachAccess).toBe("NEARBY");
    expect(villagesFacts.hardGates.mountainOrSkiAccess).toBe("NONE");
    expect(villagesFacts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(villagesFacts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(villagesFacts.hardGates.safetyStandard).toBe("UNKNOWN");
    expect(villagesFacts.hardGates.lgbtqLegalProtectionStatus).toBe("UNKNOWN");
    expect(villagesFacts.financial.pensionTreatment).toBe("EXEMPT");
    expect(villagesFacts.financial.socialSecurityTreatment).toBe("EXEMPT");
    expect(villagesFacts.financial.iraTreatment).toBe("EXEMPT");
    expect(villagesFacts.financial.retirementAccount401kTreatment).toBe("EXEMPT");
    expect(villagesFacts.financial.wealthTaxApplicable).toBe("NO");
    expect(villagesFacts.financial.propertyTaxAnnualRatePercent).toBeNull();
    expect(villagesFacts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
    expect(villagesFacts.cost.estimatedMonthlyCostRange).toEqual({ low: 3454, high: 6650, currencyCode: "USD" });
    expect(villagesFacts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(villagesFacts.lifestyleDimensions.dimensionValues.climate).toBe(78);
    // Checkpoint B: connectivity/airport_access are SAFE_ONE_TO_ONE legacy keys, now resolved
    // via alias fallback (no exact canonical row exists for either at The Villages).
    expect(villagesFacts.lifestyleDimensions.dimensionValues.connectivityRemoteWork).toBe(82);
    expect(villagesFacts.lifestyleDimensions.dimensionValues.transportationAirportQuality).toBe(62);
    // Unlike Summerlin ("walkability" exact-matched), The Villages' only other DESTINATION_SCORES
    // rows use compound/ambiguous legacy names (walkability_transport, lifestyle_culture, food_social) -
    // these remain intentionally unmapped, never aliased or split.
    expect(villagesFacts.lifestyleDimensions.dimensionValues.walkability).toBeUndefined();
    expect(villagesFacts.lifestyleDimensions.dimensionValues.culture).toBeUndefined();
    expect(villagesFacts.lifestyleDimensions.dimensionValues.foodDining).toBeUndefined();
    // international-only fields remain blank
    expect(villagesFacts.entryAndStay.touristStayLimitDays).toBeNull();
    expect(villagesFacts.entryAndStay.remoteWorkLegalUnderTouristStatus).toBe("UNKNOWN");
    expect(villagesFacts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable).toBe("UNKNOWN");
    expect(villagesFacts.entryAndStay.retirementVisaProgramAvailable).toBe("UNKNOWN");
    expect(villagesFacts.entryAndStay.spouseOrDependentInclusionSupported).toBe("UNKNOWN");
    expect(villagesFacts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("UNKNOWN");
    expect(villagesFacts.financial.taxResidencyTriggerDays).toBeNull();
    expect(villagesFacts.financial.usTaxTreatyInEffect).toBe("UNKNOWN");
    expect(villagesFacts.financial.foreignTaxCreditAvailable).toBe("UNKNOWN");
  });

  it("SCENARIO 1 — single retiree / renter / $5,500 flexible: domestic Layer 1 all null, real Layer 2 classification, domestic retirement findings present", () => {
    const result = run(makeProfile());

    expect(result.eligibility.criteria).toEqual({
      entryFeasibility: null,
      stayDurationFeasibility: null,
      requiredLegalPath: null,
      remoteWorkLegality: null,
      retirementOrResidencyPath: null,
      spouseOrDependentFeasibility: null,
      foreignPropertyPurchaseRights: null,
      healthcareGate: null,
      safetyGate: null,
      lgbtqLegalSafetyGate: null,
      beachAccessGate: null,
      mountainOrSkiAccessGate: null,
    });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.exclusionReasonCodes).toEqual([]);
    expect(result.eligibility.unknownReasonCodes).toEqual([]);

    // Real $3,454-$6,650 range against $5,500 -> straddles the range -> BORDERLINE, not AFFORDABLE.
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.estimatedMonthlyCostRange).toEqual({ low: 3454, high: 6650, currencyCode: "USD" });
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.affordability.currencyConversion).toBeNull(); // USD -> USD, no conversion needed

    expect(result.financialEfficiency.findings.map((f) => f.category)).toEqual([
      "PENSION_TREATMENT",
      "SOCIAL_SECURITY_TREATMENT",
      "IRA_TREATMENT",
      "RETIREMENT_ACCOUNT_401K_TREATMENT",
      "WEALTH_TAX",
    ]);
    expect(result.financialEfficiency.findings.every((f) => f.severity === "POSITIVE")).toBe(true);
    expect(result.financialEfficiency.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ reasonCode: "PENSION_TREATMENT_EXEMPT" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ reasonCode: "NO_WEALTH_TAX_REGIME" });
    // No international findings, and never claims "federally tax free" - structured reason codes only.
    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).not.toContain("TAX_RESIDENCY_TRIGGER");
    expect(categories).not.toContain("US_TAX_INTERACTION");
    expect(categories).not.toContain("TAX_TREATY_OR_FOREIGN_TAX_CREDIT");
    for (const f of result.financialEfficiency.findings) {
      expect(f.factSummary ?? "").not.toMatch(/federal/i);
    }

    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 2 — $4,000 hard-ceiling: BORDERLINE (budget falls inside the real range), does not auto-exclude", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 4000, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));

    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 3 — $7,000 flexible: AFFORDABLE (budget meets/exceeds the range high)", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 7000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } }));

    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.affordability.reasonCodes).toEqual(["WITHIN_BUDGET_RANGE"]);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 4 — domestic remote employee: remoteWorkLegality null, no retirement findings, wealth-tax still relevant", () => {
    const result = run(
      makeProfile({
        activityMode: "REMOTE_EMPLOYEE",
        intendsToWorkDuringStay: true,
        budget: { monthlyTargetAmount: 6000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
      }),
    );

    expect(result.eligibility.criteria.remoteWorkLegality).toBeNull();
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");

    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toEqual(["WEALTH_TAX"]);
    expect(categories).not.toContain("PENSION_TREATMENT");

    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 5 — permanent domestic buyer (retired): foreign-purchase gate null, Layer 2 UNKNOWN, retirement findings present, property/transfer-tax/buy-vs-rent/residency-relationship UNKNOWN", () => {
    const result = run(
      makeProfile({
        tenureIntent: "BUY",
        budget: { monthlyTargetAmount: 6000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );

    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");

    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);

    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toEqual([
      "PENSION_TREATMENT",
      "SOCIAL_SECURITY_TREATMENT",
      "IRA_TREATMENT",
      "RETIREMENT_ACCOUNT_401K_TREATMENT",
      "WEALTH_TAX",
      "PROPERTY_TAX",
      "PURCHASE_OR_TRANSFER_TAX",
      "BUY_VS_RENT_IMPLICATION",
      "PROPERTY_RESIDENCY_RELATIONSHIP",
    ]);
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_TAX")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PROPERTY_TAX_RATE_UNKNOWN", factSummary: null });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PURCHASE_OR_TRANSFER_TAX")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PURCHASE_TRANSFER_TAX_RATE_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "BUY_VS_RENT_IMPLICATION")).toMatchObject({ severity: "UNKNOWN", reasonCode: "OWNERSHIP_COST_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_RESIDENCY_RELATIONSHIP")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PROPERTY_RESIDENCY_RELATIONSHIP_UNKNOWN" });

    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION"); // driven by Layer 2 UNKNOWN, not Layer 1
  });

  it("SCENARIO 6 — beach soft preference: NEARBY contributes materially (not poor like Summerlin's NONE), no exclusion from Layer 3", () => {
    const result = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 4, isHardRequirement: false, targetValue: null },
          { dimensionKey: "culture", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null }, // missing - no exact score row
        ],
      }),
    );

    expect(result.lifestyleFit.scoreStatus).toBe("SCORED");
    expect(result.lifestyleFit.scoredDimensionCount).toBe(2);
    expect(result.lifestyleFit.relevantDimensionCount).toBe(3);
    expect(result.lifestyleFit.coverageRatio).toBeCloseTo(2 / 3);

    const beachContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "beachLifestyle");
    expect(beachContribution).toMatchObject({ isUnknown: false, rawDimensionValue: 60, normalizedFitPercent: 60 }); // BEACH_ACCESS_DIMENSION_SCORE.NEARBY

    const climateContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "climate");
    expect(climateContribution).toMatchObject({ isUnknown: false, rawDimensionValue: 78, normalizedFitPercent: 78 });

    const cultureContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "culture");
    expect(cultureContribution).toMatchObject({ isUnknown: true, rawDimensionValue: null, contributionPoints: 0 }); // missing, never fabricated

    expect(result.lifestyleFit.tradeoffs).toEqual([]); // no high-importance/poor-fit combination here
    expect(result.eligibility.criteria.beachAccessGate).toBeNull(); // no hard requirement activated
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 7 — beach hard requirement (PRODUCT-SEMANTIC FINDING): NEARBY currently PASSES the gate", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true } }),
    );

    // Product finding: the current gate only distinguishes NONE/UNKNOWN from "any access" -
    // NEARBY passes identically to DIRECT_ACCESS under the current contract (same as Lisbon's NEARBY).
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "PASS", reasonCode: "BEACH_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 8 — mountain/ski hard requirement: FAIL (mountainOrSkiAccess=NONE) -> EXCLUDED", () => {
    const result = run(
      makeProfile({
        budget: { monthlyTargetAmount: 7000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" }, // affordable
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true },
      }),
    );

    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "FAIL", reasonCode: "NO_MOUNTAIN_OR_SKI_ACCESS" });
    expect(result.eligibility.overallStatus).toBe("EXCLUDED");
    expect(result.eligibility.exclusionReasonCodes).toEqual(["NO_MOUNTAIN_OR_SKI_ACCESS"]);
    expect(result.affordability.status).toBe("AFFORDABLE"); // proves affordability alone cannot override a Layer 1 FAIL
    expect(result.excluded).toBe(true);
    expect(result.recommendationStatus).toBe("EXCLUDED");
  });

  it("SCENARIO 9 — LGBTQ legal-safety essential: UNKNOWN (generic placeholder text), NEEDS_VERIFICATION - not fixed in this task", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } }),
    );

    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "LGBTQ_LEGAL_STATUS_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 10 — safety minimum essential: UNKNOWN (worst severity=High), never coerced to FAIL", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "MODERATE_OR_BETTER" } }),
    );

    expect(result.eligibility.criteria.safetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "SAFETY_STANDARD_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 11 — couple / retired: Layer 2 UNKNOWN (HOUSEHOLD_ESTIMATE_MISMATCH, single-only cost data), spouse-inclusion stays null domestically", () => {
    const result = run(makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }));

    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toBeNull();
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
    expect(result.affordability.householdSizeAssumed).toBe(1);
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 12 — climate-focused user: climate contributes materially, missing dimensions reduce coverage, never fabricated", () => {
    const result = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "nightlife", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null }, // missing
        ],
      }),
    );

    expect(result.lifestyleFit.scoreStatus).toBe("SCORED");
    expect(result.lifestyleFit.scoredDimensionCount).toBe(1);
    expect(result.lifestyleFit.relevantDimensionCount).toBe(2);
    expect(result.lifestyleFit.coverageRatio).toBeCloseTo(0.5);
    expect(result.lifestyleFit.totalScore).toBe(78); // only climate scored, at its own normalized fit percent

    const climateContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "climate");
    expect(climateContribution).toMatchObject({ isUnknown: false, rawDimensionValue: 78, normalizedFitPercent: 78 });

    const nightlifeContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "nightlife");
    expect(nightlifeContribution).toMatchObject({ isUnknown: true, rawDimensionValue: null });
  });

  it("SCENARIO 13 — retirement-tax-favorable user: all 4 retirement-income findings + wealth-tax finding present, no fatal constraints", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 7000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } }));

    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    for (const category of ["PENSION_TREATMENT", "SOCIAL_SECURITY_TREATMENT", "IRA_TREATMENT", "RETIREMENT_ACCOUNT_401K_TREATMENT", "WEALTH_TAX"]) {
      const finding = result.financialEfficiency.findings.find((f) => f.category === category);
      expect(finding).toMatchObject({ severity: "POSITIVE" });
      expect(finding?.factSummary ?? "").not.toMatch(/federal/i);
    }
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 14 — affordable but mountain FAIL: Layer 2 favorable, Layer 1 mountain gate FAIL, final EXCLUDED (DO NOT AVERAGE AWAY A FATAL FLAW)", () => {
    const result = run(
      makeProfile({
        budget: { monthlyTargetAmount: 7000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true },
      }),
    );

    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "FAIL" });
    expect(result.eligibility.overallStatus).toBe("EXCLUDED");
    expect(result.excluded).toBe(true);
    expect(result.recommendationStatus).toBe("EXCLUDED");
  });

  it("SCENARIO 15 — no hard gates / sparse Layer 3: measures real coverage honestly, never padded", () => {
    const result = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
          { dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
          { dimensionKey: "healthcareQuality", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
          { dimensionKey: "safetyQuality", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
          { dimensionKey: "walkability", direction: "MORE_IS_BETTER", importance: 4, isHardRequirement: false, targetValue: null },
          { dimensionKey: "golf", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
        ],
      }),
    );

    // climate(78), beachLifestyle(60), mountainOutdoorLifestyle(0 - a real "no access" value, not missing), healthcareQuality(66) resolve;
    // safetyQuality (safetyStandard=UNKNOWN), walkability (no exact score row), golf (no score row) do not.
    expect(result.lifestyleFit.scoredDimensionCount).toBe(4);
    expect(result.lifestyleFit.relevantDimensionCount).toBe(7);
    expect(result.lifestyleFit.coverageRatio).toBeCloseTo(4 / 7);
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "mountainOutdoorLifestyle")).toMatchObject({ isUnknown: false, rawDimensionValue: 0 });
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "safetyQuality")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "walkability")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "golf")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
  });

  it("DOMESTIC APPLICABILITY PROOF — no international-only Layer 1 criteria or Layer 4 findings appear across any U.S.-citizen scenario", () => {
    const scenarios = [
      makeProfile(),
      makeProfile({ activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true }),
      makeProfile({ tenureIntent: "BUY", hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true } }),
      makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }),
    ];

    for (const profile of scenarios) {
      const result = run(profile);
      expect(result.eligibility.criteria.entryFeasibility).toBeNull();
      expect(result.eligibility.criteria.stayDurationFeasibility).toBeNull();
      expect(result.eligibility.criteria.retirementOrResidencyPath).toBeNull();
      expect(result.eligibility.criteria.remoteWorkLegality).toBeNull();
      expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();
      const categories = result.financialEfficiency.findings.map((f) => f.category);
      expect(categories).not.toContain("TAX_RESIDENCY_TRIGGER");
      expect(categories).not.toContain("US_TAX_INTERACTION");
      expect(categories).not.toContain("TAX_TREATY_OR_FOREIGN_TAX_CREDIT");
    }
  });
});
