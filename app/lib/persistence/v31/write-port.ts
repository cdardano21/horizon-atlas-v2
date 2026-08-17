// Deterministic v3.1 write port: translates an approved DestinationPlan (already produced by the
// existing, untouched diff/plan engine - see plan-destination.ts) into a sequence of parameterized
// SQL write statements, and executes them through an injected generic SQL client inside a single
// transaction. This file intentionally owns NO parsing, normalization, or diffing logic - it only
// knows how to turn already-computed ScalarOperation/ChildOperation entries into persistence calls.
//
// The SqlExecutionClient interface is deliberately generic (not a literal database-vendor name) so
// this file can stay inside app/lib/persistence/v31/ without crossing the import boundary enforced
// by __tests__/types-contract.test.ts ("keeps the import boundary free of protected runtime
// dependencies"). The real Postgres-backed implementation lives in app/lib/runtime/.
import type {
  ApprovedDestinationScope,
  ChildOperation,
  DestinationId,
  DestinationPlan,
  KeyedChildModuleKey,
  ScalarModuleKey,
  ScalarOperation,
} from "./types";

export interface SqlStatement {
  readonly text: string;
  readonly values: readonly unknown[];
}

export interface SqlQueryResult {
  readonly rows: readonly Record<string, unknown>[];
  readonly rowCount: number;
}

export interface SqlExecutionClient {
  readonly query: (text: string, values?: readonly unknown[]) => Promise<SqlQueryResult>;
}

export type WriteGateFailureReason =
  | "MODE_NOT_EXECUTE"
  | "EXECUTION_NOT_EXPLICITLY_APPROVED"
  | "CONTRACT_INVALID"
  | "UNRESOLVED_COUNT_NONZERO"
  | "PLAN_HAS_ERRORS"
  | "PLAN_ACTION_UNSUPPORTED"
  | "MISSING_DESTINATION_KEY"
  | "MISSING_DESTINATION_ID"
  | "DESTINATION_OUTSIDE_APPROVED_SCOPE"
  | "APPROVED_SCOPE_IDENTITY_MISMATCH"
  | "MISSING_BATCH_RUN_ID";

export interface WriteGateFailure {
  readonly ok: false;
  readonly reason: WriteGateFailureReason;
  readonly message: string;
}

export interface WriteGateSuccess {
  readonly ok: true;
}

export type WriteGateResult = WriteGateFailure | WriteGateSuccess;

export interface ExecutionGateCheckInput {
  readonly mode: "DRY_RUN" | "EXECUTE";
  readonly explicitlyApproveExecution: boolean;
  readonly contractValid: boolean;
  readonly unresolvedCount: number;
  readonly plan: DestinationPlan;
  readonly approvedScope: ApprovedDestinationScope;
  readonly batchRunId: string | null | undefined;
}

/**
 * Defense-in-depth gate: the write port refuses to perform ANY write unless every condition holds,
 * regardless of what the outer orchestrator already checked. Returns the first failing reason.
 */
