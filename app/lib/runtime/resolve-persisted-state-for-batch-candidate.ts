import type { CanonicalDestinationKey, DestinationId, PersistedDestinationReadResult, ResolvedDestinationIdentity } from "../persistence/v31/types";
import { loadPersistedDestinationFromRuntime } from "./persisted-destination-read-runtime";

type BatchCandidateIdentity = {
  readonly destinationId?: string | null;
  readonly destinationKey?: string | null;
};

type ResolvePersistedStateForBatchCandidateDeps = {
  readonly loadPersistedDestinationFromRuntime?: typeof loadPersistedDestinationFromRuntime;
};

type ResolvePersistedStateForBatchCandidateResult =
  | {
      readonly status: "LOADED";
      readonly identity: ResolvedDestinationIdentity;
      readonly result: PersistedDestinationReadResult;
    }
  | {
      readonly status: "IDENTITY_UNRESOLVED";
      readonly reason: "MISSING_DESTINATION_KEY" | "MISSING_DESTINATION_ID";
      readonly candidate: BatchCandidateIdentity;
    };

function buildResolvedDestinationIdentity(destinationId: string, destinationKey: string): ResolvedDestinationIdentity {
  return {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
}

export async function resolvePersistedStateForBatchCandidate(
  candidate: BatchCandidateIdentity,
  deps: ResolvePersistedStateForBatchCandidateDeps = {},
): Promise<ResolvePersistedStateForBatchCandidateResult> {
  const destinationId = candidate.destinationId?.trim();
  const destinationKey = candidate.destinationKey?.trim();

  if (
!destinationKey) {
    return {
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate,
    };
  }

  if (
!destinationId) {
    return {
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_ID",
      candidate,
    };
  }

  const loadPersistedDestination = deps.loadPersistedDestinationFromRuntime ?? loadPersistedDestinationFromRuntime;
  const identity = buildResolvedDestinationIdentity(destinationId, destinationKey);

  return {
    status: "LOADED",
    identity,
    result: await loadPersistedDestination(identity),
  };
}
