// Reusable, parameterized deterministic v3.1 batch orchestration entrypoint.
//
// This is the single forward-facing pipeline for turning a workbook (the frozen 3-pilot
// fixture, or any future batch workbook using the same versioned contract) into a
// dry-run report, and - only with explicit approval - an execution result.
//
// It deliberately reuses the existing generic diff/plan engine in ../persistence/v31/manifest,
// ../persistence/v31/plan-destination, ../persistence/v31/plan-envelope, and
// ./orchestrate-destination-plan-for-batch-candidate rather than duplicating any of that logic.
// See the repo-root docs/v31-module-inventory.md for the module list.
//
// This file lives in app/lib/runtime/ (not app/lib/persistence/v31/) intentionally: the persistence
// engine's core is required to stay decoupled from Supabase/legacy imports (see
// app/lib/persistence/v31/__tests__/types-contract.test.ts's "keeps the import boundary free of
// protected runtime dependencies" check), while orchestration that reaches into the database
// belongs in app/lib/runtime/ alongside the other batch-candidate orchestration helpers.
//
// IMPORTANT SCOPE NOTE: there is currently no write port implementation for this engine (only a
// read port - see app/lib/persistence/v31/supabase-persisted-destination-read-port.ts and its test,
// which asserts writes are never attempted). EXECUTE mode therefore only proves the in-memory
// plan/execute reducer pipeline; it does not and cannot perform a live database write yet. That is
// a real, separate piece of remaining work, not something this entrypoint should silently paper over.
import { getSupabaseConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "../supabase";
import {
  isDeterministicV31ContractVersionSupported,
  loadFrozenWorkbookV31DeterministicImport,
  validateDeterministicV31Contract,
  type DeterministicV31CanonicalDestination,
} from "../workbook-v31-deterministic-core";
import { orchestrateDestinationPlanForBatchCandidate } from "./orchestrate-destination-plan-for-batch-candidate";
import { interpretOperationManifest } from "../persistence/v31/manifest";
import { buildPlanEnvelope, validatePlanEnvelopeForExecution } from "../persistence/v31/plan-envelope";
import { executeDestinationPlan } from "../persistence/v31/execute-destination-plan";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  DestinationId,
  DestinationPlan,
  DiffPolicy,
  ExecutionPolicy,
  OperationManifest,
  StoredDestinationState,
} from "../persistence/v31/types";

export type DeterministicBatchOrchestrationMode = "DRY_RUN" | "EXECUTE";

export interface DeterministicBatchOrchestrationInput {
  /** Defaults to the frozen 3-pilot golden fixture when omitted. */
  readonly workbookPath?: string;
  /** The destination_key values from the workbook this run is allowed to touch. Nothing outside this scope is planned. */
  readonly approvedDestinationKeys: readonly string[];
  /** Defaults to "DRY_RUN". EXECUTE additionally requires explicitlyApproveExecution: true. */
  readonly mode?: DeterministicBatchOrchestrationMode;
  readonly explicitlyApproveExecution?: boolean;
  /** Optional catalog slug to try alongside destination_key when resolving an existing destinations_catalog row. */
  readonly catalogSlugByDestinationKey?: Readonly<Record<string, string>>;
}

