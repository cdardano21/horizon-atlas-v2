import type { BeachAccessFact, MountainOrSkiAccessFact, SafetyStandardFact } from "./destination-fact-types";
import type { HealthcareMinimumStandard, PreferenceImportance, SafetyMinimumStandard } from "./profile-types";
import type { ScoringModelVersion } from "./versions";
import { CURRENT_SCORING_MODEL_VERSION } from "./versions";

/**
 * LIFESTYLE_SCORING_MODEL_V1 — the only Layer 3 scoring policy for this phase.
 *
 * Recalibrating later means changing this file/bumping the version, never editing
 * the scorer itself.
 */
export const LIFESTYLE_SCORING_POLICY_VERSION: ScoringModelVersion = CURRENT_SCORING_MODEL_VERSION;

/**
 * Recognized Layer 3 dimension keys, reviewed against the existing taxonomy already
 * used across synthetic fixtures (climate, walkability, culture, community, safety,
 * healthcare, connectivity, nature, pace, coast) plus the smallest additive set
 * needed to cover the dimensions this phase explicitly requires (golf, food/dining,
 * nightlife, language ease, accessibility, settlement urbanness, transportation,
 * and soft healthcare/safety/beach/mountain variants). No dozens-of-dimensions
 * taxonomy was invented — this is the minimal named list.
 */
export const LIFESTYLE_DIMENSION_KEYS = [
  "climate",
  "walkability",
  "culture",
  "foodDining",
  "nightlife",
  "golf",
  "beachLifestyle",
  "mountainOutdoorLifestyle",
  "community",
  "languageEase",
  "accessibility",
  "settlementUrbanness",
  "transportationAirportQuality",
  "connectivityRemoteWork",
  "healthcareQuality",
  "safetyQuality",
] as const;

export type LifestyleDimensionKey = (typeof LIFESTYLE_DIMENSION_KEYS)[number];

/** Dimension keys resolved from an enum-shaped hard-gate fact rather than the free-form `dimensionValues` map (no field duplication). */
export const ENUM_DERIVED_DIMENSION_KEYS: ReadonlySet<string> = new Set([
  "beachLifestyle",
  "mountainOutdoorLifestyle",
  "healthcareQuality",
  "safetyQuality",
]);

/** importance IS the weight — the simplest explicit, non-arbitrary curve. Recalibrate by editing this table only. */
export const IMPORTANCE_WEIGHT_TABLE: Record<PreferenceImportance, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

export const BEACH_ACCESS_DIMENSION_SCORE: Record<BeachAccessFact, number | null> = {
  DIRECT_ACCESS: 100,
  NEARBY: 60,
  NONE: 0,
  UNKNOWN: null,
};

export const MOUNTAIN_ACCESS_DIMENSION_SCORE: Record<MountainOrSkiAccessFact, number | null> = {
  SKI_RESORT_ACCESS: 100,
  MOUNTAIN_SCENIC_ONLY: 60,
  NONE: 0,
  UNKNOWN: null,
};

export const HEALTHCARE_STANDARD_DIMENSION_SCORE: Record<HealthcareMinimumStandard | "UNKNOWN", number | null> = {
  BASIC_ACCESS: 33,
  GOOD_PRIVATE_AVAILABLE: 66,
  INTERNATIONAL_STANDARD: 100,
  UNKNOWN: null,
};

export const SAFETY_STANDARD_DIMENSION_SCORE: Record<SafetyMinimumStandard | SafetyStandardFact | "UNKNOWN", number | null> = {
  MODERATE_OR_BETTER: 50,
  HIGH_SAFETY_ONLY: 100,
  ELEVATED_RISK: 0,
  UNKNOWN: null,
};

/** Default target for CLOSER_TO_TARGET_IS_BETTER when the profile omits an explicit targetValue. */
export const DEFAULT_CLOSER_TO_TARGET_MIDPOINT = 50;

/** A tradeoff is surfaced only when a highly-important preference (>= this) is poorly matched. */
export const TRADEOFF_HIGH_IMPORTANCE_THRESHOLD: PreferenceImportance = 4;

/** Below this normalized-fit percentage on a high-importance dimension, the fit is flagged LOW. */
export const TRADEOFF_LOW_FIT_THRESHOLD_PERCENT = 40;
