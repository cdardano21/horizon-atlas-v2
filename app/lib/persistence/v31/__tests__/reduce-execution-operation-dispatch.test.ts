import { describe, expect, it } from "vitest";
import { reduceExecutionOperationDispatcher } from "../reduce-execution-operation-dispatch";
import type { ChildOperation, ModuleExecutionOperation, ScalarOperation, StoredDestinationState } from "../types";

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
    editorial: buildEditorialState(),
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

describe("execution operation dispatcher", () => {
  it("dispatches a scalar UPDATE operation to the scalar reducer", () => {
    const state = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "old" }) });
    const operation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("APPLIED");
    expect(result.operationFamily).toBe("SCALAR");
    expect(result.operationKind).toBe("UPDATE");
    expect(result.resultingState.editorial.shortDescription).toBe("new");
    expect(result.resultingState).not.toBe(state);
  });

  it("preserves scalar stale failure metadata", () => {
    const state = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "other" }) });
    const operation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("STALE_PRECONDITION");
    expect(result.operationFamily).toBe("SCALAR");
    expect(result.module).toBe("editorial");
    expect(result.fieldPath).toBe("shortDescription");
    expect(result.operationKind).toBe("UPDATE");
    expect(result.resultingState).toBe(state);
  });

  it("dispatches a child CREATE_CHILD operation to the child reducer", () => {
    const state = buildDestinationState();
    const operation: ChildOperation = {
      kind: "CREATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: null,
      incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
    } as ChildOperation;

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("APPLIED");
    expect(result.operationFamily).toBe("CHILD");
    expect(result.operationKind).toBe("CREATE_CHILD");
    expect(result.module).toBe("facts");
    expect(result.stableChildKey).toBe("fact-a");
    expect(result.resultingState.facts).toHaveLength(1);
  });

  it("preserves child failure reasons", () => {
    const state = buildDestinationState();
    const operation: ChildOperation = {
      kind: "UPDATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
      incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "beta", displayLabel: null, sourceName: null },
    } as ChildOperation;

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("MISSING_CHILD");
    expect(result.operationFamily).toBe("CHILD");
    expect(result.module).toBe("facts");
    expect(result.stableChildKey).toBe("fact-a");
    expect(result.resultingState).toBe(state);
  });

  it("preserves duplicate stored-child identity failures at the dispatcher boundary", () => {
    const state = buildDestinationState({
      facts: [
        { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
        { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
      ],
    });
    const operation: ChildOperation = {
      kind: "CREATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: null,
      incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "beta", displayLabel: null, sourceName: null },
    } as ChildOperation;

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("DUPLICATE_STORED_CHILD_IDENTITY");
    expect(result.operationFamily).toBe("CHILD");
    expect(result.module).toBe("facts");
    expect(result.stableChildKey).toBe("fact-a");
    expect(result.operationKind).toBe("CREATE_CHILD");
    expect(result.resultingState).toBe(state);
  });

  it("preserves duplicate child-create failures at the dispatcher boundary", () => {
    const state = buildDestinationState({
      facts: [
        { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
      ],
    });
    const operation: ChildOperation = {
      kind: "CREATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: null,
      incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "beta", displayLabel: null, sourceName: null },
    } as ChildOperation;

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("DUPLICATE_CHILD_CREATE");
    expect(result.operationFamily).toBe("CHILD");
    expect(result.module).toBe("facts");
    expect(result.stableChildKey).toBe("fact-a");
    expect(result.operationKind).toBe("CREATE_CHILD");
    expect(result.resultingState).toBe(state);
  });

  it("preserves child stale-precondition failures at the dispatcher boundary", () => {
    const state = buildDestinationState({
      facts: [
        { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "alpha", displayLabel: null, sourceName: null },
      ],
    });
    const operation: ChildOperation = {
      kind: "UPDATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "gamma", displayLabel: null, sourceName: null },
      incomingChild: { factKey: "fact-a" as StoredDestinationState["facts"][number]["factKey"], factGroup: null, valueText: "beta", displayLabel: null, sourceName: null },
    } as ChildOperation;

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("STALE_PRECONDITION");
    expect(result.operationFamily).toBe("CHILD");
    expect(result.module).toBe("facts");
    expect(result.stableChildKey).toBe("fact-a");
    expect(result.operationKind).toBe("UPDATE_CHILD");
    expect(result.resultingState).toBe(state);
  });

  it("dispatches a module REPLACE_MODULE operation to the module reducer", () => {
    const state = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }] });
    const operation: ModuleExecutionOperation = {
      kind: "REPLACE_MODULE",
      module: "costOfLiving",
      expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }],
      expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }],
    };

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("APPLIED");
    expect(result.operationFamily).toBe("MODULE");
    expect(result.operationKind).toBe("REPLACE_MODULE");
    expect(result.module).toBe("costOfLiving");
    expect(result.resultingState.costOfLiving).toEqual([{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }]);
  });

  it("preserves module stale failure metadata", () => {
    const state = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "300", monthlyHigh: "400", currency: null }] });
    const operation: ModuleExecutionOperation = {
      kind: "REPLACE_MODULE",
      module: "costOfLiving",
      expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }],
      expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }],
    };

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("STALE_PRECONDITION");
    expect(result.operationFamily).toBe("MODULE");
    expect(result.module).toBe("costOfLiving");
    expect(result.operationKind).toBe("REPLACE_MODULE");
    expect(result.resultingState).toBe(state);
  });

  it("propagates NO_OP and ALREADY_APPLIED results", () => {
    const scalarState = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "value" }) });
    const scalarNoOp = reduceExecutionOperationDispatcher(scalarState, {
      kind: "UNCHANGED",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "value",
      incomingValue: "value",
    } as ScalarOperation);
    expect(scalarNoOp.outcome).toBe("NO_OP");
    expect(scalarNoOp.resultingState).toBe(scalarState);

    const moduleState = buildDestinationState({ costOfLiving: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }] });
    const moduleAlreadyApplied = reduceExecutionOperationDispatcher(moduleState, {
      kind: "REPLACE_MODULE",
      module: "costOfLiving",
      expectedBefore: [{ itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null }],
      expectedAfter: [{ itemKey: "row-1", category: null, monthlyLow: "220", monthlyHigh: "300", currency: null }],
    } as ModuleExecutionOperation);
    expect(moduleAlreadyApplied.outcome).toBe("ALREADY_APPLIED");
    expect(moduleAlreadyApplied.resultingState).toBe(moduleState);
  });

  it("does not mutate the input state or operation", () => {
    const state = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "old" }) });
    const operation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };
    const beforeState = structuredClone(state);
    const beforeOperation = structuredClone(operation);

    const result = reduceExecutionOperationDispatcher(state, operation);

    expect(state).toEqual(beforeState);
    expect(operation).toEqual(beforeOperation);
    expect(result.resultingState).not.toBe(state);
    expect(result.resultingState.editorial.shortDescription).toBe("new");
  });

  it("is deterministic for identical inputs", () => {
    const state = buildDestinationState({ editorial: buildEditorialState({ shortDescription: "old" }) });
    const operation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };

    const first = reduceExecutionOperationDispatcher(state, operation);
    const second = reduceExecutionOperationDispatcher(state, operation);

    expect(first).toEqual(second);
  });
});
