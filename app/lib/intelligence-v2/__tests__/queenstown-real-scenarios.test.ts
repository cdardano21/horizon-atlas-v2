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
 * Queenstown (queenstown-nz) real four-layer scenarios — the fourth Batch #1
 * CROSS-BORDER fixture, the first NZD real fixture, and the FINAL Batch #1
 * destination: real workbook -> real deterministic parser -> real
 * workbook-v32 adapter -> real orchestrator, no mocks in the core chain.
 *
 * This is also the first real destination whose beachAccess=DIRECT_ACCESS
 * derives from a genuine freshwater (lake) beach rather than an ocean beach -
 * a documented, approved product-semantic finding, not an engine defect: the
 * current beach contract is intentionally generic (see the completed
 * architecture review) and was never restricted to ocean/coastal water.
 *
 * This is validation, not tuning: every assertion below pins the engine's
 * actual observed output for the given profile.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let queenstownFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "queenstown-nz");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  queenstownFacts = adapted!.facts;
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
    budget: { monthlyTargetAmount: 5500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

// EXPLICIT ILLUSTRATIVE frozen FX snapshot - a test fixture only, never a claim about
// live market FX. Queenstown's real cost data is NZD; every USD profile budget
// below requires this table for Layer 2 to compare them at all.
const USD_NZD_RATE = 1.7;
const FROZEN_FX_TABLE: FxRateTable = {
  snapshotVersion: "queenstown-real-scenario-fixture-2026-08",
  effectiveDate: "2026-08-22",
  source: "deterministic-test-fixture",
  rates: [{ baseCurrency: "USD", quoteCurrency: "NZD", rate: USD_NZD_RATE }],
};
const EXPECTED_LOW_USD = 4600 / USD_NZD_RATE;
const EXPECTED_HIGH_USD = 8000 / USD_NZD_RATE;

function run(profile: UserProfileV2, fxTable: FxRateTable | undefined = FROZEN_FX_TABLE) {
  return evaluateDestinationForProfile(profile, queenstownFacts, fxTable);
}

describe("Queenstown real four-layer scenarios — fourth Batch #1 cross-border + NZD FX + freshwater-beach proof (final Batch #1 destination)", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  it("real Queenstown facts loaded from the workbook match the expected post-enrichment values", () => {
    expect(queenstownFacts.countryCode).toBe("NZ");
    expect(queenstownFacts.hardGates.beachAccess).toBe("DIRECT_ACCESS");
    expect(queenstownFacts.hardGates.mountainOrSkiAccess).toBe("SKI_RESORT_ACCESS");
    expect(queenstownFacts.entryAndStay.touristEntryAllowed).toBe("YES");
    expect(queenstownFacts.entryAndStay.touristStayLimitDays).toBe(90);
    expect(queenstownFacts.entryAndStay.extendedStayOrLongStayVisaAvailable).toBe("YES");
    expect(queenstownFacts.entryAndStay.permanentResidencyPathAvailable).toBe("UNKNOWN");
    expect(queenstownFacts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("NO");
    // Checkpoint C backfill: a genuine qualifying/conditional purchase path exists (workbook's own
    // residency_required_to_buy=TRUE fact), even though ordinary/unrestricted purchase is NO.
    expect(queenstownFacts.entryAndStay.propertyPurchaseConditionalPathAvailable).toBe("YES");
    expect(queenstownFacts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    expect(queenstownFacts.hardGates.safetyStandard).toBe("UNKNOWN");
    expect(queenstownFacts.hardGates.lgbtqLegalProtectionStatus).toBe("UNKNOWN");
    expect(queenstownFacts.cost.estimatedMonthlyCostRange).toEqual({ low: 4600, high: 8000, currencyCode: "NZD" });
    expect(queenstownFacts.cost.householdSizeAssumedForEstimate).toBe(1);
    expect(queenstownFacts.financial.pensionTreatment).toBe("TREATY_DEPENDENT");
    expect(queenstownFacts.financial.socialSecurityTreatment).toBe("TREATY_DEPENDENT");
    expect(queenstownFacts.financial.iraTreatment).toBe("TREATY_DEPENDENT");
    expect(queenstownFacts.financial.retirementAccount401kTreatment).toBe("TREATY_DEPENDENT");
    expect(queenstownFacts.financial.usTaxTreatyInEffect).toBe("YES");
    expect(queenstownFacts.financial.foreignTaxCreditAvailable).toBe("YES");
    expect(queenstownFacts.financial.wealthTaxApplicable).toBe("NO");
    expect(queenstownFacts.financial.taxResidencyTriggerDays).toBeNull();
    expect(queenstownFacts.lifestyleDimensions.dimensionValues.climate).toBe(72);
    // Checkpoint B: connectivity/airport_access are SAFE_ONE_TO_ONE legacy keys, now resolved
    // via alias fallback (no exact canonical row exists for either at Queenstown).
    expect(queenstownFacts.lifestyleDimensions.dimensionValues.connectivityRemoteWork).toBe(85);
    expect(queenstownFacts.lifestyleDimensions.dimensionValues.transportationAirportQuality).toBe(80);
    // walkability_transport/lifestyle_culture/food_social remain intentionally unmapped compound legacy rows.
    expect(queenstownFacts.lifestyleDimensions.dimensionValues.walkability).toBeUndefined();
    expect(queenstownFacts.lifestyleDimensions.dimensionValues.culture).toBeUndefined();
    expect(queenstownFacts.lifestyleDimensions.dimensionValues.foodDining).toBeUndefined();
  });

  it("SCENARIO 1 — 30-day retired renter / $5,500 FLEXIBLE: full four-layer trace, real NZD->USD conversion, treaty-YES/FTC-YES finding", () => {
    const result = run(makeProfile());

    expect(result.eligibility.criteria.entryFeasibility).toMatchObject({ status: "PASS", reasonCode: "ENTRY_ALLOWED" });
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "PASS", reasonCode: "TOURIST_PATH_SUFFICIENT_FOR_PRESENCE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");

    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "NZD",
      originalRange: { low: 4600, high: 8000, currencyCode: "NZD" },
      fxSnapshotVersion: "queenstown-real-scenario-fixture-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
    });
    expect(result.affordability.currencyConversion!.convertedRange!.low).toBeCloseTo(EXPECTED_LOW_USD, 6);
    expect(result.affordability.currencyConversion!.convertedRange!.high).toBeCloseTo(EXPECTED_HIGH_USD, 6);
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
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 2 — 90-day retired renter: exactly at the inclusive tourist-limit boundary -> real PASS", () => {
    const result = run(makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "PASS", reasonCode: "WITHIN_TOURIST_STAY_LIMIT" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 3 — 91-day retired renter: 1 day past the NZeTA 90-day limit now correctly resolves UNKNOWN post-tightening (same profile-aware fix proven at Sofia/Hoi An)", () => {
    const result = run(makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 91 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "UNKNOWN", reasonCode: "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toBeNull();
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 4 — 180-day retiree: tourist path no longer sufficient, and post-tightening the generic long-stay fact alone no longer fabricates a qualifying retiree-specific basis", () => {
    const result = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 180 } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "UNKNOWN", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
  });

  it("SCENARIO 5 — permanent retiree: the LONG_TERM_PERMANENT-specific facts are genuinely incomplete -> real UNKNOWN_INCOMPLETE", () => {
    const result = run(makeProfile({ stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null } }));
    expect(result.eligibility.criteria.stayDurationFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.requiredLegalPath).toMatchObject({ status: "UNKNOWN", reasonCode: "PERMANENT_PATH_UNKNOWN" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "UNKNOWN", reasonCode: "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");

    expect(result.financialEfficiency.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "CAUTION" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({ severity: "CAUTION" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
  });

  it("SCENARIO 6 — $3,000 HARD_CEILING: the real converted range's low bound (~$2,706) is below $3,000 -> BORDERLINE, not UNAFFORDABLE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 3000, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 7 — $4,000 HARD_CEILING: also straddles the real converted range -> BORDERLINE, no exclusion", () => {
    const result = run(makeProfile({ budget: { monthlyTargetAmount: 4000, currencyCode: "USD", ceilingType: "HARD_CEILING" } }));
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false);
  });

  it("SCENARIO 8 — $5,500 FLEXIBLE: real converted high (~$4,706) <= budget -> AFFORDABLE", () => {
    const result = run(makeProfile());
    expect(result.affordability.status).toBe("AFFORDABLE");
  });

  it("SCENARIO 9 — remote employee / 30 days: remote-work legality is a genuine UNKNOWN (English-speaking environment/connectivity never conflated with legal work authorization)", () => {
    const result = run(makeProfile({ activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true }));
    expect(result.eligibility.criteria.remoteWorkLegality).toMatchObject({ status: "UNKNOWN", reasonCode: "REMOTE_WORK_LEGALITY_UNKNOWN" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 10/11 — beach hard requirement: DIRECT_ACCESS -> real PASS (KNOWN PRODUCT SEMANTIC: the current generic beach contract treats genuine freshwater/lake beach access identically to ocean access; the ocean-vs-freshwater intent distinction is a documented IMPORTANT_SOON gap, not an engine bug)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "PASS", reasonCode: "BEACH_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 12 — mountain/ski hard requirement: SKI_RESORT_ACCESS -> real PASS (the cleanest genuine ski-access case in Batch #1)", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true } }),
    );
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS", reasonCode: "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
  });

  it("SCENARIO 13 — LGBTQ legal-safety hard requirement: UNKNOWN -> NEEDS_VERIFICATION, a data gap not a bug", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } }),
    );
    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "LGBTQ_LEGAL_STATUS_UNKNOWN" });
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 14 — safety minimum hard requirement: UNKNOWN (compound severity Medium-High never recognized) -> NEEDS_VERIFICATION, never coerced to FAIL", () => {
    const result = run(
      makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "MODERATE_OR_BETTER" } }),
    );
    expect(result.eligibility.criteria.safetyGate).toMatchObject({ status: "UNKNOWN", reasonCode: "SAFETY_STANDARD_UNKNOWN" });
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 15 — foreign property buyer (hard requirement), qualifier omitted (defaults to NOT_SURE): foreignPropertyPurchaseAllowed=NO but propertyPurchaseConditionalPathAvailable=YES (real backfilled fact, derived from the workbook's own residency_required_to_buy=TRUE prose) -> real PASS, closing the proven wrong-exclusion risk", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "PASS", reasonCode: "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE" });
    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("SCENARIO 15A — foreign property buyer, explicit ANY_LEGAL_RESIDENTIAL_PROPERTY qualifier -> real PASS", () => {
    const result = run(
      makeProfile({
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true, propertyOwnershipRequirement: "ANY_LEGAL_RESIDENTIAL_PROPERTY" },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "PASS", reasonCode: "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE" });
  });

  it("SCENARIO 15B — foreign property buyer, explicit UNRESTRICTED_FREEHOLD qualifier -> real FAIL (a residency-contingent path does not satisfy an unrestricted-ownership requirement)", () => {
    const result = run(
      makeProfile({
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true, propertyOwnershipRequirement: "UNRESTRICTED_FREEHOLD" },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "FAIL", reasonCode: "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP" });
    expect(result.excluded).toBe(true);
  });

  it("SCENARIO 15C — foreign property buyer, explicit LAND_OWNERSHIP_REQUIRED qualifier -> real FAIL", () => {
    const result = run(
      makeProfile({
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true, propertyOwnershipRequirement: "LAND_OWNERSHIP_REQUIRED" },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "FAIL", reasonCode: "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP" });
    expect(result.excluded).toBe(true);
  });

  it("SCENARIO 16 — buyer, property NOT essential: BUY alone does not activate the hard gate; Layer 2 remains UNKNOWN regardless (identical real contract behavior to Hoi An's non-essential BUY scenario)", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);
  });

  it("SCENARIO 17 — couple retiree: single-only cost data -> real HOUSEHOLD_ESTIMATE_MISMATCH; spouse-inclusion fact is also genuinely UNKNOWN", () => {
    const result = run(makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } }));
    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toMatchObject({ status: "UNKNOWN", reasonCode: "SPOUSE_OR_DEPENDENT_INCLUSION_UNKNOWN" });
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
  });

  it("SCENARIO 18 — beach-lover vs. ski-lover: both real dimensions resolve to the maximum (100), producing a legitimate score tie with materially different contributor identity - never forced apart", () => {
    const beachLover = makeProfile({
      lifestylePreferences: [{ dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null }],
    });
    const skiLover = makeProfile({
      lifestylePreferences: [{ dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null }],
    });
    const beachResult = run(beachLover);
    const skiResult = run(skiLover);

    expect(beachResult.lifestyleFit!.dimensionContributions[0]).toMatchObject({ dimensionKey: "beachLifestyle", rawDimensionValue: 100, isUnknown: false });
    expect(skiResult.lifestyleFit!.dimensionContributions[0]).toMatchObject({ dimensionKey: "mountainOutdoorLifestyle", rawDimensionValue: 100, isUnknown: false });
    // Both real dimensions legitimately max out - a genuine tie, not fabricated.
    expect(beachResult.lifestyleFit!.totalScore).toBe(100);
    expect(skiResult.lifestyleFit!.totalScore).toBe(100);
    expect(beachResult.lifestyleFit!.topContributors).toEqual(["beachLifestyle"]);
    expect(skiResult.lifestyleFit!.topContributors).toEqual(["mountainOutdoorLifestyle"]);
    expect(beachResult.lifestyleFit!.coverageRatio).toBe(1);
    expect(skiResult.lifestyleFit!.coverageRatio).toBe(1);
  });

  it("SCENARIO 19 — climate-lover vs. ski-lover: materially different real scores (72 vs. 100), a clean non-tie personalization proof", () => {
    const climateLover = makeProfile({
      lifestylePreferences: [{ dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null }],
    });
    const skiLover = makeProfile({
      lifestylePreferences: [{ dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null }],
    });
    const climateResult = run(climateLover);
    const skiResult = run(skiLover);
    expect(climateResult.lifestyleFit!.totalScore).toBe(72);
    expect(skiResult.lifestyleFit!.totalScore).toBe(100);
    expect(climateResult.lifestyleFit!.totalScore).not.toBe(skiResult.lifestyleFit!.totalScore);
  });

  it("SCENARIO 20 — retirement tax findings: all four retirement categories TREATY_DEPENDENT/CAUTION, treaty=YES/FTC=YES CAUTION, WEALTH_TAX POSITIVE(NO), TAX_RESIDENCY_TRIGGER UNKNOWN, no personal tax liability asserted", () => {
    const result = run(makeProfile());
    const findings = result.financialEfficiency.findings;
    for (const category of ["PENSION_TREATMENT", "SOCIAL_SECURITY_TREATMENT", "IRA_TREATMENT", "RETIREMENT_ACCOUNT_401K_TREATMENT"] as const) {
      const f = findings.find((finding) => finding.category === category)!;
      expect(f.severity).toBe("CAUTION");
      expect(f.factSummary).not.toMatch(/federal/i);
    }
    expect(findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")).toMatchObject({ severity: "CAUTION", reasonCode: "TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION" });
    expect(findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE" });
    expect(findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")).toMatchObject({ severity: "UNKNOWN" });
  });

  it("SCENARIO 21 — tax-residency UNKNOWN does not block: Layer 1 ELIGIBLE + Layer 2 AFFORDABLE -> VIABLE, despite a Layer 4 TAX_RESIDENCY_TRIGGER=UNKNOWN finding", () => {
    const result = run(makeProfile());
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.tradeoffs.some((t) => t.sourceLayer === "FINANCIAL" && t.category === "TAX_RESIDENCY_TRIGGER")).toBe(false);
  });

  it("SCENARIO 22 — explicit treaty=YES/FTC=YES proof: produces CAUTION/TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION, never claiming double taxation is eliminated", () => {
    const result = run(makeProfile());
    const finding = result.financialEfficiency.findings.find((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT")!;
    expect(finding.severity).toBe("CAUTION");
    expect(finding.reasonCode).toBe("TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION");
    expect(finding.factSummary).toMatch(/does not guarantee/i);
  });

  it("SCENARIO 23 — frozen FX determinism: identical results across repeated runs with the same table; a different frozen rate can cross a budget boundary and change the outcome", () => {
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4000, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const runA = run(profile, FROZEN_FX_TABLE);
    const runB = run(profile, FROZEN_FX_TABLE);
    expect(runA.affordability.status).toBe(runB.affordability.status);
    expect(runA.recommendationStatus).toBe(runB.recommendationStatus);
    expect(runA.affordability.reasonCodes).toEqual(runB.affordability.reasonCodes);
    expect(runA.affordability.status).toBe("BORDERLINE");
    expect(runA.affordability.excludedByAffordability).toBe(false);

    const WEAKER_USD_FX_TABLE: FxRateTable = {
      snapshotVersion: "queenstown-real-scenario-fixture-alt-rate-2026-08",
      effectiveDate: "2026-08-22",
      source: "deterministic-test-fixture",
      rates: [{ baseCurrency: "USD", quoteCurrency: "NZD", rate: 1.0 }],
    };
    const runC = run(profile, WEAKER_USD_FX_TABLE);
    expect(runC.affordability.estimatedMonthlyCostRange).toEqual({ low: 4600, high: 8000, currencyCode: "USD" });
    expect(runC.affordability.status).toBe("UNAFFORDABLE");
    expect(runC.affordability.excludedByAffordability).toBe(true);
    expect(runC.excluded).toBe(true);
    expect(runA.affordability.status).not.toBe(runC.affordability.status);
  });

  it("SCENARIO 24 — no FX table supplied: Layer 2 is honestly UNKNOWN, never a raw cross-currency numeric comparison", () => {
    const result = evaluateDestinationForProfile(makeProfile(), queenstownFacts);
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["MISSING_FX_RATE_FOR_CURRENCY_PAIR"]);
    expect(result.affordability.currencyConversion).toMatchObject({
      originalCurrencyCode: "NZD",
      originalRange: { low: 4600, high: 8000, currencyCode: "NZD" },
      convertedRange: null,
      fxSnapshotVersion: null,
    });
  });

  it("SCENARIO 25 — healthcare hard requirement: GOOD_PRIVATE_AVAILABLE minimum -> real PASS; INTERNATIONAL_STANDARD minimum -> real FAIL (regional specialist-care depth is a known, separate data-fidelity nuance, not altered here)", () => {
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

  it("SCENARIO 26 — property FAIL (strict qualifier) cannot be averaged away: real FAIL -> EXCLUDED regardless of treaty/ski/beach/retirement positives; Layer 2 stays UNKNOWN (BUY ownership costs not modeled), never an artificial AFFORDABLE+FAIL combination", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        budget: { monthlyTargetAmount: 8000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true, propertyOwnershipRequirement: "UNRESTRICTED_FREEHOLD" },
      }),
    );
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "FAIL", reasonCode: "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP" });
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.excluded).toBe(true);
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["BUY_INTENT_OWNERSHIP_COST_NOT_MODELED"]);
    expect(result.financialEfficiency.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "CAUTION" });
  });

  it("SCENARIO 27 — both geography hard gates PASS simultaneously with an AFFORDABLE high-budget renter -> VIABLE (Queenstown satisfies both current geography hard gates at once)", () => {
    const result = run(
      makeProfile({
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true, mountainOrSkiAccessEssential: true },
      }),
    );
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "PASS" });
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("CROSS-BORDER APPLICABILITY PROOF — US->NZ is CROSS_BORDER: international Layer 1 criteria are real HardConstraintResults (never null), and cross-border Layer 4 categories are never suppressed", () => {
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
