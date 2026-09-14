import { describe, expect, it } from "vitest";
import { BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS, BATCH_20_01_PREMIUM_V2_REPLACEMENT_MODULES, BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256, buildBatch20PremiumV2ReplayManifest, validateBatch20PremiumV2ReplayAuthorization } from "../batch-20-01-replay-authorization";
const workbookPath = "data/curated-mixed-batch-20-01/DestinationFinderAI-Curated-Mixed-Batch-20-01-PREMIUM-REPAIRED-v2-v3.3.xlsx";
describe("Batch 20-01 premium v2 replay authorization", () => {
  it("authorizes the exact scope and every approved replacement module", () => {
    expect(validateBatch20PremiumV2ReplayAuthorization({ workbookPath, workbookHash: BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256, approvedDestinationKeys: BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS })).toEqual({ authorized: true, reason: null });
    const modules = buildBatch20PremiumV2ReplayManifest("kuching-malaysia" as never).entries.map((entry) => entry.targetModule);
    expect(modules).toEqual([...BATCH_20_01_PREMIUM_V2_REPLACEMENT_MODULES]);
    expect(modules).toContain("lifestyleFeatures");
  });
  it("does not authorize another workbook or a wrong hash", () => {
    expect(validateBatch20PremiumV2ReplayAuthorization({ workbookPath: "data/other.xlsx", workbookHash: BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256, approvedDestinationKeys: BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS })).toEqual({ authorized: false, reason: null });
    expect(validateBatch20PremiumV2ReplayAuthorization({ workbookPath, workbookHash: "wrong", approvedDestinationKeys: BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS }).reason).toBe("curated-mixed-batch-20-01:WORKBOOK_SHA256_NOT_AUTHORIZED");
  });
  it("rejects a wrong destination scope", () => {
    expect(validateBatch20PremiumV2ReplayAuthorization({ workbookPath, workbookHash: BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256, approvedDestinationKeys: BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS.slice(1) }).reason).toBe("curated-mixed-batch-20-01:DESTINATION_SCOPE_NOT_AUTHORIZED");
  });
  it("emits replacement entries only, preserving draft/catalog identity", () => {
    expect(buildBatch20PremiumV2ReplayManifest("oberstdorf-germany" as never).entries.every((entry) => entry.operation === "REPLACE_MODULE")).toBe(true);
  });
});
