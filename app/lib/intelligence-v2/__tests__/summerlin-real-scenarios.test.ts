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
 * Phase 11 — real Summerlin (summerlin-nv-us) workbook facts run through the REAL
 * four-layer engine for representative U.S.-domestic profiles (no mocks in the
 * chain: real parser -> real adapter -> real orchestrator).
 *
 * This is validation, not tuning: every assertion below pins the engine's actual
 * observed output for the given profile. If the engine's semantics ever change,
 * these tests should fail loudly rather than be "fixed" to match new output.
 *
 * Summerlin is a domestic (US-US) relocation and USD->USD, so unlike the Lisbon
 * suite no FxRateTable is required or passed.
 */

const V32_MASTER_WORKBOOK_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Master_Workbook_v3.2_Pilot_Dataset.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let summerlinFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(V32_MASTER_WORKBOOK_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(V32_MASTER_WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "summerlin-nv-us");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  summerlinFacts = adapted!.facts;
});

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    // Domestic relocation, not a tourist stay - LONG_TERM_PERMANENT is the natural default.
    stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 6500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

// Summerlin's real cost data is USD, and every profile budget below is USD too -
// no FxRateTable is needed (or passed) for any scenario in this suite.
function run(profile: UserProfileV2) {
  return evaluateDestinationForProfile(profile, summerlinFacts);
}

