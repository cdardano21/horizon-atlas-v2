import type { DeterministicV31CanonicalDestination } from "../workbook-v31-deterministic-core";
import type { PersistedReadFailureReason } from "../persistence/v31/errors";
import type { OperationManifestInterpretationResult } from "../persistence/v31/manifest";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../persistence/v31/materialize-stored-destination-state";
import { buildDestinationPlan } from "../persistence/v31/plan-destination";
import type { ApprovedDestinationScope, DiffPolicy, PersistedDestinationReadFailure, PersistedDestinationReadResult, ResolvedDestinationIdentity, StoredDestinationState } from "../persistence/v31/types";
import { orchestratePersistedStateForBatchCandidate } from "./orchestrate-persisted-state-for-batch-candidate";

type BatchCandidateIdentity = {
  readonly destinationId?: string | null;
  readonly destinationKey?: string | null;
};

type OrchestrateDestinationPlanForBatchCandidateDeps = {
  readonly canonicalDestination: DeterministicV31CanonicalDestination;
  readonly manifestInterpretation: OperationManifestInterpretationResult;
  readonly diffPolicy: DiffPolicy;
  readonly approvedScope: ApprovedDestinationScope;
  readonly orchestratePersistedStateForBatchCandidate?: typeof orchestratePersistedStateForBatchCandidate;
  readonly materializeStoredDestinationStateFromNormalizedPersistedBundle?: typeof materializeStoredDestinationStateFromNormalizedPersistedBundle;
  readonly buildDestinationPlan?: typeof buildDestinationPlan;
};

type NonDestinationNotFoundFailureReason = Exclude<PersistedReadFailureReason, "DESTINATION_NOT_FOUND">;

type NonDestinationNotFoundFailure = PersistedDestinationReadFailure & {
  readonly reason: NonDestinationNotFoundFailureReason;
};

type OrchestrateDestinationPlanForBatchCandidateResult =
  | {
      readonly status: "PLANNED";
      readonly candidate: BatchCandidateIdentity;
      readonly identity: ResolvedDestinationIdentity;
      readonly storedDestinationState: StoredDestinationState;
      readonly plan: ReturnType<typeof buildDestinationPlan>;
    }
  | {
      readonly status: "IDENTITY_UNRESOLVED";
      readonly reason: "MISSING_DESTINATION_KEY" | "MISSING_DESTINATION_ID";
      readonly candidate: BatchCandidateIdentity;
      readonly identity: null;
      readonly storedDestinationState: null;
      readonly plan: null;
    }
  | {
      readonly status: "DESTINATION_NOT_FOUND";
      readonly reason: "DESTINATION_NOT_FOUND";
      readonly candidate: BatchCandidateIdentity;
      readonly identity: ResolvedDestinationIdentity;
      readonly readResult: PersistedDestinationReadResult;
      readonly failure: PersistedDestinationReadFailure;
      readonly storedDestinationState: null;
      readonly plan: null;
    }
  | {
      readonly status: "PERSISTENCE_READ_FAILED";
      readonly reason: NonDestinationNotFoundFailureReason;
      readonly candidate: BatchCandidateIdentity;
      readonly identity: ResolvedDestinationIdentity;
      readonly readResult: PersistedDestinationReadResult;
      readonly failure: NonDestinationNotFoundFailure;
      readonly storedDestinationState: null;
      readonly plan: null;
    };

function isDestinationNotFoundFailure(failure: PersistedDestinationReadFailure): failure is PersistedDestinationReadFailure & { readonly reason: "DESTINATION_NOT_FOUND" } {
  return failure.reason === "DESTINATION_NOT_FOUND";
}

function isNonDestinationNotFoundFailure(failure: PersistedDestinationReadFailure): failure is NonDestinationNotFoundFailure {
  return !isDestinationNotFoundFailure(failure);
}

export async function orchestrateDestinationPlanForBatchCandidate(
  candidate: BatchCandidateIdentity,
  deps: OrchestrateDestinationPlanForBatchCandidateDeps,
): Promise<OrchestrateDestinationPlanForBatchCandidateResult> {
  const orchestratePersistedState = deps.orchestratePersistedStateForBatchCandidate ?? orchestratePersistedStateForBatchCandidate;
  const materializeStoredDestinationState = deps.materializeStoredDestinationStateFromNormalizedPersistedBundle ?? materializeStoredDestinationStateFromNormalizedPersistedBundle;
  const buildPlan = deps.buildDestinationPlan ?? buildDestinationPlan;

  const resolvedPersistence = await orchestratePersistedState(candidate);

  if (resolvedPersistence.status === "IDENTITY_UNRESOLVED") {
    return {
      status: "IDENTITY_UNRESOLVED",
      reason: resolvedPersistence.reason,
      candidate,
      identity: null,
      storedDestinationState: null,
      plan: null,
    };
  }

  if (resolvedPersistence.readResult.outcome === "FAILED") {
    const failure = resolvedPersistence.readResult.failure;

    if (isDestinationNotFoundFailure(failure)) {
      return {
        status: "DESTINATION_NOT_FOUND",
        reason: failure.reason,
        candidate,
        identity: resolvedPersistence.identity,
        readResult: resolvedPersistence.readResult,
        failure,
        storedDestinationState: null,
        plan: null,
      };
    }

    if (isNonDestinationNotFoundFailure(failure)) {
      return {
        status: "PERSISTENCE_READ_FAILED",
        reason: failure.reason,
        candidate,
        identity: resolvedPersistence.identity,
        readResult: resolvedPersistence.readResult,
        failure,
        storedDestinationState: null,
        plan: null,
      };
    }

    return {
      status: "DESTINATION_NOT_FOUND",
      reason: "DESTINATION_NOT_FOUND",
      candidate,
      identity: resolvedPersistence.identity,
      readResult: resolvedPersistence.readResult,
      failure,
      storedDestinationState: null,
      plan: null,
    };
  }

  const storedDestinationState = materializeStoredDestinationState(resolvedPersistence.readResult.bundle);

  const plan = buildPlan({
    resolvedDestinationIdentity: resolvedPersistence.identity,
    canonicalDestination: deps.canonicalDestination,
    storedDestinationState,
    manifestInterpretation: deps.manifestInterpretation,
    diffPolicy: deps.diffPolicy,
    approvedScope: deps.approvedScope,
  });

  return {
    status: "PLANNED",
    candidate,
    identity: resolvedPersistence.identity,
    storedDestinationState,
    plan,
  };
}
