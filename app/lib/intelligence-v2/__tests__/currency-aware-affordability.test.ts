import { describe, expect, it } from "vitest";
import { evaluateAffordability } from "../affordability-evaluator";
import { evaluateDestinationForProfile } from "../orchestrator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import type { SyntheticDestinationFixture } from "../destination-fact-types";
import type { FxRateTable } from "../fx-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

/**
 * Currency-aware Layer 2 affordability - dedicated test suite (Phase 10.6).
 *
 * Every FX table below is an explicit, frozen, test-only fixture. None of them
 * are claims about real market exchange rates.
 */

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
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

function makeDestination(overrides: Partial<SyntheticDestinationFixture> = {}): SyntheticDestinationFixture {
  return {
    id: "fixture-currency-test",
    displayName: "Fixture: Currency Test Destination",
    notes: "Synthetic fixture for FX-aware affordability tests only - never a real destination.",
    entryAndStay: {
      touristEntryAllowed: "UNKNOWN",
      touristStayLimitDays: null,
      extendedStayOrLongStayVisaAvailable: "UNKNOWN",
      permanentResidencyPathAvailable: "UNKNOWN",
      retirementVisaProgramAvailable: "UNKNOWN",
      remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
      remoteWorkLegalUnderTouristStatus: "UNKNOWN",
      foreignPropertyPurchaseAllowed: "UNKNOWN",
      propertyPurchaseGrantsResidencyPath: "UNKNOWN",
      spouseOrDependentInclusionSupported: "UNKNOWN",
    },
    hardGates: {
      beachAccess: "UNKNOWN",
      mountainOrSkiAccess: "UNKNOWN",
      healthcareStandard: "UNKNOWN",
      safetyStandard: "UNKNOWN",
      lgbtqLegalProtectionStatus: "UNKNOWN",
    },
    cost: {
      estimatedMonthlyCostRange: { low: 1000, high: 2000, currencyCode: "USD" },
      householdSizeAssumedForEstimate: 1,
    },
    financial: {
      taxResidencyTriggerDays: null,
      pensionTreatment: "UNKNOWN",
      socialSecurityTreatment: "UNKNOWN",
      iraTreatment: "UNKNOWN",
      retirementAccount401kTreatment: "UNKNOWN",
      usTaxTreatyInEffect: "UNKNOWN",
      foreignTaxCreditAvailable: "UNKNOWN",
      wealthTaxApplicable: "UNKNOWN",
      propertyTaxAnnualRatePercent: null,
      propertyPurchaseOrTransferTaxPercent: null,
      buyVsRentBreakEvenYears: null,
    },
    lifestyleDimensions: { dimensionValues: {} },
    ...overrides,
  };
}

describe("1. SAME CURRENCY — no FX table required, identical to existing behavior", () => {
  it("classifies using the raw range with no FX lookup, and reports no currency conversion", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 3000, high: 4000, currencyCode: "USD" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const withoutTable = evaluateAffordability(profile, destination);
    const withUnusedTable = evaluateAffordability(profile, destination, { snapshotVersion: "v1", effectiveDate: "2026-08-21", source: "test", rates: [] });

    expect(withoutTable.status).toBe("AFFORDABLE");
    expect(withoutTable.currencyConversion).toBeNull();
    expect(withoutTable).toEqual(withUnusedTable); // an FX table is simply never consulted when currencies already match
  });
});

describe("2. USD budget vs EUR destination — converts before classification", () => {
  const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "illustrative test fixture", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.92 }] };

  it("converts the EUR range into USD, then classifies with the unchanged policy", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const result = evaluateAffordability(profile, destination, fxTable);

    expect(result.status).toBe("BORDERLINE"); // 4500 falls inside the converted ~2712-5011 USD range
    expect(result.excludedByAffordability).toBe(false); // BORDERLINE never excludes, even under HARD_CEILING
    expect(result.estimatedMonthlyCostRange?.currencyCode).toBe("USD");
    expect(result.estimatedMonthlyCostRange?.low).toBeCloseTo(2712, 0);
    expect(result.estimatedMonthlyCostRange?.high).toBeCloseTo(5011, 0);
    expect(result.currencyConversion).toMatchObject({
      originalCurrencyCode: "EUR",
      originalRange: { low: 2495, high: 4610, currencyCode: "EUR" },
      fxSnapshotVersion: "test-fx@1",
    });
  });
});

describe("3. USD budget vs MXN destination — large scale difference, proves the old raw-number error cannot occur", () => {
  const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "illustrative test fixture", rates: [{ baseCurrency: "USD", quoteCurrency: "MXN", rate: 17.5 }] };

  it("converts a large-magnitude MXN range down into a comparable USD range", () => {
    // MXN 43,750-70,000 is genuinely USD 2,500-4,000 at this rate - a raw-number comparison against a
    // $4,500 budget would have wrongly classified this as UNAFFORDABLE (43,750 > 4,500) before this fix.
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 43750, high: 70000, currencyCode: "MXN" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination, fxTable);

    expect(result.estimatedMonthlyCostRange).toEqual({ low: 2500, high: 4000, currencyCode: "USD" });
    expect(result.status).toBe("AFFORDABLE");
  });
});

