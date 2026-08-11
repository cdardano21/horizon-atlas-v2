import type { PersistenceError } from "./errors";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationPlan, ExecutionPolicy, PlanEnvelope, PlanStatus, ValidationResult } from "./types";

export interface BuildPlanEnvelopeInput {
  readonly planId?: string | null;
  readonly planHash?: string | null;
  readonly workbookHash?: string | null;
  readonly contractSchemaVersion?: string | null;
  readonly normalizationVersion?: string | null;
  readonly diffPolicyVersion?: string | null;
  readonly operationManifestHash?: string | null;
  readonly executionPolicy: ExecutionPolicy;
  readonly approvedScope: ApprovedDestinationScope;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly approvedAt?: string | null;
  readonly approvedBy?: string | null;
  readonly expiresAt?: string | null;
  readonly status?: PlanStatus | null;
  readonly destinationPlans: readonly DestinationPlan[];
}

export interface ValidatePlanEnvelopeForExecutionInput {
  readonly envelope: PlanEnvelope;
  readonly expectedContractSchemaVersion?: string | null;
  readonly expectedNormalizationVersion?: string | null;
  readonly expectedDiffPolicyVersion?: string | null;
}

function makeError(kind: PersistenceError["kind"], message: string, extra: Record<string, unknown>): PersistenceError {
  return { kind, message, ...extra } as PersistenceError;
}

function sortDestinationPlans(destinationPlans: readonly DestinationPlan[]): readonly DestinationPlan[] {
  return [...destinationPlans].sort((left, right) => {
    const leftKey = `${left.destinationIdentity.destinationKey}:${left.destinationIdentity.destinationId}`;
    const rightKey = `${right.destinationIdentity.destinationKey}:${right.destinationIdentity.destinationId}`;
    return leftKey.localeCompare(rightKey);
  });
}

function cloneApprovedScope(approvedScope: ApprovedDestinationScope): ApprovedDestinationScope {
  return approvedScope.map((entry) => ({ ...entry }));
}

function cloneDestinationPlans(destinationPlans: readonly DestinationPlan[]): readonly DestinationPlan[] {
  return destinationPlans.map((plan) => ({
    ...plan,
    destinationIdentity: { ...plan.destinationIdentity },
    scalarOperations: [...plan.scalarOperations],
    childOperations: [...plan.childOperations],
    warnings: [...plan.warnings],
    errors: [...plan.errors],
  }));
}

export function buildPlanEnvelope(input: BuildPlanEnvelopeInput): PlanEnvelope {
  const approvedScope = cloneApprovedScope(input.approvedScope);
  const destinationPlans = sortDestinationPlans(cloneDestinationPlans(input.destinationPlans));
  const status = input.status ?? "DRAFT";
  const planHash = input.planHash ?? null;
  const envelope: PlanEnvelope = {
    planId: input.planId ?? null,
    planHash,
    workbookHash: input.workbookHash ?? null,
    contractSchemaVersion: input.contractSchemaVersion ?? null,
    normalizationVersion: input.normalizationVersion ?? null,
    diffPolicyVersion: input.diffPolicyVersion ?? null,
    operationManifestHash: input.operationManifestHash ?? null,
    executionPolicy: input.executionPolicy,
    approvedScope,
    createdAt: input.createdAt ?? null,
    createdBy: input.createdBy ?? null,
    approvedAt: input.approvedAt ?? null,
    approvedBy: input.approvedBy ?? null,
    expiresAt: input.expiresAt ?? null,
    status,
    destinationPlans,
  };

  return Object.freeze(envelope);
}

export function validatePlanEnvelopeForExecution(input: ValidatePlanEnvelopeForExecutionInput): ValidationResult {
  const errors: PersistenceError[] = [];
  const warnings: string[] = [];
  const envelope = input.envelope;
  const approvedScopeLookup = new Map(envelope.approvedScope.map((entry) => [entry.destinationKey, entry.destinationId]));
  const seenDestinationKeys = new Set<CanonicalDestinationKey>();
  const seenDestinationIds = new Map<string, CanonicalDestinationKey>();

  if (envelope.status !== "APPROVED") {
    errors.push(makeError("PLAN_EXECUTION_PRECHECK_FAILED", "Plan envelope is not approved for execution", { planStatus: envelope.status, reason: "INVALID_STATUS" }));
  }

  if (input.expectedContractSchemaVersion !== undefined && envelope.contractSchemaVersion !== input.expectedContractSchemaVersion) {
    errors.push(makeError("SCHEMA_VERSION_MISMATCH", "Contract schema version does not match the expected version", { expectedVersion: input.expectedContractSchemaVersion, receivedVersion: envelope.contractSchemaVersion ?? "" }));
  }

  if (input.expectedNormalizationVersion !== undefined && envelope.normalizationVersion !== input.expectedNormalizationVersion) {
    errors.push(makeError("NORMALIZATION_VERSION_MISMATCH", "Normalization version does not match the expected version", { expectedVersion: input.expectedNormalizationVersion, receivedVersion: envelope.normalizationVersion ?? "" }));
  }

  if (input.expectedDiffPolicyVersion !== undefined && envelope.diffPolicyVersion !== input.expectedDiffPolicyVersion) {
    errors.push(makeError("DIFF_POLICY_VERSION_MISMATCH", "Diff policy version does not match the expected version", { expectedVersion: input.expectedDiffPolicyVersion, receivedVersion: envelope.diffPolicyVersion ?? "" }));
  }

  for (const plan of envelope.destinationPlans) {
    const destinationKey = plan.destinationIdentity.destinationKey;
    const destinationId = plan.destinationIdentity.destinationId;
    const approvedDestinationId = approvedScopeLookup.get(destinationKey);

    if (approvedDestinationId === undefined) {
      errors.push(makeError("OUT_OF_SCOPE_DESTINATION", "Destination plan is outside the approved scope", { destinationKey }));
      continue;
    }

    if (approvedDestinationId !== destinationId) {
      errors.push(makeError("PLAN_IDENTITY_CONFLICT", "Destination plan identity does not match the approved scope", { destinationKey, destinationId, reason: "SCOPE_DESTINATION_ID_MISMATCH" }));
    }

    if (seenDestinationKeys.has(destinationKey)) {
      errors.push(makeError("PLAN_IDENTITY_CONFLICT", "Duplicate destination plan identity", { destinationKey, destinationId, reason: "DUPLICATE_DESTINATION_KEY" }));
    } else {
      seenDestinationKeys.add(destinationKey);
    }

    const existingDestinationKey = seenDestinationIds.get(destinationId);
    if (existingDestinationKey !== undefined && existingDestinationKey !== destinationKey) {
      errors.push(makeError("PLAN_IDENTITY_CONFLICT", "Duplicate destination plan identity", { destinationKey, destinationId, reason: "DUPLICATE_DESTINATION_ID" }));
    } else if (existingDestinationKey === undefined) {
      seenDestinationIds.set(destinationId, destinationKey);
    }

    if (plan.action === "CREATE" || plan.action === "ERROR") {
      errors.push(makeError("PLAN_EXECUTION_PRECHECK_FAILED", "Plan action is not supported by execution preflight", { destinationKey, planAction: plan.action, reason: "UNSUPPORTED_ACTION" }));
    }

    if (plan.errors.length > 0) {
      errors.push(makeError("PLAN_EXECUTION_PRECHECK_FAILED", "Destination plan contains execution-blocking errors", { destinationKey, planAction: plan.action, reason: "PLAN_HAS_ERRORS" }));
      errors.push(...plan.errors);
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}
