import { describe, expect, it, vi } from "vitest";

import type { DeterministicV31CanonicalDestination } from "../workbook-v31-deterministic-core";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle, type NormalizedPersistedDestinationBundle } from "../persistence/v31/materialize-stored-destination-state";
import type { OperationManifestInterpretationResult } from "../persistence/v31/manifest";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, DestinationPlan, DiffPolicy, PersistedDestinationReadFailure, PersistedDestinationReadResult, ResolvedDestinationIdentity, StoredDestinationState } from "../persistence/v31/types";
import { orchestrateDestinationPlanForBatchCandidate } from "./orchestrate-destination-plan-for-batch-candidate";

type NonDestinationNotFoundFailure = PersistedDestinationReadFailure & {
  readonly reason: Exclude<PersistedDestinationReadFailure["reason"], "DESTINATION_NOT_FOUND">;
};

function createIdentity(destinationKey: string, destinationId: string): ResolvedDestinationIdentity {
  return {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
}

function createCanonicalDestination(): DeterministicV31CanonicalDestination {
  return {
    identity: {
      destinationKey: "paris-france" as CanonicalDestinationKey,
      slug: "paris",
      name: "Paris",
      city: "Paris",
      country: "France",
    },
    editorial: {
      shortDescription: "Paris is a vibrant destination.",
      longDescription: "A compact yet dynamic city with excellent culture and transit.",
      currency: "EUR",
      primaryLanguage: "French",
      timeZone: "Europe/Paris",
    },
    facts: [],
    scores: [],
    neighborhoods: [],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [],
    climateMonthly: [],
    housing: [],
    propertyResources: [],
    healthcare: [],
    visaResidency: [],
    taxesFinance: [],
    lgbtqInclusivity: [],
    safetyRisks: [],
    transportation: [],
    remoteWork: [],
    languageIntegration: [],
    pets: [],
    familyEducation: [],
    communitySocial: [],
    accessibility: [],
    bureaucracySetup: [],
    workBusiness: [],
    retirementAging: [],
    lifestyleLaws: [],
    realityCheck: [],
    moveChecklist: [],
    environmentQuality: null,
    dailyLifePracticality: null,
    eventsSeasonality: [],
    sources: [],
  };
}

function createManifestInterpretation(): OperationManifestInterpretationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
    interpretedManifest: { entries: [] },
  } as OperationManifestInterpretationResult;
}

function createDiffPolicy(): DiffPolicy {
  return {
    updateMode: "MERGE_NONBLANK",
    normalizationVersion: "v1",
    diffPolicyVersion: "v1",
    arrayOrderRule: "stable-key-order",
  };
}

function createApprovedScope(): ApprovedDestinationScope {
  return [{ destinationKey: "paris-france" as CanonicalDestinationKey, destinationId: "dest-1" as DestinationId }];
}

function createFailure(reason: PersistedDestinationReadFailure["reason"], identity: ResolvedDestinationIdentity): PersistedDestinationReadFailure {
  return {
    reason,
    destinationIdentity: identity,
  };
}

function createFailedReadResult(failure: PersistedDestinationReadFailure): PersistedDestinationReadResult {
  return {
    outcome: "FAILED",
    failure,
  };
}

function createNormalizedPersistedDestinationBundle(overrides: Partial<NormalizedPersistedDestinationBundle> = {}): NormalizedPersistedDestinationBundle {
  return {
    destinationKey: "paris-france" as CanonicalDestinationKey,
    identity: {
      slug: null,
      name: null,
      city: null,
      country: null,
    },
    editorial: {
      shortDescription: null,
      longDescription: null,
      currency: null,
      primaryLanguage: null,
      timeZone: null,
    },
    facts: [],
    scores: [],
    neighborhoods: [],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [],
    climateMonthly: [],
    housing: [],
    propertyResources: [],
    healthcare: [],
    visaResidency: [],
    taxesFinance: [],
    lgbtqInclusivity: [],
    safetyRisks: [],
    transportation: [],
    remoteWork: [],
    languageIntegration: [],
    pets: [],
    familyEducation: [],
    communitySocial: [],
    accessibility: [],
    bureaucracySetup: [],
    workBusiness: [],
    retirementAging: [],
    lifestyleLaws: [],
    realityCheck: [],
    moveChecklist: [],
    environmentQuality: null,
    dailyLifePracticality: null,
    eventsSeasonality: [],
    sources: [],
    ...overrides,
  };
}

