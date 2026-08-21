import { describe, expect, it } from "vitest";
import { evaluateDestinationForProfile, rankDestinationsForProfile } from "../orchestrator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { LifestylePreferenceInput, UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import type { SyntheticDestinationFixture } from "../destination-fact-types";
import { CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY } from "../fixtures/synthetic-destinations";

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

function pref(dimensionKey: string, direction: LifestylePreferenceInput["direction"], importance: LifestylePreferenceInput["importance"]): LifestylePreferenceInput {
  return { dimensionKey, direction, importance, isHardRequirement: false, targetValue: null };
}

/** Fully-formed baseline destination: entry/stay all PASS-friendly, no hard gates activated, cost affordable, no financial facts known. */
function makeDestination(
  id: string,
  overrides: {
    entryAndStay?: Partial<SyntheticDestinationFixture["entryAndStay"]>;
    hardGates?: Partial<SyntheticDestinationFixture["hardGates"]>;
    cost?: Partial<SyntheticDestinationFixture["cost"]>;
    financial?: Partial<SyntheticDestinationFixture["financial"]>;
    lifestyleDimensions?: SyntheticDestinationFixture["lifestyleDimensions"];
  } = {},
): SyntheticDestinationFixture {
  return {
    ...CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY,
    id,
    displayName: `Fixture: Orchestrator Test — ${id}`,
    notes: "Orchestrator test fixture.",
    entryAndStay: {
      touristEntryAllowed: "YES",
      touristStayLimitDays: 365,
      extendedStayOrLongStayVisaAvailable: "YES",
      permanentResidencyPathAvailable: "YES",
      retirementVisaProgramAvailable: "YES",
      remoteWorkOrDigitalNomadVisaAvailable: "YES",
      remoteWorkLegalUnderTouristStatus: "YES",
      foreignPropertyPurchaseAllowed: "YES",
      propertyPurchaseGrantsResidencyPath: "NO",
      spouseOrDependentInclusionSupported: "YES",
      ...overrides.entryAndStay,
    },
    hardGates: {
      beachAccess: "UNKNOWN",
      mountainOrSkiAccess: "UNKNOWN",
      healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
      safetyStandard: "MODERATE_OR_BETTER",
      lgbtqLegalProtectionStatus: "UNKNOWN",
      ...overrides.hardGates,
    },
    cost: {
      estimatedMonthlyCostRange: { low: 2000, high: 2600, currencyCode: "USD" },
      householdSizeAssumedForEstimate: 1,
      ...overrides.cost,
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
      ...overrides.financial,
    },
    lifestyleDimensions: overrides.lifestyleDimensions ?? { dimensionValues: {} },
  };
}

describe("1. Layer 1 fatal FAIL + lifestyle 100 -> excluded", () => {
  it("excludes despite a perfect lifestyle score and favorable Layer 4", () => {
    const destination = makeDestination("fatal-flaw", {
      entryAndStay: { touristEntryAllowed: "NO" },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
      financial: { wealthTaxApplicable: "NO" },
    });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5)] });
    const result = evaluateDestinationForProfile(profile, destination);

    expect(result.eligibility.overallStatus).toBe("EXCLUDED");
    expect(result.lifestyleFit?.totalScore).toBe(100);
    expect(result.excluded).toBe(true);
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.sortRankingValue).toBeNull();
  });
});

describe("2-3. Layer 2 hard budget vs flexible budget", () => {
  const destination = makeDestination("budget-test", {
    cost: { estimatedMonthlyCostRange: { low: 5000, high: 5800, currencyCode: "USD" } },
    lifestyleDimensions: { dimensionValues: { climate: 100 } },
  });
  const profileBuilder = (ceilingType: "HARD_CEILING" | "FLEXIBLE_TARGET") =>
    makeProfile({
      budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5)],
    });

  it("2. hard budget excludes even with a perfect lifestyle score", () => {
    const result = evaluateDestinationForProfile(profileBuilder("HARD_CEILING"), destination);
    expect(result.affordability.excludedByAffordability).toBe(true);
    expect(result.excluded).toBe(true);
    expect(result.recommendationStatus).toBe("EXCLUDED");
    expect(result.sortRankingValue).toBeNull();
  });

  it("3. flexible budget does not exclude, and ranking value remains available", () => {
    const result = evaluateDestinationForProfile(profileBuilder("FLEXIBLE_TARGET"), destination);
    expect(result.affordability.status).toBe("UNAFFORDABLE");
    expect(result.affordability.excludedByAffordability).toBe(false);
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("VIABLE");
    expect(result.sortRankingValue?.value).toBe(100);
  });
});

