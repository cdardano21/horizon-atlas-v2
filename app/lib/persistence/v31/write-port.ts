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
  ModuleExecutionOperation,
  ReplaceModuleExecutionModuleKey,
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
  if (input.plan.action === "ERROR" || input.plan.action === "CREATE") {
    // Real plans never carry action "CREATE" - buildDestinationPlan only ever emits UNCHANGED,
    // UPDATE, or ERROR. A destination that doesn't exist yet is bootstrapped by creating its
    // destinations_catalog row BEFORE planning, so the resulting plan targets an existing row and
    // arrives here as UPDATE. Rejecting a hand-written action="CREATE" plan keeps this gate aligned
    // with validatePlanEnvelopeForExecution, which rejects the same action for the same reason -
    // there is exactly one authority on this, not two disagreeing ones.
    return { ok: false, reason: "PLAN_ACTION_UNSUPPORTED", message: `Refusing to write: plan action is ${input.plan.action}.` };
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
  /** Must exactly match the table's actual unique constraint column list - most keyed-child
   *  tables are unique on (destination_id, destination_key, <stableKeyColumn>), but
   *  premium_move_checklist and premium_events_seasonality are only unique on
   *  (destination_id, <stableKeyColumn>) (confirmed directly against live pg_constraint), so this
   *  is per-module config rather than a hardcoded assumption. */
  readonly conflictColumns: readonly string[];
}

const KEYED_CHILD_TABLE_CONFIG: Readonly<Record<KeyedChildModuleKey, KeyedChildTableConfig>> = {
  facts: { table: "premium_destination_facts", stableKeyColumn: "fact_key", columns: { factGroup: "fact_type", valueText: "body", displayLabel: "title", sourceName: "source_ref" }, conflictColumns: ["destination_id", "destination_key", "fact_key"] },
  scores: { table: "premium_destination_scores", stableKeyColumn: "score_key", columns: { scoreValue: "score_value", scoreLabel: "score_name" }, conflictColumns: ["destination_id", "destination_key", "score_key"] },
  neighborhoods: { table: "premium_neighborhoods", stableKeyColumn: "neighborhood_key", columns: { name: "neighborhood_name", summary: "summary", areaType: "area_type" }, requiredTextColumn: "neighborhood_name", conflictColumns: ["destination_id", "destination_key", "neighborhood_key"] },
  places: { table: "premium_places", stableKeyColumn: "place_key", columns: { category: "category_key", name: "place_name", description: "description" }, requiredTextColumn: "place_name", conflictColumns: ["destination_id", "destination_key", "place_key"] },
  resources: { table: "premium_resources", stableKeyColumn: "resource_key", columns: { category: "resource_category", name: "resource_name", url: "url" }, requiredTextColumn: "resource_name", conflictColumns: ["destination_id", "destination_key", "resource_key"] },
  media: { table: "premium_media", stableKeyColumn: "media_key", columns: { kind: "media_type", url: "url", caption: "caption", altText: "alt_text" }, conflictColumns: ["destination_id", "destination_key", "media_key"] },
  propertyResources: { table: "premium_property_resources", stableKeyColumn: "record_key", columns: { category: "resource_type", name: "resource_name", url: "url" }, conflictColumns: ["destination_id", "destination_key", "record_key"] },
  moveChecklist: { table: "premium_move_checklist", stableKeyColumn: "checklist_key", columns: { summary: "summary", checklistNotes: "checklist_notes" }, conflictColumns: ["destination_id", "checklist_key"] },
  eventsSeasonality: { table: "premium_events_seasonality", stableKeyColumn: "event_seasonality_key", columns: { summary: "summary", seasonalityNotes: "seasonality_notes" }, conflictColumns: ["destination_id", "event_seasonality_key"] },
  sources: { table: "premium_sources", stableKeyColumn: "source_key", columns: { name: "source_name", url: "source_url", type: "source_type" }, requiredTextColumn: "source_name", conflictColumns: ["destination_id", "destination_key", "source_key"] },
};