export interface DeterministicBatchDestinationReport {
  readonly destinationKey: string;
  readonly status: "PLANNED" | "IDENTITY_UNRESOLVED" | "DESTINATION_NOT_FOUND" | "PERSISTENCE_READ_FAILED" | "NOT_IN_WORKBOOK" | "NOT_IN_CATALOG";
  readonly action?: DestinationPlan["action"];
  readonly scalarOperationCounts: Readonly<Record<string, number>>;
  readonly childOperationCounts: Readonly<Record<string, number>>;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export interface DeterministicBatchExecutionReport {
  readonly destinationKey: string;
  readonly outcome: "SUCCESS" | "NO_OP" | "FAILED" | "NOT_ATTEMPTED";
  readonly persistedToDatabase: false;
  readonly reason: "WRITE_PORT_NOT_IMPLEMENTED";
}

export interface DeterministicBatchOrchestrationResult {
  readonly mode: DeterministicBatchOrchestrationMode;
  readonly workbookPath: string;
  readonly contractValid: boolean;
  readonly contractSchemaVersion: string;
  readonly contractValidationErrors: readonly string[];
  readonly destinationReports: readonly DeterministicBatchDestinationReport[];
  readonly executionReports: readonly DeterministicBatchExecutionReport[];
  /** Step 10 rollback evidence: the stored state immediately before any execution was attempted, per destination_key. */
  readonly preExecutionSnapshots: Readonly<Record<string, StoredDestinationState>>;
  readonly summary: {
    readonly totalApproved: number;
    readonly planned: number;
    readonly unresolved: number;
    readonly totalScalarOperations: number;
    readonly totalChildOperations: number;
  };
}

const DEFAULT_DIFF_POLICY: DiffPolicy = {
  updateMode: "MERGE_NONBLANK",
  normalizationVersion: "v31-normalize-1",
  diffPolicyVersion: "v31-diff-1",
};

const DEFAULT_EXECUTION_POLICY: ExecutionPolicy = {
  transactionGranularity: "PER_DESTINATION",
  failurePolicy: "CONTINUE_AFTER_FAILURE",
  replayPolicy: "IDEMPOTENT_REPLAY",
  stalePlanPolicy: "STRICT_PRECONDITION_MATCH",
  readBackVerification: true,
};

const EMPTY_MANIFEST: OperationManifest = { entries: [] };

async function resolveDestinationCatalogId(destinationKey: string, catalogSlug?: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  // This is an admin/import operation, not a public read path - it must be able to resolve destinations
  // regardless of their publish status (e.g. status = 'review'), so it uses the service role key rather
  // than the anon key that the public-facing runtime read path is correctly restricted to.
  const { url, anonKey } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const effectiveKey = serviceRoleKey || anonKey;

  const filters = [`destination_key.eq.${destinationKey}`];
  if (catalogSlug) {
    filters.push(`slug.eq.${catalogSlug}`);
  }

  const response = await fetch(`${url}/rest/v1/destinations_catalog?select=id,destination_key,slug&or=(${filters.join(",")})&limit=1`, {
    cache: "no-store",
    headers: {
      apikey: effectiveKey,
      Authorization: `Bearer ${effectiveKey}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{ id?: string }>;
  return rows[0]?.id ?? null;
}

function countByField<T>(items: readonly T[], field: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = field(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export async function runDeterministicV31BatchOrchestration(
  input: DeterministicBatchOrchestrationInput,
): Promise<DeterministicBatchOrchestrationResult> {
  const mode = input.mode ?? "DRY_RUN";
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(input.workbookPath);

  const metadata = workbookImport.diagnostics?.metadata ?? {};
  const sheetNames = metadata.sheetNames ? String(metadata.sheetNames).split(",") : [];
  const contractSchemaVersion = String(metadata.schema_version ?? workbookImport.contractVersion ?? "unknown");

  const contractValidationErrors = [
    ...workbookImport.validationErrors,
    ...validateDeterministicV31Contract({
      metadata: {
        schema_version: contractSchemaVersion,
        architecture: String(metadata.architecture ?? ""),
        primary_identity: String(metadata.primary_identity ?? ""),
      },
      sheetNames,
    }),
  ];

  const contractValid = contractValidationErrors.length === 0 && isDeterministicV31ContractVersionSupported(contractSchemaVersion);

  const emptyResult: DeterministicBatchOrchestrationResult = {
    mode,
    workbookPath: input.workbookPath ?? "(default frozen workbook)",
    contractValid,
    contractSchemaVersion,
    contractValidationErrors,
    destinationReports: [],
    executionReports: [],
    preExecutionSnapshots: {},
    summary: { totalApproved: input.approvedDestinationKeys.length, planned: 0, unresolved: 0, totalScalarOperations: 0, totalChildOperations: 0 },
  };

  if (!contractValid) {
    return emptyResult;
  }

  const canonicalByKey = new Map<string, DeterministicV31CanonicalDestination>(
    workbookImport.canonicalDestinations.map((destination: DeterministicV31CanonicalDestination) => [destination.identity.destinationKey, destination] as const),
  );

  const approvedScopeEntries: Array<{ destinationKey: string; destinationId: string }> = [];
  const notInWorkbook: string[] = [];
  const notInCatalog: string[] = [];

  for (const destinationKey of input.approvedDestinationKeys) {
    if (!canonicalByKey.has(destinationKey)) {
      notInWorkbook.push(destinationKey);
      continue;
    }
    const destinationId = await resolveDestinationCatalogId(destinationKey, input.catalogSlugByDestinationKey?.[destinationKey]);
    if (!destinationId) {
      notInCatalog.push(destinationKey);
      continue;
    }
    approvedScopeEntries.push({ destinationKey, destinationId });
  }

  const approvedScope: ApprovedDestinationScope = approvedScopeEntries.map((entry) => ({
    destinationKey: entry.destinationKey as CanonicalDestinationKey,
    destinationId: entry.destinationId as DestinationId,
  }));

  const destinationReports: DeterministicBatchDestinationReport[] = [
    ...notInWorkbook.map((destinationKey): DeterministicBatchDestinationReport => ({
      destinationKey,
      status: "NOT_IN_WORKBOOK",
      scalarOperationCounts: {},
      childOperationCounts: {},
      warnings: [],
      errors: [`"${destinationKey}" was not found in the parsed workbook's DESTINATIONS sheet.`],
    })),
    ...notInCatalog.map((destinationKey): DeterministicBatchDestinationReport => ({
      destinationKey,
      status: "NOT_IN_CATALOG",
      scalarOperationCounts: {},
      childOperationCounts: {},
      warnings: [],
      errors: [`"${destinationKey}" has no matching destinations_catalog row yet (creating new catalog rows is not implemented by this entrypoint).`],
    })),
  ];

