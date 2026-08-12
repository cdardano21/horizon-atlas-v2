import { executeDestinationPlan } from "./execute-destination-plan";
import { validatePlanEnvelopeForExecution } from "./plan-envelope";
import type { CanonicalDestinationKey, DestinationPlan, PlanEnvelope, ResolvedDestinationIdentity, StoredDestinationState } from "./types";
import type { ExecutionFailureReason, PersistenceError } from "./errors";
import type { DestinationExecutionResult } from "./execute-destination-plan";

export type PlanEnvelopeExecutionOutcome = "SUCCESS" | "NO_OP" | "FAILED";

export interface PlanEnvelopeDestinationExecutionEntry {
  readonly destinationIdentity: ResolvedDestinationIdentity;
  readonly outcome: PlanEnvelopeExecutionOutcome;
  readonly result?: DestinationExecutionResult;
  readonly failureReason?: ExecutionFailureReason;
}

export interface PlanEnvelopeExecutionResult {
  readonly outcome: PlanEnvelopeExecutionOutcome;
  readonly destinationResults: readonly PlanEnvelopeDestinationExecutionEntry[];
  readonly preflightErrors: readonly PersistenceError[];
}

function classifyOutcome(destinationResults: readonly PlanEnvelopeDestinationExecutionEntry[]): PlanEnvelopeExecutionOutcome {
  if (destinationResults.length === 0) {
    return "NO_OP";
  }

  if (destinationResults.some((entry) => entry.outcome === "FAILED")) {
    return "FAILED";
  }

  if (destinationResults.some((entry) => entry.outcome === "SUCCESS")) {
    return "SUCCESS";
  }

  return "NO_OP";
}

function buildMissingStartingStateEntry(plan: DestinationPlan): PlanEnvelopeDestinationExecutionEntry {
  return {
    destinationIdentity: plan.destinationIdentity,
    outcome: "FAILED",
    failureReason: "MISSING_STARTING_STATE",
  };
}

export function executePlanEnvelope(
  envelope: PlanEnvelope,
  startingStates: ReadonlyMap<CanonicalDestinationKey, StoredDestinationState>,
): PlanEnvelopeExecutionResult {
  const preflightResult = validatePlanEnvelopeForExecution({ envelope });
  if (!preflightResult.valid) {
    return {
      outcome: "FAILED",
      destinationResults: [],
      preflightErrors: preflightResult.errors,
    };
  }

  const destinationResults: PlanEnvelopeDestinationExecutionEntry[] = [];

  for (const plan of envelope.destinationPlans) {
    const startingState = startingStates.get(plan.destinationIdentity.destinationKey);
    if (startingState === undefined) {
      destinationResults.push(buildMissingStartingStateEntry(plan));
      continue;
    }

    const result = executeDestinationPlan(plan, startingState);
    destinationResults.push({
      destinationIdentity: plan.destinationIdentity,
      outcome: result.outcome === "SUCCESS" ? "SUCCESS" : result.outcome === "NO_OP" ? "NO_OP" : "FAILED",
      result,
      failureReason: result.failure?.reason,
    });
  }

  return {
    outcome: classifyOutcome(destinationResults),
    destinationResults,
    preflightErrors: [],
  };
}
