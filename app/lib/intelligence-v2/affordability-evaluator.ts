import type { Household, UserProfileV2 } from "./profile-types";
import type { AffordabilityResult, MoneyRange } from "./result-types";
import type { SyntheticDestinationFixture } from "./destination-fact-types";
import { CURRENT_AFFORDABILITY_MODEL_VERSION } from "./versions";
import {
  classifyCostRangeAgainstBudget,
  isExcludedByAffordabilityPolicy,
  isValidBudgetAmount,
  isValidMoneyRange,
} from "./affordability-policy";

/**
 * Layer 2 — CAN I AFFORD IT? Deterministic pure-function evaluator.
 *
 * Reads only `profile.budget` / `profile.household` / `profile.tenureIntent` plus
 * `destination.cost`. Never reads `destination.entryAndStay` (Layer 1),
 * `destination.hardGates` or `destination.lifestyleDimensions` (Layer 3), or
 * `destination.financial` (Layer 4) — monthly affordability is not legal
 * feasibility, lifestyle fit, or long-term financial efficiency.
 */

/** No family multipliers are invented — this is a literal headcount used only to match against the destination's own stated assumption. */
function computeProfileHeadcount(household: Household): number {
  switch (household.type) {
    case "SINGLE":
      return 1;
    case "COUPLE":
      return household.spouseOrPartnerAccompanying ? 2 : 1;
    case "FAMILY_WITH_DEPENDENTS":
      return (household.spouseOrPartnerAccompanying ? 2 : 1) + household.dependentCount;
  }
}

function unknownResult(
  profile: UserProfileV2,
  reasonCode: string,
  estimatedMonthlyCostRange: MoneyRange | null,
  householdSizeAssumed: number,
): AffordabilityResult {
  return {
    modelVersion: CURRENT_AFFORDABILITY_MODEL_VERSION,
    status: "UNKNOWN",
    userMonthlyBudgetAmount: profile.budget.monthlyTargetAmount,
    userMonthlyBudgetCurrencyCode: profile.budget.currencyCode,
    budgetCeilingType: profile.budget.ceilingType,
    estimatedMonthlyCostRange,
    householdSizeAssumed,
    housingAssumption: profile.tenureIntent,
    marginAmount: null,
    reasonCodes: [reasonCode],
    excludedByAffordability: false,
  };
}

export function evaluateAffordability(profile: UserProfileV2, destination: SyntheticDestinationFixture): AffordabilityResult {
  const { budget, tenureIntent, household } = profile;
  const cost = destination.cost;

  if (!isValidBudgetAmount(budget.monthlyTargetAmount)) {
    return unknownResult(profile, "NO_USER_BUDGET_TARGET", null, cost.householdSizeAssumedForEstimate);
  }

  // BUY: no ownership monthly-cost model exists in this phase — never pretend the rental range applies.
  if (tenureIntent === "BUY") {
    return unknownResult(profile, "BUY_INTENT_OWNERSHIP_COST_NOT_MODELED", null, cost.householdSizeAssumedForEstimate);
  }

  if (cost.estimatedMonthlyCostRange === null) {
    return unknownResult(profile, "NO_DESTINATION_COST_DATA", null, cost.householdSizeAssumedForEstimate);
  }

  const range = cost.estimatedMonthlyCostRange;
  if (!isValidMoneyRange(range)) {
    return unknownResult(profile, "INVALID_DESTINATION_COST_RANGE", range, cost.householdSizeAssumedForEstimate);
  }

  const profileHeadcount = computeProfileHeadcount(household);
  if (profileHeadcount !== cost.householdSizeAssumedForEstimate) {
    return unknownResult(profile, "HOUSEHOLD_ESTIMATE_MISMATCH", range, cost.householdSizeAssumedForEstimate);
  }

  const status = classifyCostRangeAgainstBudget(range, budget.monthlyTargetAmount);
  const excludedByAffordability = isExcludedByAffordabilityPolicy(status, budget.ceilingType);
  const midpoint = (range.low + range.high) / 2;

  const reasonCodes: string[] = [
    status === "AFFORDABLE" ? "WITHIN_BUDGET_RANGE" : status === "BORDERLINE" ? "COST_RANGE_STRADDLES_BUDGET" : "COST_RANGE_EXCEEDS_BUDGET",
  ];
  if (excludedByAffordability) reasonCodes.push("HARD_CEILING_EXCLUSION");
  if (tenureIntent === "UNSURE") reasonCodes.push("TENURE_UNSURE_USING_RENT_BASELINE");

  return {
    modelVersion: CURRENT_AFFORDABILITY_MODEL_VERSION,
    status,
    userMonthlyBudgetAmount: budget.monthlyTargetAmount,
    userMonthlyBudgetCurrencyCode: budget.currencyCode,
    budgetCeilingType: budget.ceilingType,
    estimatedMonthlyCostRange: range,
    householdSizeAssumed: cost.householdSizeAssumedForEstimate,
    housingAssumption: tenureIntent,
    marginAmount: budget.monthlyTargetAmount - midpoint,
    reasonCodes,
    excludedByAffordability,
  };
}