  const plansByKey = new Map<string, DestinationPlan>();
  const preExecutionSnapshots: Record<string, StoredDestinationState> = {};

  for (const entry of approvedScopeEntries) {
    const canonicalDestination = canonicalByKey.get(entry.destinationKey);
    if (!canonicalDestination) continue;

    const manifestInterpretation = interpretOperationManifest({
      manifest: EMPTY_MANIFEST,
      canonicalDestinations: [{
        identity: {
          destinationKey: entry.destinationKey as CanonicalDestinationKey,
          slug: canonicalDestination.identity.slug,
          name: canonicalDestination.identity.name,
          city: canonicalDestination.identity.city,
          country: canonicalDestination.identity.country,
        },
      }],
      approvedScope,
    });

    const result = await orchestrateDestinationPlanForBatchCandidate(
      { destinationId: entry.destinationId, destinationKey: entry.destinationKey },
      {
        canonicalDestination,
        manifestInterpretation,
        diffPolicy: DEFAULT_DIFF_POLICY,
        approvedScope,
      },
    );

    if (result.status === "PLANNED") {
      plansByKey.set(entry.destinationKey, result.plan);
      preExecutionSnapshots[entry.destinationKey] = result.storedDestinationState;
      destinationReports.push({
        destinationKey: entry.destinationKey,
        status: "PLANNED",
        action: result.plan.action,
        scalarOperationCounts: countByField<(typeof result.plan.scalarOperations)[number]>(result.plan.scalarOperations, (op) => op.kind),
        childOperationCounts: countByField<(typeof result.plan.childOperations)[number]>(result.plan.childOperations, (op) => op.kind),
        warnings: result.plan.warnings,
        errors: result.plan.errors.map((error: { message: string }) => error.message),
      });
    } else {
      destinationReports.push({
        destinationKey: entry.destinationKey,
        status: result.status,
        scalarOperationCounts: {},
        childOperationCounts: {},
        warnings: [],
        errors: [result.status === "DESTINATION_NOT_FOUND" || result.status === "PERSISTENCE_READ_FAILED" ? result.failure.reason : result.reason],
      });
    }
  }

  const destinationPlans = [...plansByKey.values()];
  const planEnvelope = buildPlanEnvelope({
    executionPolicy: DEFAULT_EXECUTION_POLICY,
    approvedScope,
    contractSchemaVersion,
    status: "DRAFT",
    destinationPlans,
  });

  const totalScalarOperations = destinationPlans.reduce((sum, plan) => sum + plan.scalarOperations.length, 0);
  const totalChildOperations = destinationPlans.reduce((sum, plan) => sum + plan.childOperations.length, 0);