export function checkExecutionGates(input: ExecutionGateCheckInput): WriteGateResult {
  if (input.mode !== "EXECUTE") {
    return { ok: false, reason: "MODE_NOT_EXECUTE", message: "Refusing to write: mode is not EXECUTE." };
  }
  if (input.explicitlyApproveExecution !== true) {
    return { ok: false, reason: "EXECUTION_NOT_EXPLICITLY_APPROVED", message: "Refusing to write: explicitlyApproveExecution was not true." };
  }
  if (input.contractValid !== true) {
    return { ok: false, reason: "CONTRACT_INVALID", message: "Refusing to write: workbook contract is not valid." };
  }
  if (input.unresolvedCount !== 0) {
    return { ok: false, reason: "UNRESOLVED_COUNT_NONZERO", message: `Refusing to write: unresolved count is ${input.unresolvedCount}, expected 0.` };
  }
  const destinationKey = input.plan.destinationIdentity.destinationKey;
  const destinationId = input.plan.destinationIdentity.destinationId;
  if (!destinationKey || String(destinationKey).trim() === "") {
    return { ok: false, reason: "MISSING_DESTINATION_KEY", message: "Refusing to write: destination_key is missing or blank." };
  }
  if (!destinationId || String(destinationId).trim() === "") {
    return { ok: false, reason: "MISSING_DESTINATION_ID", message: "Refusing to write: destination_id is missing or blank." };
  }
  if (input.plan.action === "ERROR") {
    return { ok: false, reason: "PLAN_ACTION_UNSUPPORTED", message: "Refusing to write: plan action is ERROR." };
  }
  if (input.plan.errors.length > 0) {
    return { ok: false, reason: "PLAN_HAS_ERRORS", message: "Refusing to write: plan contains execution-blocking errors." };
  }
  const scopeEntry = input.approvedScope.find((entry) => entry.destinationKey === destinationKey);
  if (!scopeEntry) {
    return { ok: false, reason: "DESTINATION_OUTSIDE_APPROVED_SCOPE", message: `Refusing to write: "${destinationKey}" is not in the approved destination scope.` };
  }
  if (scopeEntry.destinationId !== destinationId) {
    return { ok: false, reason: "APPROVED_SCOPE_IDENTITY_MISMATCH", message: "Refusing to write: destination_id does not match the approved scope entry for this destination_key." };
  }
  if (!input.batchRunId || input.batchRunId.trim() === "") {
    return { ok: false, reason: "MISSING_BATCH_RUN_ID", message: "Refusing to write: no batch/audit run id was provided." };
  }
  return { ok: true };
}

interface KeyedChildTableConfig {
  readonly table: string;
  readonly stableKeyColumn: string;
  readonly columns: Readonly<Record<string, string>>;
  readonly requiredTextColumn?: string;
}

const KEYED_CHILD_TABLE_CONFIG: Readonly<Record<KeyedChildModuleKey, KeyedChildTableConfig>> = {
  facts: { table: "premium_destination_facts", stableKeyColumn: "fact_key", columns: { factGroup: "fact_type", valueText: "body", displayLabel: "title", sourceName: "source_ref" } },
  scores: { table: "premium_destination_scores", stableKeyColumn: "score_key", columns: { scoreValue: "score_value", scoreLabel: "score_name" } },
  neighborhoods: { table: "premium_neighborhoods", stableKeyColumn: "neighborhood_key", columns: { name: "neighborhood_name", summary: "summary", areaType: "area_type" }, requiredTextColumn: "neighborhood_name" },
  places: { table: "premium_places", stableKeyColumn: "place_key", columns: { category: "category_key", name: "place_name", description: "description" }, requiredTextColumn: "place_name" },
  resources: { table: "premium_resources", stableKeyColumn: "resource_key", columns: { category: "resource_category", name: "resource_name", url: "url" }, requiredTextColumn: "resource_name" },
  media: { table: "premium_media", stableKeyColumn: "media_key", columns: { kind: "media_type", url: "url", caption: "caption", altText: "alt_text" } },
  propertyResources: { table: "premium_property_resources", stableKeyColumn: "record_key", columns: { category: "resource_type", name: "resource_name", url: "url" } },
  moveChecklist: { table: "premium_move_checklist", stableKeyColumn: "checklist_key", columns: { summary: "summary", checklistNotes: "checklist_notes" } },
  eventsSeasonality: { table: "premium_events_seasonality", stableKeyColumn: "event_seasonality_key", columns: { summary: "summary", seasonalityNotes: "seasonality_notes" } },
  sources: { table: "premium_sources", stableKeyColumn: "source_key", columns: { name: "source_name", url: "source_url", type: "source_type" }, requiredTextColumn: "source_name" },
};

