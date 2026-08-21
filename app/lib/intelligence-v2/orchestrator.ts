import type { UserProfileV2 } from "./profile-types";
import type { AffordabilityResult, EligibilityResult, FinalDestinationRecommendationResult, FinancialEfficiencyResult, LifestyleScore, RecommendationStatus, RecommendationTradeoff, SortRankingValue } from "./result-types";
import type { SyntheticDestinationFixture } from "./destination-fact-types";
import { evaluateEligibility } from "./eligibility-evaluator";
import { evaluateAffordability } from "./affordability-evaluator";
import { evaluateLifestyleFit } from "./lifestyle-scorer";
import { evaluateFinancialEfficiency } from "./financial-efficiency";
import {
  CURRENT_AFFORDABILITY_MODEL_VERSION,
  CURRENT_ELIGIBILITY_MODEL_VERSION,
  CURRENT_FINANCIAL_MODEL_VERSION,
  CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS,
  CURRENT_SCORING_MODEL_VERSION,
} from "./versions";
import { compareForRanking, MATCHED_REASON_FIT_THRESHOLD_PERCENT } from "./ranking-policy";

/**
 * Orchestration/ranking pipeline. Runs all four layers unconditionally (Layer 4
 * findings remain available for diagnostics even on an excluded destination),
 * derives a single richer `recommendationStatus`, and ranks only what that status
 * allows — never averaging away a Layer 1 FAIL or a Layer 2 hard-budget exclusion.
 *
 * DO NOT AVERAGE AWAY A FATAL FLAW: `excluded`/`recommendationStatus` derive only
 * from Layers 1 and 2. Layer 3 only ever supplies `sortRankingValue` for non-excluded
 * destinations. Layer 4 is advisory-only and never participates in ranking.
 */

function assertConsistentModelVersions(
  eligibility: EligibilityResult,
  affordability: AffordabilityResult,
  lifestyleFit: LifestyleScore,
  financialEfficiency: FinancialEfficiencyResult,
): void {
  if (eligibility.modelVersion !== CURRENT_ELIGIBILITY_MODEL_VERSION) {
    throw new Error(`Eligibility model version mismatch: ${eligibility.modelVersion}`);
  }
  if (affordability.modelVersion !== CURRENT_AFFORDABILITY_MODEL_VERSION) {
    throw new Error(`Affordability model version mismatch: ${affordability.modelVersion}`);
  }
  if (lifestyleFit.modelVersion !== CURRENT_SCORING_MODEL_VERSION) {
    throw new Error(`Scoring model version mismatch: ${lifestyleFit.modelVersion}`);
  }
  if (financialEfficiency.modelVersion !== CURRENT_FINANCIAL_MODEL_VERSION) {
    throw new Error(`Financial model version mismatch: ${financialEfficiency.modelVersion}`);
  }
}

export function evaluateDestinationForProfile(
  profile: UserProfileV2,
  destination: SyntheticDestinationFixture,
): FinalDestinationRecommendationResult {
  const eligibility = evaluateEligibility(profile, destination);
  const affordability = evaluateAffordability(profile, destination);
  const lifestyleFit = evaluateLifestyleFit(profile, destination);
  const financialEfficiency = evaluateFinancialEfficiency(profile, destination);

  assertConsistentModelVersions(eligibility, affordability, lifestyleFit, financialEfficiency);

  const layer1Fail = eligibility.overallStatus === "EXCLUDED";
  const layer2HardExclusion = affordability.excludedByAffordability;
  const excluded = layer1Fail || layer2HardExclusion;

  const layer1Unknown = eligibility.overallStatus === "UNKNOWN_INCOMPLETE";
  const layer2Unknown = affordability.status === "UNKNOWN";

  const recommendationStatus: RecommendationStatus = excluded
    ? "EXCLUDED"
    : layer1Unknown || layer2Unknown
      ? "NEEDS_VERIFICATION"
      : "VIABLE";

  const exclusionReasons = [...eligibility.exclusionReasonCodes, ...(layer2HardExclusion ? affordability.reasonCodes : [])];
  const failedConstraints = [...eligibility.exclusionReasonCodes, ...(layer2HardExclusion ? affordability.reasonCodes : [])];
  const unknownConstraints = [...eligibility.unknownReasonCodes, ...(layer2Unknown ? affordability.reasonCodes : [])];

  const matchedReasons =
    lifestyleFit.scoreStatus === "SCORED"
      ? lifestyleFit.dimensionContributions
          .filter((c) => !c.isUnknown && c.normalizedFitPercent !== null && c.normalizedFitPercent >= MATCHED_REASON_FIT_THRESHOLD_PERCENT)
          .sort((a, b) => Math.abs(b.contributionPoints) - Math.abs(a.contributionPoints) || a.dimensionKey.localeCompare(b.dimensionKey))
          .map((c) => c.dimensionKey)
      : [];

  const lifestyleTradeoffs: RecommendationTradeoff[] = lifestyleFit.tradeoffs.map((t) => ({ sourceLayer: "LIFESTYLE", ...t }));
  const financialTradeoffs: RecommendationTradeoff[] = financialEfficiency.findings
    .filter((f) => f.severity === "CAUTION" || f.severity === "NEGATIVE")
    .map((f) => ({ sourceLayer: "FINANCIAL", category: f.category, severity: f.severity, reasonCode: f.reasonCode }));
  const tradeoffs: RecommendationTradeoff[] = [...lifestyleTradeoffs, ...financialTradeoffs];

  const sortRankingValue: SortRankingValue | null =
    recommendationStatus === "VIABLE" && lifestyleFit.scoreStatus === "SCORED"
      ? { basis: "LIFESTYLE_SCORE_AMONG_ELIGIBLE_ONLY", value: lifestyleFit.totalScore }
      : null;

  return {
    destinationId: destination.id,
    contractVersions: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS,
    eligibility,
    affordability,
    lifestyleFit,
    financialEfficiency,
    recommendationStatus,
    excluded,
    exclusionReasons,
    matchedReasons,
    tradeoffs,
    failedConstraints,
    unknownConstraints,
    topScoreContributors: lifestyleFit.topContributors,
    sortRankingValue,
  };
}

export function rankDestinationsForProfile(
  profile: UserProfileV2,
  destinations: readonly SyntheticDestinationFixture[],
): readonly FinalDestinationRecommendationResult[] {
  const results = destinations.map((destination) => evaluateDestinationForProfile(profile, destination));
  return [...results].sort(compareForRanking);
}
