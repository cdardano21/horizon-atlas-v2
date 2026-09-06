import { describe, expect, it } from "vitest";
import { smartShortlistCandidates } from "./cohort";
import { evaluateShortlistWithOwnedAffordability } from "./owned-affordability-evaluator";

const budget = {
  amountUsd: 2_000,
  household: "single" as const,
};

describe("owned affordability shortlist gate", () => {
  it("adds exactly one direct budget signal for every destination", () => {
    const results = evaluateShortlistWithOwnedAffordability(smartShortlistCandidates, {}, budget);
    expect(results).toHaveLength(36);
    expect(results.every((result) => result.reasons.filter((reason) => reason.capability === "affordability").length === 1)).toBe(true);
    expect(results.find((result) => result.destination.key === "the-villages-fl-us")?.affordabilityDecision?.state).toBe("OVER_BUDGET");
    expect(results.find((result) => result.destination.key === "sofia-bg")?.group).toBe("MEETS_FILTERS");
  });

  it("never lets an affordability pass cancel another required conflict", () => {
    const results = evaluateShortlistWithOwnedAffordability(smartShortlistCandidates, {
      includedCountries: ["US"],
    }, { ...budget, amountUsd: 10_000 });
    expect(results.find((result) => result.destination.key === "sofia-bg")?.group).toBe("EXCLUDED");
  });

  it("uses the selected household estimate", () => {
    const candidates = smartShortlistCandidates.filter((candidate) => candidate.key === "sofia-bg");
    const [single] = evaluateShortlistWithOwnedAffordability(candidates, {}, { amountUsd: 2_000, household: "single" });
    const [couple] = evaluateShortlistWithOwnedAffordability(candidates, {}, { amountUsd: 2_000, household: "couple" });
    expect(single.affordabilityDecision?.state).toBe("WITHIN_BUDGET");
    expect(couple.affordabilityDecision?.state).toBe("OVER_BUDGET");
  });

  it("uses the same over-budget evidence as a hard exclusion or flexible tradeoff", () => {
    const candidates = smartShortlistCandidates.filter((candidate) => candidate.key === "the-villages-fl-us");
    const [hard] = evaluateShortlistWithOwnedAffordability(candidates, {}, { ...budget, require: true });
    const [flexible] = evaluateShortlistWithOwnedAffordability(candidates, {}, { ...budget, require: false });

    expect(hard.group).toBe("EXCLUDED");
    expect(flexible.group).toBe("MEETS_FILTERS");
    expect(hard.affordabilityDecision).toEqual(flexible.affordabilityDecision);
  });
});