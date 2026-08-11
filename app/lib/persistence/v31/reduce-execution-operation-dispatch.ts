import type { ChildOperation, ChildOperationKind, KeyedChildModuleKey, ModuleExecutionOperation, ReplaceModuleExecutionModuleKey, ScalarModuleKey, ScalarOperation, ScalarOperationKind, StableChildKey, StoredDestinationState } from "./types";
import type { ExecutionFailureReason } from "./errors";
import { reduceChildExecutionOperation } from "./reduce-child-execution-operation";
import { reduceModuleExecutionOperation } from "./reduce-module-execution-operation";
import { reduceScalarExecutionOperation } from "./reduce-execution-operation";

export type UnifiedExecutionOutcome = "APPLIED" | "ALREADY_APPLIED" | "NO_OP" | "FAILED";

export interface UnifiedExecutionReducerResult {
  readonly outcome: UnifiedExecutionOutcome;
  readonly resultingState: StoredDestinationState;
  readonly reason?: ExecutionFailureReason;
  readonly operationFamily: "SCALAR" | "CHILD" | "MODULE";
  readonly operationKind: ScalarOperationKind | ChildOperationKind | "REPLACE_MODULE";
  readonly module: ScalarModuleKey | KeyedChildModuleKey | ReplaceModuleExecutionModuleKey;
  readonly fieldPath?: string;
  readonly stableChildKey?: StableChildKey;
}

export function reduceExecutionOperationDispatcher(
  state: StoredDestinationState,
  operation: ScalarOperation | ChildOperation | ModuleExecutionOperation,
): UnifiedExecutionReducerResult {
  switch (operation.kind) {
    case "CREATE":
    case "UPDATE":
    case "CLEAR":
    case "UNCHANGED":
    case "PRESERVE": {
      const result = reduceScalarExecutionOperation(state, operation);
      return {
        outcome: result.outcome,
        resultingState: result.resultingState,
        reason: result.reason,
        operationFamily: "SCALAR",
        operationKind: result.operationKind ?? operation.kind,
        module: result.module ?? operation.module,
        fieldPath: result.fieldPath,
      };
    }
    case "CREATE_CHILD":
    case "UPDATE_CHILD":
    case "DELETE_CHILD":
    case "UNCHANGED_CHILD":
    case "PRESERVE_CHILD": {
      const result = reduceChildExecutionOperation(state, operation);
      return {
        outcome: result.outcome,
        resultingState: result.resultingState,
        reason: result.reason,
        operationFamily: "CHILD",
        operationKind: result.operationKind ?? operation.kind,
        module: result.module ?? operation.module,
        stableChildKey: result.stableChildKey,
      };
    }
    case "REPLACE_MODULE": {
      const result = reduceModuleExecutionOperation(state, operation);
      return {
        outcome: result.outcome,
        resultingState: result.resultingState,
        reason: result.reason,
        operationFamily: "MODULE",
        operationKind: result.operation ?? operation.kind,
        module: result.module ?? operation.module,
      };
    }
  }
}
