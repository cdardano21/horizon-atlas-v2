import { randomUUID } from "node:crypto";
import { buildFirstTimeModuleAuthorizationManifest } from "../persistence/v31/first-time-module-authorization";
import { REQUIRED_PRESENCE_MODULES } from "../persistence/v31/load-normalized-persisted-destination-bundle";
import { interpretOperationManifest, type CanonicalDestinationInput } from "../persistence/v31/manifest";
import { buildDestinationPlan } from "../persistence/v31/plan-destination";
import {
  executeApprovedDestinationPlanWithCatalogWrite,
  planCatalogWriteOperation,
  type CatalogWriteOperation,
} from "../persistence/v31/catalog-write-contract";
import type { SqlExecutionClient } from "../persistence/v31/write-port";
import { createTransactionPersistedReadClient } from "../persistence/v31/transaction-persisted-read-client";
import { loadNormalizedPersistedDestinationBundle } from "../persistence/v31/load-normalized-persisted-destination-bundle";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../persistence/v31/materialize-stored-destination-state";
import { createSupabasePersistedDestinationReadPort } from "../persistence/v31/supabase-persisted-destination-read-port";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  DestinationId,
  DestinationPlan,
  DiffPolicy,
  ResolvedDestinationIdentity,
  StoredDestinationState,
} from "../persistence/v31/types";
import {
  type BatchDestinationPlanSource,
  type BatchDestinationResult,
  type BatchDestinationSpec,
  type ExecuteDeterministicV31BatchInput,
  type ExecuteDeterministicV31BatchResult,
} from "./execute-deterministic-v31-batch";
import { orchestrateDestinationPlanForBatchCandidate } from "./orchestrate-destination-plan-for-batch-candidate";
import { recordWritePortBatchAudit } from "./persisted-destination-write-runtime";

const DEFAULT_DIFF_POLICY: DiffPolicy = {
  updateMode: "MERGE_NONBLANK",
  normalizationVersion: "v31-normalize-1",
  diffPolicyVersion: "v31-diff-1",
};

interface CatalogResolution {
  readonly destination: BatchDestinationSpec;
  readonly identity: ResolvedDestinationIdentity;
  readonly existed: boolean;
  readonly current: {
    readonly destinationKey: string | null;
    readonly slug: string | null;
    readonly city: string | null;
    readonly country: string | null;
    readonly beachAccess: string | null;
    readonly mountainOrSkiAccess: string | null;
    readonly countryCode: string | null;
  } | null;
}

export interface ExecuteGuardedDeterministicV31BatchInput extends Omit<ExecuteDeterministicV31BatchInput, "deps"> {
  readonly deps?: {
    readonly orchestrateDestinationPlanForBatchCandidate?: typeof orchestrateDestinationPlanForBatchCandidate;
    readonly allocateDestinationId?: () => string;
    readonly recordWritePortBatchAudit?: typeof recordWritePortBatchAudit;
    readonly observePreparedPlan?: (plan: DestinationPlan, catalogOperation: CatalogWriteOperation | null) => void;
  };
}

export interface GuardedBatchDestinationResult extends BatchDestinationResult {
  readonly catalogOperationKind: CatalogWriteOperation["kind"] | null;
}

export interface ExecuteGuardedDeterministicV31BatchResult extends Omit<ExecuteDeterministicV31BatchResult, "destinationResults"> {
  readonly failurePolicy: "STOP_ON_FIRST_FAILURE";
  readonly transactionGranularity: "PER_DESTINATION";
  readonly destinationResults: readonly GuardedBatchDestinationResult[];
}

function rejection(input: ExecuteGuardedDeterministicV31BatchInput, reason: string): ExecuteGuardedDeterministicV31BatchResult {
  return {
    ok: false,
    rejectionReason: reason,
    batchRunId: input.batchRunId,
    mode: input.mode,
    approvedDestinationKeys: input.approvedDestinationKeys,
    attempted: 0,
    succeeded: 0,
    failed: 0,
    skipped: input.destinations.length,
    totalStatementsExecuted: 0,
    destinationResults: [],
    batchOutcome: "FAILED",
    failurePolicy: "STOP_ON_FIRST_FAILURE",
    transactionGranularity: "PER_DESTINATION",
  };
}

