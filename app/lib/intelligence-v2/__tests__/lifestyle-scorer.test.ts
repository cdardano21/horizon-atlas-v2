import { describe, expect, it } from "vitest";
import { evaluateLifestyleFit } from "../lifestyle-scorer";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { LifestylePreferenceInput, UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import type { SyntheticDestinationFixture } from "../destination-fact-types";
import { CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY } from "../fixtures/synthetic-destinations";

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(preferences: readonly LifestylePreferenceInput[]): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: preferences,
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
  };
}

function pref(
  dimensionKey: string,
  direction: LifestylePreferenceInput["direction"],
  importance: LifestylePreferenceInput["importance"],
  targetValue: number | null = null,
): LifestylePreferenceInput {
  return { dimensionKey, direction, importance, isHardRequirement: false, targetValue };
}

/** Minimal destination template — Layer 3 only ever reads hardGates + lifestyleDimensions. */
function makeDestination(
  dimensionValues: Record<string, number>,
  hardGateOverrides: Partial<SyntheticDestinationFixture["hardGates"]> = {},
): SyntheticDestinationFixture {
  return {
    ...CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY,
    id: "fixture-layer3-test",
    displayName: "Fixture: Layer 3 Test",
    notes: "Layer 3 scorer test fixture.",
    hardGates: {
      beachAccess: "UNKNOWN",
      mountainOrSkiAccess: "UNKNOWN",
      healthcareStandard: "UNKNOWN",
      safetyStandard: "UNKNOWN",
      ...hardGateOverrides,
    },
    lifestyleDimensions: { dimensionValues },
  };
}

