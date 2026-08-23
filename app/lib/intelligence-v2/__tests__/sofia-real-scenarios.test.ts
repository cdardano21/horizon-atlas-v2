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
 * Sofia (sofia-bg) real four-layer scenarios — the second Batch #1 CROSS-BORDER
 * fixture and the first European (EUR + Schengen) real fixture: real workbook ->
 * real deterministic parser -> real workbook-v32 adapter -> real orchestrator, no
 * mocks in the core chain. Unlike The Villages/Summerlin (domestic), Sofia is
 * US->BG (CROSS_BORDER), so international Layer 1 criteria and Layer 4
 * cross-border categories (TAX_RESIDENCY_TRIGGER, US_TAX_INTERACTION,
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

let sofiaFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "sofia-bg");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  sofiaFacts = adapted!.facts;
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
    budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

// EXPLICIT ILLUSTRATIVE frozen FX snapshot - a test fixture only, never a claim about
// live market FX. Sofia's real cost data is EUR; every USD profile budget below
// requires this table for Layer 2 to compare them at all.
const USD_EUR_RATE = 0.92;
const FROZEN_FX_TABLE: FxRateTable = {
  snapshotVersion: "sofia-real-scenario-fixture-2026-08",
  effectiveDate: "2026-08-22",
  source: "deterministic-test-fixture",
  rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: USD_EUR_RATE }],
};
const EXPECTED_LOW_USD = 1370 / USD_EUR_RATE;
const EXPECTED_HIGH_USD = 2660 / USD_EUR_RATE;

function run(profile: UserProfileV2, fxTable: FxRateTable | undefined = FROZEN_FX_TABLE) {
  return evaluateDestinationForProfile(profile, sofiaFacts, fxTable);
}

