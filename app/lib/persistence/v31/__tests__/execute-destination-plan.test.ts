import { describe, expect, it } from "vitest";
import { executeDestinationPlan } from "../execute-destination-plan";
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

function createPlan(overrides: Partial<DestinationPlan> = {}): DestinationPlan {
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
    expectedComparablePostState: { identity: { destinationKey: "dest-1" } },
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
    const plan = createPlan({ scalarOperations: [{ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" }], childOperations: [
      {
        kind: "CREATE_CHILD",
        module: "facts",
        stableChildKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"],
        currentChild: null,
        incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
      } as ChildOperation,
    ], moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "costOfLiving", expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }], expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] }] });

    const result = executeDestinationPlan(plan, startingState);

    expect(result.outcome).toBe("SUCCESS");
    expect(result.resultingState.editorial.shortDescription).toBe("new");
    expect(result.resultingState.facts).toHaveLength(1);
    expect(result.resultingState.costOfLiving).toEqual([{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }]);
    expect(result.resultingState).not.toBe(startingState);
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
});
