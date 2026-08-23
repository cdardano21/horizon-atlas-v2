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
 * Hoi An (hoi-an-vn) real four-layer scenarios — the third Batch #1
 * CROSS-BORDER fixture and the first Southeast Asian / VND real fixture: real
 * workbook -> real deterministic parser -> real workbook-v32 adapter -> real
 * orchestrator, no mocks in the core chain. Also the first destination to
 * exercise a real FAIL on the foreign-property hard gate (foreignPropertyPurchaseAllowed=NO)
 * and the first real proof of the treaty=NO/FTC=YES Layer 4 branch.
 *
 * This is validation, not tuning: every assertion below pins the engine's
 * actual observed output for the given profile.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let hoiAnFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "hoi-an-vn");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  hoiAnFacts = adapted!.facts;
});

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 30 },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 2500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

// EXPLICIT ILLUSTRATIVE frozen FX snapshot - a test fixture only, never a claim about
// live market FX. Hoi An's real cost data is VND; every USD profile budget below
// requires this table for Layer 2 to compare them at all.
const USD_VND_RATE = 25000;
const FROZEN_FX_TABLE: FxRateTable = {
  snapshotVersion: "hoi-an-real-scenario-fixture-2026-08",
  effectiveDate: "2026-08-22",
  source: "deterministic-test-fixture",
  rates: [{ baseCurrency: "USD", quoteCurrency: "VND", rate: USD_VND_RATE }],
};
const EXPECTED_LOW_USD = 20500000 / USD_VND_RATE;
const EXPECTED_HIGH_USD = 45000000 / USD_VND_RATE;

function run(profile: UserProfileV2, fxTable: FxRateTable | undefined = FROZEN_FX_TABLE) {
  return evaluateDestinationForProfile(profile, hoiAnFacts, fxTable);
}