describe("4. Layer 4 does not affect rank", () => {
  it("destination A (score 90, unfavorable Layer 4) ranks above destination B (score 80, favorable Layer 4)", () => {
    const destinationA = makeDestination("layer4-a", {
      lifestyleDimensions: { dimensionValues: { climate: 90 } },
      financial: { taxResidencyTriggerDays: 30, wealthTaxApplicable: "YES" },
    });
    const destinationB = makeDestination("layer4-b", {
      lifestyleDimensions: { dimensionValues: { climate: 80 } },
      financial: { wealthTaxApplicable: "NO" },
    });
    const profile = makeProfile({
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5)],
    });

    const ranked = rankDestinationsForProfile(profile, [destinationB, destinationA]);
    expect(ranked[0].destinationId).toBe("layer4-a");
    expect(ranked[1].destinationId).toBe("layer4-b");
    expect(ranked[0].tradeoffs.some((t) => t.sourceLayer === "FINANCIAL")).toBe(true);
  });
});

describe("5. same destination / different profile", () => {
  it("produces contextually different eligibility, affordability, lifestyle, financial, exclusion, and ranking across profiles A-F", () => {
    const destination = makeDestination("same-destination-multi-profile", {
      entryAndStay: { touristStayLimitDays: 90, retirementVisaProgramAvailable: "YES" },
      cost: { estimatedMonthlyCostRange: { low: 4200, high: 4800, currencyCode: "USD" } },
      financial: { taxResidencyTriggerDays: 183 },
      hardGates: { beachAccess: "DIRECT_ACCESS" },
      lifestyleDimensions: { dimensionValues: { climate: 80 } },
    });

    const profileA = makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 } });
    const profileB = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } });
    const profileC = makeProfile({
      activityMode: "REMOTE_EMPLOYEE",
      intendsToWorkDuringStay: true,
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
    });
    const profileD = makeProfile({
      tenureIntent: "BUY",
      stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });
    const profileE = makeProfile({ budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" } });
    const profileF = makeProfile({
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true },
      lifestylePreferences: [pref("beachLifestyle", "MORE_IS_BETTER", 5)],
    });

    const results = [profileA, profileB, profileC, profileD, profileE, profileF].map((p) => evaluateDestinationForProfile(p, destination));
    const signatures = results.map((r) => JSON.stringify([r.eligibility.overallStatus, r.affordability.status, r.lifestyleFit?.totalScore, r.excluded, r.sortRankingValue]));
    expect(new Set(signatures).size).toBeGreaterThan(1); // genuinely different results, not identical across all 6 profiles
  });
});

describe("fatal-flaw orchestration test (canonical)", () => {
  it("Layer 1 FAIL + Layer 2 AFFORDABLE + Layer 3 100 + Layer 4 favorable -> excluded, sortRankingValue null", () => {
    const destination = makeDestination("canonical-fatal-flaw", {
      entryAndStay: { touristEntryAllowed: "NO" },
      cost: { estimatedMonthlyCostRange: { low: 1000, high: 1200, currencyCode: "USD" } },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
      financial: { wealthTaxApplicable: "NO" },
    });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5)] });
    const result = evaluateDestinationForProfile(profile, destination);

    expect(result.affordability.status).toBe("AFFORDABLE");
    expect(result.lifestyleFit?.totalScore).toBe(100);
    expect(result.excluded).toBe(true);
    expect(result.sortRankingValue).toBeNull();
  });
});

