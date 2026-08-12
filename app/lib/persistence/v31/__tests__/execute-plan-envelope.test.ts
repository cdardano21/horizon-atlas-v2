import { describe, expect, it } from "vitest";

import { executeDestinationPlan } from "../execute-destination-plan";
import { executePlanEnvelope } from "../execute-plan-envelope";
import { projectComparable } from "../comparable-projection";
import type { ExecutionPolicy, PlanEnvelope, StoredDestinationState, DestinationPlan, ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, ResolvedDestinationIdentity } from "../types";
import type { DestinationExecutionResult } from "../execute-destination-plan";

const DESTINATION_A_KEY = "dest-a" as CanonicalDestinationKey;
const DESTINATION_A_ID = "dest-id-a" as DestinationId;
const DESTINATION_B_KEY = "dest-b" as CanonicalDestinationKey;
const DESTINATION_B_ID = "dest-id-b" as DestinationId;
const DESTINATION_C_KEY = "dest-c" as CanonicalDestinationKey;
const DESTINATION_C_ID = "dest-id-c" as DestinationId;

const LEGAL_EXECUTION_POLICY: ExecutionPolicy = Object.freeze({
  transactionGranularity: "PER_DESTINATION",
  failurePolicy: "CONTINUE_AFTER_FAILURE",
  replayPolicy: "IDEMPOTENT_REPLAY",
  stalePlanPolicy: "STRICT_PRECONDITION_MATCH",
  readBackVerification: true,
});

function createApprovedScope(): ApprovedDestinationScope {
  return Object.freeze([
    Object.freeze({ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }),
    Object.freeze({ destinationKey: DESTINATION_B_KEY, destinationId: DESTINATION_B_ID }),
    Object.freeze({ destinationKey: DESTINATION_C_KEY, destinationId: DESTINATION_C_ID }),
  ]);
}

function createIdentity(destinationKey: CanonicalDestinationKey, destinationId: DestinationId): ResolvedDestinationIdentity {
  return Object.freeze({ destinationKey, destinationId });
}