// Real canonical destination objects (parsed directly from a workbook) only carry the sheet's raw
// snake_case column names for keyed-child payload fields - only facts/scores get an explicit
// camelCase alias added during parsing (see the matching comment in plan-destination.ts's
// buildChildOperations, which already applies this exact fallback for stable-key extraction only).
// This map extends the same defensive fallback to the rest of each child's payload fields, so the
// write port never inserts a null into a column the DB requires NOT NULL just because the upstream
// canonical object used its raw workbook column name instead of a stored-shape alias.
const KEYED_CHILD_CANONICAL_FALLBACK_FIELD: Readonly<Record<KeyedChildModuleKey, Readonly<Record<string, string>>>> = {
  facts: {},
  scores: {},
  neighborhoods: { name: "neighborhood_name", areaType: "area_type" },
  places: { category: "category_key", name: "place_name" },
  resources: { category: "resource_category", name: "resource_name" },
  media: { kind: "media_type", url: "image_url", altText: "subject" },
  propertyResources: { category: "resource_type", name: "resource_name" },
  moveChecklist: { summary: "task", checklistNotes: "description" },
  eventsSeasonality: { summary: "description", seasonalityNotes: "weather_context" },
  sources: { name: "source_name", url: "source_url", type: "source_type" },
};

interface SingletonTableConfig {
  readonly table: string;
  readonly columns: Readonly<Record<string, string>>;
  /** Must exactly match the table's actual unique constraint column list. */
  readonly conflictColumns: readonly string[];
  /** Whether a successful write of this module must also produce the same durable
   *  premium_destination_module_presence row every keyed-child/REPLACE_MODULE write already
   *  produces (see REQUIRED_PRESENCE_MODULES in load-normalized-persisted-destination-bundle.ts).
   *  Editorial is the destination's root profile row (validated separately via validateProfile,
   *  not via presence) and is intentionally NOT in REQUIRED_PRESENCE_MODULES, so it stays false. */
  readonly requiresPresence: boolean;
}

const SINGLETON_TABLE_CONFIG: Readonly<Record<"environmentQuality" | "dailyLifePracticality", SingletonTableConfig>> = {
  environmentQuality: { table: "premium_environment_quality", columns: { summary: "summary", qualityNotes: "quality_notes" }, conflictColumns: ["destination_id"], requiresPresence: true },
  dailyLifePracticality: { table: "premium_daily_life_practicality", columns: { summary: "summary", practicalityNotes: "practicality_notes" }, conflictColumns: ["destination_id"], requiresPresence: true },
};

const EDITORIAL_TABLE_CONFIG: SingletonTableConfig = {
  table: "premium_destination_profiles",
  columns: { shortDescription: "summary", longDescription: "overview", currency: "currency", primaryLanguage: "primary_language", timeZone: "time_zone" },
  conflictColumns: ["destination_id", "destination_key"],
  requiresPresence: false,
};

interface ReplaceModuleTableConfig {
  readonly table: string;
  /** How each row's per-destination-unique identity column is generated, since these modules
   *  carry no stable key from the canonical/stored layer (that absence is exactly why they are
   *  REPLACE_MODULE rather than keyed-diff modules in the first place). */
  readonly keyStrategy: "record_key" | "position";
  readonly columns: Readonly<Record<string, string>>;
}

