import { projectComparableObject } from "./comparable-projection";
import type { ComparableValue } from "./comparable-projection";
import type { ChildOperation, ChildOperationKind, KeyedChildModuleKey, StableChildKey, StoredDestinationState, StoredEventsSeasonalityState, StoredFact, StoredMedia, StoredMoveChecklistState, StoredNeighborhood, StoredPlace, StoredPropertyResource, StoredResource, StoredScore, StoredSource } from "./types";
import type { ExecutionFailureReason } from "./errors";

export type ChildExecutionOutcome = "APPLIED" | "ALREADY_APPLIED" | "NO_OP" | "FAILED";

export interface ChildExecutionReducerResult {
  readonly outcome: ChildExecutionOutcome;
  readonly resultingState: StoredDestinationState;
  readonly reason?: ExecutionFailureReason;
  readonly module?: KeyedChildModuleKey;
  readonly stableChildKey?: StableChildKey;
  readonly operationKind?: ChildOperationKind;
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

function sortChildrenByStableKey<T extends object>(children: readonly T[], getStableKey: (child: T) => string): readonly T[] {
  return [...children].sort((left, right) => {
    const leftKey = getStableKey(left);
    const rightKey = getStableKey(right);
    return leftKey.localeCompare(rightKey);
  });
}

function buildFailure(state: StoredDestinationState, operation: ChildOperation, reason: ExecutionFailureReason): ChildExecutionReducerResult {
  return {
    outcome: "FAILED",
    resultingState: state,
    reason,
    module: operation.module,
    stableChildKey: operation.stableChildKey,
    operationKind: operation.kind,
  };
}

function buildNoOp(state: StoredDestinationState, operation: ChildOperation): ChildExecutionReducerResult {
  return {
    outcome: "NO_OP",
    resultingState: state,
    module: operation.module,
    stableChildKey: operation.stableChildKey,
    operationKind: operation.kind,
  };
}

function replaceFactsArray(state: StoredDestinationState, facts: readonly StoredFact[]): StoredDestinationState {
  return { ...state, facts };
}

function replaceScoresArray(state: StoredDestinationState, scores: readonly StoredScore[]): StoredDestinationState {
  return { ...state, scores };
}

function replaceNeighborhoodsArray(state: StoredDestinationState, neighborhoods: readonly StoredNeighborhood[]): StoredDestinationState {
  return { ...state, neighborhoods };
}

function replacePlacesArray(state: StoredDestinationState, places: readonly StoredPlace[]): StoredDestinationState {
  return { ...state, places };
}

function replaceResourcesArray(state: StoredDestinationState, resources: readonly StoredResource[]): StoredDestinationState {
  return { ...state, resources };
}

function replaceMediaArray(state: StoredDestinationState, media: readonly StoredMedia[]): StoredDestinationState {
  return { ...state, media };
}

function replacePropertyResourcesArray(state: StoredDestinationState, propertyResources: readonly StoredPropertyResource[]): StoredDestinationState {
  return { ...state, propertyResources };
}

function replaceMoveChecklistArray(state: StoredDestinationState, moveChecklist: readonly StoredMoveChecklistState[]): StoredDestinationState {
  return { ...state, moveChecklist };
}

function replaceEventsSeasonalityArray(state: StoredDestinationState, eventsSeasonality: readonly StoredEventsSeasonalityState[]): StoredDestinationState {
  return { ...state, eventsSeasonality };
}

function replaceSourcesArray(state: StoredDestinationState, sources: readonly StoredSource[]): StoredDestinationState {
  return { ...state, sources };
}

function reduceFactsChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "facts" }>): ChildExecutionReducerResult {
  const duplicateCount = state.facts.filter((child) => child.factKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.facts.find((child) => child.factKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceFactsArray(state, sortChildrenByStableKey([...state.facts, operation.incomingChild], (child) => child.factKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceFactsArray(state, sortChildrenByStableKey(state.facts.map((child) => (child.factKey === existingChild.factKey ? operation.incomingChild : child)), (child) => child.factKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceFactsArray(state, sortChildrenByStableKey(state.facts.filter((child) => child.factKey !== existingChild.factKey), (child) => child.factKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceScoresChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "scores" }>): ChildExecutionReducerResult {
  const duplicateCount = state.scores.filter((child) => child.scoreKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.scores.find((child) => child.scoreKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceScoresArray(state, sortChildrenByStableKey([...state.scores, operation.incomingChild], (child) => child.scoreKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceScoresArray(state, sortChildrenByStableKey(state.scores.map((child) => (child.scoreKey === existingChild.scoreKey ? operation.incomingChild : child)), (child) => child.scoreKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceScoresArray(state, sortChildrenByStableKey(state.scores.filter((child) => child.scoreKey !== existingChild.scoreKey), (child) => child.scoreKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceNeighborhoodsChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "neighborhoods" }>): ChildExecutionReducerResult {
  const duplicateCount = state.neighborhoods.filter((child) => child.neighborhoodKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.neighborhoods.find((child) => child.neighborhoodKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceNeighborhoodsArray(state, sortChildrenByStableKey([...state.neighborhoods, operation.incomingChild], (child) => child.neighborhoodKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceNeighborhoodsArray(state, sortChildrenByStableKey(state.neighborhoods.map((child) => (child.neighborhoodKey === existingChild.neighborhoodKey ? operation.incomingChild : child)), (child) => child.neighborhoodKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceNeighborhoodsArray(state, sortChildrenByStableKey(state.neighborhoods.filter((child) => child.neighborhoodKey !== existingChild.neighborhoodKey), (child) => child.neighborhoodKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reducePlacesChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "places" }>): ChildExecutionReducerResult {
  const duplicateCount = state.places.filter((child) => child.placeKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.places.find((child) => child.placeKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replacePlacesArray(state, sortChildrenByStableKey([...state.places, operation.incomingChild], (child) => child.placeKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replacePlacesArray(state, sortChildrenByStableKey(state.places.map((child) => (child.placeKey === existingChild.placeKey ? operation.incomingChild : child)), (child) => child.placeKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replacePlacesArray(state, sortChildrenByStableKey(state.places.filter((child) => child.placeKey !== existingChild.placeKey), (child) => child.placeKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceResourcesChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "resources" }>): ChildExecutionReducerResult {
  const duplicateCount = state.resources.filter((child) => child.resourceKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.resources.find((child) => child.resourceKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceResourcesArray(state, sortChildrenByStableKey([...state.resources, operation.incomingChild], (child) => child.resourceKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceResourcesArray(state, sortChildrenByStableKey(state.resources.map((child) => (child.resourceKey === existingChild.resourceKey ? operation.incomingChild : child)), (child) => child.resourceKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceResourcesArray(state, sortChildrenByStableKey(state.resources.filter((child) => child.resourceKey !== existingChild.resourceKey), (child) => child.resourceKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceMediaChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "media" }>): ChildExecutionReducerResult {
  const duplicateCount = state.media.filter((child) => child.mediaKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.media.find((child) => child.mediaKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceMediaArray(state, sortChildrenByStableKey([...state.media, operation.incomingChild], (child) => child.mediaKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceMediaArray(state, sortChildrenByStableKey(state.media.map((child) => (child.mediaKey === existingChild.mediaKey ? operation.incomingChild : child)), (child) => child.mediaKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceMediaArray(state, sortChildrenByStableKey(state.media.filter((child) => child.mediaKey !== existingChild.mediaKey), (child) => child.mediaKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reducePropertyResourcesChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "propertyResources" }>): ChildExecutionReducerResult {
  const duplicateCount = state.propertyResources.filter((child) => child.itemKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.propertyResources.find((child) => child.itemKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replacePropertyResourcesArray(state, sortChildrenByStableKey([...state.propertyResources, operation.incomingChild], (child) => child.itemKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replacePropertyResourcesArray(state, sortChildrenByStableKey(state.propertyResources.map((child) => (child.itemKey === existingChild.itemKey ? operation.incomingChild : child)), (child) => child.itemKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replacePropertyResourcesArray(state, sortChildrenByStableKey(state.propertyResources.filter((child) => child.itemKey !== existingChild.itemKey), (child) => child.itemKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceMoveChecklistChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "moveChecklist" }>): ChildExecutionReducerResult {
  const duplicateCount = state.moveChecklist.filter((child) => child.checklistKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.moveChecklist.find((child) => child.checklistKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceMoveChecklistArray(state, sortChildrenByStableKey([...state.moveChecklist, operation.incomingChild], (child) => child.checklistKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceMoveChecklistArray(state, sortChildrenByStableKey(state.moveChecklist.map((child) => (child.checklistKey === existingChild.checklistKey ? operation.incomingChild : child)), (child) => child.checklistKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceMoveChecklistArray(state, sortChildrenByStableKey(state.moveChecklist.filter((child) => child.checklistKey !== existingChild.checklistKey), (child) => child.checklistKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceEventsSeasonalityChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "eventsSeasonality" }>): ChildExecutionReducerResult {
  const duplicateCount = state.eventsSeasonality.filter((child) => child.eventSeasonalityKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.eventsSeasonality.find((child) => child.eventSeasonalityKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceEventsSeasonalityArray(state, sortChildrenByStableKey([...state.eventsSeasonality, operation.incomingChild], (child) => child.eventSeasonalityKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceEventsSeasonalityArray(state, sortChildrenByStableKey(state.eventsSeasonality.map((child) => (child.eventSeasonalityKey === existingChild.eventSeasonalityKey ? operation.incomingChild : child)), (child) => child.eventSeasonalityKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceEventsSeasonalityArray(state, sortChildrenByStableKey(state.eventsSeasonality.filter((child) => child.eventSeasonalityKey !== existingChild.eventSeasonalityKey), (child) => child.eventSeasonalityKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

function reduceSourcesChildOperation(state: StoredDestinationState, operation: Extract<ChildOperation, { module: "sources" }>): ChildExecutionReducerResult {
  const duplicateCount = state.sources.filter((child) => child.sourceKey === operation.stableChildKey).length;
  if (duplicateCount > 1) {
    return buildFailure(state, operation, "DUPLICATE_STORED_CHILD_IDENTITY");
  }

  const existingChild = state.sources.find((child) => child.sourceKey === operation.stableChildKey) ?? null;

  switch (operation.kind) {
    case "CREATE_CHILD": {
      if (existingChild !== null) {
        if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
          return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
        }
        return buildFailure(state, operation, "DUPLICATE_CHILD_CREATE");
      }
      return {
        outcome: "APPLIED",
        resultingState: replaceSourcesArray(state, sortChildrenByStableKey([...state.sources, operation.incomingChild], (child) => child.sourceKey)),
        module: operation.module,
        stableChildKey: operation.stableChildKey,
        operationKind: operation.kind,
      };
    }
    case "UPDATE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceSourcesArray(state, sortChildrenByStableKey(state.sources.map((child) => (child.sourceKey === existingChild.sourceKey ? operation.incomingChild : child)), (child) => child.sourceKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "DELETE_CHILD": {
      if (existingChild === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state, module: operation.module, stableChildKey: operation.stableChildKey, operationKind: operation.kind };
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return {
          outcome: "APPLIED",
          resultingState: replaceSourcesArray(state, sortChildrenByStableKey(state.sources.filter((child) => child.sourceKey !== existingChild.sourceKey), (child) => child.sourceKey)),
          module: operation.module,
          stableChildKey: operation.stableChildKey,
          operationKind: operation.kind,
        };
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "UNCHANGED_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.incomingChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
    case "PRESERVE_CHILD": {
      if (existingChild === null) {
        return buildFailure(state, operation, "MISSING_CHILD");
      }
      if (areSemanticallyEqual(existingChild, operation.currentChild)) {
        return buildNoOp(state, operation);
      }
      return buildFailure(state, operation, "STALE_PRECONDITION");
    }
  }
}

export function reduceChildExecutionOperation(state: StoredDestinationState, operation: ChildOperation): ChildExecutionReducerResult {
  switch (operation.module) {
    case "facts":
      return reduceFactsChildOperation(state, operation);
    case "scores":
      return reduceScoresChildOperation(state, operation);
    case "neighborhoods":
      return reduceNeighborhoodsChildOperation(state, operation);
    case "places":
      return reducePlacesChildOperation(state, operation);
    case "resources":
      return reduceResourcesChildOperation(state, operation);
    case "media":
      return reduceMediaChildOperation(state, operation);
    case "propertyResources":
      return reducePropertyResourcesChildOperation(state, operation);
    case "moveChecklist":
      return reduceMoveChecklistChildOperation(state, operation);
    case "eventsSeasonality":
      return reduceEventsSeasonalityChildOperation(state, operation);
    case "sources":
      return reduceSourcesChildOperation(state, operation);
  }
}
