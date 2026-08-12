import { describe, expect, it } from "vitest";
import { executeDestinationPlan } from "../execute-destination-plan";
import { projectComparable } from "../comparable-projection";
import { reduceExecutionOperationDispatcher } from "../reduce-execution-operation-dispatch";
import type { DestinationPlan, ScalarOperation, ChildOperation, ModuleExecutionOperation, StoredDestinationState } from "../types";

function buildEditorialState(overrides: Partial<StoredDestinationState["editorial"]> = {}): StoredDestinationState["editorial"] {
  return {
    shortDescription: null,
    longDescription: null,
    currency: null,
    primaryLanguage: null,
    timeZone: null,
    ...overrides,
  };
}

function buildDestinationState(overrides: Partial<StoredDestinationState> = {}): StoredDestinationState {
  const baseState: StoredDestinationState = {
    identity: {
      destinationKey: "dest-1" as StoredDestinationState["identity"]["destinationKey"],
      slug: "dest-1",
      name: "Destination One",
      city: "Destination City",
      country: "Country",
    },
    editorial: buildEditorialState({ shortDescription: "old" }),
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
    editorial: overrides.editorial ? { ...baseState.editorial, ...overrides.editorial } : baseState.editorial,
    environmentQuality: overrides.environmentQuality === undefined ? baseState.environmentQuality : overrides.environmentQuality,
    dailyLifePracticality: overrides.dailyLifePracticality === undefined ? baseState.dailyLifePracticality : overrides.dailyLifePracticality,
  };
}

function createPlan(overrides: Partial<DestinationPlan> = {}, expectedComparablePostStateOverride?: ReturnType<typeof projectComparable>): DestinationPlan {
  const scalarOperation: ScalarOperation = {
    kind: "UPDATE",
    module: "editorial",
    fieldPath: "shortDescription",
    currentValue: "old",
    incomingValue: "new",
  };

  const childOperation: ChildOperation = {
    kind: "CREATE_CHILD",
    module: "facts",
    stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"],
    currentChild: null,
    incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
  } as ChildOperation;

  const moduleOperation: ModuleExecutionOperation = {
    kind: "REPLACE_MODULE",
    module: "costOfLiving",
    expectedBefore: [],
    expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }],
  };

  const effectiveScalarOperations = overrides.scalarOperations ?? [scalarOperation];
  const effectiveChildOperations = overrides.childOperations ?? [childOperation];
  const effectiveModuleOperations = overrides.moduleExecutionOperations ?? [moduleOperation];
  let expectedState = buildDestinationState();

  for (const operation of effectiveScalarOperations) {
    if (operation.module === "editorial" && operation.fieldPath === "shortDescription") {
      expectedState = {
        ...expectedState,
        editorial: buildEditorialState({ ...expectedState.editorial, shortDescription: operation.currentValue as string | null }),
      };
    }

    const result = reduceExecutionOperationDispatcher(expectedState, operation);
    if (result.outcome === "APPLIED" || result.outcome === "ALREADY_APPLIED" || result.outcome === "NO_OP") {
      expectedState = result.resultingState;
    }
  }

  for (const operation of effectiveChildOperations) {
    const result = reduceExecutionOperationDispatcher(expectedState, operation);
    if (result.outcome === "APPLIED" || result.outcome === "ALREADY_APPLIED" || result.outcome === "NO_OP") {
      expectedState = result.resultingState;
    }
  }

  for (const operation of effectiveModuleOperations) {
    if (operation.module === "costOfLiving") {
      expectedState = {
        ...expectedState,
        costOfLiving: operation.expectedBefore as StoredDestinationState["costOfLiving"],
      };
    }

    const result = reduceExecutionOperationDispatcher(expectedState, operation);
    if (result.outcome === "APPLIED" || result.outcome === "ALREADY_APPLIED" || result.outcome === "NO_OP") {
      expectedState = result.resultingState;
    }
  }

  return {
    destinationIdentity: {
      destinationKey: "dest-1" as StoredDestinationState["identity"]["destinationKey"],
      destinationId: "dest-id-1" as StoredDestinationState["identity"]["destinationKey"],
    },
    action: "UPDATE",
    scalarOperations: [scalarOperation],
    childOperations: [childOperation],
    warnings: [],
    errors: [],
    moduleExecutionOperations: [moduleOperation],
    expectedComparablePostState: expectedComparablePostStateOverride ?? projectComparable(expectedState),
    ...overrides,
  } as DestinationPlan;
}

