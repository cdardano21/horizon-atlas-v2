import { createHash } from "node:crypto";
import { chmod, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

import { executeApprovedDestinationPlanWithCatalogWrite, type CatalogWriteOperation } from "../app/lib/persistence/v31/catalog-write-contract";
import { projectStoredComparable } from "../app/lib/persistence/v31/comparable-projection";
import { loadNormalizedPersistedDestinationBundle } from "../app/lib/persistence/v31/load-normalized-persisted-destination-bundle";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../app/lib/persistence/v31/materialize-stored-destination-state";
import { buildPlanEnvelope, validatePlanEnvelopeForExecution } from "../app/lib/persistence/v31/plan-envelope";
import { createSupabasePersistedDestinationReadPort } from "../app/lib/persistence/v31/supabase-persisted-destination-read-port";
import { createTransactionPersistedReadClient } from "../app/lib/persistence/v31/transaction-persisted-read-client";
import type { ApprovedDestinationScope, DestinationPlan, PlanEnvelope, ResolvedDestinationIdentity } from "../app/lib/persistence/v31/types";
import type { SqlExecutionClient } from "../app/lib/persistence/v31/write-port";

const ROOT = process.cwd();
const PREFLIGHT_PATH = "tmp/legacy-carryover-batch-20-02-premium-replacement-preflight-20260908T100046146Z/preflight.json";
const PREFLIGHT_SHA256 = "0f92ccc5e123a771658cf4ffd67d63225bc486e36c815039512178947025160a";
const WORKBOOK_SHA256 = "015209686a8a68c20c32288498be40b88802268cc967a4ef71fbaa143b9d2a3a";
const RECOVERY_SHA256 = "842bb019124a49bff70738b847574876dcf72572e6880108a3b18479b757aee8";
const AUTHORIZED_EXPIRES_AT = "2026-09-09T10:01:03.085Z";
const OPERATOR = "Samuel Curt Dardano";
const RESULT_PATH = path.join(path.dirname(path.resolve(ROOT, PREFLIGHT_PATH)), "execution-result.json");

type Json = Record<string, unknown>;
type ScopeRow = {
  destinationId: string;
  destinationKey: string;
  slug: string;
  city: string;
  country: string;
  status: string | null;
  currentDestinationKey: string | null;
  beachAccess: string | null;
  mountainOrSkiAccess: string | null;
  countryCode: string | null;
};
type ExactnessRow = {
  destinationKey: string;
  currentComparableSha256: string;
  desiredComparableSha256: string;
  expectedComparableSha256: string;
  exact: boolean;
  catalogOperation: CatalogWriteOperation | null;
};
type StoredPreflight = {
  status: string;
  verdict: string;
  blockingReasons: readonly unknown[];
  targetEnvironment: string;
  expiresAt: string;
  workbook: { path: string; sha256: string };
  recoverySnapshot: { path: string; sha256: string };
  approvedDestinationKeys: readonly string[];
  approvedScope: readonly ScopeRow[];
  discoveredTables: readonly string[];
  outsideScope: Json;
  manifest: { sha256: string };
  operationCounts: { totalPlannedSqlStatements: number };
  exactExpectedPostState: readonly ExactnessRow[];
  planEnvelope: PlanEnvelope;
  safety: {
    eventualTransactionBoundary: string;
    atomicRollbackOnAnyMismatch: boolean;
  };
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stable(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => [key, stable(child)]));
  }
  return value;
}

function stableString(value: unknown): string {
  return JSON.stringify(stable(value));
}

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function fileSha256(filePath: string): Promise<string> {
  return sha256(await readFile(filePath));
}

