import type { PersistedDestinationReadResult, ResolvedDestinationIdentity } from "../persistence/v31/types";
import { resolvePersistedStateForBatchCandidate } from "./resolve-persisted-state-for-batch-candidate";

type BatchCandidateIdentity = {
  readonly destinationId?: string | null;
  readonly destinationKey?: string | null;
};

type OrchestratePersistedStateForBatchCandidateDeps = {
  readonly loadPersistedDestinationFromRuntime?: typeof import("./persisted-destination-read-runtime").loadPersistedDestinationFromRuntime;
};

type OrchestratePersistedStateForBatchCandidateResult =
  | {
      readonly status: "LOADED";
      readonly candidate: BatchCandidateIdentity;
      readonly identity: ResolvedDestinationIdentity;
      readonly readResult: PersistedDestinationReadResult;
    }
  | {
      readonly status: "IDENTITY_UNRESOLVED";
      readonly reason: "MISSING_DESTINATION_KEY" | "MISSING_DESTINATION_ID";
      readonly candidate: BatchCandidateIdentity;
      readonly identity: null;
      readonly readResult: null;
    };

export async function orchestratePersistedStateForBatchCandidate(
  candidate: BatchCandidateIdentity,
  deps: OrchestratePersistedStateForBatchCandidateDeps = {},
): Promise<OrchestratePersistedStateForBatchCandidateResult> {
  const resolved = await resolvePersistedStateForBatchCandidate(candidate, deps);

  if (resolved.status === "IDENTITY_UNRESOLVED") {
    return {
      status: "IDENTITY_UNRESOLVED",
      reason: resolved.reason,
      candidate: resolved.candidate,
      identity: null,
      readResult: null,
    };
  }

  return {
    status: "LOADED",
    candidate,
    identity: resolved.identity,
    readResult: resolved.result,
  };
}