function createSuccessfulReadResult(bundle: NormalizedPersistedDestinationBundle): PersistedDestinationReadResult {
  return {
    outcome: "SUCCESS",
    bundle,
  };
}

function createStoredDestinationState(): StoredDestinationState {
  return materializeStoredDestinationStateFromNormalizedPersistedBundle(createNormalizedPersistedDestinationBundle());
}

function isDestinationNotFoundFailure(failure: PersistedDestinationReadFailure): failure is PersistedDestinationReadFailure & { readonly reason: "DESTINATION_NOT_FOUND" } {
  return failure.reason === "DESTINATION_NOT_FOUND";
}

function assertNonDestinationNotFoundFailure(failure: PersistedDestinationReadFailure): asserts failure is NonDestinationNotFoundFailure {
  if (isDestinationNotFoundFailure(failure)) {
    throw new Error("Expected a non-destination-not-found failure");
  }
}

function createDestinationPlan(identity: ResolvedDestinationIdentity): DestinationPlan {
  return {
    destinationIdentity: identity,
    action: "UPDATE",
    scalarOperations: [],
    childOperations: [],
    warnings: [],
    errors: [],
    moduleExecutionOperations: [],
    expectedComparablePostState: {},
  };
}

describe("orchestrateDestinationPlanForBatchCandidate", () => {
  it("returns IDENTITY_UNRESOLVED without materializing or planning", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "   " };
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "IDENTITY_UNRESOLVED" as const,
      reason: "MISSING_DESTINATION_KEY" as const,
      candidate,
      identity: null,
      readResult: null,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn();
    const buildDestinationPlan = vi.fn();

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    expect(result).toEqual({
      status: "IDENTITY_UNRESOLVED",
      reason: "MISSING_DESTINATION_KEY",
      candidate,
      identity: null,
      storedDestinationState: null,
      plan: null,
    });
    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).not.toHaveBeenCalled();
    expect(buildDestinationPlan).not.toHaveBeenCalled();
  });

  it("returns DESTINATION_NOT_FOUND for a missing persisted destination", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "paris-france" };
    const identity = createIdentity("paris-france", "dest-1");
    const failure = createFailure("DESTINATION_NOT_FOUND", identity);
    const readResult = createFailedReadResult(failure);
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "LOADED" as const,
      candidate,
      identity,
      readResult,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn();
    const buildDestinationPlan = vi.fn();

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    expect(result).toEqual({
      status: "DESTINATION_NOT_FOUND",
      reason: "DESTINATION_NOT_FOUND",
      candidate,
      identity,
      readResult,
      failure,
      storedDestinationState: null,
      plan: null,
    });
    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).not.toHaveBeenCalled();
    expect(buildDestinationPlan).not.toHaveBeenCalled();
  });

  it("returns PERSISTENCE_READ_FAILED for DB_READ_FAILED persisted-state failures", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "paris-france" };
    const identity = createIdentity("paris-france", "dest-1");
    const failure = createFailure("DB_READ_FAILED", identity);
    const readResult = createFailedReadResult(failure);
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "LOADED" as const,
      candidate,
      identity,
      readResult,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn();
    const buildDestinationPlan = vi.fn();

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    if (result.status !== "PERSISTENCE_READ_FAILED") {
      throw new Error("Expected PERSISTENCE_READ_FAILED");
    }

    assertNonDestinationNotFoundFailure(result.failure);
    expect(result).toEqual({
      status: "PERSISTENCE_READ_FAILED",
      reason: "DB_READ_FAILED",
      candidate,
      identity,
      readResult,
      failure: result.failure,
      storedDestinationState: null,
      plan: null,
    });
    expect(result.reason).toBe("DB_READ_FAILED");
    expect(result.failure.reason).toBe("DB_READ_FAILED");
    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).not.toHaveBeenCalled();
    expect(buildDestinationPlan).not.toHaveBeenCalled();
  });

  it("returns PERSISTENCE_READ_FAILED for unsupported legacy persisted-state failures", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "paris-france" };
    const identity = createIdentity("paris-france", "dest-1");
    const failure = createFailure("UNSUPPORTED_LEGACY_STATE", identity);
    const readResult = createFailedReadResult(failure);
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "LOADED" as const,
      candidate,
      identity,
      readResult,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn();
    const buildDestinationPlan = vi.fn();

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    if (result.status !== "PERSISTENCE_READ_FAILED") {
      throw new Error("Expected PERSISTENCE_READ_FAILED");
    }

    expect(result.reason).toBe("UNSUPPORTED_LEGACY_STATE");
    expect(result.failure.reason).toBe("UNSUPPORTED_LEGACY_STATE");
    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).not.toHaveBeenCalled();
    expect(buildDestinationPlan).not.toHaveBeenCalled();
  });

  it("returns PERSISTENCE_READ_FAILED for incomplete persisted-state failures", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "paris-france" };
    const identity = createIdentity("paris-france", "dest-1");
    const failure = createFailure("INCOMPLETE_PERSISTED_STATE", identity);
    const readResult = createFailedReadResult(failure);
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "LOADED" as const,
      candidate,
      identity,
      readResult,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn();
    const buildDestinationPlan = vi.fn();

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    if (result.status !== "PERSISTENCE_READ_FAILED") {
      throw new Error("Expected PERSISTENCE_READ_FAILED");
    }

    expect(result.reason).toBe("INCOMPLETE_PERSISTED_STATE");
    expect(result.failure.reason).toBe("INCOMPLETE_PERSISTED_STATE");
    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).not.toHaveBeenCalled();
    expect(buildDestinationPlan).not.toHaveBeenCalled();
  });

  it("returns PERSISTENCE_READ_FAILED for malformed persisted-state failures", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "paris-france" };
    const identity = createIdentity("paris-france", "dest-1");
    const failure = createFailure("MALFORMED_PERSISTED_STATE", identity);
    const readResult = createFailedReadResult(failure);
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "LOADED" as const,
      candidate,
      identity,
      readResult,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn();
    const buildDestinationPlan = vi.fn();

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    if (result.status !== "PERSISTENCE_READ_FAILED") {
      throw new Error("Expected PERSISTENCE_READ_FAILED");
    }

    expect(result.reason).toBe("MALFORMED_PERSISTED_STATE");
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).not.toHaveBeenCalled();
    expect(buildDestinationPlan).not.toHaveBeenCalled();
  });

  it("materializes persisted state and builds a destination plan for a successful read", async () => {
    const candidate = { destinationId: "dest-1", destinationKey: "paris-france" };
    const identity = createIdentity("paris-france", "dest-1");
    const bundle = createNormalizedPersistedDestinationBundle();
    const storedDestinationState = createStoredDestinationState();
    const plan = createDestinationPlan(identity);
    const readResult = createSuccessfulReadResult(bundle);
    const orchestratePersistedStateForBatchCandidate = vi.fn(async () => ({
      status: "LOADED" as const,
      candidate,
      identity,
      readResult,
    }));
    const materializeStoredDestinationStateFromNormalizedPersistedBundle = vi.fn(() => storedDestinationState);
    const buildDestinationPlan = vi.fn(() => plan);

    const result = await orchestrateDestinationPlanForBatchCandidate(
      candidate,
      {
        canonicalDestination: createCanonicalDestination(),
        manifestInterpretation: createManifestInterpretation(),
        diffPolicy: createDiffPolicy(),
        approvedScope: createApprovedScope(),
        orchestratePersistedStateForBatchCandidate,
        materializeStoredDestinationStateFromNormalizedPersistedBundle,
        buildDestinationPlan,
      },
    );

    expect(materializeStoredDestinationStateFromNormalizedPersistedBundle).toHaveBeenCalledWith(bundle);
    expect(buildDestinationPlan).toHaveBeenCalledWith({
      resolvedDestinationIdentity: identity,
      canonicalDestination: expect.anything(),
      storedDestinationState,
      manifestInterpretation: expect.anything(),
      diffPolicy: expect.anything(),
      approvedScope: expect.anything(),
    });
    expect(result).toEqual({
      status: "PLANNED",
      candidate,
      identity,
      storedDestinationState,
      plan,
    });
  });
});
