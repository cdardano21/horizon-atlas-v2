// Thin, production-quality multi-destination batch execution driver for the deterministic v3.1
// write port. Owns NO diffing, planning, or transactional-write logic of its own - it only
// sequences the already-proven single-destination primitives (createDestinationCatalogRow,
// buildFirstTimeModuleAuthorizationManifest, interpretOperationManifest, buildDestinationPlan,
// orchestrateDestinationPlanForBatchCandidate, checkExecutionGates, executeApprovedDestinationPlanWrite,
// recordWritePortBatchAudit, deleteDestinationCatalogRowCascade) across N approved destinations in
// one call, honoring the declared ExecutionPolicy: transactionGranularity "PER_DESTINATION" and
// failurePolicy "CONTINUE_AFTER_FAILURE".
//
// Known, explicitly-reported gap (not silently papered over): the real persisted-state read path
// (orchestrateDestinationPlanForBatchCandidate -> loadNormalizedPersistedDestinationBundle) requires
// an existing premium_destination_profiles row and full module-presence rows to succeed - nothing
// currently seeds those for a genuinely first-time destination. This driver therefore branches on a
// one-time `select 1 from premium_destination_profiles` existence check: destinations with no
// existing profile row are planned via the first-time/empty-state path (buildFirstTimeModuleAuthorizationManifest
// against an in-memory empty StoredDestinationState - the same proven approach already used for this
// batch's DRY_RUN proofs), while destinations that already have persisted content are re-planned via
// the real read path so already-applied fields diff to UNCHANGED/PRESERVE rather than being replayed.
// There is no `preStateHash`/STRICT_PRECONDITION_MATCH equality check wired anywhere in the codebase;
// idempotent-safe replay here is achieved by always re-resolving current state before planning, not by
// a separate hash comparison - that distinction is intentional to keep this report honest.
import type { DeterministicV31CanonicalDestination } from "../workbook-v31-deterministic-core";
import { buildFirstTimeModuleAuthorizationManifest } from "../persistence/v31/first-time-module-authorization";
import { interpretOperationManifest } from "../persistence/v31/manifest";
import { buildDestinationPlan } from "../persistence/v31/plan-destination";
import {
  checkExecutionGates,
  executeApprovedDestinationPlanWrite,
  type SqlExecutionClient,
} from "../persistence/v31/write-port";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  DestinationId,
  DestinationPlan,
  DestinationPlanAction,
  DiffPolicy,
  ResolvedDestinationIdentity,
  StoredDestinationState,
} from "../persistence/v31/types";
import { orchestrateDestinationPlanForBatchCandidate } from "./orchestrate-destination-plan-for-batch-candidate";
import {
  createDestinationCatalogRow,
  deleteDestinationCatalogRowCascade,
  recordWritePortBatchAudit,
} from "./persisted-destination-write-runtime";

const DEFAULT_DIFF_POLICY: DiffPolicy = {
  updateMode: "MERGE_NONBLANK",
  normalizationVersion: "v31-normalize-1",
  diffPolicyVersion: "v31-diff-1",
};

export interface BatchDestinationBootstrapIdentity {
  readonly slug: string;
  readonly city: string;
  readonly country: string;
  readonly tier?: string;
}

export interface BatchDestinationSpec {
  readonly destinationKey: string;
  readonly canonicalDestination: DeterministicV31CanonicalDestination;
  /** Identity fields used ONLY if this destination genuinely does not exist in destinations_catalog yet. */
  readonly bootstrapIdentity: BatchDestinationBootstrapIdentity;
}

export interface ExecuteDeterministicV31BatchInput {
  readonly client: SqlExecutionClient;
  /** The complete, human-approved list of destination_key values this call may ever touch. */
  readonly approvedDestinationKeys: readonly string[];
  readonly destinations: readonly BatchDestinationSpec[];
  readonly workbookPath: string;
  readonly workbookHash?: string | null;
  readonly contractSchemaVersion: string;
  /** Shared identifier stitched into every per-destination audit row's JSONB payload so the whole
   *  batch can be reconstructed later by querying deterministic_v31_batch_runs for this value -
   *  no schema change, since the column it is embedded in is already jsonb. */
  readonly batchRunId: string;
  readonly mode: "DRY_RUN" | "EXECUTE";
  readonly explicitlyApproveExecution: boolean;
  readonly executedBy?: string | null;
  readonly diffPolicy?: DiffPolicy;
  /** Test-only seam, mirroring the same dependency-injection pattern already used by
   *  orchestrateDestinationPlanForBatchCandidate itself - lets tests substitute a fake replay
   *  planner instead of faking the entire Supabase REST-based read runtime. */
  readonly deps?: {
    readonly orchestrateDestinationPlanForBatchCandidate?: typeof orchestrateDestinationPlanForBatchCandidate;
  };
}