function validateInput(input: ExecuteGuardedDeterministicV31BatchInput): string | null {
  if (!input.batchRunId?.trim()) return "MISSING_BATCH_RUN_ID";
  if (!input.contractSchemaVersion?.trim()) return "MISSING_CONTRACT_SCHEMA_VERSION";
  if (input.approvedDestinationKeys.length === 0 || input.destinations.length === 0) return "EMPTY_BATCH";
  const approved = new Set(input.approvedDestinationKeys);
  if (approved.size !== input.approvedDestinationKeys.length) return "DUPLICATE_APPROVED_KEY";
  const supplied = new Set(input.destinations.map((destination) => destination.destinationKey));
  if (supplied.size !== input.destinations.length) return "DUPLICATE_DESTINATION_SPEC";
  for (const destination of input.destinations) {
    if (!approved.has(destination.destinationKey)) return `DESTINATION_OUTSIDE_APPROVED_SCOPE:${destination.destinationKey}`;
  }
  for (const key of input.approvedDestinationKeys) {
    if (!supplied.has(key)) return `APPROVED_KEY_MISSING_DESTINATION_SPEC:${key}`;
  }
  return null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

async function resolveCatalog(
  client: SqlExecutionClient,
  destination: BatchDestinationSpec,
  allocateDestinationId: () => string,
): Promise<CatalogResolution> {
  const result = await client.query(
    "select id, slug, city, country, destination_key, beach_access, mountain_or_ski_access, country_code from public.destinations_catalog where destination_key = $1 or slug = $2 limit 2",
    [destination.destinationKey, destination.bootstrapIdentity.slug],
  );
  if (result.rows.length > 1) {
    throw new Error(`CATALOG_IDENTITY_AMBIGUOUS:${destination.destinationKey}`);
  }
  const row = result.rows[0];
  if (!row) {
    return {
      destination,
      identity: {
        destinationKey: destination.destinationKey as CanonicalDestinationKey,
        destinationId: allocateDestinationId() as DestinationId,
      },
      existed: false,
      current: null,
    };
  }

  const id = nullableString(row.id);
  const currentDestinationKey = nullableString(row.destination_key);
  if (!id) throw new Error(`CATALOG_ID_MISSING:${destination.destinationKey}`);
  if (currentDestinationKey !== null && currentDestinationKey !== destination.destinationKey) {
    throw new Error(`CATALOG_SLUG_KEY_COLLISION:${destination.destinationKey}`);
  }
  return {
    destination,
    identity: {
      destinationKey: destination.destinationKey as CanonicalDestinationKey,
      destinationId: id as DestinationId,
    },
    existed: true,
    current: {
      destinationKey: currentDestinationKey,
      slug: nullableString(row.slug),
      city: nullableString(row.city),
      country: nullableString(row.country),
      beachAccess: nullableString(row.beach_access),
      mountainOrSkiAccess: nullableString(row.mountain_or_ski_access),
      countryCode: nullableString(row.country_code),
    },
  };
}

function emptyStoredState(resolution: CatalogResolution): StoredDestinationState {
  const { destination } = resolution;
  return {
    identity: {
      destinationKey: destination.destinationKey as CanonicalDestinationKey,
      slug: resolution.current?.slug ?? destination.bootstrapIdentity.slug,
      name: null,
      city: resolution.current?.city ?? destination.bootstrapIdentity.city,
      country: resolution.current?.country ?? destination.bootstrapIdentity.country,
    },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
    costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
    visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
    remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
    accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
    realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
    eventsSeasonality: [], sources: [], lifestyleFeatures: [],
  } as unknown as StoredDestinationState;
}

function asManifestCanonicalDestination(destination: BatchDestinationSpec["canonicalDestination"]): CanonicalDestinationInput {
  return {
    ...destination,
    identity: {
      ...destination.identity,
      destinationKey: destination.identity.destinationKey as CanonicalDestinationKey,
    },
  };
}

function buildFirstTimePlan(
  resolution: CatalogResolution,
  approvedScope: ApprovedDestinationScope,
  diffPolicy: DiffPolicy,
): DestinationPlan {
  const storedDestinationState = emptyStoredState(resolution);
  const manifest = buildFirstTimeModuleAuthorizationManifest(
    resolution.identity.destinationKey,
    resolution.destination.canonicalDestination,
    storedDestinationState,
  );
  const manifestInterpretation = interpretOperationManifest({
    manifest,
    canonicalDestinations: [asManifestCanonicalDestination(resolution.destination.canonicalDestination)],
    approvedScope,
  });
  const plan = buildDestinationPlan({
    resolvedDestinationIdentity: resolution.identity,
    canonicalDestination: resolution.destination.canonicalDestination,
    storedDestinationState,
    manifestInterpretation,
    diffPolicy,
    approvedScope,
  });
  return {
    ...plan,
    modulePresenceOperations: REQUIRED_PRESENCE_MODULES.map((moduleKey) => ({ kind: "INITIALIZE_MODULE", module: moduleKey })),
  };
}

async function hasExistingProfileRow(client: SqlExecutionClient, destinationId: DestinationId): Promise<boolean> {
  const result = await client.query(
    "select 1 as present from public.premium_destination_profiles where destination_id = $1 limit 1",
    [destinationId],
  );
  return result.rows.length > 0;
}

function catalogOperationFor(resolution: CatalogResolution): CatalogWriteOperation | null {
  if (!resolution.existed) {
    return planCatalogWriteOperation({
      kind: "CREATE",
      resolvedDestinationIdentity: resolution.identity,
      canonicalDestination: resolution.destination.canonicalDestination,
      bootstrap: resolution.destination.bootstrapIdentity,
    });
  }
  return planCatalogWriteOperation({
    kind: "EXISTING",
    resolvedDestinationIdentity: resolution.identity,
    canonicalDestination: resolution.destination.canonicalDestination,
    current: resolution.current!,
  });
}

async function auditDestination(
  input: ExecuteGuardedDeterministicV31BatchInput,
  destinationKey: string,
  destinationId: string,
  outcome: "SUCCESS" | "NO_OP" | "GATE_REJECTED" | "FAILED",
  statementsExecuted: number,
): Promise<{ id?: string; ok?: boolean; error?: string }> {
  if (input.mode !== "EXECUTE") return {};
  try {
    const recordAudit = input.deps?.recordWritePortBatchAudit ?? recordWritePortBatchAudit;
    const result = await recordAudit({
      workbookPath: input.workbookPath,
      workbookHash: input.workbookHash,
      contractSchemaVersion: input.contractSchemaVersion,
      mode: input.mode,
      approvedDestinationKeys: input.approvedDestinationKeys,
      destinationKeysTouched: outcome === "SUCCESS" ? [destinationKey] : [],
      scalarOperationCounts: {},
      childOperationCounts: {},
      destinationReports: [{ batchRunId: input.batchRunId, destinationKey, destinationId, outcome, statementsExecuted }],
      preExecutionSnapshot: {},
      status: outcome === "SUCCESS" || outcome === "NO_OP" ? "COMPLETED" : "FAILED",
      failureReason: outcome === "FAILED" || outcome === "GATE_REJECTED" ? outcome : null,
      executedBy: input.executedBy ?? null,
    });
    return { id: result.id, ok: result.ok, error: result.error };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function executeGuardedDeterministicV31Batch(
  input: ExecuteGuardedDeterministicV31BatchInput,
): Promise<ExecuteGuardedDeterministicV31BatchResult> {
  const invalid = validateInput(input);
  if (invalid) return rejection(input, invalid);

  const allocateDestinationId = input.deps?.allocateDestinationId ?? randomUUID;
  const orchestrateReplay = input.deps?.orchestrateDestinationPlanForBatchCandidate ?? orchestrateDestinationPlanForBatchCandidate;
  const diffPolicy = input.diffPolicy ?? DEFAULT_DIFF_POLICY;
  let resolutions: readonly CatalogResolution[];
  try {
    resolutions = await Promise.all(input.destinations.map((destination) => resolveCatalog(input.client, destination, allocateDestinationId)));
  } catch (error) {
    return rejection(input, error instanceof Error ? error.message : String(error));
  }

  const approvedScope: ApprovedDestinationScope = resolutions.map(({ identity }) => identity);
  const destinationResults: GuardedBatchDestinationResult[] = [];
  let succeeded = 0;
  let failed = 0;
  let totalStatementsExecuted = 0;

  for (const resolution of resolutions) {
    const { destination, identity } = resolution;
    let planSource: BatchDestinationPlanSource = "NOT_ATTEMPTED";
    let plan: DestinationPlan | null = null;
    let catalogOperation: CatalogWriteOperation | null = null;
    try {
      catalogOperation = catalogOperationFor(resolution);
      const hasProfile = resolution.existed && await hasExistingProfileRow(input.client, identity.destinationId);
      if (hasProfile) {
        planSource = "REPLAY_FROM_PERSISTED_STATE";
        const manifestInterpretation = interpretOperationManifest({
          manifest: { entries: [] },
          canonicalDestinations: [asManifestCanonicalDestination(destination.canonicalDestination)],
          approvedScope,
        });
        if (input.deps?.orchestrateDestinationPlanForBatchCandidate) {
          const replay = await orchestrateReplay(
            { destinationId: identity.destinationId, destinationKey: identity.destinationKey },
            { canonicalDestination: destination.canonicalDestination, manifestInterpretation, diffPolicy, approvedScope },
          );
          if (replay.status !== "PLANNED") throw new Error(`REPLAY_PLANNING_FAILED:${destination.destinationKey}:${replay.status}`);
          plan = replay.plan;
        } else {
          const persisted = await loadNormalizedPersistedDestinationBundle(
            identity,
            createSupabasePersistedDestinationReadPort(createTransactionPersistedReadClient(input.client)),
          );
          if (persisted.outcome !== "SUCCESS") throw new Error(`REPLAY_PLANNING_FAILED:${destination.destinationKey}:${persisted.failure.reason}`);
          plan = buildDestinationPlan({
            resolvedDestinationIdentity: identity,
            canonicalDestination: destination.canonicalDestination,
            storedDestinationState: materializeStoredDestinationStateFromNormalizedPersistedBundle(persisted.bundle),
            manifestInterpretation,
            diffPolicy,
            approvedScope,
          });
        }
      } else {
        planSource = "FIRST_TIME_EMPTY_STATE";
        plan = buildFirstTimePlan(resolution, approvedScope, diffPolicy);
      }
      if (plan.errors.length > 0 || plan.action === "ERROR" || plan.action === "CREATE") {
        throw new Error(`PLAN_NOT_EXECUTABLE:${destination.destinationKey}:${plan.action}:${plan.errors.length}`);
      }

      input.deps?.observePreparedPlan?.(plan, catalogOperation);

      const writeResult = await executeApprovedDestinationPlanWithCatalogWrite(input.client, {
        gateInput: {
          mode: input.mode,
          explicitlyApproveExecution: input.explicitlyApproveExecution,
          contractValid: true,
          unresolvedCount: 0,
          plan,
          approvedScope,
          batchRunId: input.batchRunId,
        },
        catalogOperation,
      });
      totalStatementsExecuted += writeResult.statementsExecuted;
      const executionSucceeded = writeResult.outcome === "SUCCESS" || writeResult.outcome === "NO_OP";
      const dryRunSucceeded = input.mode === "DRY_RUN" && writeResult.outcome === "GATE_REJECTED";
      if (executionSucceeded) succeeded += 1;
      else if (!dryRunSucceeded) failed += 1;
      const audit = await auditDestination(input, destination.destinationKey, identity.destinationId, writeResult.outcome, writeResult.statementsExecuted);
      destinationResults.push({
        destinationKey: destination.destinationKey,
        destinationId: identity.destinationId,
        bootstrapResult: resolution.existed ? "ALREADY_EXISTED" : input.mode === "DRY_RUN" ? "WOULD_CREATE" : "CREATED",
        planSource,
        planAction: plan.action,
        scalarOperationCount: plan.scalarOperations.length,
        childOperationCount: plan.childOperations.length,
        moduleExecutionOperationCount: plan.moduleExecutionOperations.length,
        writeOutcome: writeResult.outcome,
        statementsExecuted: writeResult.statementsExecuted,
        auditRecordId: audit.id,
        auditRecordOk: audit.ok,
        auditError: audit.error,
        cleanupPerformed: false,
        error: writeResult.outcome === "FAILED" ? writeResult.error : writeResult.outcome === "GATE_REJECTED" && input.mode !== "DRY_RUN" ? writeResult.gateFailure?.message : undefined,
        catalogOperationKind: catalogOperation?.kind ?? null,
      });
      if (!executionSucceeded && !dryRunSucceeded) break;
    } catch (error) {
      failed += 1;
      destinationResults.push({
        destinationKey: destination.destinationKey,
        destinationId: identity.destinationId,
        bootstrapResult: resolution.existed ? "ALREADY_EXISTED" : input.mode === "DRY_RUN" ? "WOULD_CREATE" : "NOT_ATTEMPTED",
        planSource,
        planAction: plan?.action ?? null,
        scalarOperationCount: plan?.scalarOperations.length ?? 0,
        childOperationCount: plan?.childOperations.length ?? 0,
        moduleExecutionOperationCount: plan?.moduleExecutionOperations.length ?? 0,
        writeOutcome: "FAILED",
        statementsExecuted: 0,
        cleanupPerformed: false,
        error: error instanceof Error ? error.message : String(error),
        catalogOperationKind: catalogOperation?.kind ?? null,
      });
      break;
    }
  }

  const attempted = destinationResults.length;
  const skipped = input.destinations.length - attempted;
  const batchOutcome = failed > 0 ? (succeeded > 0 ? "PARTIAL_FAILURE" : "FAILED") : "COMPLETED";
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
    failurePolicy: "STOP_ON_FIRST_FAILURE",
    transactionGranularity: "PER_DESTINATION",
  };
}
