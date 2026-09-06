import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { smartShortlistCandidates, type LocalCostRow } from "./cohort";
import { assessLocalCostEvidence, normalizedAffordabilityStatus } from "./cost-evidence";
import { evaluateShortlist, type ShortlistProfile } from "./evaluator";
import { convertRangeForDisplay, U3_R3_FIXTURE_SNAPSHOT } from "./exchange-rates";

const SEALED_COHORT_SHA256 = "47ee8beadde326b2d285f723bdcd67256a18394bec85476dec6a377a8ac953f0";
const rejectedKeys = ["san-ramon-costa-rica", "st-cloud-minnesota-united-states", "st-john-s-canada"];

describe("U3-R2 cost and scoring preservation", () => {
  it("keeps the sealed cohort source byte-identical", () => {
    const source = readFileSync("app/lib/smart-shortlist/cohort.ts");
    expect(createHash("sha256").update(source).digest("hex")).toBe(SEALED_COHORT_SHA256);
  });

  it("preserves exactly 36 candidates and all 237 retained rows", () => {
    expect(smartShortlistCandidates).toHaveLength(36);
    expect(new Set(smartShortlistCandidates.map((candidate) => candidate.key)).size).toBe(36);
    expect(smartShortlistCandidates.flatMap((candidate) => candidate.costRows)).toHaveLength(237);
  });

  it("preserves every original amount and currency through display conversion", () => {
    const before = structuredClone(smartShortlistCandidates.map((candidate) => candidate.costRows));
    for (const candidate of smartShortlistCandidates) {
      for (const row of candidate.costRows) {
        convertRangeForDisplay({ low: row.low, high: row.high, baseCurrency: row.currency, displayCurrency: "USD", snapshot: U3_R3_FIXTURE_SNAPSHOT, asOfDate: "2026-09-06" });
      }
    }
    expect(smartShortlistCandidates.map((candidate) => candidate.costRows)).toEqual(before);
  });

  it("keeps all ten canonical cohort currencies intact", () => {
    const currencies = new Set(smartShortlistCandidates.flatMap((candidate) => candidate.costRows.map((row) => row.currency)));
    expect([...currencies].sort()).toEqual(["BRL", "EUR", "MXN", "MYR", "NZD", "PHP", "THB", "USD", "UYU", "VND"]);
  });

  it("does not let conversion or a cash budget alter shortlist ranking", () => {
    const baseline = evaluateShortlist(smartShortlistCandidates, {}).map(({ destination, group, preferenceSupport }) => ({ key: destination.key, group, preferenceSupport }));
    for (const candidate of smartShortlistCandidates) {
      const total = candidate.localTotals.single;
      if (total) convertRangeForDisplay({ low: total.monthlyLow, high: total.monthlyHigh, baseCurrency: total.currency, displayCurrency: "USD", snapshot: U3_R3_FIXTURE_SNAPSHOT, asOfDate: "2026-09-06" });
    }
    const withCashBudget = evaluateShortlist(smartShortlistCandidates, { budget: { amount: 4_500, currency: "USD", household: "single" } }).map(({ destination, group, preferenceSupport }) => ({ key: destination.key, group, preferenceSupport }));
    expect(withCashBudget).toEqual(baseline);
  });

  it("does not count rent, utilities, groceries, transport, or healthcare as ranking factors", () => {
    const profile: ShortlistProfile = {};
    const original = smartShortlistCandidates[0];
    const extraRows: LocalCostRow[] = ["rent", "utilities", "groceries", "transportation", "healthcare"].map((category) => ({ category, household: "single", low: 1, high: 1, currency: "USD", verifiedAt: "2026-09-06" }));
    const enriched = { ...original, costRows: [...original.costRows, ...extraRows] };
    expect(evaluateShortlist([enriched], profile)[0].preferenceSupport).toBe(evaluateShortlist([original], profile)[0].preferenceSupport);
  });

  it("keeps normalized affordability as the only budget requirement and unknown for all 36", () => {
    expect(smartShortlistCandidates.map(normalizedAffordabilityStatus)).toEqual(Array(36).fill("INSUFFICIENT_INFORMATION"));
    const required = evaluateShortlist(smartShortlistCandidates, { affordability: { maxBand: "MODERATE", require: true } });
    expect(required.every((result) => result.group === "NEEDS_VERIFICATION")).toBe(true);
    expect(required.every((result) => result.reasons.some((reason) => reason.capability === "affordability" && reason.state === "UNKNOWN"))).toBe(true);
  });

  it("flags conflicting local evidence for review without scoring it", () => {
    const assessment = assessLocalCostEvidence([
      { category: "rent", household: "single", low: 1_000, high: 1_500, currency: "EUR", verifiedAt: "2026-09-01" },
      { category: "rent", household: "single", low: 2_000, high: 2_500, currency: "EUR", verifiedAt: "2026-09-02" },
    ]);
    expect(assessment).toEqual({ reviewRequired: true, conflicts: ["rent|single"] });
  });

  it("keeps the three placeholder-like destinations empty and insufficient", () => {
    for (const key of rejectedKeys) {
      const candidate = smartShortlistCandidates.find((item) => item.key === key)!;
      expect(candidate.affordabilityReadiness).toBe("INSUFFICIENT_FOR_AFFORDABILITY");
      expect(candidate.costRows).toEqual([]);
      expect(candidate.localTotals).toEqual({});
      expect(normalizedAffordabilityStatus(candidate)).toBe("INSUFFICIENT_INFORMATION");
    }
  });
});