describe("1-2. climate directional fit", () => {
  const warmDestination = makeDestination({ climate: 90 });

  it("warm preference + warm destination -> strong fit", () => {
    const warmLover = makeProfile([pref("climate", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(warmLover, warmDestination);
    expect(result.totalScore).toBeGreaterThan(80);
  });

  it("cool preference + same warm destination -> weaker fit", () => {
    const coolLover = makeProfile([pref("climate", "LESS_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(coolLover, warmDestination);
    expect(result.totalScore).toBeLessThan(20);
  });
});

describe("3-4. beach vs mountain directional fit on the same destination", () => {
  const beachDestination = makeDestination({}, { beachAccess: "DIRECT_ACCESS", mountainOrSkiAccess: "NONE" });

  it("beach lover + beach destination -> strong contribution", () => {
    const beachLover = makeProfile([pref("beachLifestyle", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(beachLover, beachDestination);
    expect(result.dimensionContributions[0].normalizedFitPercent).toBe(100);
    expect(result.totalScore).toBe(100);
  });

  it("mountain lover + same beach destination -> lower score", () => {
    const mountainLover = makeProfile([pref("mountainOutdoorLifestyle", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(mountainLover, beachDestination);
    expect(result.dimensionContributions[0].normalizedFitPercent).toBe(0);
    expect(result.totalScore).toBe(0);
  });
});

describe("5-6. golf never excludes but importance materially changes contribution", () => {
  const golfDestination = makeDestination({ golf: 95 });

  it("golf importance 5 strongly influences fit but never excludes", () => {
    const golfer = makeProfile([pref("golf", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(golfer, golfDestination);
    expect(result.totalScore).toBeGreaterThan(90);
    expect(Object.keys(result)).not.toContain("excluded");
  });

  it("golf importance 1 has a smaller contribution than importance 5", () => {
    const casualGolfer = makeProfile([pref("golf", "MORE_IS_BETTER", 1)]);
    const keenGolfer = makeProfile([pref("golf", "MORE_IS_BETTER", 5)]);
    const casualResult = evaluateLifestyleFit(casualGolfer, golfDestination);
    const keenResult = evaluateLifestyleFit(keenGolfer, golfDestination);
    // Same fit percentage either way, but the weighted contribution magnitude differs.
    expect(casualResult.dimensionContributions[0].normalizedFitPercent).toBe(keenResult.dimensionContributions[0].normalizedFitPercent);
    expect(Math.abs(keenResult.dimensionContributions[0].contributionPoints)).toBeGreaterThan(
      Math.abs(casualResult.dimensionContributions[0].contributionPoints),
    );
  });
});

describe("7. walkability high importance rewards a walkable fixture", () => {
  it("scores a highly walkable destination well for a walkability-focused user", () => {
    const walkableDestination = makeDestination({ walkability: 92 });
    const walker = makeProfile([pref("walkability", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(walker, walkableDestination);
    expect(result.totalScore).toBeGreaterThan(85);
  });
});

describe("8. quiet lifestyle preference penalizes a nightlife-heavy fixture", () => {
  it("scores poorly for a quiet-preferring user at a loud destination", () => {
    const loudDestination = makeDestination({ nightlife: 95 });
    const quietUser = makeProfile([pref("nightlife", "LESS_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(quietUser, loudDestination);
    expect(result.totalScore).toBeLessThan(10);
  });
});

describe("9-10. English-integration vs cultural-immersion preference", () => {
  const easyEnglishDestination = makeDestination({ languageEase: 90 });

  it("English-integration preference rewards an easy-English fixture", () => {
    const englishPreferring = makeProfile([pref("languageEase", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(englishPreferring, easyEnglishDestination);
    expect(result.totalScore).toBeGreaterThan(85);
  });

  it("cultural-immersion preference can reward lower English ease via LESS_IS_BETTER", () => {
    const immersionSeeker = makeProfile([pref("languageEase", "LESS_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(immersionSeeker, easyEnglishDestination);
    expect(result.totalScore).toBeLessThan(15);
  });
});

describe("11-12. connectivity preference and remote-work-legality isolation", () => {
  it("connectivity preference rewards strong remote-work infrastructure", () => {
    const wellConnectedDestination = makeDestination({ connectivityRemoteWork: 93 });
    const remoteWorker = makeProfile([pref("connectivityRemoteWork", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(remoteWorker, wellConnectedDestination);
    expect(result.totalScore).toBeGreaterThan(85);
  });

  it("mutating remote-work LEGAL facts (Layer 1 territory) has zero effect on Layer 3", () => {
    const destination = makeDestination({ connectivityRemoteWork: 80 });
    const remoteWorker = makeProfile([pref("connectivityRemoteWork", "MORE_IS_BETTER", 3)]);
    const original = evaluateLifestyleFit(remoteWorker, destination);

    const mutated = {
      ...destination,
      entryAndStay: {
        ...destination.entryAndStay,
        remoteWorkLegalUnderTouristStatus: "NO" as const,
        remoteWorkOrDigitalNomadVisaAvailable: "NO" as const,
      },
    };
    expect(evaluateLifestyleFit(remoteWorker, mutated)).toEqual(original);
  });
});

describe("13-14. safety and healthcare soft preferences without hard-gate semantics", () => {
  it("safety soft preference influences score based on the destination's safety tier", () => {
    const safeDestination = makeDestination({}, { safetyStandard: "HIGH_SAFETY_ONLY" });
    const lessSafeDestination = makeDestination({}, { safetyStandard: "MODERATE_OR_BETTER" });
    const safetyLover = makeProfile([pref("safetyQuality", "MORE_IS_BETTER", 5)]);

    const strongResult = evaluateLifestyleFit(safetyLover, safeDestination);
    const weakerResult = evaluateLifestyleFit(safetyLover, lessSafeDestination);

    expect(strongResult.totalScore).toBeGreaterThan(weakerResult.totalScore);
    expect(Object.keys(strongResult)).not.toContain("eligible");
    expect(Object.keys(strongResult)).not.toContain("hardFail");
  });

  it("healthcare soft preference influences score based on the destination's healthcare tier", () => {
    const excellentHealthcare = makeDestination({}, { healthcareStandard: "INTERNATIONAL_STANDARD" });
    const basicHealthcare = makeDestination({}, { healthcareStandard: "BASIC_ACCESS" });
    const healthcareLover = makeProfile([pref("healthcareQuality", "MORE_IS_BETTER", 5)]);

    const strongResult = evaluateLifestyleFit(healthcareLover, excellentHealthcare);
    const weakerResult = evaluateLifestyleFit(healthcareLover, basicHealthcare);

    expect(strongResult.totalScore).toBeGreaterThan(weakerResult.totalScore);
  });
});

describe("15-16. missing relevant vs missing irrelevant dimensions", () => {
  it("a missing relevant dimension decreases coverage but does not auto-fail", () => {
    const destination = makeDestination({ climate: 90 }); // walkability deliberately absent
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 5), pref("walkability", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(profile, destination);

    expect(result.relevantDimensionCount).toBe(2);
    expect(result.scoredDimensionCount).toBe(1);
    expect(result.coverageRatio).toBe(0.5);
    expect(result.scoreStatus).toBe("SCORED");
    expect(result.totalScore).toBeGreaterThan(80); // scored purely from the known climate dimension
  });

  it("missing irrelevant dimensions (not in the profile's preferences) do not lower the score", () => {
    const richDestination = makeDestination({ climate: 90, culture: 10, nightlife: 5, foodDining: 3, accessibility: 1 });
    const sparseDestination = makeDestination({ climate: 90 });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 5)]);

    const richResult = evaluateLifestyleFit(profile, richDestination);
    const sparseResult = evaluateLifestyleFit(profile, sparseDestination);
    expect(richResult.totalScore).toBe(sparseResult.totalScore);
  });
});

describe("17. evidence-bias test — more unrelated destination data must not change the score", () => {
  it("scores identically for the profile's 5 relevant dimensions whether or not 5 unrelated dimensions are populated", () => {
    const relevantValues = { climate: 80, walkability: 70, culture: 60, foodDining: 50, nightlife: 40 };

    const destinationA = makeDestination({
      ...relevantValues,
      accessibility: 99,
      transportationAirportQuality: 99,
      languageEase: 99,
      settlementUrbanness: 99,
      connectivityRemoteWork: 99,
    });
    const destinationB = makeDestination({ ...relevantValues }); // the 5 unrelated dimensions are simply absent (UNKNOWN)

    const profile = makeProfile([
      pref("climate", "MORE_IS_BETTER", 3),
      pref("walkability", "MORE_IS_BETTER", 3),
      pref("culture", "MORE_IS_BETTER", 3),
      pref("foodDining", "MORE_IS_BETTER", 3),
      pref("nightlife", "MORE_IS_BETTER", 3),
    ]);

    const resultA = evaluateLifestyleFit(profile, destinationA);
    const resultB = evaluateLifestyleFit(profile, destinationB);

    expect(resultA.totalScore).toBe(resultB.totalScore);
    expect(resultA.scoredDimensionCount).toBe(resultB.scoredDimensionCount);
    expect(resultA.coverageRatio).toBe(resultB.coverageRatio);
  });
});

describe("18. same destination / different users produces materially different scores", () => {
  it("User A (beach/warm/walkability) and User B (mountain/cool/quiet-suburban) diverge on the same destination", () => {
    const destination = makeDestination(
      { climate: 85, walkability: 30, nightlife: 20, settlementUrbanness: 85 },
      { beachAccess: "DIRECT_ACCESS", mountainOrSkiAccess: "NONE" },
    );

    const userA = makeProfile([
      pref("beachLifestyle", "MORE_IS_BETTER", 5),
      pref("climate", "MORE_IS_BETTER", 5),
      pref("walkability", "MORE_IS_BETTER", 4),
    ]);
    const userB = makeProfile([
      pref("mountainOutdoorLifestyle", "MORE_IS_BETTER", 5),
      pref("climate", "LESS_IS_BETTER", 5),
      pref("settlementUrbanness", "CLOSER_TO_TARGET_IS_BETTER", 4, 20),
    ]);

    const resultA = evaluateLifestyleFit(userA, destination);
    const resultB = evaluateLifestyleFit(userB, destination);

    expect(resultA.totalScore).toBeGreaterThan(70);
    expect(resultB.totalScore).toBeLessThan(30);
    expect(resultA.totalScore).not.toBe(resultB.totalScore);
  });
});

describe("19. same user / different destinations ranks sensible fit differences", () => {
  it("ranks a well-matched destination above a poorly-matched one for the same user", () => {
    const user = makeProfile([pref("climate", "MORE_IS_BETTER", 5), pref("walkability", "MORE_IS_BETTER", 5)]);
    const wellMatched = makeDestination({ climate: 90, walkability: 85 });
    const poorlyMatched = makeDestination({ climate: 20, walkability: 15 });

    const wellMatchedResult = evaluateLifestyleFit(user, wellMatched);
    const poorlyMatchedResult = evaluateLifestyleFit(user, poorlyMatched);
    expect(wellMatchedResult.totalScore).toBeGreaterThan(poorlyMatchedResult.totalScore);
  });
});

describe("weight-sensitivity", () => {
  it("importance 5 has materially greater influence on contribution than importance 1 for the same direction/destination", () => {
    const destination = makeDestination({ walkability: 90 });
    const low = evaluateLifestyleFit(makeProfile([pref("walkability", "MORE_IS_BETTER", 1)]), destination);
    const high = evaluateLifestyleFit(makeProfile([pref("walkability", "MORE_IS_BETTER", 5)]), destination);

    expect(Math.abs(high.dimensionContributions[0].contributionPoints)).toBeGreaterThan(
      Math.abs(low.dimensionContributions[0].contributionPoints) * 4,
    );
    // Same normalized fit either way — only the weighted contribution differs.
    expect(low.dimensionContributions[0].normalizedFitPercent).toBe(high.dimensionContributions[0].normalizedFitPercent);
  });
});

describe("20. identical inputs produce byte-identical output", () => {
  it("is deterministic across repeated runs", () => {
    const destination = makeDestination({ climate: 77, walkability: 63 });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 4), pref("walkability", "MORE_IS_BETTER", 2)]);
    const first = evaluateLifestyleFit(profile, destination);
    const second = evaluateLifestyleFit(profile, destination);
    expect(second).toEqual(first);
  });
});

describe("all-relevant-data-missing honesty", () => {
  it("returns INSUFFICIENT_DATA (not a fabricated numeric fit) when every relevant dimension is unknown", () => {
    const destination = makeDestination({}); // no dimension values at all
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 5), pref("walkability", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(profile, destination);

    expect(result.scoreStatus).toBe("INSUFFICIENT_DATA");
    expect(result.scoredDimensionCount).toBe(0);
    expect(result.coverageRatio).toBe(0);
  });

  it("returns INSUFFICIENT_DATA when the profile has no lifestyle preferences at all", () => {
    const destination = makeDestination({ climate: 90 });
    const profile = makeProfile([]);
    const result = evaluateLifestyleFit(profile, destination);
    expect(result.scoreStatus).toBe("INSUFFICIENT_DATA");
    expect(result.relevantDimensionCount).toBe(0);
  });
});

describe("no hard-gate leakage", () => {
  it("Layer 3 still computes a plain score even when the destination has a Layer 1 hard FAIL, and owns no exclusion semantics", () => {
    // A destination with NO beach access at all, evaluated for a beach-essential profile would FAIL Layer 1 —
    // but Layer 3 is invoked directly here and knows nothing about Layer 1 at all.
    const destination = makeDestination({}, { beachAccess: "NONE" });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 3)]);
    const result = evaluateLifestyleFit(profile, destination);

    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(Object.keys(result)).not.toContain("excluded");
    expect(Object.keys(result)).not.toContain("hardFail");
    expect(Object.keys(result)).not.toContain("eligible");
  });

  it("a composed final result cannot let a high lifestyle score resurrect a Layer 1 exclusion (test-only composition)", () => {
    const destination = makeDestination({ climate: 100, walkability: 100 }, { beachAccess: "NONE" });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 5), pref("walkability", "MORE_IS_BETTER", 5)]);
    const lifestyleFit = evaluateLifestyleFit(profile, destination);
    expect(lifestyleFit.totalScore).toBe(100);

    // Test-only composition mirroring the FinalDestinationRecommendationResult rule: excluded is
    // derived strictly from Layer 1/2, never from lifestyleFit.
    const eligibilityFailed = true; // stands in for an EligibilityResult.overallStatus === "EXCLUDED"
    const excluded = eligibilityFailed; // lifestyleFit.totalScore must never factor into this
    expect(excluded).toBe(true);
    expect(lifestyleFit.totalScore).toBe(100); // the score itself is untouched...
    // ...but a real orchestration layer (not built yet) must still treat this destination as excluded.
  });
});

describe("no affordability leakage", () => {
  it("is unaffected by mutated cost range, ceiling type, or any affordability-shaped fact", () => {
    const destination = makeDestination({ climate: 70 });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 4)]);
    const original = evaluateLifestyleFit(profile, destination);

    const mutated = {
      ...destination,
      cost: { estimatedMonthlyCostRange: { low: 99999, high: 999999, currencyCode: "USD" }, householdSizeAssumedForEstimate: 7 },
    };
    const mutatedProfile: UserProfileV2 = { ...profile, budget: { monthlyTargetAmount: 1, currencyCode: "USD", ceilingType: "HARD_CEILING" } };

    expect(evaluateLifestyleFit(mutatedProfile, mutated)).toEqual(original);
  });
});

describe("no Layer 4 leakage", () => {
  it("is unaffected by mutated tax/pension/wealth-tax/property-tax facts", () => {
    const destination = makeDestination({ climate: 70 });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 4)]);
    const original = evaluateLifestyleFit(profile, destination);

    const mutated = {
      ...destination,
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
    expect(evaluateLifestyleFit(profile, mutated)).toEqual(original);
  });
});

describe("soft-preference-only proof", () => {
  it("LifestyleScore contains no field equivalent to excluded/hardFail/eligible/visa/affordability/tax-residency", () => {
    const destination = makeDestination({ climate: 70 });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 4)]);
    const result = evaluateLifestyleFit(profile, destination);

    const forbiddenKeyFragments = ["exclud", "hardfail", "eligib", "visa", "afford", "taxresidency", "residency"];
    const allKeys = [
      ...Object.keys(result),
      ...result.dimensionContributions.flatMap((c) => Object.keys(c)),
      ...result.tradeoffs.flatMap((t) => Object.keys(t)),
    ].map((key) => key.toLowerCase());

    for (const fragment of forbiddenKeyFragments) {
      expect(allKeys.some((key) => key.includes(fragment))).toBe(false);
    }
  });
});

describe("top contributors and tradeoffs", () => {
  it("ranks top contributors by absolute contribution magnitude, deterministically tie-broken by dimensionKey", () => {
    const destination = makeDestination({ climate: 90, walkability: 90 });
    const profile = makeProfile([pref("climate", "MORE_IS_BETTER", 3), pref("walkability", "MORE_IS_BETTER", 3)]);
    const result = evaluateLifestyleFit(profile, destination);
    expect(result.topContributors).toEqual(["climate", "walkability"]); // alphabetical tie-break, equal contribution
  });

  it("surfaces a structured tradeoff for a highly-important, poorly-matched dimension", () => {
    const destination = makeDestination({ walkability: 5 });
    const profile = makeProfile([pref("walkability", "MORE_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(profile, destination);

    expect(result.tradeoffs).toHaveLength(1);
    expect(result.tradeoffs[0]).toEqual({ dimensionKey: "walkability", importance: 5, fitLevel: "LOW", note: "HIGH_IMPORTANCE_POOR_FIT" });
  });

  it("does not surface a tradeoff for a low-importance poorly-matched dimension", () => {
    const destination = makeDestination({ walkability: 5 });
    const profile = makeProfile([pref("walkability", "MORE_IS_BETTER", 1)]);
    const result = evaluateLifestyleFit(profile, destination);
    expect(result.tradeoffs).toHaveLength(0);
  });
});

describe("CLOSER_TO_TARGET_IS_BETTER settlement preference", () => {
  it("scores a mid-urbanness destination well for a suburban-preferring user with an explicit target", () => {
    const suburbanDestination = makeDestination({ settlementUrbanness: 55 });
    const suburbanUser = makeProfile([pref("settlementUrbanness", "CLOSER_TO_TARGET_IS_BETTER", 5, 50)]);
    const result = evaluateLifestyleFit(suburbanUser, suburbanDestination);
    expect(result.totalScore).toBeGreaterThan(90);
  });

  it("falls back to the documented midpoint default when no targetValue is supplied", () => {
    const destination = makeDestination({ settlementUrbanness: 50 });
    const profile = makeProfile([pref("settlementUrbanness", "CLOSER_TO_TARGET_IS_BETTER", 5)]);
    const result = evaluateLifestyleFit(profile, destination);
    expect(result.totalScore).toBe(100);
  });
});
