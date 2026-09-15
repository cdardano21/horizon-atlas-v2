import { describe, expect, it } from "vitest";
import {
  BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS,
  BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES,
  BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS,
  BATCH_20_02_PREMIUM_V6_WORKBOOK_SHA256,
  buildBatch20PremiumV3ReplayManifest,
  isBatch20PremiumV3ReplayDestinationKey,
  validateBatch20PremiumV3ReplayAuthorization,
} from "../batch-20-02-replay-authorization";

const workbookPath = "data/curated-mixed-batch-20-02/DestinationFinderAI-Curated-Mixed-Batch-20-02-PREMIUM-REPAIRED-v6-v3.3.xlsx";

describe("Batch 20-02 premium v6 replay authorization", () => {
  it("authorizes only the exact workbook, hash, and twenty-key scope", () => {
    expect(validateBatch20PremiumV3ReplayAuthorization({
      workbookPath,
      workbookHash: BATCH_20_02_PREMIUM_V6_WORKBOOK_SHA256,
      approvedDestinationKeys: BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS,
    })).toEqual({ authorized: true, reason: null });
  });

  it("rejects a wrong path, hash, partial scope, or extra key", () => {
    const base = { workbookPath, workbookHash: BATCH_20_02_PREMIUM_V6_WORKBOOK_SHA256, approvedDestinationKeys: BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS };
    expect(validateBatch20PremiumV3ReplayAuthorization({ ...base, workbookPath: "data/other.xlsx" })).toEqual({ authorized: false, reason: null });
    expect(validateBatch20PremiumV3ReplayAuthorization({ ...base, workbookHash: "wrong" }).reason).toBe("curated-mixed-batch-20-02:WORKBOOK_SHA256_NOT_AUTHORIZED");
    expect(validateBatch20PremiumV3ReplayAuthorization({ ...base, approvedDestinationKeys: BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS.slice(1) }).reason).toBe("curated-mixed-batch-20-02:DESTINATION_SCOPE_NOT_AUTHORIZED");
    expect(validateBatch20PremiumV3ReplayAuthorization({ ...base, approvedDestinationKeys: [...BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS, "outside"] }).reason).toBe("curated-mixed-batch-20-02:DESTINATION_SCOPE_NOT_AUTHORIZED");
  });

  it("limits replacement replay to the six explicitly authorized existing identities", () => {
    expect(BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS).toHaveLength(6);
    for (const key of BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS) {
      expect(isBatch20PremiumV3ReplayDestinationKey(key)).toBe(true);
      expect(buildBatch20PremiumV3ReplayManifest(key as never).entries.map((entry) => entry.targetModule)).toEqual([...BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES]);
    }
    expect(isBatch20PremiumV3ReplayDestinationKey("almunecar-spain")).toBe(false);
    expect(buildBatch20PremiumV3ReplayManifest("almunecar-spain" as never).entries).toEqual([]);
    expect(BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES).not.toContain("environmentQuality");
    expect(BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES).not.toContain("dailyLifePracticality");
    expect(BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES).not.toContain("eventsSeasonality");
  });
});
