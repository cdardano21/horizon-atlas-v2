import { describe, expect, it } from "vitest";
import { evaluateAffordability } from "../affordability-evaluator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import {
  AFFORDABLE_AT_6500_NOT_AT_4500,
  EXPENSIVE_BUT_EXCELLENT_LIFESTYLE,
  LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING,
  LAYER2_TEST_BUDGET_STRADDLING_RANGE,
} from "../fixtures/synthetic-destinations";
import {
  FLEXIBLE_BUDGET_6500_USER,
  HARD_BUDGET_4500_USER,
  PERMANENT_RETIREE_BUYER,
  SPLIT_YEAR_SNOWBIRD_RENTER,
} from "../fixtures/synthetic-profiles";

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

describe("1. $4,500 hard ceiling vs $4,000-$4,400 destination -> AFFORDABLE, not excluded", () => {
  it("classifies AFFORDABLE and does not exclude", () => {
    const result = evaluateAffordability(HARD_BUDGET_4500_USER, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);
    expect(result.status).toBe("AFFORDABLE");
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("2. $4,500 hard ceiling vs $5,000-$5,800 destination -> UNAFFORDABLE, excluded", () => {
  it("classifies UNAFFORDABLE and excludes", () => {
    const result = evaluateAffordability(HARD_BUDGET_4500_USER, AFFORDABLE_AT_6500_NOT_AT_4500);
    expect(result.status).toBe("UNAFFORDABLE");
    expect(result.excludedByAffordability).toBe(true);
  });
});

describe("3. $4,500 flexible target vs $5,000-$5,800 destination -> UNAFFORDABLE, NOT excluded", () => {
  it("classifies UNAFFORDABLE but does not exclude under a flexible target", () => {
    const flexible4500 = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });
    const result = evaluateAffordability(flexible4500, AFFORDABLE_AT_6500_NOT_AT_4500);
    expect(result.status).toBe("UNAFFORDABLE");
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("4. $6,500 flexible budget vs $5,000-$5,800 destination -> AFFORDABLE", () => {
  it("classifies AFFORDABLE", () => {
    const result = evaluateAffordability(FLEXIBLE_BUDGET_6500_USER, AFFORDABLE_AT_6500_NOT_AT_4500);
    expect(result.status).toBe("AFFORDABLE");
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("5. cost range straddles budget ($4,500 vs $4,300-$4,900) -> BORDERLINE", () => {
  it("classifies BORDERLINE under the explicit range-vs-budget policy", () => {
    const result = evaluateAffordability(HARD_BUDGET_4500_USER, LAYER2_TEST_BUDGET_STRADDLING_RANGE);
    expect(result.status).toBe("BORDERLINE");
    // BORDERLINE never auto-excludes under this policy version, even with a hard ceiling.
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("6. missing destination cost -> UNKNOWN", () => {
  it("returns UNKNOWN when estimatedMonthlyCostRange is null", () => {
    const destinationWithNoCostData = { ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING, cost: { estimatedMonthlyCostRange: null, householdSizeAssumedForEstimate: 1 } };
    const result = evaluateAffordability(HARD_BUDGET_4500_USER, destinationWithNoCostData);
    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("NO_DESTINATION_COST_DATA");
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("7. missing user budget -> UNKNOWN", () => {
  it("returns UNKNOWN when the budget amount is not a valid positive number", () => {
    const invalidBudgetProfile = makeProfile({ budget: { monthlyTargetAmount: 0, currencyCode: "USD", ceilingType: "HARD_CEILING" } });
    const result = evaluateAffordability(invalidBudgetProfile, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);
    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("NO_USER_BUDGET_TARGET");
  });
});

describe("8. invalid range (low > high) -> UNKNOWN", () => {
  it("returns UNKNOWN for a structurally invalid cost range", () => {
    const destinationWithInvalidRange = {
      ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING,
      cost: { estimatedMonthlyCostRange: { low: 5000, high: 4000, currencyCode: "USD" }, householdSizeAssumedForEstimate: 1 },
    };
    const result = evaluateAffordability(HARD_BUDGET_4500_USER, destinationWithInvalidRange);
    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("INVALID_DESTINATION_COST_RANGE");
  });
});

describe("9. buy intent + no ownership-cost facts -> UNKNOWN", () => {
  it("never pretends the rental range represents ownership cost", () => {
    expect(PERMANENT_RETIREE_BUYER.tenureIntent).toBe("BUY");
    const result = evaluateAffordability(PERMANENT_RETIREE_BUYER, AFFORDABLE_AT_6500_NOT_AT_4500);
    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("BUY_INTENT_OWNERSHIP_COST_NOT_MODELED");
    expect(result.estimatedMonthlyCostRange).toBeNull();
  });
});

describe("10. rent intent + valid rent/living range -> evaluates normally", () => {
  it("produces a normal AFFORDABLE/BORDERLINE/UNAFFORDABLE classification for a renter", () => {
    const result = evaluateAffordability(HARD_BUDGET_4500_USER, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);
    expect(HARD_BUDGET_4500_USER.tenureIntent).toBe("RENT");
    expect(result.status).toBe("AFFORDABLE");
    expect(result.housingAssumption).toBe("RENT");
  });
});

describe("11. snowbird renter -> evaluated as renter, no property ownership assumption", () => {
  it("evaluates the split-year/snowbird renter using the rent-based cost path", () => {
    expect(SPLIT_YEAR_SNOWBIRD_RENTER.tenureIntent).toBe("RENT");
    // Match the destination's household assumption (2) to the snowbird couple so the evaluation proceeds normally.
    const destinationForCouple = { ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING, cost: { ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING.cost, householdSizeAssumedForEstimate: 2 } };
    const result = evaluateAffordability(SPLIT_YEAR_SNOWBIRD_RENTER, destinationForCouple);
    expect(result.housingAssumption).toBe("RENT");
    expect(result.reasonCodes).not.toContain("BUY_INTENT_OWNERSHIP_COST_NOT_MODELED");
    expect(result.status).not.toBe("UNKNOWN");
  });
});

describe("12. same destination, $4,500 hard vs $6,500 flexible -> different affordability result", () => {
  it("produces a different status for the two budgets at the same destination", () => {
    const hard = evaluateAffordability(HARD_BUDGET_4500_USER, AFFORDABLE_AT_6500_NOT_AT_4500);
    const flexible = evaluateAffordability(FLEXIBLE_BUDGET_6500_USER, AFFORDABLE_AT_6500_NOT_AT_4500);
    expect(hard.status).toBe("UNAFFORDABLE");
    expect(flexible.status).toBe("AFFORDABLE");
    expect(hard.status).not.toBe(flexible.status);
  });
});

describe("13. same $4,500 number: hard ceiling vs flexible target -> same status possible, different exclusion", () => {
  it("shares the same status but diverges only on exclusion", () => {
    const hard4500 = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" } });
    const flexible4500 = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const hardResult = evaluateAffordability(hard4500, AFFORDABLE_AT_6500_NOT_AT_4500);
    const flexibleResult = evaluateAffordability(flexible4500, AFFORDABLE_AT_6500_NOT_AT_4500);

    expect(hardResult.status).toBe(flexibleResult.status);
    expect(hardResult.status).toBe("UNAFFORDABLE");
    expect(hardResult.excludedByAffordability).toBe(true);
    expect(flexibleResult.excludedByAffordability).toBe(false);
  });
});

describe("14. household estimate mismatch without supported cost fact -> UNKNOWN, no invented multiplier", () => {
  it("returns UNKNOWN when the profile's headcount does not match the destination's assumed headcount", () => {
    // LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING assumes a household of 1; a couple profile does not match it.
    const coupleProfile = makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } });
    const result = evaluateAffordability(coupleProfile, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);
    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("HOUSEHOLD_ESTIMATE_MISMATCH");
  });
});

describe("fatal budget test — a hard ceiling excludes an otherwise-excellent destination", () => {
  it("marks EXPENSIVE_BUT_EXCELLENT_LIFESTYLE as UNAFFORDABLE and excluded for a $4,500 hard-ceiling user", () => {
    // This fixture has international-standard healthcare, high safety, legal LGBTQ+ protections,
    // direct beach access, and high climate/culture/community/walkability values — genuinely excellent.
    expect(EXPENSIVE_BUT_EXCELLENT_LIFESTYLE.hardGates.healthcareStandard).toBe("INTERNATIONAL_STANDARD");
    expect(EXPENSIVE_BUT_EXCELLENT_LIFESTYLE.hardGates.safetyStandard).toBe("HIGH_SAFETY_ONLY");
    expect(EXPENSIVE_BUT_EXCELLENT_LIFESTYLE.hardGates.lgbtqLegalProtectionStatus).toBe("LEGAL_PROTECTIONS_IN_PLACE");

    const result = evaluateAffordability(HARD_BUDGET_4500_USER, EXPENSIVE_BUT_EXCELLENT_LIFESTYLE);
    expect(result.status).toBe("UNAFFORDABLE");
    expect(result.excludedByAffordability).toBe(true);
  });
});

describe("no Layer 1 leakage", () => {
  it("is unaffected by mutated legal/visa/remote-work/property-right facts", () => {
    const original = evaluateAffordability(HARD_BUDGET_4500_USER, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);

    const mutated = {
      ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING,
      entryAndStay: {
        touristEntryAllowed: "NO" as const,
        touristStayLimitDays: 1,
        extendedStayOrLongStayVisaAvailable: "NO" as const,
        permanentResidencyPathAvailable: "NO" as const,
        retirementVisaProgramAvailable: "NO" as const,
        remoteWorkOrDigitalNomadVisaAvailable: "NO" as const,
        remoteWorkLegalUnderTouristStatus: "NO" as const,
        foreignPropertyPurchaseAllowed: "NO" as const,
        propertyPurchaseGrantsResidencyPath: "NO" as const,
        spouseOrDependentInclusionSupported: "NO" as const,
      },
    };

    expect(evaluateAffordability(HARD_BUDGET_4500_USER, mutated)).toEqual(original);
  });
});

describe("no Layer 3 leakage", () => {
  it("is unaffected by mutated hard-gate facts and lifestyle dimension values", () => {
    const original = evaluateAffordability(HARD_BUDGET_4500_USER, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);

    const mutated = {
      ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING,
      hardGates: {
        beachAccess: "NONE" as const,
        mountainOrSkiAccess: "NONE" as const,
        healthcareStandard: "BASIC_ACCESS" as const,
        safetyStandard: "MODERATE_OR_BETTER" as const,
        lgbtqLegalProtectionStatus: "CRIMINALIZED" as const,
      },
      lifestyleDimensions: { dimensionValues: { climate: 1, culture: 1, community: 1, walkability: 1 } },
    };

    expect(evaluateAffordability(HARD_BUDGET_4500_USER, mutated)).toEqual(original);
  });
});

describe("no Layer 4 leakage", () => {
  it("is unaffected by mutated tax/pension/wealth-tax facts", () => {
    const original = evaluateAffordability(HARD_BUDGET_4500_USER, LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING);

    const mutated = {
      ...LAYER2_TEST_AFFORDABLE_UNDER_HARD_CEILING,
      financial: {
        taxResidencyTriggerDays: 1,
        pensionTaxable: "YES" as const,
        socialSecurityTaxTreatyBenefit: "NO" as const,
        iraOrForeignRetirementAccountRecognized: "NO" as const,
        fourZeroOneKRecognized: "NO" as const,
        usTaxTreatyInEffect: "NO" as const,
        foreignTaxCreditAvailable: "NO" as const,
        wealthTaxApplicable: "YES" as const,
        propertyTaxAnnualRatePercent: 99,
        propertyPurchaseOrTransferTaxPercent: 99,
        buyVsRentBreakEvenYears: 1,
      },
    };

    expect(evaluateAffordability(HARD_BUDGET_4500_USER, mutated)).toEqual(original);
  });
});

describe("determinism", () => {
  it("returns a byte-identical result across repeated runs of the same inputs", () => {
    const first = evaluateAffordability(HARD_BUDGET_4500_USER, AFFORDABLE_AT_6500_NOT_AT_4500);
    const second = evaluateAffordability(HARD_BUDGET_4500_USER, AFFORDABLE_AT_6500_NOT_AT_4500);
    expect(second).toEqual(first);
  });
});