async function databaseUrl(): Promise<string> {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const contents = await readFile(path.join(ROOT, ".env.local"), "utf8");
  const match = contents.match(/^SUPABASE_DB_URL=(.+)$/m);
  assert(match, "SUPABASE_DB_URL_NOT_CONFIGURED");
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function serializedClient(raw: Client): SqlExecutionClient {
  let queue = Promise.resolve();
  return {
    query: async (text, values) => {
      const query = queue.then(async () => {
        const result = await raw.query(text, values ? [...values] : undefined);
        return { rows: result.rows, rowCount: result.rowCount ?? 0 };
      });
      queue = query.then(() => undefined, () => undefined);
      return query;
    },
  };
}

function atomicClient(raw: Client): { client: SqlExecutionClient; state: { begins: number; commits: number; rollbackRequested: boolean } } {
  let queue = Promise.resolve();
  const state = { begins: 0, commits: 0, rollbackRequested: false };
  const client: SqlExecutionClient = {
    query: async (text, values) => {
      const query = queue.then(async () => {
        const command = text.trim().toUpperCase();
        if (command === "BEGIN") {
          state.begins += 1;
          return { rows: [], rowCount: 0 };
        }
        if (command === "COMMIT") {
          state.commits += 1;
          return { rows: [], rowCount: 0 };
        }
        if (command === "ROLLBACK") {
          state.rollbackRequested = true;
          throw new Error("INNER_ROLLBACK_REQUESTED");
        }
        const result = await raw.query(text, values ? [...values] : undefined);
        return { rows: result.rows, rowCount: result.rowCount ?? 0 };
      });
      queue = query.then(() => undefined, () => undefined);
      return query;
    },
  };
  return { client, state };
}

async function resolveScope(raw: Client, keys: readonly string[]): Promise<ScopeRow[]> {
  const rows: ScopeRow[] = [];
  for (const destinationKey of keys) {
    const result = await raw.query("select id, destination_key, slug, city, country, status, beach_access, mountain_or_ski_access, country_code from public.destinations_catalog where destination_key = $1 limit 2", [destinationKey]);
    assert(result.rows.length === 1, `DATABASE_IDENTITY_COUNT:${destinationKey}:${result.rows.length}`);
    const row = result.rows[0];
    rows.push({
      destinationId: String(row.id), destinationKey, slug: String(row.slug), city: String(row.city), country: String(row.country),
      status: row.status == null ? null : String(row.status), currentDestinationKey: row.destination_key == null ? null : String(row.destination_key),
      beachAccess: row.beach_access == null ? null : String(row.beach_access), mountainOrSkiAccess: row.mountain_or_ski_access == null ? null : String(row.mountain_or_ski_access),
      countryCode: row.country_code == null ? null : String(row.country_code),
    });
  }
  return rows;
}

async function discoverTables(raw: Client): Promise<string[]> {
  const result = await raw.query("select distinct c.table_name from information_schema.columns c join information_schema.tables t on t.table_schema=c.table_schema and t.table_name=c.table_name where c.table_schema='public' and c.column_name='destination_id' and t.table_type='BASE TABLE' and c.table_name like 'premium_%' order by c.table_name");
  return result.rows.map((row) => String(row.table_name));
}

function safeTable(table: string): string {
  assert(/^[a-z][a-z0-9_]*$/.test(table), `UNSAFE_TABLE_NAME:${table}`);
  return `"${table}"`;
}

function normalizeRows(rows: readonly Json[]): Json[] {
  return rows.map((row) => stable(row) as Json).sort((left, right) => stableString(left).localeCompare(stableString(right)));
}

async function captureOutsideScope(raw: Client, tables: readonly string[], ids: readonly string[]): Promise<Json> {
  const output: Json = {};
  const catalog = normalizeRows((await raw.query("select * from public.destinations_catalog where not (id = any($1::uuid[])) order by id", [ids])).rows as Json[]);
  output.destinations_catalog = { rowCount: catalog.length, sha256: sha256(stableString(catalog)) };
  for (const table of tables) {
    const rows = normalizeRows((await raw.query(`select * from public.${safeTable(table)} where destination_id is null or not (destination_id = any($1::uuid[])) order by destination_id, id`, [ids])).rows as Json[]);
    output[table] = { rowCount: rows.length, sha256: sha256(stableString(rows)) };
  }
  const audit = normalizeRows((await raw.query("select * from public.deterministic_v31_batch_runs order by id")).rows as Json[]);
  output.deterministic_v31_batch_runs = { rowCount: audit.length, sha256: sha256(stableString(audit)) };
  return output;
}

async function loadStored(raw: Client, identity: ResolvedDestinationIdentity) {
  const readClient = createTransactionPersistedReadClient(serializedClient(raw));
  const result = await loadNormalizedPersistedDestinationBundle(identity, createSupabasePersistedDestinationReadPort(readClient));
  assert(result.outcome === "SUCCESS", `PERSISTED_READ_FAILED:${identity.destinationKey}:${result.outcome === "FAILED" ? result.failure.reason : "UNKNOWN"}`);
  return materializeStoredDestinationStateFromNormalizedPersistedBundle(result.bundle);
}

function expectedWithCatalog(plan: DestinationPlan, catalog: CatalogWriteOperation | null) {
  if (!catalog || catalog.kind !== "UPDATE_EXISTING_CATALOG") return plan.expectedComparablePostState;
  const identity = plan.expectedComparablePostState.identity as Record<string, unknown>;
  return {
    ...plan.expectedComparablePostState,
    identity: {
      ...identity, slug: catalog.slug, name: catalog.city, city: catalog.city, country: catalog.country,
      beachAccess: catalog.beachAccess, mountainOrSkiAccess: catalog.mountainOrSkiAccess, countryCode: catalog.countryCode,
    },
  };
}

function differencePaths(left: unknown, right: unknown, prefix = ""): string[] {
  if (stableString(left) === stableString(right)) return [];
  if (Array.isArray(left) && Array.isArray(right)) {
    return Array.from({ length: Math.max(left.length, right.length) }, (_, index) => differencePaths(left[index], right[index], `${prefix}[${index}]`)).flat();
  }
  if (left && right && typeof left === "object" && typeof right === "object") {
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    return keys.flatMap((key) => differencePaths((left as Json)[key], (right as Json)[key], prefix ? `${prefix}.${key}` : key));
  }
  return [prefix || "$"];
}

function valueAtPath(value: unknown, fieldPath: string): unknown {
  return fieldPath.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Json)[key] : undefined, value);
}