describe("4. USD budget vs NZD destination — generic non-EUR currency support", () => {
  const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "illustrative test fixture", rates: [{ baseCurrency: "USD", quoteCurrency: "NZD", rate: 1.65 }] };

  it("converts the NZD range into USD using the same generic mechanism", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 3300, high: 4950, currencyCode: "NZD" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination, fxTable);

    expect(result.estimatedMonthlyCostRange).toEqual({ low: 2000, high: 3000, currencyCode: "USD" });
    expect(result.status).toBe("AFFORDABLE");
  });
});

describe("5. MISSING FX RATE — currencies differ, table supplied but lacks the pair", () => {
  it("returns UNKNOWN with MISSING_FX_RATE_FOR_CURRENCY_PAIR, never a raw-number guess", () => {
    const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "GBP", quoteCurrency: "JPY", rate: 190 }] };
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination, fxTable);

    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("MISSING_FX_RATE_FOR_CURRENCY_PAIR");
    expect(result.currencyConversion).toMatchObject({ originalCurrencyCode: "EUR", convertedRange: null, fxSnapshotVersion: "test-fx@1" });
  });

  it("also returns the same UNKNOWN reason when no FX table is supplied at all", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination);

    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("MISSING_FX_RATE_FOR_CURRENCY_PAIR");
    expect(result.currencyConversion).toMatchObject({ fxSnapshotVersion: null });
  });
});

describe("6. INVALID RATE — zero, negative, or NaN rate for the exact requested pair", () => {
  it.each([0, -1.5, Number.NaN])("returns UNKNOWN with INVALID_FX_RATE_FOR_CURRENCY_PAIR for rate=%s", (badRate) => {
    const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: badRate }] };
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination, fxTable);

    expect(result.status).toBe("UNKNOWN");
    expect(result.reasonCodes).toContain("INVALID_FX_RATE_FOR_CURRENCY_PAIR");
    expect(result.currencyConversion?.convertedRange).toBeNull();
  });
});

describe("7. INVERSE PAIR — the same stored direction serves both conversion directions safely", () => {
  // Table stores "1 EUR = 1.09 USD" (base=EUR, quote=USD) only.
  const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "EUR", quoteCurrency: "USD", rate: 1.09 }] };

  it("uses the direct edge when the destination is EUR and the budget is USD", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 1000, high: 2000, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 5000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination, fxTable);
    expect(result.estimatedMonthlyCostRange).toEqual({ low: 1090, high: 2180, currencyCode: "USD" });
  });

  it("safely inverts when the destination is USD and the budget is EUR, using the same table", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 1090, high: 2180, currencyCode: "USD" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 5000, currencyCode: "EUR", ceilingType: "FLEXIBLE_TARGET" } });

    const result = evaluateAffordability(profile, destination, fxTable);
    expect(result.estimatedMonthlyCostRange?.currencyCode).toBe("EUR");
    expect(result.estimatedMonthlyCostRange?.low).toBeCloseTo(1000, 5);
    expect(result.estimatedMonthlyCostRange?.high).toBeCloseTo(2000, 5);
  });
});

describe("8. REPLAY DETERMINISM — same profile + destination + FX snapshot reproduces a byte-identical result", () => {
  it("produces deeply equal AffordabilityResult objects across repeated runs", () => {
    const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.92 }] };
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const first = evaluateDestinationForProfile(profile, destination, fxTable);
    const second = evaluateDestinationForProfile(profile, destination, fxTable);

    expect(second).toEqual(first);
  });
});

describe("9. DIFFERENT SNAPSHOT — two frozen FX snapshots may legitimately change the classification", () => {
  it("moves the result across a classification boundary purely from a different (still frozen) FX rate", () => {
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const weakEuroSnapshot: FxRateTable = { snapshotVersion: "snapshot-a", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 1.2 }] }; // 1 USD = 1.2 EUR -> converted range ~2079-3842 USD
    const strongEuroSnapshot: FxRateTable = { snapshotVersion: "snapshot-b", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.4 }] }; // 1 USD = 0.4 EUR -> converted range ~6238-11525 USD

    const withWeakEuro = evaluateAffordability(profile, destination, weakEuroSnapshot);
    const withStrongEuro = evaluateAffordability(profile, destination, strongEuroSnapshot);

    expect(withWeakEuro.status).toBe("AFFORDABLE"); // range fully at/under budget
    expect(withStrongEuro.status).toBe("UNAFFORDABLE"); // range fully above budget
    expect(withWeakEuro.status).not.toBe(withStrongEuro.status);
  });
});

