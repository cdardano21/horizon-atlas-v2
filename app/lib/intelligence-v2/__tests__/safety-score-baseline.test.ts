import { describe, expect, it } from "vitest";
import { evaluateLifestylePreferences } from "../lifestyle-scorer";
import { SAFETY_STANDARD_DIMENSION_SCORE } from "../lifestyle-scoring-policy";

describe("Safety score baseline", () => {
  it.each([ ["ELEVATED_RISK", 0], ["MODERATE_OR_BETTER", 50], ["UNKNOWN", null] ] as const)("preserves %s without NaN", (safetyStandard, score) => {
    expect(SAFETY_STANDARD_DIMENSION_SCORE[safetyStandard]).toBe(score);
    const result = evaluateLifestylePreferences([
      { dimensionKey: "safetyQuality", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null },
    ], {
      hardGates: { beachAccess: "UNKNOWN", mountainOrSkiAccess: "UNKNOWN", healthcareStandard: "UNKNOWN", safetyStandard, lgbtqLegalProtectionStatus: "UNKNOWN" },
      lifestyleDimensions: { dimensionValues: {} },
    });
    expect(Number.isFinite(result.totalScore)).toBe(true);
    expect(result.totalScore).toBe(score ?? 0);
    expect(result.scoredDimensionCount).toBe(score === null ? 0 : 1);
    expect(result.scoreStatus).toBe(score === null ? "INSUFFICIENT_DATA" : "SCORED");
  });
});
