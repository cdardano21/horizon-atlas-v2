import type { LifestylePreferenceInput, PreferenceDirection, UserProfileV2 } from "./profile-types";
import type { LifestyleDimensionContribution, LifestyleScore, LifestyleTradeoff } from "./result-types";
import type { SyntheticDestinationFixture } from "./destination-fact-types";
import { CURRENT_SCORING_MODEL_VERSION } from "./versions";
import {
  BEACH_ACCESS_DIMENSION_SCORE,
  DEFAULT_CLOSER_TO_TARGET_MIDPOINT,
  ENUM_DERIVED_DIMENSION_KEYS,
  HEALTHCARE_STANDARD_DIMENSION_SCORE,
  IMPORTANCE_WEIGHT_TABLE,
  MOUNTAIN_ACCESS_DIMENSION_SCORE,
  SAFETY_STANDARD_DIMENSION_SCORE,
  TRADEOFF_HIGH_IMPORTANCE_THRESHOLD,
  TRADEOFF_LOW_FIT_THRESHOLD_PERCENT,
} from "./lifestyle-scoring-policy";

/**
 * Layer 3 — DOES IT FIT MY LIFE? Deterministic pure-function scorer.
 *
 * Reads only `profile.lifestylePreferences` plus `destination.hardGates` (for the 4
 * enum-derived dimensions) and `destination.lifestyleDimensions` (for everything
 * else). Never reads `destination.entryAndStay` (Layer 1), `destination.cost` or
 * `profile.budget` (Layer 2), or `destination.financial` (Layer 4).
 *
 * Iterates ONLY over the profile's own preference list — a destination's unrelated
 * populated dimensions are never inspected, which structurally prevents rewarding
 * data-richness over genuine fit (the known v1 evidence-bias defect).
 */

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function resolveDimensionRawValue(dimensionKey: string, destination: SyntheticDestinationFixture): number | null {
  if (dimensionKey === "beachLifestyle") return BEACH_ACCESS_DIMENSION_SCORE[destination.hardGates.beachAccess];
  if (dimensionKey === "mountainOutdoorLifestyle") return MOUNTAIN_ACCESS_DIMENSION_SCORE[destination.hardGates.mountainOrSkiAccess];
  if (dimensionKey === "healthcareQuality") return HEALTHCARE_STANDARD_DIMENSION_SCORE[destination.hardGates.healthcareStandard];
  if (dimensionKey === "safetyQuality") return SAFETY_STANDARD_DIMENSION_SCORE[destination.hardGates.safetyStandard];
  if (ENUM_DERIVED_DIMENSION_KEYS.has(dimensionKey)) return null;
  return destination.lifestyleDimensions.dimensionValues[dimensionKey] ?? null;
}

function computeFitFraction(direction: PreferenceDirection, rawValue: number, targetValue: number | null): number {
  if (direction === "MORE_IS_BETTER") return clamp01(rawValue / 100);
  if (direction === "LESS_IS_BETTER") return clamp01((100 - rawValue) / 100);
  const target = targetValue ?? DEFAULT_CLOSER_TO_TARGET_MIDPOINT;
  return clamp01(1 - Math.abs(rawValue - target) / 100);
}

function fitLevelFromPercent(normalizedFitPercent: number): "LOW" | "MEDIUM" | "HIGH" {
  if (normalizedFitPercent < TRADEOFF_LOW_FIT_THRESHOLD_PERCENT) return "LOW";
  if (normalizedFitPercent < 70) return "MEDIUM";
  return "HIGH";
}

export function evaluateLifestylePreferences(
  preferences: readonly LifestylePreferenceInput[],
  destination: Pick<SyntheticDestinationFixture, "hardGates" | "lifestyleDimensions">,
): LifestyleScore {
  const contributions: LifestyleDimensionContribution[] = [];
  const tradeoffs: LifestyleTradeoff[] = [];

  let achievedWeightedFit = 0;
  let possibleWeight = 0;
  let scoredDimensionCount = 0;

  for (const preference of preferences) {
    const rawDimensionValue = resolveDimensionRawValue(preference.dimensionKey, destination);

    if (rawDimensionValue === null) {
      contributions.push({
        dimensionKey: preference.dimensionKey,
        direction: preference.direction,
        importance: preference.importance,
        rawDimensionValue: null,
        normalizedFitPercent: null,
        contributionPoints: 0,
        isUnknown: true,
      });
      continue;
    }

    const weight = IMPORTANCE_WEIGHT_TABLE[preference.importance];
    const fitFraction = computeFitFraction(preference.direction, rawDimensionValue, preference.targetValue);
    const normalizedFitPercent = Math.round(fitFraction * 100);
    const contributionPoints = weight * fitFraction;

    achievedWeightedFit += contributionPoints;
    possibleWeight += weight;
    scoredDimensionCount += 1;

    contributions.push({
      dimensionKey: preference.dimensionKey,
      direction: preference.direction,
      importance: preference.importance,
      rawDimensionValue,
      normalizedFitPercent,
      contributionPoints,
      isUnknown: false,
    });

    if (preference.importance >= TRADEOFF_HIGH_IMPORTANCE_THRESHOLD && normalizedFitPercent < TRADEOFF_LOW_FIT_THRESHOLD_PERCENT) {
      tradeoffs.push({
        dimensionKey: preference.dimensionKey,
        importance: preference.importance,
        fitLevel: fitLevelFromPercent(normalizedFitPercent),
        note: "HIGH_IMPORTANCE_POOR_FIT",
      });
    }
  }

  const relevantDimensionCount = preferences.length;
  const coverageRatio = relevantDimensionCount > 0 ? scoredDimensionCount / relevantDimensionCount : 0;
  const totalScore = scoredDimensionCount > 0 ? Math.round((achievedWeightedFit / possibleWeight) * 100) : 0;

  const topContributors = contributions
    .filter((contribution) => !contribution.isUnknown)
    .sort((a, b) => Math.abs(b.contributionPoints) - Math.abs(a.contributionPoints) || a.dimensionKey.localeCompare(b.dimensionKey))
    .map((contribution) => contribution.dimensionKey);

  return {
    modelVersion: CURRENT_SCORING_MODEL_VERSION,
    scoreStatus: scoredDimensionCount > 0 ? "SCORED" : "INSUFFICIENT_DATA",
    totalScore,
    dimensionContributions: contributions,
    topContributors,
    tradeoffs,
    scoredDimensionCount,
    relevantDimensionCount,
    coverageRatio,
  };
}

export function evaluateLifestyleFit(profile: UserProfileV2, destination: SyntheticDestinationFixture): LifestyleScore {
  return evaluateLifestylePreferences(profile.lifestylePreferences, destination);
}