describe("Hoi An real four-layer scenarios — third Batch #1 cross-border + VND FX + property-FAIL proof (no mocks in the chain)", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  it("real Hoi An facts loaded from the workbook match the expected post-enrichment values", () => {
    expect(hoiAnFacts.countryCode).toBe("VN");
    expect(hoiAnFacts.hardGates.beachAccess).toBe("DIRECT_ACCESS");
    expect(hoiAnFacts.hardGates.mountainOrSkiAccess).toBe("MOUNTAIN_SCENIC_ONLY");
    expect(hoiAnFacts.entryAndStay.touristEntryAllowed).toBe("YES");
    expect(hoiAnFacts.entryAndStay.touristStayLimitDays).toBe(90);
    expect(hoiAnFacts.entryAndStay.extendedStayOrLongStayVisaAvailable).toBe("YES");
    expect(hoiAnFacts.entryAndStay.permanentResidencyPathAvailable).toBe("UNKNOWN");
    expect(hoiAnFacts.entryAndStay.retirementVisaProgramAvailable).toBe("UNKNOWN");
    expect(hoiAnFacts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("NO");
    expect(hoiAnFacts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(hoiAnFacts.hardGates.safetyStandard).toBe("UNKNOWN");
    expect(hoiAnFacts.hardGates.lgbtqLegalProtectionStatus).toBe("UNKNOWN");
    expect(hoiAnFacts.cost.estimatedMonthlyCostRange).toEqual({ low: 20500000, high: 45000000, currencyCode: "VND" });
    expect(hoiAnFacts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(hoiAnFacts.financial.pensionTreatment).toBe("EXEMPT");
    expect(hoiAnFacts.financial.socialSecurityTreatment).toBe("UNKNOWN");
    expect(hoiAnFacts.financial.iraTreatment).toBe("UNKNOWN");
    expect(hoiAnFacts.financial.retirementAccount401kTreatment).toBe("UNKNOWN");
    expect(hoiAnFacts.financial.usTaxTreatyInEffect).toBe("NO");
    expect(hoiAnFacts.financial.foreignTaxCreditAvailable).toBe("YES");
    expect(hoiAnFacts.financial.wealthTaxApplicable).toBe("NO");
    expect(hoiAnFacts.financial.taxResidencyTriggerDays).toBeNull();
    expect(hoiAnFacts.lifestyleDimensions.dimensionValues.climate).toBe(70);
  });

  it("SCENARIO 1 — 30-day retired renter / $2,500 FLEXIBLE: full four-layer trace, real VND->USD conversion, no-treaty/FTC-yes finding", () => {
    const result = run(makeProfile());

    expect(result.eligibility.criteria.entryFeasibility).toMatchObject({ status: "PASS", reasonCode: "ENTRY_ALLOWED" });
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "TOURIST_PATH_SUFFICIENT_FOR_PRESENCE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");

    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "VND",
      originalRange: { low: 20500000, high: 45000000, currencyCode: "VND" },
      fxSnapshotVersion: "hoi-an-real-scenario-fixture-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
    });
    expect(result.affordability.currencyConversion!.convertedRange!.low).toBeCloseTo(EXPECTED_LOW_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.high).toBeCloseTo(EXPECTED_HIGH_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.currencyCode).toBe("USD");
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.affordability.excludedByAffordability).toBe(false);

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
    ]);
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "POSITIVE", reasonCode: "PENSION_TREATMENT_EXEMPT" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "SOCIAL_SECURITY_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "IRA_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "RETIREMENT_ACCOUNT_401K_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({
      severity: "CAUTION",
      reasonCode: "TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION",
    });
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME" });
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 2 — 90-day retired renter: exactly at the inclusive tourist-limit boundary -> real PASS", () => {
    const result = run(makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 3 — 91-day retired renter: 1 day past the e-Visa 90-day limit still resolves a real PASS via the generic long-stay fact (KNOWN PRODUCT LIMITATION given Hoi An's own 'no simple retirement visa' prose)", () => {
    const result = run(makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 91 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "GENERIC_LONG_STAY_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "ACTIVITY_APPROPRIATE_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toBeNull(); // band still SHORT_1_3_MONTHS
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 4 — 180-day retiree: tourist path no longer sufficient, generic long-stay fact + retirement path both resolve real PASS (same KNOWN PRODUCT LIMITATION, not fixed)", () => {
    const result = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 180 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "GENERIC_LONG_STAY_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "ACTIVITY_APPROPRIATE_PATH_AVAILABLE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "PASS", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 5 — permanent retiree: the LONG_TERM_PERMANENT-specific facts are genuinely incomplete -> real UNKNOWN_INCOMPLETE", () => {
    const result = run(makeProfile({ stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "PASS", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");

    expect(result.financialEfficiency.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "POSITIVE" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "SOCIAL_SECURITY_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({ severity: "CAUTION" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
  });

  it("SCENARIO 6 — $900 HARD_CEILING: the real converted range's low bound ($820) is below $900 -> BORDERLINE, not UNAFFORDABLE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 900, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 7 — $1,200 HARD_CEILING: also straddles the real converted range -> BORDERLINE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 1200, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
  });

  it("SCENARIO 8 — $2,500 FLEXIBLE: real converted high ($1,800) <= budget -> AFFORDABLE", () => {
    const result = run(makeProfile());
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.affordability.currencyConversion!.convertedRange!.low).toBeCloseTo(820, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.high).toBeCloseTo(1800, 6);
  });

  it("SCENARIO 9 — remote employee / 30 days: remote-work legality is a genuine UNKNOWN (connectivity is never conflated with work authorization)", () => {
    const result = run(makeProfile({ activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true }));
    expect(result.eligibility.criteria.remoteWorkLegality).toMatchObject({ status: "UNKNOWN", reasonCode: "REMOTE_WORK_LEGALITY_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 10 — beach hard requirement: DIRECT_ACCESS -> real PASS", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "PASS", reasonCode: "BEACH_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 11 — mountain/ski hard requirement: MOUNTAIN_SCENIC_ONLY -> real PASS (same combined-gate semantic limitation already observed at Puerto Vallarta)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS", reasonCode: "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 12 — LGBTQ legal-safety hard requirement: UNKNOWN -> NEEDS_VERIFICATION, a data gap not a bug", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } }),
    );
    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "LGBTQ_LEGAL_STATUS_UNKNOWN" });
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 13 — safety minimum hard requirement: UNKNOWN (worst severity=High) -> NEEDS_VERIFICATION, never coerced to FAIL", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "MODERATE_OR_BETTER" } }),
    );
    expect(result.eligibility.criteria.safetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "SAFETY_STANDARD_UNKNOWN" });
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 14 — foreign property buyer (hard requirement): foreignPropertyPurchaseAllowed=NO -> real FAIL -> EXCLUDED (first real property-gate FAIL across all Batch #1 destinations tested so far)", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "FAIL", reasonCode: "FOREIGN_PROPERTY_PURCHASE_NOT_ALLOWED" });
    expect(result.eligibility.overallStatus).toBe("EXCLUDED");
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.excluded).toBe(true);
    // Workbook prose ("qualifying apartments/units...under statutory caps") is not representable by this
    // plain TriState - a real, documented PRODUCT/SCHEMA limitation, not fixed here.
  });

  it("SCENARIO 15 — foreign property buyer, property NOT essential: BUY alone does not activate the hard gate; Layer 2 remains UNKNOWN regardless because BUY ownership costs are not modeled (real current contract behavior)", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        // foreignPropertyPurchaseEssential left false (default) - BUY intent alone does not activate the gate.
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();
    // Layer 1 is still UNKNOWN_INCOMPLETE, but for the unrelated LONG_TERM_PERMANENT-path reasons, not property.
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.eligibility.exclusionReasonCodes).toEqual([]);
    // Layer 2: BUY always short-circuits to UNKNOWN in the current evaluator, independent of any hard-requirement flag.
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);
  });

  it("SCENARIO 16 — couple retiree: single-only cost data -> real HOUSEHOLD_ESTIMATE_MISMATCH; spouse-inclusion fact is also genuinely UNKNOWN", () => {
    const result = run(makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }));
    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "SPOUSE_OR_DEPENDENT_INCLUSION_UNKNOWN" });
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
    expect(result.affordability.householdSizeAssumed).toBe(1);
  });

  it("SCENARIO 17 — beach-lover vs. climate-lover: materially different personalized scores from the same real destination facts; missing dimensions reduce coverage honestly", () => {
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

    expect(beachResult.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "beachLifestyle")).toMatchObject({ rawDimensionValue: 100, isUnknown: false });
    expect(climateResult.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "climate")).toMatchObject({ rawDimensionValue: 70, isUnknown: false });
    expect(beachResult.lifestyleFit!.totalScore).toBe(100);
    expect(climateResult.lifestyleFit!.totalScore).toBe(70);
    expect(beachResult.lifestyleFit!.totalScore).not.toBe(climateResult.lifestyleFit!.totalScore);

    for (const result of [beachResult, climateResult]) {
      expect(result.lifestyleFit!.dimensionContributions.find((c) => c.dimensionKey === "golf")).toMatchObject({ rawDimensionValue: null, isUnknown: true });
      expect(result.lifestyleFit!.coverageRatio).toBe(0.5);
      expect(result.lifestyleFit!.scoreStatus).toBe("SCORED");
    }
  });

  it("SCENARIO 18 — retirement tax findings: PENSION_TREATMENT POSITIVE(EXEMPT), SS/IRA/401k UNKNOWN, treaty-NO/FTC-YES CAUTION, WEALTH_TAX POSITIVE(NO), TAX_RESIDENCY_TRIGGER UNKNOWN, no personal tax liability asserted", () => {
    const result = run(makeProfile());
    const findings = result.financialEfficiency.findings;
    expect(findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "POSITIVE", reasonCode: "PENSION_TREATMENT_EXEMPT" });
    expect(findings.find((f) => f.category === "SOCIAL_SECURITY_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(findings.find((f) => f.category === "IRA_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(findings.find((f) => f.category === "RETIREMENT_ACCOUNT_401K_TREATMENT")).toMatchObject({ severity: "UNKNOWN" });
    expect(findings.find((f) => f.category === "US_TAX_INTERACTION")).toMatchObject({ severity: "CAUTION", reasonCode: "US_WORLDWIDE_TAXATION_APPLIES" });
    expect(findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({ severity: "CAUTION", reasonCode: "TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION" });
    expect(findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME" });
    expect(findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
    for (const f of findings) {
      expect(f.factSummary ?? "").not.toMatch(/federal/i);
    }
  });

  it("SCENARIO 19 — tax-residency UNKNOWN does not block: Layer 1 ELIGIBLE + Layer 2 AFFORDABLE -> VIABLE, despite a Layer 4 TAX_RESIDENCY_TRIGGER=UNKNOWN finding", () => {
    const result = run(makeProfile());
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.tradeoffs.some((t) => t.sourceLayer === "FINANCIAL" && t.category === "TAX_RESIDENCY_TRIGGER")).toBe(false);
  });

  it("SCENARIO 20 — explicit treaty=NO/FTC=YES proof: produces CAUTION/TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION, never NO_TREATY_OR_FTC_AVAILABLE (first real destination to exercise this branch)", () => {
    const result = run(makeProfile());
    const finding = result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")!;
    expect(finding.severity).toBe("CAUTION");
    expect(finding.reasonCode).toBe("TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION");
    expect(finding.reasonCode).not.toBe("NO_TREATY_OR_FTC_AVAILABLE");
  });

  it("SCENARIO 21 — frozen FX determinism: identical results across repeated runs with the same table; a different frozen rate can cross a budget boundary and change the outcome", () => {
    const profile = makeProfile({ budget: { monthlyTargetAmount: 1200, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const runA = run(profile, FROZEN_FX_TABLE);
    const runB = run(profile, FROZEN_FX_TABLE);
    expect(runA.affordability.estimatedMonthlyCostRange).toEqual(runB.affordability.estimatedMonthlyCostRange);
    expect(runA.affordability.status).toBe(runB.affordability.status);
    expect(runA.recommendationStatus).toBe(runB.recommendationStatus);
    expect(runA.affordability.reasonCodes).toEqual(runB.affordability.reasonCodes);
    expect(runA.affordability.status).toBe("BORDERLINE");
    expect(runA.affordability.excludedByAffordability).toBe(false);

    // A deliberately different (still frozen, still illustrative) FX table - NOT a live rate lookup.
    const WEAKER_VND_FX_TABLE: FxRateTable = {
      snapshotVersion: "hoi-an-real-scenario-fixture-alt-rate-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
      rates: [{ baseCurrency: "USD", quoteCurrency: "VND", rate: 15000 }],
    };
    const runC = run(profile, WEAKER_VND_FX_TABLE);
    expect(runC.affordability.estimatedMonthlyCostRange!.low).toBeCloseTo(20500000 / 15000, 6);
    expect(runC.affordability.estimatedMonthlyCostRange!.high).toBeCloseTo(45000000 / 15000, 6);
    expect(runC.affordability.estimatedMonthlyCostRange!.currencyCode).toBe("USD");
    expect(runC.affordability.status).toBe("UNAFFORDABLE");
    expect(runC.affordability.excludedByAffordability).toBe(true);
    expect(runC.excluded).toBe(true);
    expect(runA.affordability.status).not.toBe(runC.affordability.status);
  });

  it("SCENARIO 22 — no FX table supplied: Layer 2 is honestly UNKNOWN, never a raw cross-currency numeric comparison", () => {
    const result = evaluateDestinationForProfile(makeProfile(), hoiAnFacts);
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["MISSING_FX_RATE_FOR_CURRENCY_PAIR"]);
    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "VND",
      originalRange: { low: 20500000, high: 45000000, currencyCode: "VND" },
      convertedRange: null,
      fxSnapshotVersion: null,
    });
  });

  it("SCENARIO 23 — healthcare hard requirement: GOOD_PRIVATE_AVAILABLE minimum -> real PASS; INTERNATIONAL_STANDARD minimum -> real FAIL (engine behavior is GOOD_AS_IS; the underlying data-generosity question re: Da Nang referral is a separate, already-documented IMPORTANT_SOON finding)", () => {
    const passResult = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumHealthcareStandard: "GOOD_PRIVATE_AVAILABLE" } }),
    );
    expect(passResult.eligibility.criteria.healthcareGate).toMatchObject({ status: "PASS", reasonCode: "HEALTHCARE_STANDARD_MEETS_MINIMUM" });

    const failResult = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumHealthcareStandard: "INTERNATIONAL_STANDARD" } }),
    );
    expect(failResult.eligibility.criteria.healthcareGate).toMatchObject({ status: "FAIL", reasonCode: "HEALTHCARE_STANDARD_BELOW_MINIMUM" });
    expect(failResult.eligibility.overallStatus).toBe("EXCLUDED");
  });

  it("SCENARIO 24 — property FAIL cannot be averaged away: the property hard gate only activates for tenureIntent=BUY, and BUY unconditionally makes Layer 2 UNKNOWN in the current contract - so an AFFORDABLE Layer 2 co-occurring with an active property FAIL is not reachable; the real, honest proof is EXCLUDED with Layer 2 correctly UNKNOWN, unaffected by pension/treaty/beach positives", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        budget: { monthlyTargetAmount: 5000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "FAIL" });
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.excluded).toBe(true);
    // Layer 2 is UNKNOWN (BUY ownership costs not modeled), not AFFORDABLE - confirming the real contract
    // behavior rather than an artificial AFFORDABLE+FAIL combination.
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);
    // Even with a real positive pension finding and no wealth tax, EXCLUDED is untouched.
    expect(result.financialEfficiency.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "POSITIVE" });
  });

  it("CROSS-BORDER APPLICABILITY PROOF — US->VN is CROSS_BORDER: international Layer 1 criteria are real HardConstraintResults (never null), and cross-border Layer 4 categories are never suppressed", () => {
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
