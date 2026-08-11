import { normalizeScalarValue } from "./normalize";
import type {
  ScalarModuleKey,
  ScalarOperation,
  ScalarOperationKind,
  ScalarValue,
  StoredDailyLifePracticalityState,
  StoredDestinationState,
  StoredEditorialState,
  StoredEnvironmentQualityState,
} from "./types";

export type ScalarExecutionOutcome = "APPLIED" | "ALREADY_APPLIED" | "NO_OP" | "FAILED";

export interface ScalarExecutionReducerResult {
  readonly outcome: ScalarExecutionOutcome;
  readonly resultingState: StoredDestinationState;
  readonly reason?: "STALE_PRECONDITION";
  readonly module?: ScalarModuleKey;
  readonly fieldPath?: string;
  readonly operationKind?: ScalarOperationKind;
}

function areSemanticallyEqual(left: ScalarValue, right: ScalarValue): boolean {
  const leftSemantic = normalizeScalarValue(left);
  const rightSemantic = normalizeScalarValue(right);
  return leftSemantic === rightSemantic;
}

function materializeStringValue(value: ScalarValue): string | null {
  const semanticValue = normalizeScalarValue(value);
  return typeof semanticValue === "string" ? semanticValue : null;
}

function getEditorialValue(state: StoredEditorialState, fieldPath: string): ScalarValue | null {
  switch (fieldPath) {
    case "shortDescription":
      return state.shortDescription;
    case "longDescription":
      return state.longDescription;
    case "currency":
      return state.currency;
    case "primaryLanguage":
      return state.primaryLanguage;
    case "timeZone":
      return state.timeZone;
    default:
      return null;
  }
}

function setEditorialValue(state: StoredEditorialState, fieldPath: string, value: string | null): StoredEditorialState {
  switch (fieldPath) {
    case "shortDescription":
      return { ...state, shortDescription: value };
    case "longDescription":
      return { ...state, longDescription: value };
    case "currency":
      return { ...state, currency: value };
    case "primaryLanguage":
      return { ...state, primaryLanguage: value };
    case "timeZone":
      return { ...state, timeZone: value };
    default:
      return state;
  }
}

function getEnvironmentQualityValue(state: StoredEnvironmentQualityState | null, fieldPath: string): ScalarValue | null {
  if (state === null) {
    return null;
  }

  switch (fieldPath) {
    case "summary":
      return state.summary;
    case "qualityNotes":
      return state.qualityNotes;
    default:
      return null;
  }
}

function setEnvironmentQualityValue(state: StoredEnvironmentQualityState | null, fieldPath: string, value: string | null): StoredEnvironmentQualityState | null {
  if (state === null) {
    return fieldPath === "summary"
      ? { summary: value, qualityNotes: null }
      : { summary: null, qualityNotes: value };
  }

  switch (fieldPath) {
    case "summary":
      return { ...state, summary: value };
    case "qualityNotes":
      return { ...state, qualityNotes: value };
    default:
      return state;
  }
}

function getDailyLifePracticalityValue(state: StoredDailyLifePracticalityState | null, fieldPath: string): ScalarValue | null {
  if (state === null) {
    return null;
  }

  switch (fieldPath) {
    case "summary":
      return state.summary;
    case "practicalityNotes":
      return state.practicalityNotes;
    default:
      return null;
  }
}

function setDailyLifePracticalityValue(state: StoredDailyLifePracticalityState | null, fieldPath: string, value: string | null): StoredDailyLifePracticalityState | null {
  if (state === null) {
    return fieldPath === "summary"
      ? { summary: value, practicalityNotes: null }
      : { summary: null, practicalityNotes: value };
  }

  switch (fieldPath) {
    case "summary":
      return { ...state, summary: value };
    case "practicalityNotes":
      return { ...state, practicalityNotes: value };
    default:
      return state;
  }
}