async function verifyReadback(raw: Client, preflight: StoredPreflight): Promise<Json[]> {
  const output: Json[] = [];
  for (const plan of preflight.planEnvelope.destinationPlans) {
    const destinationKey = String(plan.destinationIdentity.destinationKey);
    const exactness = preflight.exactExpectedPostState.find((row) => row.destinationKey === destinationKey);
    assert(exactness, `EXACTNESS_ROW_MISSING:${destinationKey}`);
    const stored = await loadStored(raw, plan.destinationIdentity);
    const actual = projectStoredComparable(stored);
    const expected = expectedWithCatalog(plan, exactness.catalogOperation);
    const actualHash = sha256(stableString(actual));
    const mismatchedPaths = differencePaths(actual, expected);
    const mismatchValues = Object.fromEntries(mismatchedPaths.map((fieldPath) => [fieldPath, { actual: valueAtPath(actual, fieldPath), expected: valueAtPath(expected, fieldPath) }]));
    assert(stableString(actual) === stableString(expected), `NORMALIZED_READBACK_MISMATCH:${destinationKey}:${stableString(mismatchValues)}`);
    assert(actualHash === exactness.desiredComparableSha256, `AUTHORITATIVE_HASH_MISMATCH:${destinationKey}`);
    output.push({ destinationKey, destinationId: plan.destinationIdentity.destinationId, comparableSha256: actualHash, lifestyleRows: stored.lifestyleFeatures.length });
  }
  return output;
}

async function verifyPreState(raw: Client, preflight: StoredPreflight): Promise<void> {
  for (const plan of preflight.planEnvelope.destinationPlans) {
    const destinationKey = String(plan.destinationIdentity.destinationKey);
    const exactness = preflight.exactExpectedPostState.find((row) => row.destinationKey === destinationKey);
    assert(exactness, `EXACTNESS_ROW_MISSING:${destinationKey}`);
    const stored = await loadStored(raw, plan.destinationIdentity);
    const currentHash = sha256(stableString(projectStoredComparable(stored)));
    assert(currentHash === exactness.currentComparableSha256, `SCOPED_STATE_DRIFT:${destinationKey}`);
  }
}

