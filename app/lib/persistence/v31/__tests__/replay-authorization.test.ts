import { describe, expect, it } from "vitest";
import { buildReplayManifest, validateReplayAuthorization, type ReplayAuthorizationPolicy } from "../replay-authorization";

const policy: ReplayAuthorizationPolicy = {
  workbookSuffix: "data/batch.xlsx",
  workbookHash: "abc",
  destinationKeys: ["one", "two"],
  replacementDestinationKeys: ["one"],
  replacementModules: ["healthcare", "housing"],
  reason: "test-batch",
};

describe("generic replay authorization", () => {
  it("allows exact path, hash, and scope only", () => {
    expect(validateReplayAuthorization({ workbookPath: "data/batch.xlsx", workbookHash: "abc", approvedDestinationKeys: ["one", "two"] }, policy)).toEqual({ authorized: true, reason: null });
  });
  it("blocks wrong hashes, duplicate/out-of-scope keys, and wrong paths", () => {
    expect(validateReplayAuthorization({ workbookPath: "data/batch.xlsx", workbookHash: "wrong", approvedDestinationKeys: ["one", "two"] }, policy).authorized).toBe(false);
    expect(validateReplayAuthorization({ workbookPath: "data/batch.xlsx", workbookHash: "abc", approvedDestinationKeys: ["one", "one"] }, policy).authorized).toBe(false);
    expect(validateReplayAuthorization({ workbookPath: "data/batch.xlsx", workbookHash: "abc", approvedDestinationKeys: ["one", "other"] }, policy).authorized).toBe(false);
    expect(validateReplayAuthorization({ workbookPath: "data/other.xlsx", workbookHash: "abc", approvedDestinationKeys: ["one", "two"] }, policy).authorized).toBe(false);
  });
  it("builds replacement operations only for explicitly authorized destinations and modules", () => {
    expect(buildReplayManifest("one" as never, policy).entries.map((entry) => entry.targetModule)).toEqual(["healthcare", "housing"]);
    expect(buildReplayManifest("two" as never, policy)).toEqual({ entries: [] });
  });
});