function getScalarValueFromState(state: StoredDestinationState, module: ScalarModuleKey, fieldPath: string): ScalarValue | null {
  switch (module) {
    case "editorial":
      return getEditorialValue(state.editorial, fieldPath);
    case "environmentQuality":
      return getEnvironmentQualityValue(state.environmentQuality, fieldPath);
    case "dailyLifePracticality":
      return getDailyLifePracticalityValue(state.dailyLifePracticality, fieldPath);
    default:
      return null;
  }
}

function applyScalarValueToState(state: StoredDestinationState, module: ScalarModuleKey, fieldPath: string, value: string | null): StoredDestinationState {
  switch (module) {
    case "editorial":
      return { ...state, editorial: setEditorialValue(state.editorial, fieldPath, value) };
    case "environmentQuality":
      return { ...state, environmentQuality: setEnvironmentQualityValue(state.environmentQuality, fieldPath, value) };
    case "dailyLifePracticality":
      return { ...state, dailyLifePracticality: setDailyLifePracticalityValue(state.dailyLifePracticality, fieldPath, value) };
    default:
      return state;
  }
}

function buildFailure(state: StoredDestinationState, operation: ScalarOperation): ScalarExecutionReducerResult {
  return {
    outcome: "FAILED",
    resultingState: state,
    reason: "STALE_PRECONDITION",
    module: operation.module,
    fieldPath: operation.fieldPath,
    operationKind: operation.kind,
  };
}

export function reduceScalarExecutionOperation(state: StoredDestinationState, operation: ScalarOperation): ScalarExecutionReducerResult {
  const actualValue = getScalarValueFromState(state, operation.module, operation.fieldPath);
  const currentValue = operation.currentValue;
  const incomingValue = operation.incomingValue;

  switch (operation.kind) {
    case "CREATE": {
      const incomingSemantic = normalizeScalarValue(incomingValue);
      const actualSemantic = normalizeScalarValue(actualValue);
      if (incomingSemantic === null && actualSemantic === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state };
      }
      if (actualSemantic === incomingSemantic) {
        return { outcome: "ALREADY_APPLIED", resultingState: state };
      }
      if (actualSemantic === normalizeScalarValue(currentValue)) {
        const nextValue = materializeStringValue(incomingValue);
        return {
          outcome: "APPLIED",
          resultingState: applyScalarValueToState(state, operation.module, operation.fieldPath, nextValue),
        };
      }
      return buildFailure(state, operation);
    }
    case "UPDATE": {
      const incomingSemantic = normalizeScalarValue(incomingValue);
      const currentSemantic = normalizeScalarValue(actualValue);
      if (currentSemantic === incomingSemantic) {
        return { outcome: "ALREADY_APPLIED", resultingState: state };
      }
      if (currentSemantic === normalizeScalarValue(currentValue)) {
        const nextValue = materializeStringValue(incomingValue);
        return {
          outcome: "APPLIED",
          resultingState: applyScalarValueToState(state, operation.module, operation.fieldPath, nextValue),
        };
      }
      return buildFailure(state, operation);
    }
    case "CLEAR": {
      const currentSemantic = normalizeScalarValue(actualValue);
      if (currentSemantic === null) {
        return { outcome: "ALREADY_APPLIED", resultingState: state };
      }
      if (currentSemantic === normalizeScalarValue(currentValue)) {
        return {
          outcome: "APPLIED",
          resultingState: applyScalarValueToState(state, operation.module, operation.fieldPath, null),
        };
      }
      return buildFailure(state, operation);
    }
    case "UNCHANGED": {
      const expectedSemantic = normalizeScalarValue(operation.incomingValue);
      const actualSemantic = normalizeScalarValue(actualValue);
      if (actualSemantic === expectedSemantic) {
        return { outcome: "NO_OP", resultingState: state };
      }
      return buildFailure(state, operation);
    }
    case "PRESERVE": {
      const expectedSemantic = normalizeScalarValue(currentValue);
      const actualSemantic = normalizeScalarValue(actualValue);
      if (actualSemantic === expectedSemantic) {
        return { outcome: "NO_OP", resultingState: state };
      }
      return buildFailure(state, operation);
    }
    default:
      return buildFailure(state, operation);
  }
}
