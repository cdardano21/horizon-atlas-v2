import { describe, expect, it } from "vitest";
import { smartShortlistCandidates } from "./cohort";
import { evaluateShortlist, type ShortlistProfile } from "./evaluator";

const group = (profile: ShortlistProfile, name: string) => evaluateShortlist(smartShortlistCandidates, profile)
  .filter((result) => result.group === name);

describe("Smart Shortlist product scenarios", () => {
  it("uses exactly the approved 36 unique candidates", () => {
    expect(smartShortlistCandidates).toHaveLength(36);
    expect(new Set(smartShortlistCandidates.map((item) => item.key)).size).toBe(36);
  });

  it("keeps a no-preference search neutral and deterministic", () => {
    const results = evaluateShortlist(smartShortlistCandidates, {});
    expect(results).toHaveLength(36);
    expect(results.every((result) => result.group === "MEETS_FILTERS" && result.preferenceSupport === 0)).toBe(true);
    expect(results.map((result) => result.destination.key)).toEqual([...results.map((result) => result.destination.key)].sort());
  });

  it("finds exactly the six US candidates by geographic scope", () => {
    expect(group({ includedCountries: ["US"] }, "MEETS_FILTERS")).toHaveLength(6);
  });

  it("does not treat domestic geography as legal eligibility", () => {
    const results = group({ includedCountries: ["US"] }, "MEETS_FILTERS");
    expect(results.every((result) => result.reasons.every((reason) => !/citizen|visa|eligible/i.test(reason.explanation)))).toBe(true);
  });

  it("finds exactly the three broad ski-resort-access candidates", () => {
    expect(group({ mountain: "SKI_RESORT_ACCESS", requireMountain: true }, "MEETS_FILTERS")).toHaveLength(3);
  });

  it("returns Queenstown alone for direct beach plus ski access", () => {
    const results = group({ beach: "DIRECT_ACCESS", requireBeach: true, mountain: "SKI_RESORT_ACCESS", requireMountain: true }, "MEETS_FILTERS");
    expect(results.map((result) => result.destination.key)).toEqual(["queenstown-nz"]);
  });

  it("returns no confirmed result for US plus direct beach plus ski access", () => {
    expect(group({ includedCountries: ["US"], beach: "DIRECT_ACCESS", requireBeach: true, mountain: "SKI_RESORT_ACCESS", requireMountain: true }, "MEETS_FILTERS")).toHaveLength(0);
  });

  it("keeps all normalized affordability requirements unresolved", () => {
    expect(group({ affordability: { maxBand: "MODERATE", require: true } }, "NEEDS_VERIFICATION")).toHaveLength(36);
  });

  it("preserves all 237 detailed local cost rows", () => {
    expect(smartShortlistCandidates.reduce((sum, item) => sum + item.costRows.length, 0)).toBe(237);
  });

  it("matches the audited affordability readiness distribution", () => {
    const counts = smartShortlistCandidates.reduce<Record<string, number>>((result, item) => {
      result[item.affordabilityReadiness] = (result[item.affordabilityReadiness] ?? 0) + 1;
      return result;
    }, {});
    expect(counts).toEqual({ INSUFFICIENT_FOR_AFFORDABILITY: 17, PROXY_REQUIRED: 10, LOCAL_EVIDENCE_READY: 9 });
  });

  it("does not assign a fabricated normalized index or band", () => {
    expect(smartShortlistCandidates.every((item) => item.normalizedAffordability.index === null && item.normalizedAffordability.band === null)).toBe(true);
  });
});