describe("insufficient-lifestyle-data test", () => {
  it("Layer 1 PASS + Layer 2 non-excluding + Layer 3 INSUFFICIENT_DATA -> not excluded, ranks after scored viable destinations", () => {
    const destinationNoData = makeDestination("insufficient-data");
    const destinationScored = makeDestination("scored", { lifestyleDimensions: { dimensionValues: { climate: 50 } } });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)] });

    const insufficient = evaluateDestinationForProfile(profile, destinationNoData);
    expect(insufficient.excluded).toBe(false);
    expect(insufficient.recommendationStatus).toBe("VIABLE");
    expect(insufficient.lifestyleFit?.scoreStatus).toBe("INSUFFICIENT_DATA");
    expect(insufficient.sortRankingValue).toBeNull();

    const ranked = rankDestinationsForProfile(profile, [destinationNoData, destinationScored]);
    expect(ranked[0].destinationId).toBe("scored");
    expect(ranked[1].destinationId).toBe("insufficient-data");
  });
});

describe("UNKNOWN-gate / needs-verification test", () => {
  it("Layer 1 UNKNOWN_INCOMPLETE with no FAIL -> NEEDS_VERIFICATION, not VIABLE, not EXCLUDED", () => {
    const destination = makeDestination("needs-verification", {
      hardGates: { healthcareStandard: "UNKNOWN" },
    });
    const profile = makeProfile({
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumHealthcareStandard: "GOOD_PRIVATE_AVAILABLE" },
    });
    const result = evaluateDestinationForProfile(profile, destination);

    expect(result.eligibility.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.excluded).toBe(false);
    expect(result.recommendationStatus).toBe("NEEDS_VERIFICATION");
  });
});

describe("multi-destination ranking test", () => {
  it("produces a deterministic, correct ordering across 8 destinations of varied status", () => {
    const highFit = makeDestination("viable-high", { lifestyleDimensions: { dimensionValues: { climate: 95 } } });
    const mediumFit = makeDestination("viable-medium", { lifestyleDimensions: { dimensionValues: { climate: 60 } } });
    const lowFit = makeDestination("viable-low", { lifestyleDimensions: { dimensionValues: { climate: 20 } } });
    const insufficientData = makeDestination("viable-insufficient");
    const needsVerification = makeDestination("needs-verification-multi", { hardGates: { healthcareStandard: "UNKNOWN" } });
    const layer1Excluded = makeDestination("layer1-excluded", {
      entryAndStay: { touristEntryAllowed: "NO" },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
    });
    const layer2Excluded = makeDestination("layer2-excluded", {
      cost: { estimatedMonthlyCostRange: { low: 9000, high: 9500, currencyCode: "USD" } },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
    });
    const tieA = makeDestination("tie-a", { lifestyleDimensions: { dimensionValues: { climate: 60 } } });

    const profile = makeProfile({
      budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5)],
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumHealthcareStandard: "GOOD_PRIVATE_AVAILABLE" },
    });

    const ranked = rankDestinationsForProfile(profile, [
      layer2Excluded,
      layer1Excluded,
      needsVerification,
      insufficientData,
      lowFit,
      tieA,
      mediumFit,
      highFit,
    ]);

    const ids = ranked.map((r) => r.destinationId);
    expect(ids.indexOf("viable-high")).toBeLessThan(ids.indexOf("viable-medium"));
    expect(ids.indexOf("viable-medium")).toBeLessThan(ids.indexOf("viable-low"));
    expect(ids.indexOf("viable-low")).toBeLessThan(ids.indexOf("viable-insufficient"));
    expect(ids.indexOf("viable-insufficient")).toBeLessThan(ids.indexOf("needs-verification-multi"));
    expect(ids.indexOf("needs-verification-multi")).toBeLessThan(ids.indexOf("layer1-excluded"));
    expect(ids.indexOf("needs-verification-multi")).toBeLessThan(ids.indexOf("layer2-excluded"));
    // exact-score tie ("tie-a" and "viable-medium" both score 60) breaks by destinationId ascending.
    expect(ids.indexOf("tie-a")).toBeLessThan(ids.indexOf("viable-medium"));
    // excluded destinations never outrank viable ones despite a perfect Layer 3 score.
    expect(ids.indexOf("layer1-excluded")).toBeGreaterThan(ids.indexOf("viable-low"));
    expect(ids.indexOf("layer2-excluded")).toBeGreaterThan(ids.indexOf("viable-low"));
  });
});