function buildDestinationState(overrides: Partial<StoredDestinationState> = {}): StoredDestinationState {
  const baseState: StoredDestinationState = {
    identity: {
      destinationKey: DESTINATION_A_KEY,
      slug: "alpha",
      name: "Alpha",
      city: "Alpha City",
      country: "Country A",
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
  };

  return {
    ...baseState,
    ...overrides,
    identity: overrides.identity ? { ...baseState.identity, ...overrides.identity } : baseState.identity,
    editorial: overrides.editorial ? { ...baseState.editorial, ...overrides.editorial } : baseState.editorial,
    environmentQuality: overrides.environmentQuality === undefined ? baseState.environmentQuality : overrides.environmentQuality,
    dailyLifePracticality: overrides.dailyLifePracticality === undefined ? baseState.dailyLifePracticality : overrides.dailyLifePracticality,
  } as StoredDestinationState;
}

function createPlan(destinationKey: CanonicalDestinationKey, destinationId: DestinationId, action: DestinationPlan["action"], expectedState: StoredDestinationState, operationOverrides: Partial<DestinationPlan> = {}, startingState?: StoredDestinationState): DestinationPlan {
  const currentValue = startingState?.editorial.shortDescription ?? null;
  const plan: DestinationPlan = {
    destinationIdentity: createIdentity(destinationKey, destinationId),
    action,
    scalarOperations: Object.freeze([
      {
        kind: "UPDATE",
        module: "editorial",
        fieldPath: "shortDescription",
        currentValue,
        incomingValue: "new",
      },
    ]),
    childOperations: Object.freeze([]),
    warnings: Object.freeze([]),
    errors: Object.freeze([]),
    moduleExecutionOperations: Object.freeze([]),
    expectedComparablePostState: Object.freeze(projectComparable(expectedState)),
    ...operationOverrides,
  };

  return Object.freeze(plan);
}

function createEnvelope(destinationPlans: readonly DestinationPlan[], status: PlanEnvelope["status"] = "APPROVED"): PlanEnvelope {
  return Object.freeze({
    planId: null,
    planHash: null,
    workbookHash: null,
    contractSchemaVersion: "v3.1",
    normalizationVersion: "v1",
    diffPolicyVersion: "v1",
    operationManifestHash: null,
    executionPolicy: LEGAL_EXECUTION_POLICY,
    approvedScope: createApprovedScope(),
    createdAt: null,
    createdBy: null,
    approvedAt: null,
    approvedBy: null,
    expiresAt: null,
    status,
    destinationPlans: Object.freeze([...destinationPlans]),
  });
}

describe("plan envelope orchestration", () => {
  it("returns a failed aggregate result for preflight rejection without fabricating destination execution", () => {
    const envelope = createEnvelope([createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState())], "DRAFT");
    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, buildDestinationState()]]));

    expect(result.outcome).toBe("FAILED");
    expect(result.destinationResults).toEqual([]);
    expect(result.preflightErrors.length).toBeGreaterThan(0);
  });

  it("executes destinations in PlanEnvelope order and routes each plan to its matching starting state", () => {
    const firstState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "alpha-origin" } });
    const secondState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "beta-origin" } });
    const firstPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, firstState);
    const secondPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, secondState);
    const envelope = createEnvelope([firstPlan, secondPlan]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, firstState], [DESTINATION_B_KEY, secondState]]));

    expect(result.outcome).toBe("SUCCESS");
    expect(result.destinationResults).toHaveLength(2);
    expect(result.destinationResults[0]?.destinationIdentity.destinationKey).toBe(DESTINATION_A_KEY);
    expect(result.destinationResults[1]?.destinationIdentity.destinationKey).toBe(DESTINATION_B_KEY);
    expect(result.destinationResults[0]?.result?.resultingState.editorial.shortDescription).toBe("new");
    expect(result.destinationResults[1]?.result?.resultingState.editorial.shortDescription).toBe("new");
    expect(result.destinationResults[0]?.result?.resultingState.identity.destinationKey).toBe(DESTINATION_A_KEY);
    expect(result.destinationResults[1]?.result?.resultingState.identity.destinationKey).toBe(DESTINATION_B_KEY);
  });

  it("classifies an all-success envelope as SUCCESS", () => {
    const firstState = buildDestinationState();
    const secondState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const firstPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, firstState);
    const secondPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, secondState);
    const envelope = createEnvelope([firstPlan, secondPlan]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, firstState], [DESTINATION_B_KEY, secondState]]));

    expect(result.outcome).toBe("SUCCESS");
    expect(result.destinationResults.every((entry) => entry.outcome === "SUCCESS")).toBe(true);
  });

  it("classifies success plus no-op as SUCCESS", () => {
    const successState = buildDestinationState();
    const noOpState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const successPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, successState);
    const noOpPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UNCHANGED", noOpState, { scalarOperations: Object.freeze([]), expectedComparablePostState: Object.freeze(projectComparable(noOpState)) });
    const envelope = createEnvelope([successPlan, noOpPlan]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, successState], [DESTINATION_B_KEY, noOpState]]));

    expect(result.outcome).toBe("SUCCESS");
    expect(result.destinationResults[0]?.outcome).toBe("SUCCESS");
    expect(result.destinationResults[1]?.outcome).toBe("NO_OP");
  });

  it("classifies an all-no-op envelope as NO_OP", () => {
    const firstState = buildDestinationState();
    const secondState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const firstPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UNCHANGED", firstState, { scalarOperations: Object.freeze([]), expectedComparablePostState: Object.freeze(projectComparable(firstState)) });
    const secondPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UNCHANGED", secondState, { scalarOperations: Object.freeze([]), expectedComparablePostState: Object.freeze(projectComparable(secondState)) });
    const envelope = createEnvelope([firstPlan, secondPlan]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, firstState], [DESTINATION_B_KEY, secondState]]));

    expect(result.outcome).toBe("NO_OP");
    expect(result.destinationResults.every((entry) => entry.outcome === "NO_OP")).toBe(true);
  });

  it("returns MISSING_STARTING_STATE for missing state and continues with later destinations", () => {
    const laterState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const missingPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }));
    const laterPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, laterState);
    const envelope = createEnvelope([missingPlan, laterPlan]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_B_KEY, laterState]]));

    expect(result.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.failureReason).toBe("MISSING_STARTING_STATE");
    expect(result.destinationResults[0]?.result).toBeUndefined();
    expect(result.destinationResults[1]?.outcome).toBe("SUCCESS");
  });

  it("continues after a destination-level failure and preserves later success", () => {
    const successState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const laterState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_C_KEY, slug: "gamma" } });
    const failedPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), { scalarOperations: Object.freeze([{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }]) }, buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "other" } }));
    const successPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, successState);
    const laterPlan = createPlan(DESTINATION_C_KEY, DESTINATION_C_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_C_KEY, slug: "gamma" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, laterState);
    const envelope = createEnvelope([failedPlan, successPlan, laterPlan]);
    const startingStates = new Map([[DESTINATION_A_KEY, buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "other" } })], [DESTINATION_B_KEY, successState], [DESTINATION_C_KEY, laterState]]);

    const result = executePlanEnvelope(envelope, startingStates);

    expect(result.outcome).toBe("FAILED");
    expect(result.destinationResults).toHaveLength(3);
    expect(result.destinationResults[0]?.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.failureReason).toBe("STALE_PRECONDITION");
    expect(result.destinationResults[1]?.outcome).toBe("SUCCESS");
    expect(result.destinationResults[2]?.outcome).toBe("SUCCESS");
  });

  it("preserves EXPECTED_STATE_MISMATCH from executeDestinationPlan", () => {
    const plan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "wrong" } }), undefined, buildDestinationState());
    const envelope = createEnvelope([plan]);
    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, buildDestinationState()]]));

    expect(result.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.failureReason).toBe("EXPECTED_STATE_MISMATCH");
    expect(result.destinationResults[0]?.result?.failure?.reason).toBe("EXPECTED_STATE_MISMATCH");
  });

  it("preserves STALE_PRECONDITION from executeDestinationPlan", () => {
    const plan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }));
    const envelope = createEnvelope([plan]);
    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "other" } })]]));

    expect(result.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.failureReason).toBe("STALE_PRECONDITION");
    expect(result.destinationResults[0]?.result?.failure?.reason).toBe("STALE_PRECONDITION");
  });

  it("executes UNCHANGED plans through the single-destination executor", () => {
    const startingState = buildDestinationState();
    const plan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UNCHANGED", startingState, { scalarOperations: Object.freeze([]), expectedComparablePostState: Object.freeze(projectComparable(startingState)) });
    const envelope = createEnvelope([plan]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, startingState]]));

    expect(result.outcome).toBe("NO_OP");
    expect(result.destinationResults[0]?.outcome).toBe("NO_OP");
    expect(result.destinationResults[0]?.result?.outcome).toBe("NO_OP");
  });

  it("returns MISSING_STARTING_STATE for UNCHANGED plans without a state", () => {
    const plan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UNCHANGED", buildDestinationState(), { scalarOperations: Object.freeze([]), expectedComparablePostState: Object.freeze(projectComparable(buildDestinationState())) });
    const envelope = createEnvelope([plan]);

    const result = executePlanEnvelope(envelope, new Map());

    expect(result.outcome).toBe("FAILED");
    expect(result.destinationResults[0]?.failureReason).toBe("MISSING_STARTING_STATE");
    expect(result.destinationResults[0]?.result).toBeUndefined();
  });

  it("returns NO_OP for an empty approved envelope", () => {
    const envelope = createEnvelope([]);

    const result = executePlanEnvelope(envelope, new Map());

    expect(result.outcome).toBe("NO_OP");
    expect(result.destinationResults).toEqual([]);
  });

  it("supports replay by re-executing against prior resulting states", () => {
    const firstState = buildDestinationState();
    const secondState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const firstPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, firstState);
    const secondPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, secondState);
    const envelope = createEnvelope([firstPlan, secondPlan]);

    const firstResult = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, firstState], [DESTINATION_B_KEY, secondState]]));
    const replayStates = new Map([[DESTINATION_A_KEY, firstResult.destinationResults[0]?.result?.resultingState as StoredDestinationState], [DESTINATION_B_KEY, firstResult.destinationResults[1]?.result?.resultingState as StoredDestinationState]]);
    const replayResult = executePlanEnvelope(envelope, replayStates);

    expect(firstResult.outcome).toBe("SUCCESS");
    expect(replayResult.outcome).toBe("NO_OP");
  });

  it("does not mutate the envelope, destination plans, or starting-state map", () => {
    const startingState = buildDestinationState();
    const plan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, startingState);
    const envelope = createEnvelope([plan]);
    const beforeEnvelope = structuredClone(envelope);
    const beforeMap = new Map([[DESTINATION_A_KEY, startingState]]);

    executePlanEnvelope(envelope, beforeMap);

    expect(envelope).toEqual(beforeEnvelope);
    expect(beforeMap.get(DESTINATION_A_KEY)).toEqual(startingState);
  });

  it("produces the same result on repeated execution with equivalent input", () => {
    const firstState = buildDestinationState();
    const secondState = buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" } });
    const firstPlan = createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, firstState);
    const secondPlan = createPlan(DESTINATION_B_KEY, DESTINATION_B_ID, "UPDATE", buildDestinationState({ identity: { ...buildDestinationState().identity, destinationKey: DESTINATION_B_KEY, slug: "beta" }, editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }), undefined, secondState);
    const envelope = createEnvelope([firstPlan, secondPlan]);

    const firstResult = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, firstState], [DESTINATION_B_KEY, secondState]]));
    const secondResult = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, firstState], [DESTINATION_B_KEY, secondState]]));

    expect(firstResult).toEqual(secondResult);
  });

  it("does not add an envelope-level trace or final state map", () => {
    const envelope = createEnvelope([createPlan(DESTINATION_A_KEY, DESTINATION_A_ID, "UPDATE", buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } }))]);

    const result = executePlanEnvelope(envelope, new Map([[DESTINATION_A_KEY, buildDestinationState()]]));

    expect("trace" in result).toBe(false);
    expect("resultingStates" in result).toBe(false);
  });
});