// Two real DB key-column shapes cover all 20 non-keyed modules (verified directly against the
// tracked premium-module storage migrations' table definitions):
// - "record_key" tables: unique(destination_id, destination_key, record_key)
// - "position" tables: unique(destination_id, position), position >= 1
const REPLACE_MODULE_TABLE_CONFIG: Readonly<Record<ReplaceModuleExecutionModuleKey, ReplaceModuleTableConfig>> = {
  costOfLiving: { table: "premium_cost_of_living", keyStrategy: "record_key", columns: { category: "category", monthlyLow: "monthly_low", monthlyHigh: "monthly_high", currency: "currency" } },
  climateMonthly: { table: "premium_climate_monthly", keyStrategy: "record_key", columns: { monthKey: "month_key", avgHighTemp: "avg_high_temp", avgLowTemp: "avg_low_temp", precipitationMm: "precipitation_mm", humidityPct: "humidity_pct" } },
  housing: { table: "premium_housing_property", keyStrategy: "record_key", columns: { summary: "restrictions_summary", buyingSummary: "buying_process_summary", rentalSummary: "rental_rules_notes" } },
  healthcare: { table: "premium_healthcare_insurance", keyStrategy: "record_key", columns: { summary: "system_summary", publicAccessSummary: "public_access_foreigners", insuranceSummary: "international_insurance_notes" } },
  visaResidency: { table: "premium_visa_residency", keyStrategy: "record_key", columns: { summary: "visa_type", residencyPath: "permanent_residency_path", citizenshipPath: "citizenship_path" } },
  taxesFinance: { table: "premium_taxes_finance", keyStrategy: "record_key", columns: { summary: "summary", notes: "notes" } },
  safetyRisks: { table: "premium_safety_risks", keyStrategy: "record_key", columns: { topic: "topic", severity: "severity", summary: "summary" } },
  transportation: { table: "premium_transport_airports", keyStrategy: "record_key", columns: { summary: "summary", airportSummary: "name", transitSummary: "public_transit_available" } },
  remoteWork: { table: "premium_connectivity_remote_work", keyStrategy: "record_key", columns: { summary: "remote_work_notes", internetSummary: "avg_download_mbps", timezoneSummary: "us_time_zone_fit" } },
  realityCheck: { table: "premium_reality_check", keyStrategy: "record_key", columns: { title: "title", detail: "detail", severity: "severity" } },
  lgbtqInclusivity: { table: "premium_lgbtq_inclusivity", keyStrategy: "position", columns: { summary: "summary", culturalNotes: "cultural_notes" } },
  languageIntegration: { table: "premium_language_integration", keyStrategy: "position", columns: { summary: "summary", englishSupport: "english_support" } },
  pets: { table: "premium_pets", keyStrategy: "position", columns: { summary: "summary", petFriendlyNotes: "pet_friendly_notes" } },
  familyEducation: { table: "premium_family_education", keyStrategy: "position", columns: { summary: "summary", schoolsSummary: "schools_summary" } },
  communitySocial: { table: "premium_community_social", keyStrategy: "position", columns: { summary: "summary", socialNotes: "social_notes" } },
  accessibility: { table: "premium_accessibility", keyStrategy: "position", columns: { summary: "summary", mobilityNotes: "mobility_notes" } },
  bureaucracySetup: { table: "premium_bureaucracy_setup", keyStrategy: "position", columns: { summary: "summary", setupNotes: "setup_notes" } },
  workBusiness: { table: "premium_work_business", keyStrategy: "position", columns: { summary: "summary", remoteWorkNotes: "remote_work_notes" } },
  retirementAging: { table: "premium_retirement_aging", keyStrategy: "position", columns: { summary: "summary", agingNotes: "aging_notes" } },
  lifestyleLaws: { table: "premium_lifestyle_laws", keyStrategy: "position", columns: { summary: "summary", legalNotes: "legal_notes" } },
};

function buildReplaceModuleStatements(
  destinationId: DestinationId,
  destinationKey: string,
  operations: readonly ModuleExecutionOperation[],
): SqlStatement[] {
  const statements: SqlStatement[] = [];

  for (const operation of operations) {
    const config = REPLACE_MODULE_TABLE_CONFIG[operation.module];
    if (!config) {
      continue;
    }

    // Narrowest correct REPLACE_MODULE behavior: this operation is only ever present when an
    // explicit manifest REPLACE_MODULE entry authorized it, so an atomic delete-then-reinsert of
    // the whole array is exactly what was approved - never a silent per-row merge.
    statements.push({
      text: `delete from public.${config.table} where destination_id = $1 and destination_key = $2`,
      values: [destinationId, destinationKey],
    });

    const rows = operation.expectedAfter as readonly unknown[];
    rows.forEach((row, index) => {
      const record = row as Record<string, unknown>;
      const columnEntries = Object.entries(config.columns);
      const columnNames = columnEntries.map(([, dbColumn]) => dbColumn);
      const columnValues = columnEntries.map(([storedField]) => record[storedField] ?? null);
      const keyColumnName = config.keyStrategy === "record_key" ? "record_key" : "position";
      const keyColumnValue: unknown = config.keyStrategy === "record_key" ? `record-${index + 1}` : index + 1;

      const allColumns = ["destination_id", "destination_key", keyColumnName, ...columnNames];
      const allValues: unknown[] = [destinationId, destinationKey, keyColumnValue, ...columnValues];
      const placeholders = allValues.map((_, valueIndex) => `$${valueIndex + 1}`);

      statements.push({
        text: `insert into public.${config.table} (${allColumns.join(", ")}) values (${placeholders.join(", ")})`,
        values: allValues,
      });
    });

    if (rows.length > 0) {
      statements.push({
        text: "insert into public.premium_destination_module_presence (destination_id, destination_key, module_key) values ($1, $2, $3) on conflict (destination_id, module_key) do nothing",
        values: [destinationId, destinationKey, operation.module],
      });
    }
  }

  return statements;
}

/**
 * Builds the `on conflict (...)` target list for a keyed-child upsert from that module's
 * per-module conflictColumns config. Throws rather than silently emitting an empty/invalid
 * `on conflict ()` clause, which Postgres would otherwise reject anyway - fails loudly and early
 * instead of producing unsafe SQL.
 */
