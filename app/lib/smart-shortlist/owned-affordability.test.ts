import { describe, expect, it } from "vitest";
import { classifyAffordability } from "./owned-affordability";

describe("owned affordability classifier", () => {
  it("follows the three plain budget rules at their boundaries", () => {
    expect(classifyAffordability({ budgetUsd: 2_000, estimatedMonthlyUsd: 2_000 }).state).toBe("WITHIN_BUDGET");
    expect(classifyAffordability({ budgetUsd: 2_000, estimatedMonthlyUsd: 2_200 }).state).toBe("CLOSE_TO_BUDGET");
    expect(classifyAffordability({ budgetUsd: 2_000, estimatedMonthlyUsd: 2_201 }).state).toBe("OVER_BUDGET");
  });

  it("never improves when the user lowers the budget", () => {
    const states = [2_500, 2_000, 1_800].map((budgetUsd) => classifyAffordability({ budgetUsd, estimatedMonthlyUsd: 2_000 }).state);
    expect(states).toEqual(["WITHIN_BUDGET", "WITHIN_BUDGET", "OVER_BUDGET"]);
  });

  it("explains the estimate and stated budget", () => {
    expect(classifyAffordability({ budgetUsd: 4_500, estimatedMonthlyUsd: 2_300 }).reason).toBe("Estimated monthly cost is $2,300 against your $4,500 monthly budget.");
  });
});