describe("tie-breaker test", () => {
  it("two viable destinations with the same lifestyle score order deterministically by destinationId", () => {
    const destA = makeDestination("tie-b-destination", { lifestyleDimensions: { dimensionValues: { climate: 50 } } });
    const destB = makeDestination("tie-a-destination", { lifestyleDimensions: { dimensionValues: { climate: 50 } } });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)] });

    const ranked1 = rankDestinationsForProfile(profile, [destA, destB]);
    const ranked2 = rankDestinationsForProfile(profile, [destB, destA]);
    expect(ranked1.map((r) => r.destinationId)).toEqual(["tie-a-destination", "tie-b-destination"]);
    expect(ranked2.map((r) => r.destinationId)).toEqual(["tie-a-destination", "tie-b-destination"]);
  });
});

describe("11. matched reasons derive only from Layer 3", () => {
  it("only includes well-matched, known, relevant lifestyle dimensions", () => {
    const destination = makeDestination("matched-reasons", { lifestyleDimensions: { dimensionValues: { climate: 90, walkability: 10 } } });
    const profile = makeProfile({
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5), pref("walkability", "MORE_IS_BETTER", 5)],
    });
    const result = evaluateDestinationForProfile(profile, destination);
    expect(result.matchedReasons).toContain("climate");
    expect(result.matchedReasons).not.toContain("walkability");
  });
});

describe("12. failed constraints derive only from Layers 1/2", () => {
  it("never includes a Layer 3/4 item in failedConstraints", () => {
    const destination = makeDestination("failed-constraints", {
      entryAndStay: { touristEntryAllowed: "NO" },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
      financial: { wealthTaxApplicable: "YES" },
    });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5)] });
    const result = evaluateDestinationForProfile(profile, destination);

    expect(result.failedConstraints.length).toBeGreaterThan(0);
    expect(result.failedConstraints.every((code) => result.eligibility.exclusionReasonCodes.includes(code))).toBe(true);
  });
});

describe("13. Layer 4 CAUTION appears as tradeoff/advisory, never as an exclusion", () => {
  it("surfaces a FINANCIAL-sourced tradeoff without excluding or affecting rank", () => {
    const destination = makeDestination("layer4-caution", {
      financial: { taxResidencyTriggerDays: 30, wealthTaxApplicable: "YES" },
      lifestyleDimensions: { dimensionValues: { climate: 70 } },
    });
    const profile = makeProfile({
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)],
    });
    const result = evaluateDestinationForProfile(profile, destination);

    const financialTradeoffs = result.tradeoffs.filter((t) => t.sourceLayer === "FINANCIAL");
    expect(financialTradeoffs.length).toBeGreaterThan(0);
    expect(result.excluded).toBe(false);
    expect(result.sortRankingValue?.value).toBe(result.lifestyleFit?.totalScore);
  });
});

describe("14. top score contributors derive only from Layer 3", () => {
  it("equals lifestyleFit.topContributors exactly", () => {
    const destination = makeDestination("top-contributors", { lifestyleDimensions: { dimensionValues: { climate: 90, walkability: 80 } } });
    const profile = makeProfile({
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 5), pref("walkability", "MORE_IS_BETTER", 3)],
    });
    const result = evaluateDestinationForProfile(profile, destination);
    expect(result.topScoreContributors).toEqual(result.lifestyleFit?.topContributors);
  });
});

describe("16. repeat-run determinism", () => {
  it("produces byte-identical results and order across repeated orchestration runs", () => {
    const destinations = [
      makeDestination("det-a", { lifestyleDimensions: { dimensionValues: { climate: 80 } } }),
      makeDestination("det-b", { lifestyleDimensions: { dimensionValues: { climate: 40 } } }),
    ];
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 4)] });

    const first = rankDestinationsForProfile(profile, destinations);
    const second = rankDestinationsForProfile(profile, destinations);
    expect(second).toEqual(first);
    expect(second.map((r) => r.destinationId)).toEqual(first.map((r) => r.destinationId));
  });
});