describe("Summerlin real four-layer scenarios — no mocks in the chain (real workbook -> real parser -> real adapter -> real orchestrator)", () => {
  it("keeps the real v3.2 master workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(V32_MASTER_WORKBOOK_PATH)).toBe(workbookHashBefore);
  });

  it("real Summerlin facts loaded from the workbook match the expected post-enrichment values", () => {
    expect(summerlinFacts.countryCode).toBe("US");
    expect(summerlinFacts.hardGates.beachAccess).toBe("NONE");
    expect(summerlinFacts.hardGates.mountainOrSkiAccess).toBe("SKI_RESORT_ACCESS");
    expect(summerlinFacts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(summerlinFacts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(summerlinFacts.hardGates.lgbtqLegalProtectionStatus).toBe("LEGAL_PROTECTIONS_IN_PLACE");
    expect(summerlinFacts.hardGates.safetyStandard).toBe("UNKNOWN");
    expect(summerlinFacts.financial.pensionTreatment).toBe("EXEMPT");
    expect(summerlinFacts.financial.socialSecurityTreatment).toBe("EXEMPT");
    expect(summerlinFacts.financial.iraTreatment).toBe("EXEMPT");
    expect(summerlinFacts.financial.retirementAccount401kTreatment).toBe("EXEMPT");
    expect(summerlinFacts.financial.wealthTaxApplicable).toBe("NO");
    expect(summerlinFacts.financial.propertyTaxAnnualRatePercent).toBe(0.5);
    expect(summerlinFacts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
    expect(summerlinFacts.cost.estimatedMonthlyCostRange).toEqual({ low: 3840, high: 7320, currencyCode: "USD" });
    expect(summerlinFacts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(summerlinFacts.lifestyleDimensions.dimensionValues.walkability).toBe(55);
    // "retirement" (legacy/unconsumed) and "lifestyle" (legacy/miskeyed) are exact-match only against
    // the engine's LIFESTYLE_DIMENSION_KEYS, so neither is present in dimensionValues at all.
    expect(summerlinFacts.lifestyleDimensions.dimensionValues.retirement).toBeUndefined();
    expect(summerlinFacts.lifestyleDimensions.dimensionValues.lifestyle).toBeUndefined();
    expect(summerlinFacts.lifestyleDimensions.dimensionValues.culture).toBeUndefined();
    // international-only fields remain blank
    expect(summerlinFacts.entryAndStay.touristStayLimitDays).toBeNull();
    expect(summerlinFacts.entryAndStay.remoteWorkLegalUnderTouristStatus).toBe("UNKNOWN");
    expect(summerlinFacts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable).toBe("UNKNOWN");
    expect(summerlinFacts.entryAndStay.retirementVisaProgramAvailable).toBe("UNKNOWN");
    expect(summerlinFacts.entryAndStay.spouseOrDependentInclusionSupported).toBe("UNKNOWN");
    expect(summerlinFacts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("UNKNOWN");
    expect(summerlinFacts.financial.taxResidencyTriggerDays).toBeNull();
    expect(summerlinFacts.financial.usTaxTreatyInEffect).toBe("UNKNOWN");
    expect(summerlinFacts.financial.foreignTaxCreditAvailable).toBe("UNKNOWN");
  });

  it("SCENARIO 1 — single retiree / renter / $6,500 flexible: all international Layer 1 criteria null, no spurious NEEDS_VERIFICATION, domestic retirement findings present", () => {
    const result = run(makeProfile());

    // Layer 1: every criterion is null - domestic (no immigration question) or simply not activated.
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

    // Layer 2: real $3,840-$7,320 range against $6,500 -> straddles the range -> BORDERLINE, not AFFORDABLE.
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.estimatedMonthlyCostRange).toEqual({ low: 3840, high: 7320, currencyCode: "USD" });
    expect(result.affordability.reasonCodes).toEqual(["COST_RANGE_STRADDLES_BUDGET"]);
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.affordability.currencyConversion).toBeNull(); // USD -> USD, no conversion needed

    // Layer 4: no international findings at all; domestic retirement-income findings present, all POSITIVE (workbook EXEMPT).
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
    // Never claims "federally tax free" - findings are structured reason codes, not prose.
    for (const f of result.financialEfficiency.findings) {
      expect(f.factSummary ?? "").not.toMatch(/federal/i);
    }

    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 2 — $4,500 hard-ceiling: BORDERLINE (budget falls inside the real range), does not auto-exclude", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));

    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false); // only UNAFFORDABLE + HARD_CEILING excludes
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 3 — $8,000 flexible: AFFORDABLE (budget meets/exceeds the range high)", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 8000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } }));

    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.affordability.reasonCodes).toEqual(["WITHIN_BUDGET_RANGE"]);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 4 — domestic remote employee: remoteWorkLegality null (no digital-nomad/tourist-work/foreign-residence path), no retirement findings, wealth-tax still relevant", () => {
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
    expect(categories).toEqual(["WEALTH_TAX"]); // not retired -> no PENSION/SS/IRA/401K; domestic -> WEALTH_TAX still relevant
    expect(categories).not.toContain("PENSION_TREATMENT");
    expect(categories).not.toContain("TAX_RESIDENCY_TRIGGER");
    expect(categories).not.toContain("US_TAX_INTERACTION");
    expect(categories).not.toContain("TAX_TREATY_OR_FOREIGN_TAX_CREDIT");

    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 5 — permanent domestic buyer (retired): foreign-purchase gate null, Layer 2 UNKNOWN (no ownership-cost model), property-tax known, transfer-tax/buy-vs-rent/residency-relationship UNKNOWN, domestic retirement findings present", () => {
    const result = run(
      makeProfile({
        tenureIntent: "BUY",
        budget: { monthlyTargetAmount: 6000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );

    // Foreign-purchaser eligibility does not apply to a domestic buyer, even with the hard requirement activated.
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
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_TAX")).toMatchObject({ severity: "NEUTRAL", reasonCode: "PROPERTY_TAX_RATE_KNOWN", factSummary: "Annual property tax rate: 0.5%." });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PURCHASE_OR_TRANSFER_TAX")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PURCHASE_TRANSFER_TAX_RATE_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "BUY_VS_RENT_IMPLICATION")).toMatchObject({ severity: "UNKNOWN", reasonCode: "OWNERSHIP_COST_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_RESIDENCY_RELATIONSHIP")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PROPERTY_RESIDENCY_RELATIONSHIP_UNKNOWN" });

    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION"); // driven by Layer 2 UNKNOWN, not by Layer 1
  });

  it("SCENARIO 6 — beach soft preference: poor beach contribution (beachAccess=NONE) but no exclusion from Layer 3; missing climate lowers coverage, is not fabricated", () => {
    const result = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "walkability", direction: "MORE_IS_BETTER", importance: 4, isHardRequirement: false, targetValue: null },
          { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
        ],
      }),
    );

    expect(result.lifestyleFit.scoreStatus).toBe("SCORED");
    expect(result.lifestyleFit.scoredDimensionCount).toBe(2); // beachLifestyle + walkability
    expect(result.lifestyleFit.relevantDimensionCount).toBe(3); // + climate (missing)
    expect(result.lifestyleFit.coverageRatio).toBeCloseTo(2 / 3);

    const beachContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "beachLifestyle");
    expect(beachContribution).toMatchObject({ isUnknown: false, rawDimensionValue: 0, normalizedFitPercent: 0, contributionPoints: 0 });

    const walkabilityContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "walkability");
    expect(walkabilityContribution).toMatchObject({ isUnknown: false, rawDimensionValue: 55, normalizedFitPercent: 55 });

    const climateContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "climate");
    expect(climateContribution).toMatchObject({ isUnknown: true, rawDimensionValue: null, contributionPoints: 0 }); // missing, never fabricated

    // Poor beach fit at high importance surfaces as a tradeoff, not an exclusion - Layer 1 is untouched.
    expect(result.lifestyleFit.tradeoffs).toContainEqual(expect.objectContaining({ dimensionKey: "beachLifestyle", note: "HIGH_IMPORTANCE_POOR_FIT" }));
    expect(result.eligibility.criteria.beachAccessGate).toBeNull(); // no hard requirement activated
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 7 — beach hard requirement: FAIL (beachAccess=NONE) -> EXCLUDED, no other positive factor overrides it", () => {
    const result = run(
      makeProfile({
        budget: { monthlyTargetAmount: 8000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" }, // affordable
        lifestylePreferences: [
          { dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "walkability", direction: "MORE_IS_BETTER", importance: 4, isHardRequirement: false, targetValue: null },
        ], // strong mountain/golf-adjacent/walkability fit
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true },
      }),
    );

    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "FAIL", reasonCode: "NO_BEACH_ACCESS" });
    expect(result.eligibility.overallStatus).toBe("EXCLUDED");
    expect(result.eligibility.exclusionReasonCodes).toEqual(["NO_BEACH_ACCESS"]);
    expect(result.affordability.status).toBe("AFFORDABLE"); // proves affordability alone cannot override a Layer 1 FAIL
    expect(result.lifestyleFit.totalScore).toBeGreaterThan(0); // proves a strong Layer 3 score alone cannot override it either
    expect(result.excluded).toBe(true);
    expect(result.recommendationStatus).toBe("EXCLUDED");
  });

  it("SCENARIO 8 — mountain/ski hard requirement: PASS (SKI_RESORT_ACCESS)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true } }),
    );

    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS", reasonCode: "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 9 — LGBTQ legal-safety essential: PASS, sourced from legal_protections only (LEGAL_PROTECTIONS_IN_PLACE)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } }),
    );

    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "PASS", reasonCode: "LGBTQ_LEGAL_PROTECTIONS_IN_PLACE", sourceFactKeys: ["hardGates.lgbtqLegalProtectionStatus"] });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 10 — safety minimum essential: UNKNOWN (safetyStandard=UNKNOWN from the single high-severity heat record), never coerced to FAIL", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "MODERATE_OR_BETTER" } }),
    );

    expect(result.eligibility.criteria.safetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "SAFETY_STANDARD_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.eligibility.unknownReasonCodes).toEqual(["SAFETY_STANDARD_UNKNOWN"]);
    expect(result.excluded).toBe(false); // UNKNOWN never excludes
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 11 — couple / retired: Layer 2 UNKNOWN (HOUSEHOLD_ESTIMATE_MISMATCH, single-only cost data), and spouse-inclusion criterion stays null (domestic, not an immigration question)", () => {
    const result = run(makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }));

    // Domestic: no visa-inclusion question exists, even though a dependent path would normally be checked.
    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toBeNull();
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
    expect(result.affordability.householdSizeAssumed).toBe(1); // Summerlin's real cost data is single-person only
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 12 — mountain-loving vs beach-loving user: same real Summerlin facts produce materially different Layer 3 results; missing climate reduces coverage for both, never fabricated", () => {
    const mountainLover = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
        ],
      }),
    );
    const beachLover = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
        ],
      }),
    );

    expect(mountainLover.lifestyleFit.totalScore).not.toBe(beachLover.lifestyleFit.totalScore);
    expect(mountainLover.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "mountainOutdoorLifestyle")).toMatchObject({ rawDimensionValue: 100, normalizedFitPercent: 100 });
    expect(beachLover.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "beachLifestyle")).toMatchObject({ rawDimensionValue: 0, normalizedFitPercent: 0 });

    // Both profiles lack a climate score - coverage is reduced identically for both, never fabricated.
    expect(mountainLover.lifestyleFit.coverageRatio).toBeCloseTo(1 / 2);
    expect(beachLover.lifestyleFit.coverageRatio).toBeCloseTo(1 / 2);
    expect(mountainLover.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "climate")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
    expect(beachLover.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "climate")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
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

  it("PROPERTY PROOF — property-tax finding reflects the real 0.50% rate; transfer tax stays UNKNOWN (blank), never invented", () => {
    const result = run(
      makeProfile({
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );

    const propertyTax = result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_TAX");
    expect(propertyTax).toMatchObject({ severity: "NEUTRAL", reasonCode: "PROPERTY_TAX_RATE_KNOWN" });
    expect(propertyTax?.factSummary).toBe("Annual property tax rate: 0.5%.");

    const transferTax = result.financialEfficiency.findings.find((f) => f.category === "PURCHASE_OR_TRANSFER_TAX");
    expect(transferTax).toMatchObject({ severity: "UNKNOWN", reasonCode: "PURCHASE_TRANSFER_TAX_RATE_UNKNOWN", factSummary: null });
  });

  it("LAYER 3 COVERAGE ASSESSMENT — sparse real score coverage (walkability + 4 enum-derived) is measured honestly, never padded", () => {
    const result = run(
      makeProfile({
        lifestylePreferences: [
          { dimensionKey: "walkability", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
          { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
          { dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
          { dimensionKey: "healthcareQuality", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
          { dimensionKey: "safetyQuality", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
          { dimensionKey: "golf", direction: "MORE_IS_BETTER", importance: 4, isHardRequirement: false, targetValue: null },
          { dimensionKey: "culture", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
        ],
      }),
    );

    // 5 of 7 requested dimensions currently resolve (walkability, beach, mountain, healthcare); safetyQuality is
    // enum-derived but resolves to null because safetyStandard itself is UNKNOWN; golf/culture have no score row yet.
    expect(result.lifestyleFit.scoredDimensionCount).toBe(4);
    expect(result.lifestyleFit.relevantDimensionCount).toBe(7);
    expect(result.lifestyleFit.coverageRatio).toBeCloseTo(4 / 7);
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "safetyQuality")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "golf")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
    expect(result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "culture")).toMatchObject({ isUnknown: true, rawDimensionValue: null });
  });
});