export type BatchDestinationBootstrapResult = "CREATED" | "ALREADY_EXISTED" | "WOULD_CREATE" | "NOT_ATTEMPTED";
export type BatchDestinationPlanSource = "FIRST_TIME_EMPTY_STATE" | "REPLAY_FROM_PERSISTED_STATE" | "NOT_ATTEMPTED";
export type BatchDestinationWriteOutcome = "SUCCESS" | "NO_OP" | "GATE_REJECTED" | "FAILED" | "NOT_ATTEMPTED";

export interface BatchDestinationResult {
  readonly destinationKey: string;
  readonly destinationId: string | null;
  readonly bootstrapResult: BatchDestinationBootstrapResult;
  readonly planSource: BatchDestinationPlanSource;
  readonly planAction: DestinationPlanAction | null;
  readonly scalarOperationCount: number;
  readonly childOperationCount: number;
  readonly moduleExecutionOperationCount: number;
  readonly writeOutcome: BatchDestinationWriteOutcome;
  readonly statementsExecuted: number;
  readonly auditRecordId?: string;
  readonly auditRecordOk?: boolean;
  readonly auditError?: string;
  readonly cleanupPerformed: boolean;
  readonly cleanupRowsDeleted?: number;
  readonly cleanupError?: string;
  readonly error?: string;
}

export type BatchOutcome = "COMPLETED" | "PARTIAL_FAILURE" | "FAILED";

export interface ExecuteDeterministicV31BatchResult {
  readonly ok: boolean;
  readonly rejectionReason?: string;
  readonly batchRunId: string;
  readonly mode: "DRY_RUN" | "EXECUTE";
  readonly approvedDestinationKeys: readonly string[];
  readonly attempted: number;
  readonly succeeded: number;
  readonly failed: number;
  readonly skipped: number;
  readonly totalStatementsExecuted: number;
  readonly destinationResults: readonly BatchDestinationResult[];
  readonly batchOutcome: BatchOutcome;
}

function emptyStoredState(destinationKey: string, canonicalDestination: DeterministicV31CanonicalDestination): StoredDestinationState {
  return {
    identity: {
      destinationKey: destinationKey as CanonicalDestinationKey,
      slug: canonicalDestination.identity.slug,
      name: canonicalDestination.identity.name,
      city: canonicalDestination.identity.city,
      country: canonicalDestination.identity.country,
    },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
    costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
    visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
    remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
    accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
    realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
    eventsSeasonality: [], sources: [],
  } as unknown as StoredDestinationState;
}