describe("17. no monolithic score", () => {
  it("FinalDestinationRecommendationResult has no overallScore/totalScore/finalScore rollup", () => {
    const destination = makeDestination("no-mega-score", { lifestyleDimensions: { dimensionValues: { climate: 80 } } });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 4)] });
    const result = evaluateDestinationForProfile(profile, destination);

    const keys = Object.keys(result).map((k) => k.toLowerCase());
    expect(keys).not.toContain("overallscore");
    expect(keys).not.toContain("finalscore");
    expect(keys).not.toContain("totalscore");
  });
});

describe("18. final result keeps all 4 layer outputs visible", () => {
  it("exposes eligibility, affordability, lifestyleFit, and financialEfficiency independently", () => {
    const destination = makeDestination("all-four-visible", { lifestyleDimensions: { dimensionValues: { climate: 80 } } });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 4)] });
    const result = evaluateDestinationForProfile(profile, destination);

    expect(result.eligibility).toBeDefined();
    expect(result.affordability).toBeDefined();
    expect(result.lifestyleFit).toBeDefined();
    expect(result.financialEfficiency).toBeDefined();
  });
});

describe("layer isolation within orchestration", () => {
  it("changing Layer 4 findings only does not change ranking order among otherwise identical viable destinations", () => {
    const base = makeDestination("iso-base", { lifestyleDimensions: { dimensionValues: { climate: 70 } } });
    const withDifferentLayer4 = makeDestination("iso-layer4-variant", {
      lifestyleDimensions: { dimensionValues: { climate: 70 } },
      financial: { taxResidencyTriggerDays: 10, wealthTaxApplicable: "YES" },
    });
    const profile = makeProfile({
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 100 },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)],
    });

    const resultBase = evaluateDestinationForProfile(profile, base);
    const resultVariant = evaluateDestinationForProfile(profile, withDifferentLayer4);
    expect(resultBase.sortRankingValue?.value).toBe(resultVariant.sortRankingValue?.value);
  });

  it("changing Layer 3 score may change ranking among viable destinations", () => {
    const lower = makeDestination("iso-layer3-low", { lifestyleDimensions: { dimensionValues: { climate: 30 } } });
    const higher = makeDestination("iso-layer3-high", { lifestyleDimensions: { dimensionValues: { climate: 90 } } });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)] });
    const ranked = rankDestinationsForProfile(profile, [lower, higher]);
    expect(ranked[0].destinationId).toBe("iso-layer3-high");
  });

  it("changing Layer 1 from PASS to FAIL causes exclusion to override a high Layer 3 score", () => {
    const passing = makeDestination("iso-layer1-pass", { lifestyleDimensions: { dimensionValues: { climate: 100 } } });
    const failing = makeDestination("iso-layer1-fail", {
      entryAndStay: { touristEntryAllowed: "NO" },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
    });
    const profile = makeProfile({ lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)] });
    const ranked = rankDestinationsForProfile(profile, [failing, passing]);
    expect(ranked[0].destinationId).toBe("iso-layer1-pass");
    expect(ranked[1].destinationId).toBe("iso-layer1-fail");
    expect(ranked[1].excluded).toBe(true);
  });

  it("changing Layer 2 from flexible to hard exclusion overrides Layer 3", () => {
    const destination = makeDestination("iso-layer2", {
      cost: { estimatedMonthlyCostRange: { low: 5000, high: 5800, currencyCode: "USD" } },
      lifestyleDimensions: { dimensionValues: { climate: 100 } },
    });
    const flexibleProfile = makeProfile({
      budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)],
    });
    const hardProfile = makeProfile({
      budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" },
      lifestylePreferences: [pref("climate", "MORE_IS_BETTER", 3)],
    });

    const flexibleResult = evaluateDestinationForProfile(flexibleProfile, destination);
    const hardResult = evaluateDestinationForProfile(hardProfile, destination);
    expect(flexibleResult.excluded).toBe(false);
    expect(hardResult.excluded).toBe(true);
    expect(hardResult.sortRankingValue).toBeNull();
  });
});
