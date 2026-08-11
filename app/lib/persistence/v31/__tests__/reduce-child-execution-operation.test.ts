import { describe, expect, it } from "vitest";
import { reduceChildExecutionOperation } from "../reduce-child-execution-operation";
import type { ChildOperation, KeyedChildModuleKey, StoredDestinationState } from "../types";

function buildDestinationState(overrides: Partial<StoredDestinationState> = {}): StoredDestinationState {
  const baseState: StoredDestinationState = {
    identity: {
      destinationKey: "dest-1" as StoredDestinationState["identity"]["destinationKey"],
      slug: "dest-1",
      name: "Destination One",
      city: "Destination City",
      country: "Country",
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
    editorial: overrides.editorial ? { ...baseState.editorial, ...overrides.editorial } : baseState.editorial,
    environmentQuality: overrides.environmentQuality === undefined ? baseState.environmentQuality : overrides.environmentQuality,
    dailyLifePracticality: overrides.dailyLifePracticality === undefined ? baseState.dailyLifePracticality : overrides.dailyLifePracticality,
  };
}

function createChildForModule(module: KeyedChildModuleKey, stableKey: string, valueText: string): any {
  switch (module) {
    case "facts":
      return { factKey: stableKey, factGroup: null, valueText, displayLabel: null, sourceName: null };
    case "scores":
      return { scoreKey: stableKey, scoreValue: valueText, scoreLabel: null, methodologyVersion: null };
    case "neighborhoods":
      return { neighborhoodKey: stableKey, name: valueText, summary: null, areaType: null };
    case "places":
      return { placeKey: stableKey, category: null, name: valueText, description: null };
    case "resources":
      return { resourceKey: stableKey, category: null, name: valueText, url: null };
    case "media":
      return { mediaKey: stableKey, kind: null, url: null, caption: valueText, altText: null };
    case "propertyResources":
      return { itemKey: stableKey, category: null, name: valueText, url: null };
    case "moveChecklist":
      return { checklistKey: stableKey, summary: valueText, checklistNotes: null };
    case "eventsSeasonality":
      return { eventSeasonalityKey: stableKey, summary: valueText, seasonalityNotes: null };
    case "sources":
      return { sourceKey: stableKey, name: valueText, url: null, type: null };
  }
}

function getModuleChildren(state: StoredDestinationState, module: KeyedChildModuleKey): readonly any[] {
  switch (module) {
    case "facts":
      return state.facts;
    case "scores":
      return state.scores;
    case "neighborhoods":
      return state.neighborhoods;
    case "places":
      return state.places;
    case "resources":
      return state.resources;
    case "media":
      return state.media;
    case "propertyResources":
      return state.propertyResources;
    case "moveChecklist":
      return state.moveChecklist;
    case "eventsSeasonality":
      return state.eventsSeasonality;
    case "sources":
      return state.sources;
  }
}

function getStableKey(module: KeyedChildModuleKey, child: any): string {
  switch (module) {
    case "facts":
      return child.factKey;
    case "scores":
      return child.scoreKey;
    case "neighborhoods":
      return child.neighborhoodKey;
    case "places":
      return child.placeKey;
    case "resources":
      return child.resourceKey;
    case "media":
      return child.mediaKey;
    case "propertyResources":
      return child.itemKey;
    case "moveChecklist":
      return child.checklistKey;
    case "eventsSeasonality":
      return child.eventSeasonalityKey;
    case "sources":
      return child.sourceKey;
  }
}

function buildChildOperation(module: KeyedChildModuleKey, kind: ChildOperation["kind"], stableKey: string, currentChild: any, incomingChild: any): ChildOperation {
  return {
    kind,
    module,
    stableChildKey: stableKey as any,
    currentChild,
    incomingChild,
  } as ChildOperation;
}

describe("child execution reducer", () => {
  it.each([
    ["facts", "facts"],
    ["scores", "scores"],
    ["neighborhoods", "neighborhoods"],
    ["places", "places"],
    ["resources", "resources"],
    ["media", "media"],
    ["propertyResources", "propertyResources"],
    ["moveChecklist", "moveChecklist"],
    ["eventsSeasonality", "eventsSeasonality"],
    ["sources", "sources"],
  ])("applies CREATE_CHILD for %s and targets the correct module array", (module) => {
    const state = buildDestinationState(module === "facts" ? {} : { facts: [createChildForModule("facts", "keep", "keep")] });
    const operation = buildChildOperation(module as KeyedChildModuleKey, "CREATE_CHILD", "child-a", null, createChildForModule(module as KeyedChildModuleKey, "child-a", "alpha"));

    const result = reduceChildExecutionOperation(state, operation);

    expect(result.outcome).toBe("APPLIED");
    const targetChildren = getModuleChildren(result.resultingState, module as KeyedChildModuleKey);
    expect(targetChildren.some((child) => getStableKey(module as KeyedChildModuleKey, child) === "child-a")).toBe(true);
    expect(getModuleChildren(state, module as KeyedChildModuleKey)).toEqual([]);
    if (module === "facts") {
      expect(getModuleChildren(result.resultingState, "facts")).toHaveLength(1);
    } else {
      expect(getModuleChildren(result.resultingState, "facts")).toEqual([createChildForModule("facts", "keep", "keep")]);
    }
  });

  it("applies UPDATE_CHILD, reports already applied, and fails on drift", () => {
    const state = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha")] });
    const updateOperation = buildChildOperation("facts", "UPDATE_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "beta"));

    const applyResult = reduceChildExecutionOperation(state, updateOperation);
    expect(applyResult.outcome).toBe("APPLIED");
    expect(getModuleChildren(applyResult.resultingState, "facts")[0].valueText).toBe("beta");

    const alreadyAppliedResult = reduceChildExecutionOperation(applyResult.resultingState, updateOperation);
    expect(alreadyAppliedResult.outcome).toBe("ALREADY_APPLIED");
    expect(alreadyAppliedResult.resultingState).toBe(applyResult.resultingState);

    const staleState = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "gamma")] });
    const staleResult = reduceChildExecutionOperation(staleState, updateOperation);
    expect(staleResult.outcome).toBe("FAILED");
    expect(staleResult.reason).toBe("STALE_PRECONDITION");
  });

  it("applies DELETE_CHILD and removes exactly the target child", () => {
    const state = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-b", "beta")] });
    const deleteOperation = buildChildOperation("facts", "DELETE_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), null);

    const applyResult = reduceChildExecutionOperation(state, deleteOperation);
    expect(applyResult.outcome).toBe("APPLIED");
    expect(getModuleChildren(applyResult.resultingState, "facts")).toHaveLength(1);
    expect(getStableKey("facts", getModuleChildren(applyResult.resultingState, "facts")[0])).toBe("fact-b");

    const alreadyAppliedResult = reduceChildExecutionOperation(applyResult.resultingState, deleteOperation);
    expect(alreadyAppliedResult.outcome).toBe("ALREADY_APPLIED");
    expect(alreadyAppliedResult.resultingState).toBe(applyResult.resultingState);
  });

  it.each([
    ["CREATE_CHILD", "CREATE_CHILD"],
    ["UPDATE_CHILD", "UPDATE_CHILD"],
    ["DELETE_CHILD", "DELETE_CHILD"],
    ["UNCHANGED_CHILD", "UNCHANGED_CHILD"],
    ["PRESERVE_CHILD", "PRESERVE_CHILD"],
  ])("fails malformed duplicate stored state before semantics for %s", (kind) => {
    const state = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "alpha")] });
    const operation = buildChildOperation("facts", kind as ChildOperation["kind"], "fact-a", createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "alpha"));

    const result = reduceChildExecutionOperation(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("DUPLICATE_STORED_CHILD_IDENTITY");
    expect(result.resultingState).toBe(state);
  });

  it("treats UNCHANGED and PRESERVE as no-op when the semantic state matches, and fails on drift", () => {
    const matchingState = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha")] });
    const unchangedOperation = buildChildOperation("facts", "UNCHANGED_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "alpha"));

    const unchangedResult = reduceChildExecutionOperation(matchingState, unchangedOperation);
    expect(unchangedResult.outcome).toBe("NO_OP");
    expect(unchangedResult.resultingState).toBe(matchingState);

    const preserveOperation = buildChildOperation("facts", "PRESERVE_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), null);
    const preserveResult = reduceChildExecutionOperation(matchingState, preserveOperation);
    expect(preserveResult.outcome).toBe("NO_OP");
    expect(preserveResult.resultingState).toBe(matchingState);

    const driftState = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "beta")] });
    const driftResult = reduceChildExecutionOperation(driftState, unchangedOperation);
    expect(driftResult.outcome).toBe("FAILED");
    expect(driftResult.reason).toBe("STALE_PRECONDITION");
  });

  it("uses comparable projection semantics for child equality", () => {
    const state = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha")] });
    const operation = buildChildOperation("facts", "UPDATE_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "  alpha  "));

    const result = reduceChildExecutionOperation(state, operation);

    expect(result.outcome).toBe("ALREADY_APPLIED");
    expect(result.resultingState).toBe(state);
  });

  it("treats different stable keys as distinct children", () => {
    const state = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-b", "alpha")] });
    const operation = buildChildOperation("facts", "UPDATE_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "beta"));

    const result = reduceChildExecutionOperation(state, operation);

    expect(result.outcome).toBe("APPLIED");
    expect(getStableKey("facts", getModuleChildren(result.resultingState, "facts")[0])).toBe("fact-a");
    expect(getModuleChildren(result.resultingState, "facts")[0].valueText).toBe("beta");
    expect(getModuleChildren(result.resultingState, "facts")[1].valueText).toBe("alpha");
  });

  it("replays CREATE_CHILD and UNCHANGED/PRESERVE as already applied or no-op on the second run", () => {
    const createState = buildDestinationState();
    const createOperation = buildChildOperation("facts", "CREATE_CHILD", "fact-a", null, createChildForModule("facts", "fact-a", "alpha"));
    const firstCreateResult = reduceChildExecutionOperation(createState, createOperation);
    const secondCreateResult = reduceChildExecutionOperation(firstCreateResult.resultingState, createOperation);

    expect(firstCreateResult.outcome).toBe("APPLIED");
    expect(secondCreateResult.outcome).toBe("ALREADY_APPLIED");

    const unchangedState = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha")] });
    const unchangedOperation = buildChildOperation("facts", "UNCHANGED_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), createChildForModule("facts", "fact-a", "alpha"));
    const unchangedResult = reduceChildExecutionOperation(unchangedState, unchangedOperation);
    const secondUnchangedResult = reduceChildExecutionOperation(unchangedState, unchangedOperation);
    expect(unchangedResult.outcome).toBe("NO_OP");
    expect(secondUnchangedResult.outcome).toBe("NO_OP");

    const preserveState = buildDestinationState({ facts: [createChildForModule("facts", "fact-a", "alpha")] });
    const preserveOperation = buildChildOperation("facts", "PRESERVE_CHILD", "fact-a", createChildForModule("facts", "fact-a", "alpha"), null);
    const preserveResult = reduceChildExecutionOperation(preserveState, preserveOperation);
    const secondPreserveResult = reduceChildExecutionOperation(preserveState, preserveOperation);
    expect(preserveResult.outcome).toBe("NO_OP");
    expect(secondPreserveResult.outcome).toBe("NO_OP");
  });

  it("preserves immutability and deterministic ordering", () => {
    const beforeState = buildDestinationState({ facts: [createChildForModule("facts", "fact-b", "beta")], sources: [createChildForModule("sources", "keep", "keep")] });
    const beforeSnapshot = structuredClone(beforeState);
    const operation = buildChildOperation("facts", "CREATE_CHILD", "fact-a", null, createChildForModule("facts", "fact-a", "alpha"));
    const beforeOperation = structuredClone(operation);

    const result = reduceChildExecutionOperation(beforeState, operation);

    expect(beforeState).toEqual(beforeSnapshot);
    expect(operation).toEqual(beforeOperation);
    expect(result.resultingState).not.toBe(beforeState);
    expect(result.resultingState.facts.map((child: any) => child.factKey)).toEqual(["fact-a", "fact-b"]);
    expect(getModuleChildren(beforeState, "sources")).toEqual([createChildForModule("sources", "keep", "keep")]);
    expect(getModuleChildren(beforeState, "facts")).toEqual([createChildForModule("facts", "fact-b", "beta")]);
  });
});
