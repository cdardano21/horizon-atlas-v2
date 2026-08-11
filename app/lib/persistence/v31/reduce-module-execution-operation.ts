import { projectComparableObject } from "./comparable-projection";
import type { ComparableValue } from "./comparable-projection";
import type { ModuleExecutionOperation, ReplaceModuleExecutionModuleKey, StoredDestinationState } from "./types";

export type ModuleExecutionOutcome = "APPLIED" | "ALREADY_APPLIED" | "FAILED";

export interface ModuleExecutionReducerResult {
  readonly outcome: ModuleExecutionOutcome;
  readonly resultingState: StoredDestinationState;
  readonly reason?: "STALE_PRECONDITION";
  readonly module?: ReplaceModuleExecutionModuleKey;
  readonly operation?: ModuleExecutionOperation["kind"];
}

function compareComparableValues(left: ComparableValue | null, right: ComparableValue | null): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  if (typeof left === "string" || typeof left === "number" || typeof left === "boolean") {
    return left === right;
  }

  if (Array.isArray(left)) {
    if (!Array.isArray(right)) {
      return false;
    }
    if (left.length !== right.length) {
      return false;
    }
    return left.every((entry, index) => compareComparableValues(entry, right[index]));
  }

  if (typeof left === "object" && typeof right === "object") {
    const leftEntries = Object.entries(left);
    const rightEntries = Object.entries(right);
    if (leftEntries.length !== rightEntries.length) {
      return false;
    }
    return leftEntries.every(([key, value]) => {
      const matchingEntry = rightEntries.find(([entryKey]) => entryKey === key);
      return matchingEntry !== undefined && compareComparableValues(value, matchingEntry[1]);
    });
  }

  return false;
}

function areSemanticallyEqual<T extends object>(left: T, right: T): boolean {
  return compareComparableValues(projectComparableObject(left), projectComparableObject(right));
}

function buildFailure(state: StoredDestinationState, operation: ModuleExecutionOperation): ModuleExecutionReducerResult {
  return {
    outcome: "FAILED",
    resultingState: state,
    reason: "STALE_PRECONDITION",
    module: operation.module,
    operation: operation.kind,
  };
}

function replaceModuleArray<T extends object>(state: StoredDestinationState, module: ReplaceModuleExecutionModuleKey, nextValue: readonly T[]): StoredDestinationState {
  return { ...state, [module]: nextValue as StoredDestinationState[typeof module] };
}

function moduleStateMatches(currentModuleState: readonly unknown[], expectedState: readonly object[]): boolean {
  return expectedState.length === currentModuleState.length && expectedState.every((expectedEntry, index) => areSemanticallyEqual(expectedEntry, currentModuleState[index] as object));
}

export function reduceModuleExecutionOperation(state: StoredDestinationState, operation: ModuleExecutionOperation): ModuleExecutionReducerResult {
  const currentModuleState = state[operation.module] as readonly unknown[];
  const expectedBefore = operation.expectedBefore;
  const expectedAfter = operation.expectedAfter;

  if (moduleStateMatches(currentModuleState, expectedAfter as readonly object[])) {
    return {
      outcome: "ALREADY_APPLIED",
      resultingState: state,
      module: operation.module,
      operation: operation.kind,
    };
  }

  if (!moduleStateMatches(currentModuleState, expectedBefore as readonly object[])) {
    return buildFailure(state, operation);
  }

  return {
    outcome: "APPLIED",
    resultingState: replaceModuleArray(state, operation.module, expectedAfter),
    module: operation.module,
    operation: operation.kind,
  };
}
