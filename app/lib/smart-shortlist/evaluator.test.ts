import { describe, expect, it } from "vitest";
import {
  affordabilityState,
  compareAffordability,
  evaluateShortlist,
  normalizedAffordabilityState,
  type ShortlistFacts,
  validateAffordabilityEvidence,
} from "./evaluator";

const destination = (key: string, overrides: Partial<ShortlistFacts> = {}): ShortlistFacts => ({
  key,
  name: key,
  countryCode: "US",
  beachAccess: "NONE",
  mountainAccess: "NONE",
  healthcareStandard: "UNKNOWN",
  safetyStandard: "UNKNOWN",
  lgbtqLegalProtectionStatus: "UNKNOWN",
  entryAndStay: {
    extendedStayOrLongStayVisaAvailable: "UNKNOWN",
    permanentResidencyPathAvailable: "UNKNOWN",
    retirementVisaProgramAvailable: "UNKNOWN",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
  },
  affordability: {},
  ...overrides,
});

describe("Smart Shortlist evaluator", () => {
  it("rejects partial, inverted, negative, and unscoped monthly ranges", () => {
    expect(validateAffordabilityEvidence({ monthlyLow: 100 })).toContain("monthly range requires both bounds");
    expect(validateAffordabilityEvidence({ monthlyLow: 200, monthlyHigh: 100, currency: "USD", household: "single" })).toContain("monthly range is invalid");
    expect(validateAffordabilityEvidence({ monthlyLow: -1, monthlyHigh: 100, currency: "USD", household: "single" })).toContain("monthly range is invalid");
    expect(validateAffordabilityEvidence({ monthlyLow: 100, monthlyHigh: 200 })).toEqual(expect.arrayContaining([
      "currency is required for a monthly range",
      "household is required for a monthly range",
    ]));
  });

  it("requires a complete provider-neutral index record", () => {
    expect(validateAffordabilityEvidence({ index: 50 })).toEqual(expect.arrayContaining([
      "providerId is required for indexed affordability",
      "band is required for indexed affordability",
    ]));
    expect(validateAffordabilityEvidence({ providerId: "provider-a", index: 50, band: "MODERATE" })).toEqual([]);
  });

  it("does not compare different providers, currencies, or household scopes", () => {
    expect(compareAffordability(
      { providerId: "a", index: 20, band: "LOW" },
      { providerId: "b", index: 30, band: "MODERATE" },
    )).toBeNull();
    expect(compareAffordability(
      { monthlyLow: 1000, monthlyHigh: 1500, currency: "USD", household: "single" },
      { monthlyLow: 1000, monthlyHigh: 1500, currency: "EUR", household: "single" },
    )).toBeNull();
    expect(compareAffordability(
      { monthlyLow: 1000, monthlyHigh: 1500, currency: "USD", household: "single" },
      { monthlyLow: 1000, monthlyHigh: 1500, currency: "USD", household: "couple" },
    )).toBeNull();
  });

  it("uses conservative range logic and preserves overlap as unknown", () => {
    const budget = { amount: 2000, currency: "USD", household: "single" } as const;
    expect(affordabilityState({ monthlyLow: 1000, monthlyHigh: 1800, currency: "USD", household: "single" }, budget).state).toBe("PASS");
    expect(affordabilityState({ monthlyLow: 2100, monthlyHigh: 2500, currency: "USD", household: "single" }, budget).state).toBe("FAIL");
    expect(affordabilityState({ monthlyLow: 1800, monthlyHigh: 2200, currency: "USD", household: "single" }, budget).state).toBe("UNKNOWN");
  });

  it("uses only complete normalized evidence for the scalable affordability decision", () => {
    const target = { maxBand: "MODERATE" } as const;
    expect(normalizedAffordabilityState({ monthlyLow: 500, monthlyHigh: 900, currency: "USD", household: "single" }, target).state).toBe("UNKNOWN");
    expect(normalizedAffordabilityState({ providerId: "provider-a", index: 35, band: "LOW" }, target).state).toBe("PASS");
    expect(normalizedAffordabilityState({ providerId: "provider-a", index: 80, band: "HIGH" }, target).state).toBe("FAIL");
  });

  it("keeps unknown requirements out of confirmed results", () => {
    const [result] = evaluateShortlist([destination("unknown", { beachAccess: "UNKNOWN" })], { beach: "DIRECT_ACCESS", requireBeach: true });
    expect(result.group).toBe("NEEDS_VERIFICATION");
  });

  it("does not let missing affordability outrank a known weakness", () => {
    const results = evaluateShortlist([
      destination("known-expensive", { affordability: { providerId: "provider-a", index: 90, band: "VERY_HIGH" } }),
      destination("unknown-cost"),
    ], { affordability: { maxBand: "MODERATE", require: true } });
    expect(results.map((result) => [result.destination.key, result.group])).toEqual([
      ["unknown-cost", "NEEDS_VERIFICATION"],
      ["known-expensive", "EXCLUDED"],
    ]);
    expect(results[0].preferenceSupport).toBe(0);
  });

  it("creates disjoint groups and deterministic ties without padding", () => {
    const results = evaluateShortlist([
      destination("z-known", { beachAccess: "DIRECT_ACCESS" }),
      destination("a-known", { beachAccess: "DIRECT_ACCESS" }),
      destination("unknown", { beachAccess: "UNKNOWN" }),
      destination("failed"),
    ], { beach: "DIRECT_ACCESS", requireBeach: true });
    expect(results.map((result) => result.destination.key)).toEqual(["a-known", "z-known", "unknown", "failed"]);
    expect(results.map((result) => result.group)).toEqual(["MEETS_FILTERS", "MEETS_FILTERS", "NEEDS_VERIFICATION", "EXCLUDED"]);
    expect(new Set(results.map((result) => result.destination.key)).size).toBe(4);
    expect(results).toHaveLength(4);
  });

  it("treats geography as scope rather than citizenship eligibility", () => {
    const [result] = evaluateShortlist([destination("ca", { countryCode: "CA" })], { includedCountries: ["US"] });
    expect(result.group).toBe("EXCLUDED");
    expect(result.reasons[0].explanation).toContain("selected countries");
  });

  it("does not conflate nearby beaches, direct beaches, and ocean access", () => {
    const results = evaluateShortlist([
      destination("direct", { beachAccess: "DIRECT_ACCESS" }),
      destination("nearby", { beachAccess: "NEARBY" }),
    ], { beach: "DIRECT_ACCESS", requireBeach: true });
    expect(results.map((result) => result.group)).toEqual(["MEETS_FILTERS", "EXCLUDED"]);
    expect(results.flatMap((result) => result.reasons).some((reason) => /ocean/i.test(reason.explanation))).toBe(false);
  });

  it("requires explicit coastal evidence for ocean access", () => {
    const results = evaluateShortlist([
      destination("coastal", { beachAccess: "DIRECT_ACCESS", oceanAccess: "COASTAL" }),
      destination("lake", { beachAccess: "DIRECT_ACCESS", oceanAccess: "INLAND" }),
      destination("generic", { beachAccess: "DIRECT_ACCESS", oceanAccess: "UNKNOWN" }),
    ], { beach: "OCEAN_COASTAL", requireBeach: true });

    expect(results.map((result) => [result.destination.key, result.group])).toEqual([
      ["coastal", "MEETS_FILTERS"],
      ["generic", "NEEDS_VERIFICATION"],
      ["lake", "EXCLUDED"],
    ]);
  });

  it("uses lifestyle score before canonical key and key only for equal scores", () => {
    const results = evaluateShortlist([
      destination("a-low", { beachAccess: "NEARBY" }),
      destination("z-high", { beachAccess: "DIRECT_ACCESS" }),
      destination("b-high", { beachAccess: "DIRECT_ACCESS" }),
    ], { beach: "NEARBY_OR_DIRECT" });

    expect(results.map((result) => result.destination.key)).toEqual(["b-high", "z-high", "a-low"]);
    expect(results[0].lifestyleFit.totalScore).toBe(results[1].lifestyleFit.totalScore);
    expect(results[1].lifestyleFit.totalScore).toBeGreaterThan(results[2].lifestyleFit.totalScore);
  });

  it("applies healthcare, safety, LGBTQ, and legal-path must-haves with FAIL before UNKNOWN", () => {
    const results = evaluateShortlist([
      destination("pass", {
        healthcareStandard: "INTERNATIONAL_STANDARD",
        safetyStandard: "HIGH_SAFETY_ONLY",
        lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
        entryAndStay: {
          extendedStayOrLongStayVisaAvailable: "UNKNOWN",
          permanentResidencyPathAvailable: "YES",
          retirementVisaProgramAvailable: "UNKNOWN",
          remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
        },
      }),
      destination("unknown"),
      destination("fail", {
        healthcareStandard: "BASIC_ACCESS",
        safetyStandard: "ELEVATED_RISK",
        lgbtqLegalProtectionStatus: "NO_LEGAL_PROTECTIONS",
        entryAndStay: {
          extendedStayOrLongStayVisaAvailable: "NO",
          permanentResidencyPathAvailable: "NO",
          retirementVisaProgramAvailable: "NO",
          remoteWorkOrDigitalNomadVisaAvailable: "NO",
        },
      }),
    ], {
      healthcare: { mode: "MUST_HAVE", minimum: "GOOD_PRIVATE_AVAILABLE" },
      safety: { mode: "MUST_HAVE", minimum: "MODERATE_OR_BETTER" },
      lgbtqLegalSafety: { mode: "MUST_HAVE" },
      documentedLongStayPath: { mode: "MUST_HAVE" },
    });

    expect(results.map((result) => [result.destination.key, result.group])).toEqual([
      ["pass", "MEETS_FILTERS"],
      ["unknown", "NEEDS_VERIFICATION"],
      ["fail", "EXCLUDED"],
    ]);
  });

  it("uses only the existing V2 healthcare and safety dimensions for important preferences", () => {
    const results = evaluateShortlist([
      destination("lower", { healthcareStandard: "BASIC_ACCESS", safetyStandard: "MODERATE_OR_BETTER" }),
      destination("higher", { healthcareStandard: "INTERNATIONAL_STANDARD", safetyStandard: "HIGH_SAFETY_ONLY" }),
    ], {
      healthcare: { mode: "IMPORTANT_PREFERENCE", minimum: "GOOD_PRIVATE_AVAILABLE" },
      safety: { mode: "IMPORTANT_PREFERENCE", minimum: "MODERATE_OR_BETTER" },
    });

    expect(results.map((result) => result.destination.key)).toEqual(["higher", "lower"]);
    expect(results.every((result) => result.group === "MEETS_FILTERS")).toBe(true);
    expect(results[0].lifestyleFit.relevantDimensionCount).toBe(2);
  });
});