interface SingletonTableConfig {
  readonly table: string;
  readonly columns: Readonly<Record<string, string>>;
  /** Must exactly match the table's actual unique constraint column list. */
  readonly conflictColumns: readonly string[];
}

const SINGLETON_TABLE_CONFIG: Readonly<Record<"environmentQuality" | "dailyLifePracticality", SingletonTableConfig>> = {
  environmentQuality: { table: "premium_environment_quality", columns: { summary: "summary", qualityNotes: "quality_notes" }, conflictColumns: ["destination_id"] },
  dailyLifePracticality: { table: "premium_daily_life_practicality", columns: { summary: "summary", practicalityNotes: "practicality_notes" }, conflictColumns: ["destination_id"] },
};

const EDITORIAL_TABLE_CONFIG: SingletonTableConfig = {
  table: "premium_destination_profiles",
  columns: { shortDescription: "summary", longDescription: "overview", currency: "currency", primaryLanguage: "primary_language", timeZone: "time_zone" },
  conflictColumns: ["destination_id", "destination_key"],
};

function readChildField(child: Record<string, unknown>, storedField: string): unknown {
  return child[storedField] ?? null;
}

function buildKeyedChildStatements(
  destinationId: DestinationId,
  destinationKey: string,
  operations: readonly ChildOperation[],
): SqlStatement[] {
  const statements: SqlStatement[] = [];
  const modulesTouchedByCreate = new Set<KeyedChildModuleKey>();

  for (const operation of operations) {
    const config = KEYED_CHILD_TABLE_CONFIG[operation.module];

    if (operation.kind === "CREATE_CHILD" || operation.kind === "UPDATE_CHILD") {
      modulesTouchedByCreate.add(operation.module);
      const child = operation.incomingChild as unknown as Record<string, unknown>;
      const columnEntries = Object.entries(config.columns);
      const columnNames = columnEntries.map(([, dbColumn]) => dbColumn);
      const columnValues = columnEntries.map(([storedField]) => readChildField(child, storedField));

      const allColumns = ["destination_id", "destination_key", config.stableKeyColumn, ...columnNames];
      const allValues: unknown[] = [destinationId, destinationKey, operation.stableChildKey, ...columnValues];
      const placeholders = allValues.map((_, index) => `$${index + 1}`);
      const updateAssignments = columnNames.map((columnName) => `${columnName} = excluded.${columnName}`);

      statements.push({
        text: `insert into public.${config.table} (${allColumns.join(", ")}) values (${placeholders.join(", ")}) ` +
          `on conflict (destination_id, destination_key, ${config.stableKeyColumn}) do update set ${updateAssignments.join(", ")}, updated_at = now()`,
        values: allValues,
      });
      continue;
    }

    if (operation.kind === "DELETE_CHILD") {
      statements.push({
        text: `delete from public.${config.table} where destination_id = $1 and destination_key = $2 and ${config.stableKeyColumn} = $3`,
        values: [destinationId, destinationKey, operation.stableChildKey],
      });
      continue;
    }

    // PRESERVE_CHILD / UNCHANGED_CHILD: no SQL - omission never causes a destructive write.
  }

  for (const module of modulesTouchedByCreate) {
    statements.push({
      text: "insert into public.premium_destination_module_presence (destination_id, destination_key, module_key) values ($1, $2, $3) on conflict (destination_id, module_key) do nothing",
      values: [destinationId, destinationKey, module],
    });
  }

  return statements;
}

