import { describe, expect, it } from "vitest";
import { normalizeScalarValue } from "../normalize";
import { reduceScalarExecutionOperation } from "../reduce-execution-operation";
import type { ScalarOperation, StoredDestinationState } from "../types";

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

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
  }

  return value;
}

describe("scalar execution reducer", () => {
  it("applies CREATE operations immutably", () => {
    const state = buildDestinationState();
    const operation: ScalarOperation = {
      kind: "CREATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: null,
      incomingValue: "new",
    };

    const firstResult = reduceScalarExecutionOperation(state, operation);

    expect(firstResult.outcome).toBe("APPLIED");
    expect(firstResult.resultingState.editorial.shortDescription).toBe("new");
    expect(state.editorial.shortDescription).toBeNull();
    expect(firstResult.resultingState).not.toBe(state);
    expect(operation).toEqual({
      kind: "CREATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: null,
      incomingValue: "new",
    });
  });

  it("reports CREATE as already applied when the incoming semantic value is already present", () => {
    const state = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } });
    const operation: ScalarOperation = {
      kind: "CREATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: null,
      incomingValue: "new",
    };

    const result = reduceScalarExecutionOperation(state, operation);

    expect(result.outcome).toBe("ALREADY_APPLIED");
    expect(result.resultingState).toBe(state);
    expect(state.editorial.shortDescription).toBe("new");
  });

  it("fails CREATE when the precondition drifted", () => {
    const state = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "different" } });
    const operation: ScalarOperation = {
      kind: "CREATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: null,
      incomingValue: "new",
    };

    const result = reduceScalarExecutionOperation(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("STALE_PRECONDITION");
    expect(result.resultingState).toBe(state);
  });

  it("handles UPDATE apply, already applied, and stale outcomes", () => {
    const applyState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "old" } });
    const updateApplyOperation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };
    const applyResult = reduceScalarExecutionOperation(applyState, updateApplyOperation);

    expect(applyResult.outcome).toBe("APPLIED");
    expect(applyResult.resultingState.editorial.shortDescription).toBe("new");

    const alreadyAppliedState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "new" } });
    const alreadyAppliedResult = reduceScalarExecutionOperation(alreadyAppliedState, updateApplyOperation);
    expect(alreadyAppliedResult.outcome).toBe("ALREADY_APPLIED");
    expect(alreadyAppliedResult.resultingState).toBe(alreadyAppliedState);

    const staleState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "other" } });
    const staleResult = reduceScalarExecutionOperation(staleState, updateApplyOperation);
    expect(staleResult.outcome).toBe("FAILED");
    expect(staleResult.reason).toBe("STALE_PRECONDITION");
  });

  it("handles CLEAR apply, already applied, and stale outcomes", () => {
    const applyState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "old" } });
    const clearOperation: ScalarOperation = {
      kind: "CLEAR",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: null,
    };

    const applyResult = reduceScalarExecutionOperation(applyState, clearOperation);
    expect(applyResult.outcome).toBe("APPLIED");
    expect(applyResult.resultingState.editorial.shortDescription).toBeNull();

    const alreadyAppliedState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: null } });
    const alreadyAppliedResult = reduceScalarExecutionOperation(alreadyAppliedState, clearOperation);
    expect(alreadyAppliedResult.outcome).toBe("ALREADY_APPLIED");

    const staleState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "other" } });
    const staleResult = reduceScalarExecutionOperation(staleState, clearOperation);
    expect(staleResult.outcome).toBe("FAILED");
    expect(staleResult.reason).toBe("STALE_PRECONDITION");
  });

  it("treats UNCHANGED as no-op when the semantic state matches and fails on drift", () => {
    const matchingState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "value" } });
    const matchingOperation: ScalarOperation = {
      kind: "UNCHANGED",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "value",
      incomingValue: "value",
    };
    const matchingResult = reduceScalarExecutionOperation(matchingState, matchingOperation);
    expect(matchingResult.outcome).toBe("NO_OP");
    expect(matchingResult.resultingState).toBe(matchingState);

    const driftState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "drifted" } });
    const driftResult = reduceScalarExecutionOperation(driftState, matchingOperation);
    expect(driftResult.outcome).toBe("FAILED");
    expect(driftResult.reason).toBe("STALE_PRECONDITION");
  });

  it("treats PRESERVE as no-op when the semantic state matches and fails on drift", () => {
    const matchingState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "value" } });
    const preserveOperation: ScalarOperation = {
      kind: "PRESERVE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "value",
      incomingValue: null,
    };
    const matchingResult = reduceScalarExecutionOperation(matchingState, preserveOperation);
    expect(matchingResult.outcome).toBe("NO_OP");
    expect(matchingResult.resultingState).toBe(matchingState);

    const driftState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "drifted" } });
    const driftResult = reduceScalarExecutionOperation(driftState, preserveOperation);
    expect(driftResult.outcome).toBe("FAILED");
    expect(driftResult.reason).toBe("STALE_PRECONDITION");
  });

  it("handles the three scalar module families explicitly", () => {
    const editorialState = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "old" } });
    const editorialResult = reduceScalarExecutionOperation(editorialState, {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    });
    expect(editorialResult.outcome).toBe("APPLIED");
    expect(editorialResult.resultingState.editorial.shortDescription).toBe("new");

    const environmentQualityState = buildDestinationState({ environmentQuality: { summary: "old", qualityNotes: null } });
    const environmentResult = reduceScalarExecutionOperation(environmentQualityState, {
      kind: "UPDATE",
      module: "environmentQuality",
      fieldPath: "summary",
      currentValue: "old",
      incomingValue: "new",
    });
    expect(environmentResult.outcome).toBe("APPLIED");
    expect(environmentResult.resultingState.environmentQuality?.summary).toBe("new");

    const practicalityState = buildDestinationState({ dailyLifePracticality: { summary: "old", practicalityNotes: null } });
    const practicalityResult = reduceScalarExecutionOperation(practicalityState, {
      kind: "UPDATE",
      module: "dailyLifePracticality",
      fieldPath: "practicalityNotes",
      currentValue: null,
      incomingValue: "new",
    });
    expect(practicalityResult.outcome).toBe("APPLIED");
    expect(practicalityResult.resultingState.dailyLifePracticality?.practicalityNotes).toBe("new");
  });

  it("preserves the existing normalization authority for null, empty, zero, false, and whitespace values", () => {
    expect(normalizeScalarValue(null)).toBeNull();
    expect(normalizeScalarValue("")).toBeNull();
    expect(normalizeScalarValue("   ")).toBeNull();
    expect(normalizeScalarValue(0)).toBe(0);
    expect(normalizeScalarValue(false)).toBe(false);
    expect(normalizeScalarValue("  New Braunfels  ")).toBe("New Braunfels");
  });

  it("is replay-safe for repeated UPDATE application", () => {
    const state = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "old" } });
    const operation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };

    const firstResult = reduceScalarExecutionOperation(state, operation);
    const secondResult = reduceScalarExecutionOperation(firstResult.resultingState, operation);

    expect(firstResult.outcome).toBe("APPLIED");
    expect(secondResult.outcome).toBe("ALREADY_APPLIED");
    expect(secondResult.resultingState).toBe(firstResult.resultingState);
  });

  it("is deterministic for identical inputs and operations", () => {
    const state = buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "old" } });
    const operation: ScalarOperation = {
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    };

    const firstResult = reduceScalarExecutionOperation(state, operation);
    const secondResult = reduceScalarExecutionOperation(state, operation);

    expect(firstResult).toEqual(secondResult);
  });

  it("does not mutate the input state or operation object", () => {
    const state = deepFreeze(buildDestinationState({ editorial: { ...buildDestinationState().editorial, shortDescription: "old" } }));
    const operation = deepFreeze<ScalarOperation>({
      kind: "UPDATE",
      module: "editorial",
      fieldPath: "shortDescription",
      currentValue: "old",
      incomingValue: "new",
    });

    const result = reduceScalarExecutionOperation(state, operation);

    expect(state.editorial.shortDescription).toBe("old");
    expect(operation.incomingValue).toBe("new");
    expect(result.resultingState.editorial.shortDescription).toBe("new");
    expect(result.resultingState).not.toBe(state);
  });
});
