import { reduceExecutionOperationDispatcher } from "./reduce-execution-operation-dispatch";
import type { UnifiedExecutionReducerResult } from "./reduce-execution-operation-dispatch";
import type { DestinationPlan, StoredDestinationState } from "./types";
import type { ExecutionFailureReason } from "./errors";

export type DestinationExecutionOutcome = "SUCCESS" | "NO_OP" | "FAILED";
type OperationFamily = UnifiedExecutionReducerResult["operationFamily"];

export interface DestinationExecutionResult {
  readonly outcome: DestinationExecutionOutcome;
  readonly resultingState: StoredDestinationState;
  readonly failure?: {
    readonly reason: ExecutionFailureReason;
    readonly operationFamily?: OperationFamily;
    readonly module?: string;
    readonly fieldPath?: string;
    readonly stableChildKey?: string;
  };
}

export function executeDestinationPlan(plan: DestinationPlan, startingState: StoredDestinationState): DestinationExecutionResult {
  if (plan.action === "UNCHANGED" || plan.action === "UPDATE") {
    if (plan.scalarOperations.length === 0 && plan.childOperations.length === 0 && plan.moduleExecutionOperations.length === 0) {
      return { outcome: "NO_OP", resultingState: startingState };
    }

    let currentState = startingState;
    let hasAppliedAnyOperation = false;

    for (const operation of plan.scalarOperations) {
      const result = reduceExecutionOperationDispatcher(currentState, operation);
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
        failure: {
          reason: result.reason ?? "UNSUPPORTED_DESTINATION_ACTION",
          operationFamily: result.operationFamily,
          module: result.module,
        },
      };
    }

    return hasAppliedAnyOperation ? { outcome: "SUCCESS", resultingState: currentState } : { outcome: "NO_OP", resultingState: startingState };
  }

  return {
    outcome: "FAILED",
    resultingState: startingState,
    failure: {
      reason: "UNSUPPORTED_DESTINATION_ACTION",
    },
  };
}
