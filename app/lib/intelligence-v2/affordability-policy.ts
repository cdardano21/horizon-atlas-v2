import type { AffordabilityStatus, MoneyRange } from "./result-types";
import type { AffordabilityModelVersion } from "./versions";
import { CURRENT_AFFORDABILITY_MODEL_VERSION } from "./versions";

/**
 * AFFORDABILITY_MODEL_V1 — the only affordability policy for this phase.
 *
 * Range-vs-budget classification uses no arbitrary percentage/dollar buffer. The
 * boundary is defined structurally by where the budget falls relative to the
 * destination's own realistic cost range:
 *
 * - AFFORDABLE:   the range's most expensive case (high) is at or under budget.
 * - UNAFFORDABLE: the range's cheapest case (low) already exceeds budget.
 * - BORDERLINE:   budget falls strictly inside the range (some realistic outcomes
 *                 fit, some don't) — neither clearly affordable nor unaffordable.
 *
 * Recalibrating later means changing this file/bumping the version, never editing
 * the evaluator itself.
 */
export const AFFORDABILITY_POLICY_VERSION: AffordabilityModelVersion = CURRENT_AFFORDABILITY_MODEL_VERSION;

export function classifyCostRangeAgainstBudget(range: MoneyRange, budgetAmount: number): Exclude<AffordabilityStatus, "UNKNOWN"> {
  if (range.high <= budgetAmount) return "AFFORDABLE";
  if (range.low > budgetAmount) return "UNAFFORDABLE";
  return "BORDERLINE";
}

/**
 * Only UNAFFORDABLE + HARD_CEILING excludes. BORDERLINE never auto-excludes under
 * this policy version regardless of ceiling type — a downstream ranking system may
 * still demote it. UNKNOWN never excludes (and is never treated as PASS either).
 */
export function isExcludedByAffordabilityPolicy(
  status: AffordabilityStatus,
  ceilingType: "HARD_CEILING" | "FLEXIBLE_TARGET",
): boolean {
  return status === "UNAFFORDABLE" && ceilingType === "HARD_CEILING";
}

export function isValidMoneyRange(range: MoneyRange): boolean {
  return Number.isFinite(range.low) && Number.isFinite(range.high) && range.low >= 0 && range.high >= 0 && range.low <= range.high;
}

export function isValidBudgetAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0;
}
