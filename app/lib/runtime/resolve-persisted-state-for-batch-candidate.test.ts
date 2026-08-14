import { describe, expect, it, vi } from "vitest";
import type { CanonicalDestinationKey, DestinationId, PersistedDestinationReadResult } from "../persistence/v31/types";
import { resolvePersistedStateForBatchCandidate } from "./resolve-persisted-state-for-batch-candidate";

function createIdentity(destinationKey: string, destinationId: string) {
  return {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
}

function createReadResult(reason: string): PersistedDestinationReadResult {
  return {
    outcome: "FAILED",
    failure: {
      reason,
      destinationIdentity: createIdentity("paris-france", "dest-1"),
      module: null,
    },
  } as PersistedDestinationReadResult;
}

describe("resolvePersistedStateForBatchCandidate", () => {
  it("returns IDENTITY_UNRESOLVED when destinationKey is missing", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1" });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate: { destinationId: "dest-1" },
    });
  });

  it("returns IDENTITY_UNRESOLVED when destinationId is missing", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationKey: "paris-france" });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_ID",
      candidate: { destinationKey: "paris-france" },
    });
  });

  it("returns MISSING_DESTINATION_KEY when both identity values are missing", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationId: null, destinationKey: null });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate: { destinationId: null, destinationKey: null },
    });
  });

  it("treats an empty destinationKey as unresolved", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "" });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate: { destinationId: "dest-1", destinationKey: "" },
    });
  });

  it("treats whitespace-only destinationKey as unresolved", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "   " });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate: { destinationId: "dest-1", destinationKey: "   " },
    });
  });

  it("treats an empty destinationId as unresolved", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "", destinationKey: "paris-france" });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_ID",
      candidate: { destinationId: "", destinationKey: "paris-france" },
    });
  });

  it("treats whitespace-only destinationId as unresolved", async () => {
    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "   ", destinationKey: "paris-france" });

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_ID",
      candidate: { destinationId: "   ", destinationKey: "paris-france" },
    });
  });

  it("does not call the runtime loader for unresolved candidates", async () => {
    const loadPersistedDestinationFromRuntime = vi.fn(async () => ({ outcome: "SUCCESS", bundle: { destinationKey: "paris-france" } } as PersistedDestinationReadResult));

    await resolvePersistedStateForBatchCandidate({ destinationId: "", destinationKey: "   " }, { loadPersistedDestinationFromRuntime });

    expect(loadPersistedDestinationFromRuntime).not.toHaveBeenCalled();
  });

  it("calls the runtime loader exactly once for a valid identity", async () => {
    const readResult = { outcome: "SUCCESS", bundle: { destinationKey: "paris-france" } } as PersistedDestinationReadResult;
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate(
      { destinationId: "dest-1", destinationKey: "paris-france" },
      { loadPersistedDestinationFromRuntime },
    );

    expect(loadPersistedDestinationFromRuntime).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("passes the trimmed identity through to the runtime loader", async () => {
    const readResult = { outcome: "SUCCESS", bundle: { destinationKey: "paris-france" } } as PersistedDestinationReadResult;
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate(
      { destinationId: "  dest-1  ", destinationKey: "  paris-france  " },
      { loadPersistedDestinationFromRuntime },
    );

    expect(loadPersistedDestinationFromRuntime).toHaveBeenCalledWith(createIdentity("paris-france", "dest-1"));
    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("preserves a SUCCESS result unchanged", async () => {
    const readResult = { outcome: "SUCCESS", bundle: { destinationKey: "paris-france" } } as PersistedDestinationReadResult;
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "paris-france" }, { loadPersistedDestinationFromRuntime });

    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("preserves DESTINATION_NOT_FOUND unchanged", async () => {
    const readResult = createReadResult("DESTINATION_NOT_FOUND");
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "paris-france" }, { loadPersistedDestinationFromRuntime });

    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("preserves DB_READ_FAILED unchanged", async () => {
    const readResult = createReadResult("DB_READ_FAILED");
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "paris-france" }, { loadPersistedDestinationFromRuntime });

    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("preserves UNSUPPORTED_LEGACY_STATE unchanged", async () => {
    const readResult = createReadResult("UNSUPPORTED_LEGACY_STATE");
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "paris-france" }, { loadPersistedDestinationFromRuntime });

    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("preserves INCOMPLETE_PERSISTED_STATE unchanged", async () => {
    const readResult = createReadResult("INCOMPLETE_PERSISTED_STATE");
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "paris-france" }, { loadPersistedDestinationFromRuntime });

    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });

  it("preserves MALFORMED_PERSISTED_STATE unchanged", async () => {
    const readResult = createReadResult("MALFORMED_PERSISTED_STATE");
    const loadPersistedDestinationFromRuntime = vi.fn(async () => readResult);

    const result = await resolvePersistedStateForBatchCandidate({ destinationId: "dest-1", destinationKey: "paris-france" }, { loadPersistedDestinationFromRuntime });

    expect(result).toEqual({ status: "LOADED", identity: createIdentity("paris-france", "dest-1"), result: readResult });
  });
});