function buildScalarStatementsForModule(
  destinationId: DestinationId,
  destinationKey: string,
  module: ScalarModuleKey,
  operations: readonly ScalarOperation[],
): SqlStatement | null {
  const config: SingletonTableConfig = module === "editorial" ? EDITORIAL_TABLE_CONFIG : SINGLETON_TABLE_CONFIG[module];
  const writableOps = operations.filter((op) => op.kind === "CREATE" || op.kind === "UPDATE" || op.kind === "CLEAR");
  if (writableOps.length === 0) {
    return null;
  }

  const setColumns: string[] = [];
  const values: unknown[] = [destinationId, destinationKey];

  for (const op of writableOps) {
    const dbColumn = config.columns[op.fieldPath];
    if (!dbColumn) {
      continue;
    }
    const value = op.kind === "CLEAR" ? null : op.incomingValue;
    values.push(value);
    setColumns.push(`${dbColumn} = $${values.length}`);
  }

  if (setColumns.length === 0) {
    return null;
  }

  const insertColumns = ["destination_id", "destination_key"];
  const insertPlaceholders = ["$1", "$2"];
  // Every SET column must also appear in the INSERT values list (same parameter positions reused).
  const columnToParamIndex = new Map<string, number>();
  let paramCursor = 2;
  for (const op of writableOps) {
    const dbColumn = config.columns[op.fieldPath];
    if (!dbColumn || columnToParamIndex.has(dbColumn)) continue;
    paramCursor += 1;
    columnToParamIndex.set(dbColumn, paramCursor);
  }
  for (const [dbColumn, paramIndex] of columnToParamIndex) {
    insertColumns.push(dbColumn);
    insertPlaceholders.push(`$${paramIndex}`);
  }

  return {
    text: `insert into public.${config.table} (${insertColumns.join(", ")}) values (${insertPlaceholders.join(", ")}) ` +
      `on conflict (${config.conflictColumns.join(", ")}) do update set ${setColumns.join(", ")}, updated_at = now()`,
    values,
  };
}

function groupBy<T, K>(items: readonly T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

/**
 * Pure translation: given an already-planned DestinationPlan, produce the ordered list of
 * parameterized SQL statements needed to persist it. Does not execute anything and does not
 * inspect execution gates - callers must call checkExecutionGates first.
 */
export function buildDestinationPlanWriteStatements(plan: DestinationPlan): readonly SqlStatement[] {
  const destinationId = plan.destinationIdentity.destinationId;
  const destinationKey = String(plan.destinationIdentity.destinationKey);
  const statements: SqlStatement[] = [];

  const scalarByModule = groupBy(plan.scalarOperations, (op) => op.module);
  for (const [module, operations] of scalarByModule) {
    const statement = buildScalarStatementsForModule(destinationId, destinationKey, module, operations);
    if (statement) {
      statements.push(statement);
    }
  }

  statements.push(...buildKeyedChildStatements(destinationId, destinationKey, plan.childOperations));

  return statements;
}

export interface WritePlanResult {
  readonly outcome: "SUCCESS" | "NO_OP" | "GATE_REJECTED" | "FAILED";
  readonly statementsExecuted: number;
  readonly gateFailure?: WriteGateFailure;
  readonly error?: string;
}

/**
 * Executes an approved plan's write statements inside a single transaction via the injected
 * generic SQL client. Zero writes occur if any execution gate fails.
 */
export async function executeApprovedDestinationPlanWrite(
  client: SqlExecutionClient,
  input: ExecutionGateCheckInput,
): Promise<WritePlanResult> {
  const gateResult = checkExecutionGates(input);
  if (!gateResult.ok) {
    return { outcome: "GATE_REJECTED", statementsExecuted: 0, gateFailure: gateResult };
  }

  const statements = buildDestinationPlanWriteStatements(input.plan);
  if (statements.length === 0) {
    return { outcome: "NO_OP", statementsExecuted: 0 };
  }

  await client.query("BEGIN");
  try {
    for (const statement of statements) {
      await client.query(statement.text, statement.values);
    }
    await client.query("COMMIT");
    return { outcome: "SUCCESS", statementsExecuted: statements.length };
  } catch (error) {
    await client.query("ROLLBACK");
    return { outcome: "FAILED", statementsExecuted: 0, error: error instanceof Error ? error.message : String(error) };
  }
}
