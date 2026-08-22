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
 * Phase 10 — real Lisbon workbook facts run through the REAL four-layer engine
 * (no mocks in the chain: real parser -> real adapter -> real orchestrator).
 *
 * This is validation, not tuning: every assertion below pins the engine's actual
 * observed output for the given profile. If the engine's semantics ever change,
 * these tests should fail loudly rather than be "fixed" to match new output.
 */

const V32_MASTER_WORKBOOK_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Master_Workbook_v3.2_Pilot_Dataset.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let lisbonFacts: IntelligenceV2DestinationFacts;
let workbookHashBefore: string;

beforeAll(async () => {
  workbookHashBefore = sha256(V32_MASTER_WORKBOOK_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(V32_MASTER_WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "lisbon-pt");
  expect(adapted).not.toBeNull();
  expect(adapted!.mappingErrors).toEqual([]);
  lisbonFacts = adapted!.facts;
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
    budget: { monthlyTargetAmount: 6500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

function run(profile: UserProfileV2) {
  return evaluateDestinationForProfile(profile, lisbonFacts);
}

describe("Lisbon real four-layer scenarios — no mocks in the chain (real workbook -> real parser -> real adapter -> real orchestrator)", () => {
  it("keeps the real v3.2 master workbook byte-for-byte unchanged after all scenario runs", () => {
    expect(sha256(V32_MASTER_WORKBOOK_PATH)).toBe(workbookHashBefore);
  });

  it("SCENARIO 1 — 90-day retired renter: ordinary tourist path, no retirement-path dominance, tax residency does not trigger", () => {
    const result = run(makeProfile());

    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.criteria.stayDurationFeasibility?.reasonCode).toBe("WITHIN_TOURIST_STAY_LIMIT");
    expect(result.eligibility.criteria.requiredLegalPath?.reasonCode).toBe("TOURIST_PATH_SUFFICIENT_FOR_PRESENCE");
    expect(result.eligibility.criteria.remoteWorkLegality).toBeNull(); // not activated: intendsToWorkDuringStay=false
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull(); // not activated: tenureIntent=RENT

    expect(result.affordability.status).toBe("AFFORDABLE");

    // Tax residency (184-day threshold) does NOT trigger at 90 days -> Layer 4 stays minimal/relevant-only.
    expect(result.financialEfficiency.findings).toHaveLength(1);
    expect(result.financialEfficiency.findings[0]).toMatchObject({ category: "TAX_RESIDENCY_TRIGGER", severity: "NEUTRAL", reasonCode: "BELOW_TAX_RESIDENCY_THRESHOLD" });

    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.excluded).toBe(false);
  });

  it("SCENARIO 2 — 7-month retiree renter: long-stay/retirement path relevant, 184-day threshold triggers full retirement-income findings", () => {
    const result = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } }));

    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.criteria.retirementOrResidencyPath?.reasonCode).toBe("RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE");

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
    expect(result.financialEfficiency.findings[0]).toMatchObject({ severity: "CAUTION", reasonCode: "TAX_RESIDENCY_THRESHOLD_TRIGGERED" });
    // Legal residency (Layer 1) and tax residency (Layer 4) stay on separate, independent findings.
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 3 — 7-month remote employee: remote-work branch activates, tourist-status UNKNOWN does not force FAIL, retirement findings absent", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
        activityMode: "REMOTE_EMPLOYEE",
        intendsToWorkDuringStay: true,
      }),
    );

    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    // remoteWorkLegalUnderTouristStatus=UNKNOWN, but 210 days exceeds the tourist limit so it is not even
    // a candidate; remoteWorkOrDigitalNomadVisaAvailable=YES alone is sufficient -> PASS, not FAIL/UNKNOWN.
    expect(result.eligibility.criteria.remoteWorkLegality).toMatchObject({ status: "PASS", reasonCode: "REMOTE_WORK_LEGAL" });

    const categories = result.financialEfficiency.findings.map((f) => f.category);
    expect(categories).toEqual(["TAX_RESIDENCY_TRIGGER", "US_TAX_INTERACTION", "TAX_TREATY_OR_FOREIGN_TAX_CREDIT", "WEALTH_TAX"]);
    expect(result.financialEfficiency.findings[0].reasonCode).toBe("TAX_RESIDENCY_THRESHOLD_TRIGGERED_EARNED_INCOME_CONTEXT");
    // No PENSION/SOCIAL_SECURITY/IRA/401K findings - not retired, so retirement-income categories don't clutter the result.
    expect(categories).not.toContain("PENSION_TREATMENT");

    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 4 — permanent retiree/buyer: property purchase rights and property-grants-residency stay distinct facts", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );

    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    // foreignPropertyPurchaseAllowed=YES -> buying rights PASS...
    expect(result.eligibility.criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "PASS", reasonCode: "FOREIGN_PROPERTY_PURCHASE_ALLOWED" });
    // ...independent of propertyPurchaseGrantsResidencyPath=NO, which only affects a Layer 4 finding, never the Layer 1 buying-rights gate.
    const propertyResidencyFinding = result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_RESIDENCY_RELATIONSHIP");
    expect(propertyResidencyFinding).toMatchObject({ severity: "NEUTRAL", reasonCode: "PROPERTY_PURCHASE_HAS_NO_RESIDENCY_EFFECT" });

    // Layer 2 has no ownership-cost model at all for BUY -> always UNKNOWN, regardless of budget.
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toContain("BUY_INTENT_OWNERSHIP_COST_NOT_MODELED");

    // purchase_transfer_tax_percent is intentionally blank -> UNKNOWN; buyVsRentBreakEvenYears deferred -> UNKNOWN.
    expect(result.financialEfficiency.findings.find((f) => f.category === "PURCHASE_OR_TRANSFER_TAX")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "BUY_VS_RENT_IMPLICATION")).toMatchObject({ severity: "UNKNOWN" });
    expect(result.financialEfficiency.findings.find((f) => f.category === "PROPERTY_TAX")).toMatchObject({ severity: "NEUTRAL", reasonCode: "PROPERTY_TAX_RATE_KNOWN" });

    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION"); // driven by Layer 2 UNKNOWN, not by Layer 1
  });

  it("SCENARIO 5 — $4,500 hard-budget user: BORDERLINE, does not auto-exclude under the current policy", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
        budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" },
      }),
    );

    // Lisbon range 2495-4610: budget (4500) falls strictly inside the range -> BORDERLINE, not UNAFFORDABLE.
    expect(result.affordability.status).toBe("BORDERLINE");
    expect(result.affordability.excludedByAffordability).toBe(false); // only UNAFFORDABLE + HARD_CEILING excludes
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 6 — $6,500 flexible-budget user: AFFORDABLE, clearly different from the $4,500 hard-budget scenario", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
        budget: { monthlyTargetAmount: 6500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
      }),
    );

    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.affordability.reasonCodes).toEqual(["WITHIN_BUDGET_RANGE"]);
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 7 — beach soft preference: Lisbon gets soft lifestyle credit from beachAccess=NEARBY and walkability=91; missing climate lowers coverage, is not fabricated", () => {
    const profile = makeProfile({
      stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 150 },
      activityMode: "NOT_SURE",
      tenureIntent: "UNSURE",
      budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
      lifestylePreferences: [
        { dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
        { dimensionKey: "walkability", direction: "MORE_IS_BETTER", importance: 4, isHardRequirement: false, targetValue: null },
        { dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 3, isHardRequirement: false, targetValue: null },
      ],
    });
    const result = run(profile);

    expect(result.lifestyleFit.scoreStatus).toBe("SCORED");
    expect(result.lifestyleFit.scoredDimensionCount).toBe(2); // beachLifestyle + walkability
    expect(result.lifestyleFit.relevantDimensionCount).toBe(3); // + climate (missing)
    expect(result.lifestyleFit.coverageRatio).toBeCloseTo(2 / 3);
    expect(result.lifestyleFit.totalScore).toBe(74);

    const climateContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "climate");
    expect(climateContribution).toMatchObject({ isUnknown: true, rawDimensionValue: null, contributionPoints: 0 }); // missing, never fabricated

    const beachContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "beachLifestyle");
    expect(beachContribution?.rawDimensionValue).toBe(60); // BEACH_ACCESS_DIMENSION_SCORE.NEARBY, derived from hardGates.beachAccess
    const walkabilityContribution = result.lifestyleFit.dimensionContributions.find((c) => c.dimensionKey === "walkability");
    expect(walkabilityContribution?.rawDimensionValue).toBe(91); // real workbook DESTINATION_SCORES value
  });

  it("SCENARIO 8 — beach must-have: current contract treats NEARBY as sufficient (no DIRECT_ACCESS-only restriction)", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 150 },
        activityMode: "NOT_SURE",
        tenureIntent: "UNSURE",
        budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true },
      }),
    );

    // Product finding: evaluateBeachAccessGate only distinguishes NONE/UNKNOWN from "any access" -
    // NEARBY and DIRECT_ACCESS both PASS identically under the current contract.
    expect(result.eligibility.criteria.beachAccessGate).toMatchObject({ status: "PASS", reasonCode: "BEACH_ACCESS_AVAILABLE" });
  });

  it("SCENARIO 9 — mountain/ski must-have: MOUNTAIN_SCENIC_ONLY passes the combined gate; evaluator does not require ski-resort access specifically", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 120 },
        activityMode: "NOT_SURE",
        tenureIntent: "UNSURE",
        budget: { monthlyTargetAmount: 5000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), mountainOrSkiAccessEssential: true },
      }),
    );

    // Product finding: this is a combined "mountain OR ski" gate by design (per the evaluator's own comment) -
    // MOUNTAIN_SCENIC_ONLY and SKI_RESORT_ACCESS both PASS identically; there is no ski-specific gate today.
    expect(result.eligibility.criteria.mountainOrSkiAccessGate).toMatchObject({ status: "PASS", reasonCode: "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE" });
  });

  it("SCENARIO 10 — LGBTQ legal-safety essential: LEGAL_PROTECTIONS_IN_PLACE passes; social/community facts are never substituted", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
        budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true },
      }),
    );

    expect(result.eligibility.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "PASS", reasonCode: "LGBTQ_LEGAL_PROTECTIONS_IN_PLACE" });
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.recommendationStatus).toBe("VIABLE");
  });

  it("SCENARIO 11 (optional) — couple: Layer 2 correctly returns UNKNOWN (HOUSEHOLD_ESTIMATE_MISMATCH), never an invented couple multiplier", () => {
    const result = run(
      makeProfile({
        stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
        household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true },
      }),
    );

    expect(result.eligibility.criteria.spouseOrDependentFeasibility).toMatchObject({ status: "PASS", reasonCode: "SPOUSE_OR_DEPENDENT_INCLUSION_SUPPORTED" });
    expect(result.affordability.status).toBe("UNKNOWN");
    expect(result.affordability.reasonCodes).toEqual(["HOUSEHOLD_ESTIMATE_MISMATCH"]);
    expect(result.affordability.householdSizeAssumed).toBe(1); // Lisbon's real cost data is single-person only
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });

  it("cross-scenario sanity: 90 days vs 210 days produce different Layer 1 reason codes and different Layer 4 finding counts", () => {
    const result90 = run(makeProfile());
    const result210 = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } }));

    expect(result90.eligibility.criteria.requiredLegalPath?.reasonCode).not.toBe(result210.eligibility.criteria.requiredLegalPath?.reasonCode);
    expect(result90.financialEfficiency.findings.length).toBeLessThan(result210.financialEfficiency.findings.length);
  });

  it("cross-scenario sanity: retiree vs remote employee (same 210-day duration) produce different Layer 1/Layer 4 branches", () => {
    const retiree = run(makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } }));
    const remoteEmployee = run(
      makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 }, activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true }),
    );

    expect(retiree.eligibility.criteria.remoteWorkLegality).toBeNull();
    expect(remoteEmployee.eligibility.criteria.remoteWorkLegality).not.toBeNull();
    expect(retiree.financialEfficiency.findings.some((f) => f.category === "PENSION_TREATMENT")).toBe(true);
    expect(remoteEmployee.financialEfficiency.findings.some((f) => f.category === "PENSION_TREATMENT")).toBe(false);
  });

  it("cross-scenario sanity: RENT vs BUY alter only the appropriate branches (Layer 2 cost model, Layer 1 property gate)", () => {
    const renter = run(makeProfile());
    const buyer = run(
      makeProfile({
        stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
        tenureIntent: "BUY",
        hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
      }),
    );

    expect(renter.affordability.status).not.toBe("UNKNOWN");
    expect(buyer.affordability.status).toBe("UNKNOWN");
    expect(renter.eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();
    expect(buyer.eligibility.criteria.foreignPropertyPurchaseRights).not.toBeNull();
  });
});
