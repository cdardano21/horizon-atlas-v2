import type { PrototypeCandidate } from "./cohort";
import { compareEvaluatedDestinations, evaluateShortlist, type EvaluatedDestination, type ResultGroup, type ShortlistProfile } from "./evaluator";
import { classifyAffordability, type AffordabilityClassification } from "./owned-affordability";
import { ownedAffordabilityByDestination } from "./owned-affordability-records";

export type OwnedBudgetContext = {
  amountUsd: number;
  household: "single" | "couple";
  require?: boolean;
};

export type OwnedEvaluatedDestination = EvaluatedDestination & {
  affordabilityDecision?: AffordabilityClassification;
};

function gatedGroup(group: ResultGroup, decision: AffordabilityClassification, required: boolean): ResultGroup {
  if (!required) return group;
  if (group === "EXCLUDED" || decision.state === "WITHIN_BUDGET") return group;
  if (group === "MEETS_FILTERS") return decision.state === "CLOSE_TO_BUDGET" ? "NEEDS_VERIFICATION" : "EXCLUDED";
  return "EXCLUDED";
}

export function evaluateShortlistWithOwnedAffordability(
  destinations: PrototypeCandidate[],
  profile: ShortlistProfile,
  budget?: OwnedBudgetContext,
): OwnedEvaluatedDestination[] {
  const baseResults = evaluateShortlist(destinations, { ...profile, affordability: undefined, budget: undefined });
  if (!budget) return baseResults;

  return baseResults.map((result) => {
    const record = ownedAffordabilityByDestination.get(result.destination.key);
    if (!record) throw new Error(`Missing owned affordability estimate for ${result.destination.key}`);
    const estimatedMonthlyUsd = budget.household === "single" ? record.singleMonthlyUsd : record.coupleMonthlyUsd;
    const decision = classifyAffordability({ budgetUsd: budget.amountUsd, estimatedMonthlyUsd });
    const reasonState = decision.state === "WITHIN_BUDGET"
      ? "PASS" as const
      : decision.state === "CLOSE_TO_BUDGET" ? "UNKNOWN" as const : "FAIL" as const;
    return {
      ...result,
      group: gatedGroup(result.group, decision, budget.require !== false),
      reasons: [...result.reasons, { capability: "affordability" as const, state: reasonState, explanation: decision.reason }],
      affordabilityDecision: decision,
    };
  }).sort(compareEvaluatedDestinations);
}