// Real Postgres-backed wiring for the deterministic v3.1 write port. This is the ONLY file that
// talks to an actual database connection for writes - app/lib/persistence/v31/write-port.ts stays
// pure and injectable so it can be unit-tested with a fake SqlExecutionClient.
//
// Uses a direct Postgres connection (SUPABASE_DB_URL) rather than the PostgREST/anon-key HTTP API
// because only a real Postgres connection can provide genuine multi-statement transaction
// atomicity (BEGIN/COMMIT/ROLLBACK) across the many premium_* tables a single destination plan
// touches. This mirrors the pattern already used for one-off migration/audit scripts this session.
import { Client } from "pg";
import { isSupabaseConfigured, getSupabaseConfig, getSupabaseServiceRoleKey } from "../supabase";
import { checkExecutionGates, executeApprovedDestinationPlanWrite } from "../persistence/v31/write-port";
import type { ExecutionGateCheckInput, SqlExecutionClient, SqlQueryResult, WritePlanResult } from "../persistence/v31/write-port";

// Referencing isSupabaseConfigured purely to trigger the shared .env.local loading side effect
// that module performs on import, keeping env-loading behavior consistent across the codebase.
void isSupabaseConfigured;

export interface PostgresWriteConnection {
  readonly client: SqlExecutionClient;
  readonly close: () => Promise<void>;
}

export async function connectDestinationWriteClient(): Promise<PostgresWriteConnection> {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("SUPABASE_DB_URL is not set - cannot open a direct Postgres write connection.");
  }

  const pgClient = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  const client: SqlExecutionClient = {
    async query(text: string, values?: readonly unknown[]): Promise<SqlQueryResult> {
      const result = await pgClient.query(text, values ? [...values] : undefined);
      return { rows: result.rows as Record<string, unknown>[], rowCount: result.rowCount ?? 0 };
    },
  };

  return {
    client,
    close: () => pgClient.end(),
  };
}

export interface CreateDestinationCatalogRowInput {
  readonly slug: string;
  readonly city: string;
  readonly country: string;
  readonly destinationKey: string;
  readonly tier?: string;
}

/**
 * Bootstraps a brand-new destinations_catalog row - the generic entrypoint for ANY net-new
 * destination, real (a future Expansion Batch destination) or synthetic (a disposable test
 * destination). This is intentionally separate from the existing plan/diff engine, which requires
 * an already-resolved destinationId and does not create catalog rows (see resolveDestinationCatalogId's
 * "creating new catalog rows is not implemented by this entrypoint" comment in
 * orchestrate-deterministic-batch.ts). Explicitly refuses to proceed if a row with the same slug or
 * destination_key already exists, so it can never silently collide with real data. There is no
 * destination-specific logic here - the caller supplies whatever identity fields a real or
 * synthetic destination needs.
 */
export async function createDestinationCatalogRow(
  client: SqlExecutionClient,
  input: CreateDestinationCatalogRowInput,
): Promise<{ id: string }> {
  const existing = await client.query(
    "select id, slug, destination_key from public.destinations_catalog where slug = $1 or destination_key = $2",
    [input.slug, input.destinationKey],
  );
  if (existing.rows.length > 0) {
    throw new Error(
      `Refusing to create catalog row: slug "${input.slug}" or destination_key "${input.destinationKey}" already exists (${JSON.stringify(existing.rows)}).`,
    );
  }

  const inserted = await client.query(
    "insert into public.destinations_catalog (slug, city, country, destination_key, tier, status) values ($1, $2, $3, $4, $5, 'draft') returning id",
    [input.slug, input.city, input.country, input.destinationKey, input.tier ?? "launch"],
  );
  const id = inserted.rows[0]?.id;
  if (typeof id !== "string") {
    throw new Error("Catalog row insert did not return an id.");
  }
  return { id };
}

/**
 * Deletes a destination's catalog row. Every premium_* table has
 * `destination_id ... references destinations_catalog(id) on delete cascade`, so this single
 * statement removes all of that destination's premium module rows atomically as well.
 */
export async function deleteDestinationCatalogRowCascade(client: SqlExecutionClient, destinationId: string): Promise<number> {
  const result = await client.query("delete from public.destinations_catalog where id = $1", [destinationId]);
  return result.rowCount;
}

