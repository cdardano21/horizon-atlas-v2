import { describe, expect, it } from "vitest";
import { smartShortlistCandidates } from "./cohort";
import { ownedAffordabilityByDestination, ownedAffordabilityRecords } from "./owned-affordability-records";

describe("owned affordability registry", () => {
  it("covers exactly the approved 36 destinations without changing the cohort", () => {
    expect(ownedAffordabilityRecords).toHaveLength(36);
    expect(new Set(ownedAffordabilityRecords.map((record) => record.destinationKey)).size).toBe(36);
    expect([...ownedAffordabilityByDestination.keys()].sort()).toEqual(smartShortlistCandidates.map((candidate) => candidate.key).sort());
    expect(smartShortlistCandidates.reduce((sum, candidate) => sum + candidate.costRows.length, 0)).toBe(237);
  });

  it("provides one usable single and couple estimate in 2026 USD for every destination", () => {
    for (const record of ownedAffordabilityRecords) {
      expect(record).toEqual({
        destinationKey: record.destinationKey,
        singleMonthlyUsd: expect.any(Number),
        coupleMonthlyUsd: expect.any(Number),
        estimateYear: 2026,
      });
      expect(record.singleMonthlyUsd).toBeGreaterThan(0);
      expect(record.coupleMonthlyUsd).toBeGreaterThan(record.singleMonthlyUsd);
    }
  });

  it("includes the three completed estimates and excludes out-of-cohort destinations", () => {
    expect(ownedAffordabilityByDestination.get("fairhope-al-us")).toMatchObject({ singleMonthlyUsd: 3500, coupleMonthlyUsd: 5500 });
    expect(ownedAffordabilityByDestination.get("the-hague-netherlands")).toMatchObject({ singleMonthlyUsd: 2950, coupleMonthlyUsd: 3800 });
    expect(ownedAffordabilityByDestination.get("kyoto-japan")).toMatchObject({ singleMonthlyUsd: 2200, coupleMonthlyUsd: 2950 });
    expect([...ownedAffordabilityByDestination.keys()].join("|")).not.toMatch(/lisbon|new-braunfels|summerlin/);
  });
});