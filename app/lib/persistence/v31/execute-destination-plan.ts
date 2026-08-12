import { reduceExecutionOperationDispatcher } from "./reduce-execution-operation-dispatch";
import type { UnifiedExecutionReducerResult } from "./reduce-execution-operation-dispatch";
import type { ChildOperation, ChildOperationKind, DestinationPlan, KeyedChildModuleKey, ModuleExecutionOperation, ReplaceModuleExecutionModuleKey, ScalarModuleKey, ScalarOperation, ScalarOperationKind, StableChildKey, StoredDestinationState } from "./types";
import type { ExecutionFailureReason } from "./errors";

export type DestinationExecutionOutcome = "SUCCESS" | "NO_OP" | "FAILED";
type OperationFamily = UnifiedExecutionReducerResult["operationFamily"];

export interface DestinationExecutionTraceEntry {
  readonly index: number;
  readonly operationFamily: OperationFamily;
  readonly operationKind: ScalarOperationKind | ChildOperationKind | "REPLACE_MODULE";
  readonly module: ScalarModuleKey | KeyedChildModuleKey | ReplaceModuleExecutionModuleKey;
  readonly fieldPath?: string;
  readonly stableChildKey?: StableChildKey;
  readonly outcome: UnifiedExecutionReducerResult["outcome"];
  readonly failureReason?: ExecutionFailureReason;
}

export interface DestinationExecutionResult {
  readonly outcome: DestinationExecutionOutcome;
  readonly resultingState: StoredDestinationState;
  readonly trace: readonly DestinationExecutionTraceEntry[];
  readonly failure?: {
    readonly reason: ExecutionFailureReason;
    readonly operationFamily?: OperationFamily;
    readonly module?: string;
    readonly fieldPath?: string;
    readonly stableChildKey?: string;
  };
}

function buildTraceEntry(index: number, result: UnifiedExecutionReducerResult, operation: ScalarOperation | ChildOperation | ModuleExecutionOperation): DestinationExecutionTraceEntry {
  const baseEntry: DestinationExecutionTraceEntry = {
    index,
    operationFamily: result.operationFamily,
    operationKind: result.operationKind,
    module: result.module,
    outcome: result.outcome,
  };

  if (result.operationFamily === "SCALAR") {
    const scalarFieldPath = result.fieldPath ?? ("fieldPath" in operation ? operation.fieldPath : undefined);
    const entryWithFieldPath = scalarFieldPath === undefined ? baseEntry : { ...baseEntry, fieldPath: scalarFieldPath };

    if (result.outcome === "FAILED" && result.reason !== undefined) {
      return { ...entryWithFieldPath, failureReason: result.reason };
    }

    return entryWithFieldPath;
  }

  if (result.operationFamily === "CHILD") {
    const stableChildKey = result.stableChildKey ?? ("stableChildKey" in operation ? operation.stableChildKey : undefined);
    const entryWithChildKey = stableChildKey === undefined ? baseEntry : { ...baseEntry, stableChildKey };

    if (result.outcome === "FAILED" && result.reason !== undefined) {
      return { ...entryWithChildKey, failureReason: result.reason };
    }

    return entryWithChildKey;
  }

  if (result.outcome === "FAILED" && result.reason !== undefined) {
    return { ...baseEntry, failureReason: result.reason };
  }

  return baseEntry;
}

export function executeDestinationPlan(plan: DestinationPlan, startingState: StoredDestinationState): DestinationExecutionResult {
  if (plan.action === "UNCHANGED" || plan.action === "UPDATE") {
    if (plan.scalarOperations.length === 0 && plan.childOperations.length === 0 && plan.moduleExecutionOperations.length === 0) {
      return { outcome: "NO_OP", resultingState: startingState, trace: [] };
    }

    const trace: DestinationExecutionTraceEntry[] = [];
    let currentState = startingState;
    let hasAppliedAnyOperation = false;
    let nextTraceIndex = 0;

    for (const operation of plan.scalarOperations) {
      const result = reduceExecutionOperationDispatcher(currentState, operation);
      trace.push(buildTraceEntry(nextTraceIndex, result, operation));
      nextTraceIndex += 1;

      if (result.outcome === "APPLIED") {
        currentState = result.resultingState;
        hasAppliedAnyOperation = true;
        continue;
      }

      if (result.outcome === "ALREADY_APPLIED" || result.outcome === "NO_OP") {
        currentState = result.resultingState;
        continue;
      }

      return {
        outcome: "FAILED",
        resultingState: startingState,
        trace,
        failure: {
          reason: result.reason ?? "UNSUPPORTED_DESTINATION_ACTION",
          operationFamily: result.operationFamily,
          module: result.module,
          fieldPath: result.fieldPath,
        },
      };
    }

    for (const operation of plan.childOperations) {
      const result = reduceExecutionOperationDispatcher(currentState, operation);
      trace.push(buildTraceEntry(nextTraceIndex, result, operation));
      nextTraceIndex += 1;

      if (result.outcome === "APPLIED") {
        currentState = result.resultingState;
        hasAppliedAnyOperation = true;
        continue;
      }

      if (result.outcome === "ALREADY_APPLIED" || result.outcome === "NO_OP") {
        currentState = result.resultingState;
        continue;
      }

      return {
        outcome: "FAILED",
        resultingState: startingState,
        trace,
        failure: {
          reason: result.reason ?? "UNSUPPORTED_DESTINATION_ACTION",
          operationFamily: result.operationFamily,
          module: result.module,
          stableChildKey: result.stableChildKey,
        },
      };
    }

    for (const operation of plan.moduleExecutionOperations) {
      const result = reduceExecutionOperationDispatcher(currentState, operation);
      trace.push(buildTraceEntry(nextTraceIndex, result, operation));
      nextTraceIndex += 1;

      if (result.outcome === "APPLIED") {
        currentState = result.resultingState;
        hasAppliedAnyOperation = true;
        continue;
      }

      if (result.outcome === "ALREADY_APPLIED") {
        currentState = result.resultingState;
        continue;
      }

      return {
        outcome: "FAILED",
        resultingState: startingState,
        trace,
        failure: {
          reason: result.reason ?? "UNSUPPORTED_DESTINATION_ACTION",
          operationFamily: result.operationFamily,
          module: result.module,
        },
      };
    }

    return hasAppliedAnyOperation ? { outcome: "SUCCESS", resultingState: currentState, trace } : { outcome: "NO_OP", resultingState: startingState, trace };
  }

  return {
    outcome: "FAILED",
    resultingState: startingState,
    trace: [],
    failure: {
      reason: "UNSUPPORTED_DESTINATION_ACTION",
    },
  };
}