async function main(): Promise<void> {
  assert(process.env.LEGACY_CARRYOVER_20_02_PREMIUM_EXECUTION_AUTHORIZED === "true", "EXPLICIT_EXECUTION_AUTHORIZATION_ENV_MISSING");
  assert(Date.now() < Date.parse(AUTHORIZED_EXPIRES_AT), "AUTHORIZATION_EXPIRED");
  const preflightBytes = await readFile(path.resolve(ROOT, PREFLIGHT_PATH));
  assert(sha256(preflightBytes) === PREFLIGHT_SHA256, "PREFLIGHT_SHA256_MISMATCH");
  const preflight = JSON.parse(preflightBytes.toString("utf8")) as StoredPreflight;
  assert(preflight.status === "VERDICT_A_READY_AWAITING_EXPLICIT_AUTHORIZATION" && preflight.verdict === "A" && preflight.blockingReasons.length === 0, "PREFLIGHT_NOT_EXECUTABLE");
  assert(preflight.targetEnvironment === "private-supabase" && preflight.expiresAt === AUTHORIZED_EXPIRES_AT, "AUTHORIZATION_BINDING_MISMATCH");
  assert(preflight.workbook.sha256 === WORKBOOK_SHA256 && await fileSha256(path.resolve(ROOT, preflight.workbook.path)) === WORKBOOK_SHA256, "WORKBOOK_SHA256_MISMATCH");
  assert(preflight.recoverySnapshot.sha256 === RECOVERY_SHA256 && await fileSha256(path.resolve(ROOT, preflight.recoverySnapshot.path)) === RECOVERY_SHA256, "RECOVERY_SHA256_MISMATCH");
  assert(preflight.safety.eventualTransactionBoundary === "ONE_OUTER_TRANSACTION_FOR_ALL_20" && preflight.safety.atomicRollbackOnAnyMismatch, "ATOMIC_EXECUTION_POLICY_MISMATCH");
  assert(preflight.approvedDestinationKeys.length === 20 && preflight.planEnvelope.destinationPlans.length === 20, "APPROVED_SCOPE_COUNT_MISMATCH");
  assert(preflight.exactExpectedPostState.every((row) => row.exact && row.expectedComparableSha256 === row.desiredComparableSha256), "PREFLIGHT_EXACTNESS_INVALID");

  const approvedScope = preflight.planEnvelope.approvedScope as ApprovedDestinationScope;
  const approvedEnvelope = buildPlanEnvelope({
    ...preflight.planEnvelope,
    planHash: sha256(stableString(preflight.planEnvelope.destinationPlans)),
    approvedAt: new Date().toISOString(), approvedBy: OPERATOR, status: "APPROVED",
  });
  const envelopeValidation = validatePlanEnvelopeForExecution({ envelope: approvedEnvelope, expectedContractSchemaVersion: "3.3", expectedNormalizationVersion: "v31-normalize-1", expectedDiffPolicyVersion: "v31-diff-1" });
  assert(envelopeValidation.valid, `PLAN_ENVELOPE_REJECTED:${stableString(envelopeValidation.errors)}`);

  const raw = new Client({ connectionString: await databaseUrl(), ssl: { rejectUnauthorized: false } });
  await raw.connect();
  let committed = false;
  try {
    await raw.query("begin");
    const scopeBefore = await resolveScope(raw, preflight.approvedDestinationKeys);
    assert(stableString(scopeBefore) === stableString(preflight.approvedScope), "DATABASE_SCOPE_OR_STATUS_DRIFT");
    const tables = await discoverTables(raw);
    assert(stableString(["destinations_catalog", ...tables, "deterministic_v31_batch_runs"]) === stableString(preflight.discoveredTables), "DISCOVERED_TABLE_SET_DRIFT");
    const ids = scopeBefore.map((row) => row.destinationId);
    const outsideBefore = await captureOutsideScope(raw, tables, ids);
    assert(stableString(outsideBefore) === stableString(preflight.outsideScope), "OUTSIDE_SCOPE_CHANGED_SINCE_PREFLIGHT");
    await verifyPreState(raw, preflight);

    const atomic = atomicClient(raw);
    let statementsExecuted = 0;
    const destinationResults: Json[] = [];
    for (const plan of preflight.planEnvelope.destinationPlans) {
      const destinationKey = String(plan.destinationIdentity.destinationKey);
      const exactness = preflight.exactExpectedPostState.find((row) => row.destinationKey === destinationKey);
      assert(exactness, `EXACTNESS_ROW_MISSING:${destinationKey}`);
      const result = await executeApprovedDestinationPlanWithCatalogWrite(atomic.client, {
        gateInput: { mode: "EXECUTE", explicitlyApproveExecution: true, contractValid: true, unresolvedCount: 0, plan, approvedScope, batchRunId: `legacy-carryover-batch-20-02-premium-replacement:${PREFLIGHT_SHA256}` },
        catalogOperation: exactness.catalogOperation,
      });
      assert(result.outcome === "SUCCESS", `DESTINATION_EXECUTION_FAILED:${destinationKey}:${result.error ?? result.outcome}`);
      statementsExecuted += result.statementsExecuted;
      destinationResults.push({ destinationKey, destinationId: plan.destinationIdentity.destinationId, outcome: result.outcome, statementsExecuted: result.statementsExecuted });
    }
    assert(statementsExecuted === preflight.operationCounts.totalPlannedSqlStatements, `STATEMENT_COUNT_MISMATCH:${statementsExecuted}`);
    assert(atomic.state.begins === 20 && atomic.state.commits === 20 && !atomic.state.rollbackRequested, `ATOMIC_CONTROL_MISMATCH:${stableString(atomic.state)}`);

    const scopeAfter = await resolveScope(raw, preflight.approvedDestinationKeys);
    assert(scopeAfter.every((row, index) => row.destinationId === scopeBefore[index].destinationId && row.destinationKey === scopeBefore[index].destinationKey && row.status === "published"), "IDENTITY_OR_PUBLICATION_STATUS_CHANGED");
    const readback = await verifyReadback(raw, preflight);
    const outsideAfter = await captureOutsideScope(raw, tables, ids);
    assert(stableString(outsideAfter) === stableString(outsideBefore), "OUTSIDE_SCOPE_CHANGED_DURING_EXECUTION");
    await raw.query("commit");
    committed = true;

    await raw.query("begin transaction read only");
    const committedScope = await resolveScope(raw, preflight.approvedDestinationKeys);
    assert(stableString(committedScope) === stableString(scopeAfter), "POST_COMMIT_SCOPE_MISMATCH");
    const committedReadback = await verifyReadback(raw, preflight);
    const outsideCommitted = await captureOutsideScope(raw, tables, ids);
    assert(stableString(outsideCommitted) === stableString(outsideBefore), "POST_COMMIT_OUTSIDE_SCOPE_CHANGED");
    await raw.query("rollback");

    const artifact = {
      status: "COMPLETE", completedAt: new Date().toISOString(), operator: OPERATOR, targetEnvironment: "private-supabase",
      workbook: preflight.workbook, preflight: { path: PREFLIGHT_PATH, sha256: PREFLIGHT_SHA256 }, recoverySnapshot: preflight.recoverySnapshot,
      approvedScope: committedScope, planEnvelope: approvedEnvelope, execution: { statementsExecuted, destinationResults },
      normalizedReadback: committedReadback, inTransactionReadback: readback, publicationStatusesPreserved: true,
      outsideScopeUnchanged: true, outsideScopeSha256: sha256(stableString(outsideCommitted)), atomicCommit: true,
    };
    const bytes = `${JSON.stringify(artifact, null, 2)}\n`;
    await writeFile(RESULT_PATH, bytes, { mode: 0o600, flag: "wx" });
    await chmod(RESULT_PATH, 0o600);
    console.log(JSON.stringify({ status: artifact.status, resultPath: path.relative(ROOT, RESULT_PATH), resultSha256: sha256(bytes), destinations: committedScope.length, statementsExecuted, publicationStatusesPreserved: true, outsideScopeUnchanged: true, outsideScopeSha256: artifact.outsideScopeSha256, atomicCommit: true }, null, 2));
  } catch (error) {
    if (!committed) await raw.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await raw.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});