export function buildKeyedChildConflictTarget(module: string, conflictColumns: readonly string[]): string {
  if (conflictColumns.length === 0) {
    throw new Error(`Keyed-child module "${module}" has an empty conflictColumns config - refusing to generate an unsafe ON CONFLICT target.`);
  }
  return conflictColumns.join(", ");
}

function readChildField(child: Record<string, unknown>, storedField: string, module: KeyedChildModuleKey): unknown {
  const directValue = child[storedField];
  if (directValue !== undefined && directValue !== null) {
    return directValue;
  }
  const fallbackField = KEYED_CHILD_CANONICAL_FALLBACK_FIELD[module][storedField];
  if (fallbackField) {
    return child[fallbackField] ?? null;
  }
  return directValue ?? null;
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
      const columnValues = columnEntries.map(([storedField]) => readChildField(child, storedField, operation.module));

      const conflictTarget = buildKeyedChildConflictTarget(operation.module, config.conflictColumns);
      const allColumns = ["destination_id", "destination_key", config.stableKeyColumn, ...columnNames];
      const allValues: unknown[] = [destinationId, destinationKey, operation.stableChildKey, ...columnValues];
      const placeholders = allValues.map((_, index) => `$${index + 1}`);
      const updateAssignments = columnNames.map((columnName) => `${columnName} = excluded.${columnName}`);

      statements.push({
        text: `insert into public.${config.table} (${allColumns.join(", ")}) values (${placeholders.join(", ")}) ` +
          `on conflict (${conflictTarget}) do update set ${updateAssignments.join(", ")}, updated_at = now()`,
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

/**
 * The single authoritative current v3.1 persisted profile storage version. Owned here (the write
 * port) rather than scattered as a literal - the reader (load-normalized-persisted-destination-bundle.ts)
 * imports this same constant for its equality check instead of hardcoding "1" a second time.
 */
export const CURRENT_V31_PROFILE_STORAGE_VERSION = 1;

function buildScalarStatementsForModule(
  destinationId: DestinationId,
  destinationKey: string,
  module: ScalarModuleKey,
  operations: readonly ScalarOperation[],
): readonly SqlStatement[] {
  const config: SingletonTableConfig = module === "editorial" ? EDITORIAL_TABLE_CONFIG : SINGLETON_TABLE_CONFIG[module];
  const writableOps = operations.filter((op) => op.kind === "CREATE" || op.kind === "UPDATE" || op.kind === "CLEAR");
  if (writableOps.length === 0) {
    return [];
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
    return [];
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

  // Stamp the write-time schema version on the destination's root profile row whenever it is
  // touched. Forward-safe: GREATEST(...) means an older writer can never downgrade a row a newer
  // process has already advanced past CURRENT_V31_PROFILE_STORAGE_VERSION - it can only hold or
  // raise the stored value, never lower it.
  if (module === "editorial") {
    paramCursor += 1;
    values.push(CURRENT_V31_PROFILE_STORAGE_VERSION);
    insertColumns.push("profile_storage_version");
    insertPlaceholders.push(`$${paramCursor}`);
    setColumns.push(`profile_storage_version = greatest(coalesce(${config.table}.profile_storage_version, 0), excluded.profile_storage_version)`);
  }

  const statements: SqlStatement[] = [{
    text: `insert into public.${config.table} (${insertColumns.join(", ")}) values (${insertPlaceholders.join(", ")}) ` +
      `on conflict (${config.conflictColumns.join(", ")}) do update set ${setColumns.join(", ")}, updated_at = now()`,
    values,
  }];

  // Required-presence modules (STEP 3): a successful singleton content write must produce the
  // exact same durable presence row the keyed-child and REPLACE_MODULE write paths already
  // produce for their modules - "on conflict do nothing" keeps replay idempotent, never duplicating.
  if (config.requiresPresence) {
    statements.push({
      text: "insert into public.premium_destination_module_presence (destination_id, destination_key, module_key) values ($1, $2, $3) on conflict (destination_id, module_key) do nothing",
      values: [destinationId, destinationKey, module],
    });
  }

  return statements;
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
    statements.push(...buildScalarStatementsForModule(destinationId, destinationKey, module, operations));
  }

  statements.push(...buildKeyedChildStatements(destinationId, destinationKey, plan.childOperations));
  statements.push(...buildReplaceModuleStatements(destinationId, destinationKey, plan.moduleExecutionOperations));

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