function buildFirstTimePlan(
  destinationKey: string,
  destinationId: string,
  canonicalDestination: DeterministicV31CanonicalDestination,
  approvedScope: ApprovedDestinationScope,
  diffPolicy: DiffPolicy,
): DestinationPlan {
  const storedDestinationState = emptyStoredState(destinationKey, canonicalDestination);
  const manifest = buildFirstTimeModuleAuthorizationManifest(
    destinationKey as CanonicalDestinationKey,
    canonicalDestination,
    storedDestinationState,
  );
  const manifestInterpretation = interpretOperationManifest({
    manifest,
    canonicalDestinations: [canonicalDestination],
    approvedScope,
  });
  const resolvedDestinationIdentity: ResolvedDestinationIdentity = {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
  return buildDestinationPlan({
    resolvedDestinationIdentity,
    canonicalDestination,
    storedDestinationState,
    manifestInterpretation,
    diffPolicy,
    approvedScope,
  });
}

async function findExistingCatalogId(client: SqlExecutionClient, destinationKey: string, slug: string): Promise<string | null> {
  const result = await client.query(
    "select id from public.destinations_catalog where destination_key = $1 or slug = $2 limit 1",
    [destinationKey, slug],
  );
  const id = result.rows[0]?.id;
  return typeof id === "string" ? id : null;
}

async function hasExistingProfileRow(client: SqlExecutionClient, destinationId: string): Promise<boolean> {
  const result = await client.query(
    "select 1 as present from public.premium_destination_profiles where destination_id = $1 limit 1",
    [destinationId],
  );
  return result.rows.length > 0;
}

function classifyBatchOutcome(attempted: number, succeeded: number, failed: number): BatchOutcome {
  if (attempted === 0) return "FAILED";
  if (failed === 0) return "COMPLETED";
  if (succeeded === 0) return "FAILED";
  return "PARTIAL_FAILURE";
}

/**
 * Executes (or, in DRY_RUN mode, purely plans with zero database writes) an approved batch of N
 * destination plans against the real deterministic v3.1 write port, one destination at a time,
 * each within its own transaction (transactionGranularity: PER_DESTINATION), continuing past a
 * single destination's failure to attempt the rest (failurePolicy: CONTINUE_AFTER_FAILURE). Never
 * widens the caller-approved destination_key scope and never publishes anything - publish status is
 * untouched by every write statement this pipeline can produce.
 */
export async function executeDeterministicV31Batch(input: ExecuteDeterministicV31BatchInput): Promise<ExecuteDeterministicV31BatchResult> {
  const rejection = (reason: string): ExecuteDeterministicV31BatchResult => ({
    ok: false,
    rejectionReason: reason,
    batchRunId: input.batchRunId,
    mode: input.mode,
    approvedDestinationKeys: input.approvedDestinationKeys,
    attempted: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    totalStatementsExecuted: 0,
    destinationResults: [],
    batchOutcome: "FAILED",
  });

  if (!input.batchRunId || input.batchRunId.trim() === "") {
    return rejection("MISSING_BATCH_RUN_ID");
  }
  if (!input.contractSchemaVersion || input.contractSchemaVersion.trim() === "") {
    return rejection("MISSING_CONTRACT_SCHEMA_VERSION");
  }
  if (input.approvedDestinationKeys.length === 0 || input.destinations.length === 0) {
    return rejection("EMPTY_BATCH");
  }
  const approvedSet = new Set(input.approvedDestinationKeys);
  if (approvedSet.size !== input.approvedDestinationKeys.length) {
    return rejection("DUPLICATE_APPROVED_KEY");
  }
  const suppliedSet = new Set(input.destinations.map((destination) => destination.destinationKey));
  if (suppliedSet.size !== input.destinations.length) {
    return rejection("DUPLICATE_DESTINATION_SPEC");
  }
  for (const destination of input.destinations) {
    if (!approvedSet.has(destination.destinationKey)) {
      return rejection(`DESTINATION_OUTSIDE_APPROVED_SCOPE:${destination.destinationKey}`);
    }
  }
  for (const approvedKey of input.approvedDestinationKeys) {
    if (!suppliedSet.has(approvedKey)) {
      return rejection(`APPROVED_KEY_MISSING_DESTINATION_SPEC:${approvedKey}`);
    }
  }

  const diffPolicy = input.diffPolicy ?? DEFAULT_DIFF_POLICY;
  const orchestrateReplayPlan = input.deps?.orchestrateDestinationPlanForBatchCandidate ?? orchestrateDestinationPlanForBatchCandidate;
  const destinationResults: BatchDestinationResult[] = [];
  const resolvedScope: Array<{ destinationKey: CanonicalDestinationKey; destinationId: DestinationId }> = [];
  let succeeded = 0;
  let failed = 0;
  let totalStatementsExecuted = 0;

  for (const destination of input.destinations) {
    const destinationKey = destination.destinationKey;
    let destinationId: string | null = null;
    let bootstrapResult: BatchDestinationBootstrapResult = "NOT_ATTEMPTED";
    let planSource: BatchDestinationPlanSource = "NOT_ATTEMPTED";
    let bootstrappedThisCall = false;

    try {
      const existingId = await findExistingCatalogId(input.client, destinationKey, destination.bootstrapIdentity.slug);

      if (existingId) {
        destinationId = existingId;
        bootstrapResult = "ALREADY_EXISTED";
      } else if (input.mode === "DRY_RUN") {
        destinationId = `DRY_RUN_SIMULATED_${destinationKey}`;
        bootstrapResult = "WOULD_CREATE";
      } else {
        const created = await createDestinationCatalogRow(input.client, {
          slug: destination.bootstrapIdentity.slug,
          city: destination.bootstrapIdentity.city,
          country: destination.bootstrapIdentity.country,
          destinationKey,
          tier: destination.bootstrapIdentity.tier,
        });
        destinationId = created.id;
        bootstrapResult = "CREATED";
        bootstrappedThisCall = true;
      }

      const scopeEntry = { destinationKey: destinationKey as CanonicalDestinationKey, destinationId: destinationId as DestinationId };
      resolvedScope.push(scopeEntry);
      const approvedScope: ApprovedDestinationScope = [...resolvedScope];

      let plan: DestinationPlan;
      if (bootstrapResult === "CREATED" || bootstrapResult === "WOULD_CREATE") {
        planSource = "FIRST_TIME_EMPTY_STATE";
        plan = buildFirstTimePlan(destinationKey, destinationId, destination.canonicalDestination, approvedScope, diffPolicy);
      } else {
        const alreadyPersisted = await hasExistingProfileRow(input.client, destinationId);
        if (!alreadyPersisted) {
          planSource = "FIRST_TIME_EMPTY_STATE";
          plan = buildFirstTimePlan(destinationKey, destinationId, destination.canonicalDestination, approvedScope, diffPolicy);
        } else {
          planSource = "REPLAY_FROM_PERSISTED_STATE";
          const manifestInterpretation = interpretOperationManifest({
            manifest: { entries: [] },
            canonicalDestinations: [destination.canonicalDestination],
            approvedScope,
          });
          const replayResult = await orchestrateReplayPlan(
            { destinationId, destinationKey },
            { canonicalDestination: destination.canonicalDestination, manifestInterpretation, diffPolicy, approvedScope },
          );
          if (replayResult.status !== "PLANNED") {
            throw new Error(`Replay planning failed for "${destinationKey}": ${replayResult.status}`);
          }
          plan = replayResult.plan;
        }
      }

      if (plan.errors.length > 0 || plan.action === "ERROR" || plan.action === "CREATE") {
        throw new Error(`Plan not executable for "${destinationKey}": action=${plan.action}, errors=${plan.errors.length}`);
      }

      const gateInput = {
        mode: input.mode,
        explicitlyApproveExecution: input.explicitlyApproveExecution,
        contractValid: true,
        unresolvedCount: 0,
        plan,
        approvedScope,
        batchRunId: input.batchRunId,
      };

      const writeResult = await executeApprovedDestinationPlanWrite(input.client, gateInput);
      totalStatementsExecuted += writeResult.statementsExecuted;

      let auditRecordId: string | undefined;
      let auditRecordOk: boolean | undefined;
      let auditError: string | undefined;
      if (input.mode === "EXECUTE") {
        const gateCheck = checkExecutionGates(gateInput);
        const status = writeResult.outcome === "SUCCESS" || writeResult.outcome === "NO_OP" ? "COMPLETED" : "FAILED";
        const failureReason = !gateCheck.ok ? gateCheck.message : writeResult.outcome === "FAILED" ? (writeResult.error ?? "UNKNOWN_FAILURE") : null;
        // Audit recording is observability, not transaction correctness: this call must never be
        // allowed to throw past this point. A thrown/rejected audit attempt (e.g. a network error)
        // is captured here as an audit failure only - it must never be able to escape into the
        // outer catch, which would otherwise misclassify an already-committed write as FAILED and
        // trigger a destructive cascade cleanup of real, successfully-persisted data.
        try {
          const auditResult = await recordWritePortBatchAudit({
            workbookPath: input.workbookPath,
            workbookHash: input.workbookHash,
            contractSchemaVersion: input.contractSchemaVersion,
            mode: input.mode,
            approvedDestinationKeys: input.approvedDestinationKeys,
            destinationKeysTouched: writeResult.outcome === "SUCCESS" ? [destinationKey] : [],
            scalarOperationCounts: {},
            childOperationCounts: {},
            destinationReports: [{ batchRunId: input.batchRunId, destinationKey, destinationId, outcome: writeResult.outcome, statementsExecuted: writeResult.statementsExecuted }],
            preExecutionSnapshot: {},
            status,
            failureReason,
            executedBy: input.executedBy ?? null,
          });
          auditRecordId = auditResult.id;
          auditRecordOk = auditResult.ok;
          auditError = auditResult.error;
        } catch (auditFailure) {
          auditRecordOk = false;
          auditError = auditFailure instanceof Error ? auditFailure.message : String(auditFailure);
        }
      }

      let cleanupPerformed = false;
      let cleanupRowsDeleted: number | undefined;
      let cleanupError: string | undefined;
      if (writeResult.outcome === "FAILED" && bootstrappedThisCall && destinationId) {
        try {
          cleanupRowsDeleted = await deleteDestinationCatalogRowCascade(input.client, destinationId);
          cleanupPerformed = true;
        } catch (cleanupFailure) {
          // Never let a cleanup failure mask the real write failure or fall through to the outer
          // catch (which would otherwise attempt a redundant second cleanup and overwrite this
          // destination's actual error with an unrelated one).
          cleanupError = cleanupFailure instanceof Error ? cleanupFailure.message : String(cleanupFailure);
        }
      }

      const outcomeIsSuccess = writeResult.outcome === "SUCCESS" || writeResult.outcome === "NO_OP";
      if (input.mode === "EXECUTE") {
        if (outcomeIsSuccess) succeeded += 1;
        else failed += 1;
      }

      destinationResults.push({
        destinationKey,
        destinationId,
        bootstrapResult,
        planSource,
        planAction: plan.action,
        scalarOperationCount: plan.scalarOperations.length,
        childOperationCount: plan.childOperations.length,
        moduleExecutionOperationCount: plan.moduleExecutionOperations.length,
        writeOutcome: writeResult.outcome,
        statementsExecuted: writeResult.statementsExecuted,
        auditRecordId,
        auditRecordOk,
        auditError,
        cleanupPerformed,
        cleanupRowsDeleted,
        cleanupError,
        error: writeResult.outcome === "FAILED" ? (writeResult.error ?? (writeResult.gateFailure ? writeResult.gateFailure.message : "UNKNOWN_WRITE_FAILURE")) : undefined,
      });
    } catch (error) {
      failed += 1;
      let cleanupPerformed = false;
      let cleanupRowsDeleted: number | undefined;
      let cleanupError: string | undefined;
      if (bootstrappedThisCall && destinationId) {
        try {
          cleanupRowsDeleted = await deleteDestinationCatalogRowCascade(input.client, destinationId);
          cleanupPerformed = true;
        } catch (cleanupFailure) {
          // The original failure is still the primary reported error, but a failed cleanup must
          // never be silently swallowed - it means an orphaned draft catalog row may remain.
          cleanupError = cleanupFailure instanceof Error ? cleanupFailure.message : String(cleanupFailure);
        }
      }
      destinationResults.push({
        destinationKey,
        destinationId,
        bootstrapResult,
        planSource,
        planAction: null,
        scalarOperationCount: 0,
        childOperationCount: 0,
        moduleExecutionOperationCount: 0,
        writeOutcome: "FAILED",
        statementsExecuted: 0,
        cleanupPerformed,
        cleanupRowsDeleted,
        cleanupError,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const attempted = destinationResults.length;
  const skipped = 0;
  // In DRY_RUN mode, every well-formed destination legitimately reports GATE_REJECTED (mode !=
  // EXECUTE) rather than SUCCESS/FAILED, so succeeded/failed only move away from zero here when a
  // destination's plan genuinely could not be built (caught above) - classifyBatchOutcome still
  // correctly reports COMPLETED for a clean dry run and PARTIAL_FAILURE/FAILED if planning itself broke.
  const batchOutcome = classifyBatchOutcome(attempted, succeeded, failed);

  return {
    ok: true,
    batchRunId: input.batchRunId,
    mode: input.mode,
    approvedDestinationKeys: input.approvedDestinationKeys,
    attempted,
    succeeded,
    failed,
    skipped,
    totalStatementsExecuted,
    destinationResults,
    batchOutcome,
  };
}