export interface WritePortBatchAuditInput {
  readonly workbookPath: string;
  readonly workbookHash?: string | null;
  readonly contractSchemaVersion: string;
  readonly mode: "DRY_RUN" | "EXECUTE";
  readonly approvedDestinationKeys: readonly string[];
  readonly destinationKeysTouched: readonly string[];
  readonly scalarOperationCounts: Readonly<Record<string, number>>;
  readonly childOperationCounts: Readonly<Record<string, number>>;
  readonly destinationReports: unknown;
  readonly preExecutionSnapshot: unknown;
  readonly status: "COMPLETED" | "FAILED";
  readonly failureReason?: string | null;
  readonly executedBy?: string | null;
}

/**
 * Records one append-only row in the existing deterministic_v31_batch_runs audit table (the same
 * table recordDeterministicV31BatchRun in orchestrate-deterministic-batch.ts writes to). This is a
 * separate, small poster rather than a call into that function directly, because that function's
 * input shape is batch/multi-destination-report-oriented (built for the read-only orchestrator),
 * while the write port operates one destination-plan at a time with its own result shape - reusing
 * the table/infrastructure without forcing an awkward shape adapter onto either side.
 */
export async function recordWritePortBatchAudit(input: WritePortBatchAuditInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "SUPABASE_NOT_CONFIGURED" };
  }
  const { url } = getSupabaseConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    return { ok: false, error: "SERVICE_ROLE_KEY_REQUIRED" };
  }

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
      workbook_hash: input.workbookHash ?? null,
      contract_schema_version: input.contractSchemaVersion,
      mode: input.mode,
      approved_destination_keys: input.approvedDestinationKeys,
      destination_reports: input.destinationReports,
      pre_execution_snapshot: input.preExecutionSnapshot,
      scalar_operation_counts: input.scalarOperationCounts,
      child_operation_counts: input.childOperationCounts,
      status: input.status,
      failure_reason: input.failureReason ?? null,
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

function countOperationsByKind(operations: readonly { readonly kind: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const operation of operations) {
    counts[operation.kind] = (counts[operation.kind] ?? 0) + 1;
  }
  return counts;
}

export interface ExecuteWithAuditContext {
  readonly workbookPath: string;
  readonly workbookHash?: string | null;
  readonly contractSchemaVersion: string;
  readonly executedBy?: string | null;
}

export type WritePlanResultWithAudit = WritePlanResult & {
  readonly auditRecordId?: string;
  readonly auditRecordOk: boolean;
  readonly auditError?: string;
};

/**
 * The one entrypoint real batch-execute callers should use: runs the same execution gates and
 * transactional write as executeApprovedDestinationPlanWrite, then ALWAYS records a durable audit
 * row afterward - for DRY_RUN attempts, gate rejections, execution failures, and successes alike -
 * so a successful write can never complete without durable evidence, and a DRY_RUN or failed
 * attempt is never recorded as a misleading success.
 */
export async function executeApprovedDestinationPlanWriteWithAudit(
  client: SqlExecutionClient,
  gateInput: ExecutionGateCheckInput,
  auditContext: ExecuteWithAuditContext,
): Promise<WritePlanResultWithAudit> {
  const result = await executeApprovedDestinationPlanWrite(client, gateInput);
  const destinationKey = String(gateInput.plan.destinationIdentity.destinationKey);
  const gateCheck = checkExecutionGates(gateInput);
  const status: "COMPLETED" | "FAILED" = result.outcome === "SUCCESS" || result.outcome === "NO_OP" ? "COMPLETED" : "FAILED";
  const failureReason = !gateCheck.ok ? gateCheck.message : result.outcome === "FAILED" ? (result.error ?? "UNKNOWN_FAILURE") : null;

  const auditResult = await recordWritePortBatchAudit({
    workbookPath: auditContext.workbookPath,
    workbookHash: auditContext.workbookHash,
    contractSchemaVersion: auditContext.contractSchemaVersion,
    mode: gateInput.mode,
    approvedDestinationKeys: gateInput.approvedScope.map((entry) => String(entry.destinationKey)),
    destinationKeysTouched: result.outcome === "SUCCESS" ? [destinationKey] : [],
    scalarOperationCounts: countOperationsByKind(gateInput.plan.scalarOperations),
    childOperationCounts: countOperationsByKind(gateInput.plan.childOperations),
    destinationReports: [{ destinationKey, outcome: result.outcome, statementsExecuted: result.statementsExecuted }],
    preExecutionSnapshot: {},
    status,
    failureReason,
    executedBy: auditContext.executedBy ?? null,
  });

  return { ...result, auditRecordId: auditResult.id, auditRecordOk: auditResult.ok, auditError: auditResult.error };
}
