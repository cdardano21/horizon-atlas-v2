import type { FinalDestinationRecommendationResult } from "./result-types";

/** A dimension contribution at or above this normalized-fit percentage counts as a "matched reason", not just a top contributor. */
export const MATCHED_REASON_FIT_THRESHOLD_PERCENT = 70;

/**
 * RANKING_POLICY_V1 — deterministic grouping + tie-breaking for the orchestrator.
 *
 * 0 = VIABLE with a scored lifestyle fit (has a sortRankingValue)
 * 1 = VIABLE with insufficient lifestyle data (no sortRankingValue, still not excluded)
 * 2 = NEEDS_VERIFICATION (never presented as equivalent to a fully viable result)
 * 3 = EXCLUDED (never outranks a viable destination, regardless of Layer 3 score)
 */
export type RecommendationRankGroup = 0 | 1 | 2 | 3;

export interface RankingPolicyInput {
  readonly destinationId: string;
  readonly recommendationStatus: FinalDestinationRecommendationResult["recommendationStatus"];
  readonly sortRankingValue: FinalDestinationRecommendationResult["sortRankingValue"];
}

export function computeRankGroup(result: RankingPolicyInput): RecommendationRankGroup {
  if (result.recommendationStatus === "EXCLUDED") return 3;
  if (result.recommendationStatus === "NEEDS_VERIFICATION") return 2;
  return result.sortRankingValue !== null ? 0 : 1;
}

/**
 * Sort comparator: rank group ascending, then sortRankingValue descending (group 0
 * only), then destinationId ascending as the deterministic, non-random tie-breaker.
 */
export function compareForRanking(a: RankingPolicyInput, b: RankingPolicyInput): number {
  const groupA = computeRankGroup(a);
  const groupB = computeRankGroup(b);
  if (groupA !== groupB) return groupA - groupB;

  if (groupA === 0) {
    const valueA = a.sortRankingValue!.value;
    const valueB = b.sortRankingValue!.value;
    if (valueA !== valueB) return valueB - valueA;
  }

  return a.destinationId.localeCompare(b.destinationId);
}