  const summary = {
    totalApproved: input.approvedDestinationKeys.length,
    planned: destinationPlans.length,
    unresolved: input.approvedDestinationKeys.length - destinationPlans.length,
    totalScalarOperations,
    totalChildOperations,
  };

  const executionReports: DeterministicBatchExecutionReport[] = [];

  if (mode === "EXECUTE") {
    if (!input.explicitlyApproveExecution) {
      return {
        mode,
        workbookPath: input.workbookPath ?? "(default frozen workbook)",
        contractValid,
        contractSchemaVersion,
        contractValidationErrors,
        destinationReports,
        executionReports: destinationPlans.map((plan) => ({
          destinationKey: plan.destinationIdentity.destinationKey,
          outcome: "NOT_ATTEMPTED",
          persistedToDatabase: false,
          reason: "WRITE_PORT_NOT_IMPLEMENTED",
        })),
        preExecutionSnapshots,
        summary,
      };
    }

    const approvedEnvelope = { ...planEnvelope, status: "APPROVED" as const };
    const envelopeValidation = validatePlanEnvelopeForExecution({ envelope: approvedEnvelope });

    if (envelopeValidation.valid) {
      for (const plan of destinationPlans) {
        // executeDestinationPlan only computes the in-memory resulting state and operation trace.
        // There is no write port yet, so this proves the reducer pipeline without touching the database.
        const priorState = preExecutionSnapshots[plan.destinationIdentity.destinationKey] ?? ({} as StoredDestinationState);
        executeDestinationPlan(plan, priorState);
        executionReports.push({
          destinationKey: plan.destinationIdentity.destinationKey,
          outcome: "NOT_ATTEMPTED",
          persistedToDatabase: false,
          reason: "WRITE_PORT_NOT_IMPLEMENTED",
        });
      }
    }
  }

  return {
    mode,
    workbookPath: input.workbookPath ?? "(default frozen workbook)",
    contractValid,
    contractSchemaVersion,
    contractValidationErrors,
    destinationReports,
    executionReports,
    preExecutionSnapshots,
    summary,
  };
}

export interface RecordDeterministicV31BatchRunInput {
  readonly workbookPath: string;
  readonly contractSchemaVersion: string;
  readonly mode: DeterministicBatchOrchestrationMode;
  readonly approvedDestinationKeys: readonly string[];
  readonly result: DeterministicBatchOrchestrationResult;
  readonly executedBy?: string;
}

/**
 * Step 9: append-only batch audit history. Callers (the future real batch-import entrypoint) are
 * expected to call this once after every orchestration run - dry-run or executed - so "what did
 * Batch #N change?" is always answerable later. This intentionally does not run automatically
 * inside runDeterministicV31BatchOrchestration, keeping that function's only side effects the
 * read-only lookups it needs to build a plan.
 */
export async function recordDeterministicV31BatchRun(input: RecordDeterministicV31BatchRunInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "SUPABASE_NOT_CONFIGURED" };
  }

  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    return { ok: false, error: "SERVICE_ROLE_KEY_REQUIRED" };
  }

  const scalarOperationCounts = countByField(
    input.result.destinationReports.flatMap((report) => Object.entries(report.scalarOperationCounts).map(([kind, count]) => ({ kind, count }))),
    (entry) => entry.kind,
  );
  const childOperationCounts = countByField(
    input.result.destinationReports.flatMap((report) => Object.entries(report.childOperationCounts).map(([kind, count]) => ({ kind, count }))),
    (entry) => entry.kind,
  );

  const response = await fetch(`${url}/rest/v1/deterministic_v31_batch_runs`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      workbook_path: input.workbookPath,
      contract_schema_version: input.contractSchemaVersion,
      mode: input.mode,
      approved_destination_keys: input.approvedDestinationKeys,
      destination_reports: input.result.destinationReports,
      pre_execution_snapshot: input.result.preExecutionSnapshots,
      scalar_operation_counts: scalarOperationCounts,
      child_operation_counts: childOperationCounts,
      status: "COMPLETED",
      executed_by: input.executedBy ?? null,
      completed_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return { ok: false, error: `INSERT_FAILED_${response.status}` };
  }

  const rows = (await response.json()) as Array<{ id?: string }>;
  return { ok: true, id: rows[0]?.id };
}
