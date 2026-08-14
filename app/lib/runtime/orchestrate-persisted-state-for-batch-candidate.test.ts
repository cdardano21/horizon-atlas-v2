import { describe, expect, it, vi } from "vitest";
import type { CanonicalDestinationKey, DestinationId, PersistedDestinationReadResult } from "../persistence/v31/types";
import { orchestratePersistedStateForBatchCandidate } from "./orchestrate-persisted-state-for-batch-candidate";

function createIdentity(destinationKey: string, destinationId: string) {
  return {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
}

describe("orchestratePersistedStateForBatchCandidate", () => {
  it("returns unresolved context without loading runtime state", async () => {
    const loadPersistedDestinationFromRuntime = vi.fn(async () => ({ outcome: "SUCCESS", bundle: { destinationKey: "paris-france" } } as PersistedDestinationReadResult));

    const result = await orchestratePersistedStateForBatchCandidate(
      { destinationId: "dest-1", destinationKey: "   " },
      { loadPersistedDestinationFromRuntime },
    );

    expect(loadPersistedDestinationFromRuntime).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate: { destinationId: "dest-1", destinationKey: "   " },
      identity: null,
      readResult: null,
    });
  });

  it("returns loaded context with the resolved identity and read result", async () => {
    const readResult = { outcome: "SUCCESS", bundle: { destinationKey: "paris-france" } } as PersistedDestinationReadResult;
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await orchestratePersistedStateForBatchCandidate(
      { destinationId: "dest-1", destinationKey: "paris-france" },
      { loadPersistedDestinationFromRuntime },
    );

    expect(loadPersistedDestinationFromRuntime).toHaveBeenCalledWith(createIdentity("paris-france", "dest-1"));
    expect(result).toEqual({
      status: "LOADED",
      candidate: { destinationId: "dest-1", destinationKey: "paris-france" },
      identity: createIdentity("paris-france", "dest-1"),
      readResult,
    });
  });
});
