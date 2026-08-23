import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport, type IntelligenceV2DestinationFacts } from "../workbook-v32-adapter";
import { evaluateDestinationForProfile } from "../orchestrator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import type { FxRateTable } from "../fx-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

/**
 * Puerto Vallarta (puerto-vallarta-mx) real four-layer scenarios — the first
 * Batch #1 CROSS-BORDER + non-USD (MXN) real fixture: real workbook -> real
 * deterministic parser -> real workbook-v32 adapter -> real orchestrator, no
 * mocks in the core chain. Unlike The Villages/Summerlin (domestic), Puerto
 * Vallarta is US->MX (CROSS_BORDER), so international Layer 1 criteria and
 * Layer 4 cross-border categories (TAX_RESIDENCY_TRIGGER, US_TAX_INTERACTION,
 * TAX_TREATY_OR_FOREIGN_TAX_CREDIT) are expected to be active, not suppressed.
 *
 * This is validation, not tuning: every assertion below pins the engine's
 * actual observed output for the given profile. If the engine's semantics
 * ever change, these tests should fail loudly rather than be "fixed" to match
 * new output.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let pvFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "puerto-vallarta-mx");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  pvFacts = adapted!.facts;
});

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

// EXPLICIT ILLUSTRATIVE frozen FX snapshot - a test fixture only, never a claim about
// live market FX. Puerto Vallarta's real cost data is MXN; every USD profile budget
// below requires this table for Layer 2 to compare them at all.
const USD_MXN_RATE = 18.5;
const FROZEN_FX_TABLE: FxRateTable = {
  snapshotVersion: "pv-real-scenario-fixture-2026-08",
  effectiveDate: "2026-08-22",
  source: "deterministic-test-fixture",
  rates: [{ baseCurrency: "USD", quoteCurrency: "MXN", rate: USD_MXN_RATE }],
};
const EXPECTED_LOW_USD = 34600 / USD_MXN_RATE;
const EXPECTED_HIGH_USD = 71500 / USD_MXN_RATE;

function run(profile: UserProfileV2, fxTable: FxRateTable | undefined = FROZEN_FX_TABLE) {
  return evaluateDestinationForProfile(profile, pvFacts, fxTable);
}

describe("Puerto Vallarta real four-layer scenarios — first Batch #1 cross-border + MXN FX proof (no mocks in the chain)", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  it("real Puerto Vallarta facts loaded from the workbook match the expected post-enrichment values", () => {
    expect(pvFacts.countryCode).toBe("MX");
    expect(pvFacts.hardGates.beachAccess).toBe("DIRECT_ACCESS");
    expect(pvFacts.hardGates.mountainOrSkiAccess).toBe("MOUNTAIN_SCENIC_ONLY");
    expect(pvFacts.entryAndStay.touristEntryAllowed).toBe("YES");
    expect(pvFacts.entryAndStay.touristStayLimitDays).toBe(180);
    expect(pvFacts.entryAndStay.extendedStayOrLongStayVisaAvailable).toBe("YES");
    expect(pvFacts.entryAndStay.permanentResidencyPathAvailable).toBe("UNKNOWN");
    expect(pvFacts.entryAndStay.retirementVisaProgramAvailable).toBe("UNKNOWN");
    expect(pvFacts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable).toBe("UNKNOWN");
    expect(pvFacts.entryAndStay.remoteWorkLegalUnderTouristStatus).toBe("UNKNOWN");
    expect(pvFacts.entryAndStay.spouseOrDependentInclusionSupported).toBe("UNKNOWN");
    expect(pvFacts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(pvFacts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("UNKNOWN");
    expect(pvFacts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(pvFacts.hardGates.safetyStandard).toBe("UNKNOWN");
    expect(pvFacts.hardGates.lgbtqLegalProtectionStatus).toBe("UNKNOWN");
    expect(pvFacts.cost.estimatedMonthlyCostRange).toEqual({ low: 34600, high: 71500, currencyCode: "MXN" });
    expect(pvFacts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(pvFacts.financial.pensionTreatment).toBe("TREATY_DEPENDENT");
    expect(pvFacts.financial.socialSecurityTreatment).toBe("TREATY_DEPENDENT");
    expect(pvFacts.financial.iraTreatment).toBe("TREATY_DEPENDENT");
    expect(pvFacts.financial.retirementAccount401kTreatment).toBe("TREATY_DEPENDENT");
    expect(pvFacts.financial.usTaxTreatyInEffect).toBe("YES");
    expect(pvFacts.financial.foreignTaxCreditAvailable).toBe("UNKNOWN");
    expect(pvFacts.financial.wealthTaxApplicable).toBe("NO");
    expect(pvFacts.financial.taxResidencyTriggerDays).toBeNull();
    expect(pvFacts.financial.propertyTaxAnnualRatePercent).toBeNull();
    expect(pvFacts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
    expect(pvFacts.lifestyleDimensions.dimensionValues.climate).toBe(82);
    // No other exact-match DESTINATION_SCORES key exists for PV (walkability/culture/golf/etc are miskeyed legacy rows).
    expect(pvFacts.lifestyleDimensions.dimensionValues.walkability).toBeUndefined();
    expect(pvFacts.lifestyleDimensions.dimensionValues.golf).toBeUndefined();
    expect(pvFacts.lifestyleDimensions.dimensionValues.culture).toBeUndefined();
  });

  it("SCENARIO 1/6 — 90-day retired renter / $4,500 FLEXIBLE: full four-layer trace, real MXN->USD conversion, cross-border Layer 4 categories present", () => {
    const result = run(makeProfile());

    // LAYER 1
    expect(result.eligibility.criteria.entryFeasibility).toMatchObject({ status: "PASS", reasonCode: "ENTRY_ALLOWED" });
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "TOURIST_PATH_SUFFICIENT_FOR_PRESENCE" });
    // RETIRED but band is SHORT_1_3_MONTHS - retirementOrResidencyPath is not activated for a short stay.
    expect(result.eligibility.criteria.retirementOrResidencyPath).toBeNull();
    expect(result.eligibility.criteria.remoteWorkLegality).toBeNull();
    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toBeNull();
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.exclusionReasonCodes).toEqual([]);
    expect(result.eligibility.unknownReasonCodes).toEqual([]);

    // LAYER 2 - real MXN range converted through the frozen FX table.
    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "MXN",
      originalRange: { low: 34600, high: 71500, currencyCode: "MXN" },
      fxSnapshotVersion: "pv-real-scenario-fixture-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
    });
    expect(result.affordability.currencyConversion!.convertedRange!.low).toBeCloseTo(EXPECTED_LOW_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.high).toBeCloseTo(EXPECTED_HIGH_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.currencyCode).toBe("USD");
    expect(result.affordability.estimatedMonthlyCostRange!.low).toBeCloseTo(EXPECTED_LOW_USD, 6);
    expect(result.affordability.estimatedMonthlyCostRange!.high).toBeCloseTo(EXPECTED_HIGH_USD, 6);
    // high (~3864.86) <= 4500 budget -> AFFORDABLE.
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.affordability.reasonCodes).toEqual(["WITHIN_BUDGET_RANGE"]);
    expect(result.affordability.excludedByAffordability).toBe(false);

    // LAYER 4 - cross-border categories ARE present (unlike domestic Summerlin/Villages).
    expect(result.financialEfficiency.findings.map((f) => f.category)).toEqual([
      "TAX_RESIDENCY_TRIGGER",
      "PENSION_TREATMENT",
      "SOCIAL_SECURITY_TREATMENT",
      "IRA_TREATMENT",
      "RETIREMENT_ACCOUNT_401K_TREATMENT",
      "US_TAX_INTERACTION",
      "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
      "WEALTH_TAX",
    ]);
    expect(result.financialEfficiency.findings[0]).toMatchObject({ severity: "UNKNOWN", reasonCode: "NO_TAX_RESIDENCY_THRESHOLD_FACT" });
    for (const category of ["PENSION_TREATMENT", "SOCIAL_SECURITY_TREATMENT", "IRA_TREATMENT", "RETIREMENT_ACCOUNT_401K_TREATMENT"] as const) {
      const finding = result.financialEfficiency.findings.find((f) => f.category === category)!;
      expect(finding.severity).toBe("CAUTION");
      expect(finding.reasonCode).toBe(`${category}_TREATY_DEPENDENT`);
    }
    expect(result.financialEfficiency.findings.find((f) => f.category === "US_TAX_INTERACTION")).toMatchObject({ severity: "CAUTION", reasonCode: "US_WORLDWIDE_TAXATION_APPLIES" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({
      severity: "CAUTION",
      reasonCode: "TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION",
    });
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME" });

    // FINAL
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 2 — 210-day retired renter: post-tightening, the generic presence-based long-stay fact ALONE is no longer sufficient — activity-specific facts are UNKNOWN, so the honest result is UNKNOWN/NEEDS_VERIFICATION", () => {
    const result = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } }));

    // 210 > 180-day tourist limit, so the tourist-path branch does NOT fire. Post-tightening, the
    // bare generic extendedStayOrLongStayVisaAvailable=YES fact is no longer sufficient by itself
    // for a RETIRED profile - a specific retirementVisaProgramAvailable or
    // permanentResidencyPathAvailable fact is required, and both are UNKNOWN for Puerto Vallarta
    // today, so the honest result is UNKNOWN, never a fabricated PASS.
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "UNKNOWN", reasonCode: "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "UNKNOWN", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.eligibility.unknownReasonCodes).toEqual([
      "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE",
      "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE",
      "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN",
    ]);
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 3 — permanent retiree: the LONG_TERM_PERMANENT-specific facts (permanentResidencyPathAvailable/retirementVisaProgramAvailable) are genuinely incomplete -> real UNKNOWN_INCOMPLETE", () => {
    const result = run(makeProfile({ stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null } }));

    // Unlike the 210-day case, LONG_TERM_PERMANENT keys off permanentResidencyPathAvailable/
    // retirementVisaProgramAvailable specifically (not extendedStayOrLongStayVisaAvailable),
    // both of which are UNKNOWN for Puerto Vallarta today.
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    // Post-tightening, retirementOrResidencyPath no longer accepts the bare generic fact either -
    // it now requires the same specific retirement/permanent-residency facts, both UNKNOWN here.
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "UNKNOWN", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.eligibility.unknownReasonCodes).toEqual(["PERMANENT_PATH_UNKNOWN", "PERMANENT_PATH_UNKNOWN", "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN"]);
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");

    // Layer 4 retirement/treaty/wealth-tax findings remain fully present and honest regardless.
    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toContain("PENSION_TREATMENT");
    expect(categories).toContain("WEALTH_TAX");
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
  });

  it("SCENARIO 4 — $2,000 HARD_CEILING: the real converted range's low bound (~$1,870) is below $2,000 -> BORDERLINE, not UNAFFORDABLE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 2000, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.reasonCodes).toEqual(["COST_RANGE_STRADDLES_BUDGET"]);
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 5 — $3,000 HARD_CEILING: also straddles the real converted range -> BORDERLINE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 3000, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 7 — remote employee / 90 days: remote-work legality is a genuine UNKNOWN (connectivity is never conflated with work authorization)", () => {
    const result = run(makeProfile({ activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true }));

    expect(result.eligibility.criteria.entryFeasibility).toMatchObject({ status: "PASS" });
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "TOURIST_PATH_SUFFICIENT_FOR_PRESENCE" });
    expect(result.eligibility.criteria.remoteWorkLegality).toMatchObject({ status: "UNKNOWN", reasonCode: "REMOTE_WORK_LEGALITY_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
    // Not retired -> no retirement-income findings, but WEALTH_TAX/treaty/residency-trigger remain relevant.
    expect(result.financialEfficiency.findings.map((f) => f.category)).not.toContain("PENSION_TREATMENT");
  });

  it("SCENARIO 8 — beach hard requirement: DIRECT_ACCESS -> real PASS", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "PASS", reasonCode: "BEACH_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 9 — mountain/ski hard requirement: MOUNTAIN_SCENIC_ONLY -> real PASS (PRODUCT FINDING: the combined gate does not distinguish scenic-only from true ski-resort access)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS", reasonCode: "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 10 — LGBTQ legal-safety hard requirement: UNKNOWN (generic placeholder text) -> NEEDS_VERIFICATION, a data gap not a bug", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } }),
    );
    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "LGBTQ_LEGAL_STATUS_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 11 — safety minimum hard requirement: UNKNOWN (worst severity=High) -> NEEDS_VERIFICATION, never coerced to FAIL", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "MODERATE_OR_BETTER" } }),
    );
    expect(result.eligibility.criteria.safetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "SAFETY_STANDARD_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 12 — foreign property buyer: property gate PASSes (YES) but the fideicomiso/trust-structure nuance is invisible to the engine (PRODUCT/SCHEMA finding); Layer 2/4 honestly UNKNOWN, nothing invented", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );

    // Property gate PASSes - the engine cannot express "permitted only via a required trust structure".
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "PASS", reasonCode: "FOREIGN_PROPERTY_PURCHASE_ALLOWED" });
    // Still UNKNOWN_INCOMPLETE overall because the LONG_TERM_PERMANENT residency-path facts remain incomplete.
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");

    // Layer 2 - BUY has no ownership-cost model in this phase.
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);

    // Layer 4 - property/transfer-tax/buy-vs-rent/residency-relationship all honestly UNKNOWN, nothing invented.
    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toEqual([
      "TAX_RESIDENCY_TRIGGER",
      "PENSION_TREATMENT",
      "SOCIAL_SECURITY_TREATMENT",
      "IRA_TREATMENT",
      "RETIREMENT_ACCOUNT_401K_TREATMENT",
      "US_TAX_INTERACTION",
      "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
      "WEALTH_TAX",
      "PROPERTY_TAX",
      "PURCHASE_OR_TRANSFER_TAX",
      "BUY_VS_RENT_IMPLICATION",
      "PROPERTY_RESIDENCY_RELATIONSHIP",
    ]);
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_TAX")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PROPERTY_TAX_RATE_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PURCHASE_OR_TRANSFER_TAX")).toMatchObject({ severity: "UNKNOWN", reasonCode: "PURCHASE_TRANSFER_TAX_RATE_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "BUY_VS_RENT_IMPLICATION")).toMatchObject({ severity: "UNKNOWN", reasonCode: "OWNERSHIP_COST_UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_RESIDENCY_RELATIONSHIP")).toMatchObject({
      severity: "UNKNOWN",
      reasonCode: "PROPERTY_RESIDENCY_RELATIONSHIP_UNKNOWN",
    });

    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 13 — couple retiree: single-only cost data -> real HOUSEHOLD_ESTIMATE_MISMATCH; spouse-inclusion fact is also genuinely UNKNOWN, no multiplier invented", () => {
    const result = run(
      makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }),
    );
    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "SPOUSE_OR_DEPENDENT_INCLUSION_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
    expect(result.affordability.householdSizeAssumed).toBe(1);
  });

  it("SCENARIO 14 — beach-lover vs. climate-lover: materially different personalized scores from the same real destination facts; missing dimensions reduce coverage honestly", () => {
    const beachLover = makeProfile({
      lifestylePreferences: [
        { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
        { dimensionKey: "golf", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
      ],
    });
    const climateLover = makeProfile({
      lifestylePreferences: [
        { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
        { dimensionKey: "golf", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
      ],
    });

    const beachResult = run(beachLover);
    const climateResult = run(climateLover);

    // beachLifestyle resolves from the real DIRECT_ACCESS enum (100); climate resolves from the real exact-match score (82).
    expect(beachResult.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "beachLifestyle")).toMatchObject({ rawDimensionValue: 100, isUnknown: false });
    expect(climateResult.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "climate")).toMatchObject({ rawDimensionValue: 82, isUnknown: false });
    expect(beachResult.lifestyleFit!.totalScore).toBe(100);
    expect(climateResult.lifestyleFit!.totalScore).toBe(82);
    expect(beachResult.lifestyleFit!.totalScore).not.toBe(climateResult.lifestyleFit!.totalScore);

    // "golf" has no exact-match DESTINATION_SCORES row for Puerto Vallarta - genuinely unresolved in both, never fabricated.
    for (const result of [beachResult, climateResult]) {
      expect(result.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "golf")).toMatchObject({ rawDimensionValue: null, isUnknown: true });
      expect(result.lifestyleFit!.scoredDimensionCount).toBe(1);
      expect(result.lifestyleFit!.relevantDimensionCount).toBe(2);
      expect(result.lifestyleFit!.coverageRatio).toBe(0.5);
      expect(result.lifestyleFit!.scoreStatus).toBe("SCORED");
    }
  });

  it("SCENARIO 15 — retirement tax findings: all four retirement categories TREATY_DEPENDENT/CAUTION, plus US_TAX_INTERACTION/treaty/wealth-tax/tax-residency-UNKNOWN, no personal tax liability asserted", () => {
    const result = run(makeProfile());
    const findings = result.financialEfficiency.findings;
    expect(findings.map((f) => f.category)).toEqual([
      "TAX_RESIDENCY_TRIGGER",
      "PENSION_TREATMENT",
      "SOCIAL_SECURITY_TREATMENT",
      "IRA_TREATMENT",
      "RETIREMENT_ACCOUNT_401K_TREATMENT",
      "US_TAX_INTERACTION",
      "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
      "WEALTH_TAX",
    ]);
    expect(findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")!.severity).toBe("UNKNOWN");
    for (const category of ["PENSION_TREATMENT", "SOCIAL_SECURITY_TREATMENT", "IRA_TREATMENT", "RETIREMENT_ACCOUNT_401K_TREATMENT"] as const) {
      const f = findings.find((finding) => finding.category === category)!;
      expect(f.severity).toBe("CAUTION");
      expect(f.factSummary).not.toMatch(/federal/i);
    }
  });

  it("SCENARIO 16 — tax-residency UNKNOWN does not block: Layer 1 ELIGIBLE + Layer 2 AFFORDABLE -> VIABLE, despite a Layer 4 TAX_RESIDENCY_TRIGGER=UNKNOWN finding", () => {
    const result = run(makeProfile());
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
    // The critical architecture proof: Layer 4 UNKNOWN never promotes recommendationStatus to NEEDS_VERIFICATION.
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.tradeoffs.some((t) => t.sourceLayer === "FINANCIAL" && t.category === "TAX_RESIDENCY_TRIGGER")).toBe(false);
  });

  it("SCENARIO 17 — frozen FX determinism: identical results across repeated runs with the same table; a different frozen rate can cross a budget boundary and change the outcome", () => {
    const profile = makeProfile({ budget: { monthlyTargetAmount: 3000, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const runA = run(profile, FROZEN_FX_TABLE);
    const runB = run(profile, FROZEN_FX_TABLE);
    expect(runA.affordability.estimatedMonthlyCostRange).toEqual(runB.affordability.estimatedMonthlyCostRange);
    expect(runA.affordability.status).toBe(runB.affordability.status);
    expect(runA.recommendationStatus).toBe(runB.recommendationStatus);
    expect(runA.affordability.reasonCodes).toEqual(runB.affordability.reasonCodes);
    // At 18.5 MXN/USD, $3,000 falls inside the converted range (~$1,870-$3,865) -> BORDERLINE, not excluded.
    expect(runA.affordability.status).toBe("BORDERLINE");
    expect(runA.affordability.excludedByAffordability).toBe(false);

    // A deliberately different (still frozen, still illustrative) FX table - NOT a live rate lookup.
    const CHEAPER_MXN_FX_TABLE: FxRateTable = {
      snapshotVersion: "pv-real-scenario-fixture-alt-rate-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
      rates: [{ baseCurrency: "USD", quoteCurrency: "MXN", rate: 10 }],
    };
    const runC = run(profile, CHEAPER_MXN_FX_TABLE);
    // At 10 MXN/USD the converted range becomes $3,460-$7,150 - now entirely above the $3,000 HARD_CEILING budget.
    expect(runC.affordability.estimatedMonthlyCostRange).toEqual({ low: 3460, high: 7150, currencyCode: "USD" });
    expect(runC.affordability.status).toBe("UNAFFORDABLE");
    expect(runC.affordability.excludedByAffordability).toBe(true);
    expect(runC.excluded).toBe(true);
    expect(runA.affordability.status).not.toBe(runC.affordability.status);
  });

  it("SCENARIO 18 — no FX table supplied: Layer 2 is honestly UNKNOWN, never a raw cross-currency numeric comparison", () => {
    const result = evaluateDestinationForProfile(makeProfile(), pvFacts);
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["MISSING_FX_RATE_FOR_CURRENCY_PAIR"]);
    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "MXN",
      originalRange: { low: 34600, high: 71500, currencyCode: "MXN" },
      convertedRange: null,
      fxSnapshotVersion: null,
      effectiveDate: null,
      source: null,
    });
    expect(result.affordability.excludedByAffordability).toBe(false);
  });

  it("CROSS-BORDER APPLICABILITY PROOF — US->MX is CROSS_BORDER: international Layer 1 criteria are real HardConstraintResults (never null), and cross-border Layer 4 categories are never suppressed", () => {
    const result = run(makeProfile());
    expect(result.eligibility.criteria.entryFeasibility).not.toBeNull();
    expect(result.eligibility.criteria.stayDurationFeasibility).not.toBeNull();
    expect(result.eligibility.criteria.requiredLegalPath).not.toBeNull();
    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toContain("TAX_RESIDENCY_TRIGGER");
    expect(categories).toContain("US_TAX_INTERACTION");
    expect(categories).toContain("TAX_TREATY_OR_FOREIGN_TAX_CREDIT");
  });
});