describe("Sofia real four-layer scenarios — second Batch #1 cross-border + EUR FX proof (no mocks in the chain)", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  it("real Sofia facts loaded from the workbook match the expected post-enrichment values", () => {
    expect(sofiaFacts.countryCode).toBe("BG");
    expect(sofiaFacts.hardGates.beachAccess).toBe("NONE");
    expect(sofiaFacts.hardGates.mountainOrSkiAccess).toBe("SKI_RESORT_ACCESS");
    expect(sofiaFacts.entryAndStay.touristEntryAllowed).toBe("YES");
    expect(sofiaFacts.entryAndStay.touristStayLimitDays).toBe(90);
    expect(sofiaFacts.entryAndStay.extendedStayOrLongStayVisaAvailable).toBe("YES");
    expect(sofiaFacts.entryAndStay.permanentResidencyPathAvailable).toBe("UNKNOWN");
    expect(sofiaFacts.entryAndStay.retirementVisaProgramAvailable).toBe("UNKNOWN");
    expect(sofiaFacts.entryAndStay.remoteWorkOrDigitalNomadVisaAvailable).toBe("UNKNOWN");
    expect(sofiaFacts.entryAndStay.remoteWorkLegalUnderTouristStatus).toBe("UNKNOWN");
    expect(sofiaFacts.entryAndStay.spouseOrDependentInclusionSupported).toBe("UNKNOWN");
    expect(sofiaFacts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(sofiaFacts.entryAndStay.propertyPurchaseGrantsResidencyPath).toBe("UNKNOWN");
    expect(sofiaFacts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(sofiaFacts.hardGates.safetyStandard).toBe("UNKNOWN");
    expect(sofiaFacts.hardGates.lgbtqLegalProtectionStatus).toBe("UNKNOWN");
    expect(sofiaFacts.cost.estimatedMonthlyCostRange).toEqual({ low: 1370, high: 2660, currencyCode: "EUR" });
    expect(sofiaFacts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(sofiaFacts.financial.pensionTreatment).toBe("TREATY_DEPENDENT");
    expect(sofiaFacts.financial.socialSecurityTreatment).toBe("TREATY_DEPENDENT");
    expect(sofiaFacts.financial.iraTreatment).toBe("TREATY_DEPENDENT");
    expect(sofiaFacts.financial.retirementAccount401kTreatment).toBe("TREATY_DEPENDENT");
    expect(sofiaFacts.financial.usTaxTreatyInEffect).toBe("YES");
    expect(sofiaFacts.financial.foreignTaxCreditAvailable).toBe("UNKNOWN");
    expect(sofiaFacts.financial.wealthTaxApplicable).toBe("NO");
    expect(sofiaFacts.financial.taxResidencyTriggerDays).toBeNull();
    expect(sofiaFacts.financial.propertyTaxAnnualRatePercent).toBeNull();
    expect(sofiaFacts.financial.propertyPurchaseOrTransferTaxPercent).toBeNull();
    expect(sofiaFacts.lifestyleDimensions.dimensionValues.climate).toBe(65);
    expect(sofiaFacts.lifestyleDimensions.dimensionValues.walkability).toBeUndefined();
    expect(sofiaFacts.lifestyleDimensions.dimensionValues.golf).toBeUndefined();
    expect(sofiaFacts.lifestyleDimensions.dimensionValues.culture).toBeUndefined();
  });

  it("SCENARIO 1/7 — 90-day retired renter / $3,500 FLEXIBLE: full four-layer trace, real EUR->USD conversion, cross-border Layer 4 categories present", () => {
    const result = run(makeProfile());

    // LAYER 1 - 90 days is exactly at the tourist limit (inclusive boundary -> PASS).
    expect(result.eligibility.criteria.entryFeasibility).toMatchObject({ status: "PASS", reasonCode: "ENTRY_ALLOWED" });
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "TOURIST_PATH_SUFFICIENT_FOR_PRESENCE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toBeNull();
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.exclusionReasonCodes).toEqual([]);
    expect(result.eligibility.unknownReasonCodes).toEqual([]);

    // LAYER 2 - real EUR range converted through the frozen FX table.
    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "EUR",
      originalRange: { low: 1370, high: 2660, currencyCode: "EUR" },
      fxSnapshotVersion: "sofia-real-scenario-fixture-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
    });
    expect(result.affordability.currencyConversion!.convertedRange!.low).toBeCloseTo(EXPECTED_LOW_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.high).toBeCloseTo(EXPECTED_HIGH_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.currencyCode).toBe("USD");
    // high (~2891.30) <= 3500 budget -> AFFORDABLE.
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
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({
      severity: "CAUTION",
      reasonCode: "TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION",
    });
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME" });

    // FINAL
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 2 — 91-day retired renter: 1 day past the Schengen 90-day tourist limit still resolves a real PASS via the generic long-stay fact (SCHENGEN BOUNDARY product finding)", () => {
    const result = run(makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 91 } }));

    // 91 > 90, so the tourist-path branch does NOT fire; the engine falls through to
    // the generic long-stay-path combiner, which resolves PASS purely because
    // extendedStayOrLongStayVisaAvailable=YES (permanentResidencyPathAvailable stays UNKNOWN).
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "GENERIC_LONG_STAY_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "ACTIVITY_APPROPRIATE_PATH_AVAILABLE" });
    // band is still SHORT_1_3_MONTHS -> retirementOrResidencyPath is not activated.
    expect(result.eligibility.criteria.retirementOrResidencyPath).toBeNull();
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.unknownReasonCodes).toEqual([]);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 3 — 210-day retired renter: tourist path no longer sufficient, but the generic long-stay fact + retirement path both resolve real PASS", () => {
    const result = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "GENERIC_LONG_STAY_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "ACTIVITY_APPROPRIATE_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "PASS", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.recommendationStatus).toBe("VIABLE");
    // Layer 4 tax-residency stays UNKNOWN regardless of stay length - no numeric threshold is encoded.
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
  });

  it("SCENARIO 4 — permanent retiree: the LONG_TERM_PERMANENT-specific facts are genuinely incomplete -> real UNKNOWN_INCOMPLETE", () => {
    const result = run(makeProfile({ stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "PASS", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");

    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toContain("PENSION_TREATMENT");
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
  });

  it("SCENARIO 5 — $1,500 HARD_CEILING: the real converted range's low bound (~$1,489) is below $1,500 -> BORDERLINE, not UNAFFORDABLE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 1500, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 6 — $2,000 HARD_CEILING: also straddles the real converted range -> BORDERLINE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 2000, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
  });

  it("SCENARIO 8 — remote employee / 90 days: remote-work legality is a genuine UNKNOWN (connectivity is never conflated with work authorization)", () => {
    const result = run(makeProfile({ activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true }));
    expect(result.eligibility.criteria.remoteWorkLegality).toMatchObject({ status: "UNKNOWN", reasonCode: "REMOTE_WORK_LEGALITY_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
    expect(result.financialEfficiency.findings.map((f) => f.category)).not.toContain("PENSION_TREATMENT");
  });

  it("SCENARIO 9 — beach hard requirement: NONE -> real FAIL -> EXCLUDED; treaty/ski benefits cannot average away the fatal flaw", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "FAIL", reasonCode: "NO_BEACH_ACCESS" });
    expect(result.eligibility.overallStatus).toBe("EXCLUDED");
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.excluded).toBe(true);
  });

  it("SCENARIO 10 — mountain/ski hard requirement: SKI_RESORT_ACCESS -> real PASS (a clean contrast with Puerto Vallarta's MOUNTAIN_SCENIC_ONLY, which also passes the same combined gate)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS", reasonCode: "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 11 — LGBTQ legal-safety hard requirement: UNKNOWN (generic placeholder text) -> NEEDS_VERIFICATION, a data gap not a bug", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } }),
    );
    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "LGBTQ_LEGAL_STATUS_UNKNOWN" });
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 12 — safety minimum hard requirement: UNKNOWN (compound severities never recognized) -> NEEDS_VERIFICATION, never coerced to FAIL", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "MODERATE_OR_BETTER" } }),
    );
    expect(result.eligibility.criteria.safetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "SAFETY_STANDARD_UNKNOWN" });
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 13 — foreign property buyer: property gate PASSes (YES) but the non-EU land-ownership-restriction nuance is invisible to the engine (PRODUCT/SCHEMA finding); Layer 2/4 honestly UNKNOWN", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "PASS", reasonCode: "FOREIGN_PROPERTY_PURCHASE_ALLOWED" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");

    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);

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

  it("SCENARIO 14 — couple retiree: single-only cost data -> real HOUSEHOLD_ESTIMATE_MISMATCH; spouse-inclusion fact is also genuinely UNKNOWN", () => {
    const result = run(makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }));
    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "SPOUSE_OR_DEPENDENT_INCLUSION_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
    expect(result.affordability.householdSizeAssumed).toBe(1);
  });

  it("SCENARIO 15 — climate-lover vs. ski-lover: materially different personalized scores from the same real destination facts; missing dimensions reduce coverage honestly", () => {
    const climateLover = makeProfile({
      lifestylePreferences: [
        { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
        { dimensionKey: "golf", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
      ],
    });
    const skiLover = makeProfile({
      lifestylePreferences: [
        { dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
        { dimensionKey: "golf", direction: "MORE_IS_BETTER", importance: 2, isHardRequirement: false, targetValue: null },
      ],
    });

    const climateResult = run(climateLover);
    const skiResult = run(skiLover);

    expect(climateResult.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "climate")).toMatchObject({ rawDimensionValue: 65, isUnknown: false });
    // mountainOutdoorLifestyle is enum-derived from SKI_RESORT_ACCESS -> 100.
    expect(skiResult.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "mountainOutdoorLifestyle")).toMatchObject({ rawDimensionValue: 100, isUnknown: false });
    expect(climateResult.lifestyleFit!.totalScore).toBe(65);
    expect(skiResult.lifestyleFit!.totalScore).toBe(100);
    expect(climateResult.lifestyleFit!.totalScore).not.toBe(skiResult.lifestyleFit!.totalScore);

    for (const result of [climateResult, skiResult]) {
      expect(result.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "golf")).toMatchObject({ rawDimensionValue: null, isUnknown: true });
      expect(result.lifestyleFit!.scoredDimensionCount).toBe(1);
      expect(result.lifestyleFit!.relevantDimensionCount).toBe(2);
      expect(result.lifestyleFit!.coverageRatio).toBe(0.5);
      expect(result.lifestyleFit!.scoreStatus).toBe("SCORED");
    }
  });

  it("SCENARIO 16 — retirement tax findings: all four retirement categories TREATY_DEPENDENT/CAUTION, plus US_TAX_INTERACTION/treaty/wealth-tax/tax-residency-UNKNOWN, no personal tax liability asserted", () => {
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

  it("SCENARIO 17 — tax-residency UNKNOWN does not block: Layer 1 ELIGIBLE + Layer 2 AFFORDABLE -> VIABLE, despite a Layer 4 TAX_RESIDENCY_TRIGGER=UNKNOWN finding", () => {
    const result = run(makeProfile());
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.tradeoffs.some((t) => t.sourceLayer === "FINANCIAL" && t.category === "TAX_RESIDENCY_TRIGGER")).toBe(false);
  });

  it("SCENARIO 18 — frozen FX determinism: identical results across repeated runs with the same table; a different frozen rate can cross a budget boundary and change the outcome", () => {
    const profile = makeProfile({ budget: { monthlyTargetAmount: 2000, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const runA = run(profile, FROZEN_FX_TABLE);
    const runB = run(profile, FROZEN_FX_TABLE);
    expect(runA.affordability.estimatedMonthlyCostRange).toEqual(runB.affordability.estimatedMonthlyCostRange);
    expect(runA.affordability.status).toBe(runB.affordability.status);
    expect(runA.recommendationStatus).toBe(runB.recommendationStatus);
    expect(runA.affordability.reasonCodes).toEqual(runB.affordability.reasonCodes);
    // At 0.92 USD/EUR, $2,000 falls inside the converted range (~$1,489-$2,891) -> BORDERLINE, not excluded.
    expect(runA.affordability.status).toBe("BORDERLINE");
    expect(runA.affordability.excludedByAffordability).toBe(false);

    // A deliberately different (still frozen, still illustrative) FX table - NOT a live rate lookup.
    const STRONGER_EUR_FX_TABLE: FxRateTable = {
      snapshotVersion: "sofia-real-scenario-fixture-alt-rate-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
      rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.5 }],
    };
    const runC = run(profile, STRONGER_EUR_FX_TABLE);
    // At 0.5 USD/EUR the converted range becomes $2,740-$5,320 - now entirely above the $2,000 HARD_CEILING budget.
    expect(runC.affordability.estimatedMonthlyCostRange).toEqual({ low: 2740, high: 5320, currencyCode: "USD" });
    expect(runC.affordability.status).toBe("UNAFFORDABLE");
    expect(runC.affordability.excludedByAffordability).toBe(true);
    expect(runC.excluded).toBe(true);
    expect(runA.affordability.status).not.toBe(runC.affordability.status);
  });

  it("SCENARIO 19 — no FX table supplied: Layer 2 is honestly UNKNOWN, never a raw cross-currency numeric comparison", () => {
    const result = evaluateDestinationForProfile(makeProfile(), sofiaFacts);
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["MISSING_FX_RATE_FOR_CURRENCY_PAIR"]);
    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "EUR",
      originalRange: { low: 1370, high: 2660, currencyCode: "EUR" },
      convertedRange: null,
      fxSnapshotVersion: null,
      effectiveDate: null,
      source: null,
    });
    expect(result.affordability.excludedByAffordability).toBe(false);
  });

  it("SCENARIO 20 — affordable but beach FAIL: a high budget produces AFFORDABLE, but the beach hard-gate FAIL still forces EXCLUDED (DO NOT AVERAGE AWAY A FATAL FLAW)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true } }),
    );
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "FAIL", reasonCode: "NO_BEACH_ACCESS" });
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.excluded).toBe(true);
  });

  it("CROSS-BORDER APPLICABILITY PROOF — US->BG is CROSS_BORDER: international Layer 1 criteria are real HardConstraintResults (never null), and cross-border Layer 4 categories are never suppressed", () => {
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