describe("10 & 11. HARD_CEILING vs FLEXIBLE_TARGET after conversion", () => {
  const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.4 }] }; // converted range far above budget either way
  const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });

  it("10. HARD_CEILING: UNAFFORDABLE after conversion excludes", () => {
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" } });
    const result = evaluateAffordability(profile, destination, fxTable);
    expect(result.status).toBe("UNAFFORDABLE");
    expect(result.excludedByAffordability).toBe(true);
  });

  it("11. FLEXIBLE_TARGET: UNAFFORDABLE after conversion does NOT exclude", () => {
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });
    const result = evaluateAffordability(profile, destination, fxTable);
    expect(result.status).toBe("UNAFFORDABLE");
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("12. BORDERLINE BOUNDARY — deterministic classification exactly at the converted boundary", () => {
  it("classifies AFFORDABLE when the converted range.high lands exactly on the budget (inclusive <=)", () => {
    // EUR 4600 * (1/0.92) = 5000 exactly -> converted high == budget.
    const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.92 }] };
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 1000, high: 4600, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 5000, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const result = evaluateAffordability(profile, destination, fxTable);
    expect(result.estimatedMonthlyCostRange?.high).toBeCloseTo(5000, 6);
    expect(result.status).toBe("AFFORDABLE");
    expect(result.excludedByAffordability).toBe(false);
  });

  it("classifies BORDERLINE (not UNAFFORDABLE) when the converted range.low lands exactly on the budget", () => {
    // EUR 4600 * (1/0.92) = 5000 exactly -> converted low == budget; policy requires low > budget to be UNAFFORDABLE.
    const fxTable: FxRateTable = { snapshotVersion: "test-fx@1", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.92 }] };
    const destination = makeDestination({ cost: { estimatedMonthlyCostRange: { low: 4600, high: 9200, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 } });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 5000, currencyCode: "USD", ceilingType: "HARD_CEILING" } });

    const result = evaluateAffordability(profile, destination, fxTable);
    expect(result.estimatedMonthlyCostRange?.low).toBeCloseTo(5000, 6);
    expect(result.status).toBe("BORDERLINE");
    expect(result.excludedByAffordability).toBe(false);
  });
});

describe("13. LAYER ISOLATION — mutating the FX snapshot never affects Layer 1/3/4, only Layer 2/final status", () => {
  it("keeps eligibility, lifestyle fit, and financial efficiency identical across two different FX snapshots", () => {
    // A fully-known-YES entryAndStay so Layer 1 resolves to ELIGIBLE, isolating the recommendationStatus
    // difference purely to Layer 2/FX (an all-UNKNOWN fixture would already be NEEDS_VERIFICATION regardless of FX).
    const destination = makeDestination({
      entryAndStay: {
        touristEntryAllowed: "YES",
        touristStayLimitDays: 90,
        extendedStayOrLongStayVisaAvailable: "YES",
        permanentResidencyPathAvailable: "YES",
        retirementVisaProgramAvailable: "YES",
        remoteWorkOrDigitalNomadVisaAvailable: "YES",
        remoteWorkLegalUnderTouristStatus: "YES",
        foreignPropertyPurchaseAllowed: "YES",
        propertyPurchaseGrantsResidencyPath: "YES",
        spouseOrDependentInclusionSupported: "YES",
      },
      cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 },
    });
    const profile = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } });

    const workingSnapshot: FxRateTable = { snapshotVersion: "snapshot-a", effectiveDate: "2026-08-21", source: "test", rates: [{ baseCurrency: "USD", quoteCurrency: "EUR", rate: 0.92 }] };
    const noCoverageSnapshot: FxRateTable = { snapshotVersion: "snapshot-b", effectiveDate: "2026-08-21", source: "test - deliberately missing the USD/EUR pair", rates: [{ baseCurrency: "GBP", quoteCurrency: "JPY", rate: 190 }] };

    const resultA = evaluateDestinationForProfile(profile, destination, workingSnapshot);
    const resultB = evaluateDestinationForProfile(profile, destination, noCoverageSnapshot);

    expect(resultA.eligibility).toEqual(resultB.eligibility);
    expect(resultA.lifestyleFit).toEqual(resultB.lifestyleFit);
    expect(resultA.financialEfficiency).toEqual(resultB.financialEfficiency);

    // Only the FX-dependent Layer 2 / final-affordability-derived status differs.
    expect(resultA.affordability.status).toBe("BORDERLINE");
    expect(resultB.affordability.status).toBe("UNKNOWN");
    expect(resultA.recommendationStatus).toBe("VIABLE");
    expect(resultB.recommendationStatus).toBe("NEEDS_VERIFICATION");
    expect(resultA.recommendationStatus).not.toBe(resultB.recommendationStatus);
  });
});