describe("pure single-destination execution", () => {
  it("returns NO_OP for an unchanged plan without dispatching operations", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "UNCHANGED", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("NO_OP");
    expect(result.resultingState).toBe(startingState);
    expect(result.failure).toBeUndefined();
  });

  it("returns SUCCESS for mixed scalar, child, and module operations and applies all effects", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const expectedComparablePostState = projectComparable(buildDestinationState({
      editorial: buildEditorialState({ shortDescription: "new" }),
      facts: [{ factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null }],
      costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }],
    }));
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [
      {
        kind: "CREATE_CHILD",
        module: "facts",
        stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"],
        currentChild: null,
        incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
      } as ChildOperation,
    ], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] }, expectedComparablePostState);

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(result.resultingState.editorial.shortDescription).toBe("new");
    expect(result.resultingState.facts).toHaveLength(1);
    expect(result.resultingState.costOfLiving).toEqual([{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }]);
    expect(result.resultingState).not.toBe(startingState);
  });

  it("returns FAILED with EXPECTED_STATE_MISMATCH when the final projected state differs from the planner expectation", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const expectedComparablePostState = projectComparable(buildDestinationState({
      editorial: buildEditorialState({ shortDescription: "wrong" }),
      facts: [{ factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null }],
      costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }],
    }));
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] }, expectedComparablePostState);

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("EXPECTED_STATE_MISMATCH");
    expect(result.failure?.operationFamily).toBeUndefined();
    expect(result.failure?.module).toBeUndefined();
    expect(result.failure?.fieldPath).toBeUndefined();
    expect(result.failure?.stableChildKey).toBeUndefined();
    expect(result.trace).toHaveLength(3);
    expect(result.resultingState).toBe(startingState);
  });

  it("returns FAILED with EXPECTED_STATE_MISMATCH for a replay when the projected state differs from the expected comparable post state", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] }, projectComparable(buildDestinationState({ editorial: buildEditorialState({ shortDescription: "wrong" }) })));

    const firstExecution = executeDestinationPlan(plan, startingState);
    const secondExecution = executeDestinationPlan(plan, firstExecution.resultingState);

    expect(firstExecution.outcome).toBe("FAILED");
    expect(firstExecution.failure?.reason).toBe("EXPECTED_STATE_MISMATCH");
    expect(secondExecution.outcome).toBe("FAILED");
    expect(secondExecution.failure?.reason).toBe("EXPECTED_STATE_MISMATCH");
    expect(secondExecution.resultingState).toBe(startingState);
  });

  it("returns NO_OP for a zero-op UPDATE when the expected comparable post state matches the actual final state", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "UPDATE", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] }, projectComparable(startingState));

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("NO_OP");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("returns FAILED with EXPECTED_STATE_MISMATCH for a zero-op UPDATE when the expected comparable post state is mismatched", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "UPDATE", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] }, projectComparable(buildDestinationState({ editorial: buildEditorialState({ shortDescription: "different" }) })));

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("EXPECTED_STATE_MISMATCH");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("preserves a stale reducer failure and skips expected-state verification", () => {
    const startingState = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "other" }) });
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [], moduleExecutionOperations: [] }, projectComparable(buildDestinationState({ editorial: buildEditorialState({ shortDescription: "different" }) })));

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("STALE_PRECONDITION");
    expect(result.trace).toHaveLength(1);
    expect(result.resultingState).toBe(startingState);
  });

  it("keeps ERROR plans on the existing unsupported action path without verifying expected state", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "ERROR", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] }, projectComparable(buildDestinationState({ editorial: buildEditorialState({ shortDescription: "different" }) })));

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("UNSUPPORTED_DESTINATION_ACTION");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("keeps UNCHANGED plans on the existing NO_OP path without verifying expected state", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "UNCHANGED", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] }, projectComparable(buildDestinationState({ editorial: buildEditorialState({ shortDescription: "different" }) })));

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("NO_OP");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("keeps CREATE plans on the existing unsupported action path without verifying expected state", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "CREATE", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] }, projectComparable(buildDestinationState({ editorial: buildEditorialState({ shortDescription: "different" }) })));

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("UNSUPPORTED_DESTINATION_ACTION");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("fails fast on scalar stale precondition and does not dispatch later operations", () => {
    const startingState = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "other" }) });
    const plan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("STALE_PRECONDITION");
    expect(result.resultingState).toBe(startingState);
    expect(result.resultingState.facts).toEqual([]);
    expect(result.resultingState.costOfLiving).toEqual([]);
  });

  it("rolls back to the original state when a child operation fails after a prior successful apply", () => {
    const startingState = buildDestinationState();
    const plan: DestinationPlan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [{ kind: "UPDATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "gamma", displayLabel: null, sourceName: null }, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "beta", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("MISSING_CHILD");
    expect(result.resultingState).toBe(startingState);
    expect(result.resultingState.editorial.shortDescription).toBe("old");
    expect(result.resultingState.costOfLiving).toEqual([]);
  });

  it("rolls back to the original state when a module operation fails after prior successful operations", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan: DestinationPlan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "300", monthlyHigh: "400", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("STALE_PRECONDITION");
    expect(result.resultingState).toBe(startingState);
    expect(result.resultingState.editorial.shortDescription).toBe("old");
    expect(result.resultingState.facts).toEqual([]);
  });

  it("returns FAILED for an ERROR plan without dispatching operations", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "ERROR", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("UNSUPPORTED_DESTINATION_ACTION");
    expect(result.resultingState).toBe(startingState);
  });

  it("returns FAILED for a CREATE action without dispatching operations", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "CREATE", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.failure?.reason).toBe("UNSUPPORTED_DESTINATION_ACTION");
    expect(result.resultingState).toBe(startingState);
  });

  it("returns NO_OP for an UPDATE plan with no effective operations", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("NO_OP");
    expect(result.resultingState).toBe(startingState);
  });

  it("returns NO_OP on replay of a previously successful execution", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] });

    const firstResult = executeDestinationPlan(plan, startingState);
    const secondResult = executeDestinationPlan(plan, firstResult.resultingState);

    expect(firstResult.outcome).toBe("SUCCESS");
    expect(secondResult.outcome).toBe("NO_OP");
    expect(secondResult.resultingState).toBe(firstResult.resultingState);
  });

  it("does not mutate the input state or plan while executing", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] });
    const stateSnapshot = structuredClone(startingState);
    const planSnapshot = structuredClone(plan);

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(startingState).toEqual(stateSnapshot);
    expect(plan).toEqual(planSnapshot);
    expect(plan.scalarOperations[0]).toEqual(planSnapshot.scalarOperations[0]);
    expect(plan.childOperations[0]).toEqual(planSnapshot.childOperations[0]);
    expect(plan.moduleExecutionOperations[0]).toEqual(planSnapshot.moduleExecutionOperations[0]);
  });

  it("returns deterministic results for repeated executions with the same inputs", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] });

    const firstResult = executeDestinationPlan(plan, startingState);
    const secondResult = executeDestinationPlan(plan, startingState);

    expect(firstResult).toEqual(secondResult);
  });

  it("returns an empty trace for an unchanged plan", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "UNCHANGED", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("NO_OP");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("returns an empty trace for an ERROR plan", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "ERROR", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("returns an empty trace for an unsupported CREATE plan", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({ action: "CREATE", scalarOperations: [], childOperations: [], moduleExecutionOperations: [] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.trace).toEqual([]);
    expect(result.resultingState).toBe(startingState);
  });

  it("returns a trace for a zero-op UPDATE plan", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({
      scalarOperations: [{ kind: "UNCHANGED", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "old" }],
      childOperations: [],
      moduleExecutionOperations: [],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("NO_OP");
    expect(result.trace).toHaveLength(1);
    expect(result.trace[0]).toEqual({
      index: 0,
      operationFamily: "SCALAR",
      operationKind: "UNCHANGED",
      module: "editorial",
      fieldPath: "shortDescription",
      outcome: "NO_OP",
    });
    expect(result.resultingState).toBe(startingState);
  });

  it("records a scalar APPLIED trace entry", () => {
    const startingState = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "old" }) });
    const plan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [],
      moduleExecutionOperations: [],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(result.trace).toEqual([{ index: 0, operationFamily: "SCALAR", operationKind: "UPDATE", module: "editorial", fieldPath: "shortDescription", outcome: "APPLIED" }]);
    expect(result.resultingState.editorial.shortDescription).toBe("new");
  });

  it("records a child APPLIED trace entry", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({
      scalarOperations: [],
      childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(result.trace).toEqual([{ index: 0, operationFamily: "CHILD", operationKind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a", outcome: "APPLIED" }]);
    expect(result.resultingState.facts).toHaveLength(1);
  });

  it("records a module APPLIED trace entry", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({
      scalarOperations: [],
      childOperations: [],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(result.trace).toEqual([{ index: 0, operationFamily: "MODULE", operationKind: "REPLACE_MODULE", module: "costOfLiving", outcome: "APPLIED" }]);
    expect(result.resultingState.costOfLiving).toEqual([{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }]);
  });

  it("records mixed trace entries in dispatch order", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(result.trace).toEqual([
      { index: 0, operationFamily: "SCALAR", operationKind: "UPDATE", module: "editorial", fieldPath: "shortDescription", outcome: "APPLIED" },
      { index: 1, operationFamily: "CHILD", operationKind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a", outcome: "APPLIED" },
      { index: 2, operationFamily: "MODULE", operationKind: "REPLACE_MODULE", module: "costOfLiving", outcome: "APPLIED" },
    ]);
  });

  it("records failed operations in trace without dispatching later ones", () => {
    const startingState = buildDestinationState();
    const plan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [{ kind: "UPDATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "gamma", displayLabel: null, sourceName: null }, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "beta", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.trace).toEqual([
      { index: 0, operationFamily: "SCALAR", operationKind: "UPDATE", module: "editorial", fieldPath: "shortDescription", outcome: "APPLIED" },
      { index: 1, operationFamily: "CHILD", operationKind: "UPDATE_CHILD", module: "facts", stableChildKey: "fact-a", outcome: "FAILED", failureReason: "MISSING_CHILD" },
    ]);
    expect(result.resultingState).toBe(startingState);
  });

  it("preserves successful trace entries while a later module failure rolls back the state", () => {
    const startingState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const plan = createPlan({
      scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }],
      childOperations: [{ kind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], currentChild: null, incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null } } as ChildOperation],
      moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "300", monthlyHigh: "400", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }],
    });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("FAILED");
    expect(result.trace).toEqual([
      { index: 0, operationFamily: "SCALAR", operationKind: "UPDATE", module: "editorial", fieldPath: "shortDescription", outcome: "APPLIED" },
      { index: 1, operationFamily: "CHILD", operationKind: "CREATE_CHILD", module: "facts", stableChildKey: "fact-a", outcome: "APPLIED" },
      { index: 2, operationFamily: "MODULE", operationKind: "REPLACE_MODULE", module: "costOfLiving", outcome: "FAILED", failureReason: "STALE_PRECONDITION" },
    ]);
    expect(result.resultingState).toBe(startingState);
  });
});
