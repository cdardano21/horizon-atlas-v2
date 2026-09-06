export type AffordabilityCompatibility = "WITHIN_BUDGET" | "CLOSE_TO_BUDGET" | "OVER_BUDGET";

export type OwnedAffordabilityRecord = {
  destinationKey: string;
  singleMonthlyUsd: number;
  coupleMonthlyUsd: number;
  estimateYear: 2026;
};

export type AffordabilityClassification = {
  state: AffordabilityCompatibility;
  estimatedMonthlyUsd: number;
  budgetUsd: number;
  reason: string;
};

export const AFFORDABILITY_ESTIMATE_DEFINITION = "Estimated comfortable monthly living cost in 2026 USD, including rent for a modern one-bedroom home, utilities, groceries, ordinary local transportation, moderate dining, and entertainment. Healthcare, taxes, international travel, major medical expenses, and luxury spending are excluded. Actual costs vary.";

export function classifyAffordability(input: {
  budgetUsd: number;
  estimatedMonthlyUsd: number;
}): AffordabilityClassification {
  if (!Number.isFinite(input.budgetUsd) || input.budgetUsd <= 0) throw new RangeError("budgetUsd must be positive");
  if (!Number.isFinite(input.estimatedMonthlyUsd) || input.estimatedMonthlyUsd <= 0) throw new RangeError("estimatedMonthlyUsd must be positive");

  const state: AffordabilityCompatibility = input.estimatedMonthlyUsd <= input.budgetUsd
    ? "WITHIN_BUDGET"
    : input.estimatedMonthlyUsd <= input.budgetUsd * 1.1
      ? "CLOSE_TO_BUDGET"
      : "OVER_BUDGET";
  return {
    state,
    estimatedMonthlyUsd: input.estimatedMonthlyUsd,
    budgetUsd: input.budgetUsd,
    reason: `Estimated monthly cost is $${input.estimatedMonthlyUsd.toLocaleString("en-US")} against your $${input.budgetUsd.toLocaleString("en-US")} monthly budget.`,
  };
}