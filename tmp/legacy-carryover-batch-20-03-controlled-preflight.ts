import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

import type { CatalogWriteOperation } from "../app/lib/persistence/v31/catalog-write-contract";
import { projectStoredComparable, type ComparableProjection } from "../app/lib/persistence/v31/comparable-projection";
import { createSupabasePersistedDestinationReadPort } from "../app/lib/persistence/v31/supabase-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "../app/lib/persistence/v31/load-normalized-persisted-destination-bundle";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../app/lib/persistence/v31/materialize-stored-destination-state";
import { buildPlanEnvelope, validatePlanEnvelopeForExecution } from "../app/lib/persistence/v31/plan-envelope";
import { createTransactionPersistedReadClient } from "../app/lib/persistence/v31/transaction-persisted-read-client";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, DestinationPlan, PlanEnvelope, ResolvedDestinationIdentity } from "../app/lib/persistence/v31/types";
import type { SqlExecutionClient } from "../app/lib/persistence/v31/write-port";
import { executeGuardedDeterministicV31Batch } from "../app/lib/runtime/execute-guarded-deterministic-v31-batch";
import type { BatchDestinationSpec } from "../app/lib/runtime/execute-deterministic-v31-batch";
import { loadFrozenWorkbookV31DeterministicImport } from "../app/lib/workbook-v31-deterministic-core";

const ROOT = process.cwd();
const WORKBOOK = "data/legacy-carryover-batch-20-03/DestinationFinderAI-Next-Legacy-Batch-20-Premium-Enriched-Corrected-v3.3.xlsx";
const WORKBOOK_SHA256 = "6bae082ce0d8d2f43975971004824d202d8dcfd73be336d75d6670dd1f6f8bc7";
const REGISTRY_ID = "legacy-carryover-batch-20-03";
const TARGET_ENVIRONMENT = "private-supabase";
const EXPECTED_KEYS = [
  "aomori-japan", "kamakura-japan", "porto-portugal", "kranj-slovenia", "coimbra-portugal",
  "kumamoto-japan", "beppu-japan", "sapporo-japan", "lecce-italy", "athens-greece",
  "matsumoto-japan", "morioka-japan", "sendai-japan", "cavtat-croatia", "sirmione-italy",
  "celje-slovenia", "nagasaki-japan", "perugia-italy", "novigrad-croatia", "ioannina-greece",
] as const;
const ATTEMPT_DIR = path.resolve(ROOT, process.env.LEGACY_CARRYOVER_20_03_ATTEMPT_DIR ?? `tmp/legacy-carryover-batch-20-03-preflight-${new Date().toISOString().replace(/[-:.]/g, "").replace("Z", "Z")}`);
const BACKUP_PATH = path.join(ATTEMPT_DIR, "pre-write-recovery-snapshot.json");
const PREFLIGHT_PATH = path.join(ATTEMPT_DIR, "preflight.json");
const RESULT_PATH = path.join(ATTEMPT_DIR, "execution-result.json");
const DIFF_POLICY = { updateMode: "MERGE_NONBLANK", normalizationVersion: "v31-normalize-1", diffPolicyVersion: "v31-diff-1" } as const;

type Json = Record<string, unknown>;
type ScopeRow = { destinationId: string; destinationKey: string; slug: string; status: string | null; currentDestinationKey: string | null };
type StoredPreflight = {
  status: string;
  targetEnvironment: string;
  expiresAt: string;
  workbook: { path: string; sha256: string };
  manifestHash: string;
  backup: { path: string; sha256: string };
  approvedDestinationKeys: readonly string[];
  approvedScope: ScopeRow[];
  discoveredTables: string[];
  outsideScope: Json;
  planEnvelope: PlanEnvelope;
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

async function connect(): Promise<Client> {
  const client = new Client({ connectionString: await databaseUrl(), ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
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

async function loadWorkbook(): Promise<{ destinations: BatchDestinationSpec[] }> {
  assert(await fileSha256(path.join(ROOT, WORKBOOK)) === WORKBOOK_SHA256, "WORKBOOK_SHA256_MISMATCH");
  const parsed = await loadFrozenWorkbookV31DeterministicImport(path.join(ROOT, WORKBOOK));
  assert(parsed.validationErrors.length === 0, `WORKBOOK_VALIDATION_FAILED:${parsed.validationErrors.join("|")}`);
  const canonical = parsed.canonicalDestinations ?? [];
  assert(stableString(canonical.map((destination) => destination.identity.destinationKey)) === stableString(EXPECTED_KEYS), "WORKBOOK_SCOPE_OR_ORDER_MISMATCH");
  return {
    destinations: canonical.map((canonicalDestination) => {
      const { destinationKey, slug, city, name, country } = canonicalDestination.identity;
      assert(slug && (city ?? name) && country, `INCOMPLETE_BOOTSTRAP_IDENTITY:${destinationKey}`);
      return { destinationKey, canonicalDestination, bootstrapIdentity: { slug, city: city ?? name!, country } };
    }),
  };
}

async function resolveScope(raw: Client, destinations: readonly BatchDestinationSpec[]): Promise<ScopeRow[]> {
  const rows: ScopeRow[] = [];
  const ids = new Set<string>();
  for (const destination of destinations) {
    const result = await raw.query("select id, destination_key, slug, city, country, status from public.destinations_catalog where destination_key = $1 or slug = $2 limit 2", [destination.destinationKey, destination.bootstrapIdentity.slug]);
    assert(result.rows.length === 1, result.rows.length === 0 ? `DATABASE_IDENTITY_MISSING:${destination.destinationKey}` : `DATABASE_IDENTITY_AMBIGUOUS:${destination.destinationKey}`);
    const row = result.rows[0];
    assert(row.destination_key === null || row.destination_key === destination.destinationKey, `DATABASE_KEY_COLLISION:${destination.destinationKey}`);
    assert(String(row.slug) === destination.bootstrapIdentity.slug, `DATABASE_SLUG_MISMATCH:${destination.destinationKey}`);
    assert(String(row.city) === destination.bootstrapIdentity.city && String(row.country) === destination.bootstrapIdentity.country, `DATABASE_CITY_COUNTRY_MISMATCH:${destination.destinationKey}`);
    assert(!ids.has(String(row.id)), `DUPLICATE_DESTINATION_ID:${destination.destinationKey}`);
    ids.add(String(row.id));
    rows.push({ destinationId: String(row.id), destinationKey: destination.destinationKey, slug: String(row.slug), status: row.status == null ? null : String(row.status), currentDestinationKey: row.destination_key == null ? null : String(row.destination_key) });
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

async function captureScopedBackup(raw: Client, tables: readonly string[], scope: readonly ScopeRow[]): Promise<Json> {
  const ids = scope.map((row) => row.destinationId);
  const catalog = await raw.query("select * from public.destinations_catalog where id = any($1::uuid[]) order by id", [ids]);
  const modules: Json = {};
  for (const table of tables) {
    const result = await raw.query(`select * from public.${safeTable(table)} where destination_id = any($1::uuid[]) order by destination_id, id`, [ids]);
    modules[table] = normalizeRows(result.rows as Json[]);
  }
  return { kind: "LEGACY_CARRYOVER_BATCH_20_03_PRE_WRITE_RECOVERY", createdAt: new Date().toISOString(), workbook: { path: WORKBOOK, sha256: WORKBOOK_SHA256 }, approvedScope: scope, catalog: normalizeRows(catalog.rows as Json[]), modules };
}

async function captureOutsideScope(raw: Client, tables: readonly string[], ids: readonly string[]): Promise<Json> {
  const output: Json = {};
  const catalog = await raw.query("select * from public.destinations_catalog where not (id = any($1::uuid[])) order by id", [ids]);
  const normalizedCatalog = normalizeRows(catalog.rows as Json[]);
  output.destinations_catalog = { rowCount: normalizedCatalog.length, sha256: sha256(stableString(normalizedCatalog)) };
  for (const table of tables) {
    const result = await raw.query(`select * from public.${safeTable(table)} where destination_id is null or not (destination_id = any($1::uuid[])) order by destination_id, id`, [ids]);
    const rows = normalizeRows(result.rows as Json[]);
    output[table] = { rowCount: rows.length, sha256: sha256(stableString(rows)) };
  }
  const audit = await raw.query("select * from public.deterministic_v31_batch_runs order by id");
  const auditRows = normalizeRows(audit.rows as Json[]);
  output.deterministic_v31_batch_runs = { rowCount: auditRows.length, sha256: sha256(stableString(auditRows)) };
  return output;
}

function expectedWithCatalog(plan: DestinationPlan, catalog: CatalogWriteOperation | null): ComparableProjection {
  const expected = plan.expectedComparablePostState;
  if (!catalog) return expected;
  const identity = expected.identity;
  assert(identity && typeof identity === "object" && !Array.isArray(identity), "EXPECTED_IDENTITY_MISSING");
  return { ...expected, identity: { ...identity, beachAccess: catalog.beachAccess, mountainOrSkiAccess: catalog.mountainOrSkiAccess, countryCode: catalog.countryCode } };
}

async function loadStored(raw: Client, identity: ResolvedDestinationIdentity) {
  const readClient = createTransactionPersistedReadClient(serializedClient(raw));
  const result = await loadNormalizedPersistedDestinationBundle(identity, createSupabasePersistedDestinationReadPort(readClient));
  assert(result.outcome === "SUCCESS", `PERSISTED_READ_FAILED:${identity.destinationKey}:${result.outcome === "FAILED" ? result.failure.reason : "UNKNOWN"}`);
  return materializeStoredDestinationStateFromNormalizedPersistedBundle(result.bundle);
}

async function verifyReadback(raw: Client, scope: readonly ScopeRow[], plans: ReadonlyMap<string, DestinationPlan>, catalogs: ReadonlyMap<string, CatalogWriteOperation | null>) {
  const destinations = [];
  for (const item of scope) {
    const plan = plans.get(item.destinationKey);
    assert(plan && catalogs.has(item.destinationKey), `READBACK_PLAN_MISSING:${item.destinationKey}`);
    const stored = await loadStored(raw, { destinationKey: item.destinationKey as CanonicalDestinationKey, destinationId: item.destinationId as DestinationId });
    const expected = expectedWithCatalog(plan, catalogs.get(item.destinationKey) ?? null);
    const actual = projectStoredComparable(stored);
    assert(stableString(actual) === stableString(expected), `NORMALIZED_READBACK_MISMATCH:${item.destinationKey}`);
    destinations.push({ destinationKey: item.destinationKey, destinationId: item.destinationId, status: item.status, comparableSha256: sha256(stableString(actual)), lifestyleRows: stored.lifestyleFeatures.length });
  }
  return destinations;
}

function authorization(): { preflightHash: string; operator: string; expiresAt: string } {
  assert(process.env.LEGACY_CARRYOVER_20_03_EXECUTION_AUTHORIZED === "true", "EXPLICIT_EXECUTION_AUTHORIZATION_MISSING");
  assert(process.env.LEGACY_CARRYOVER_20_03_APPROVED_ENVIRONMENT === TARGET_ENVIRONMENT, "APPROVED_ENVIRONMENT_MISMATCH");
  assert(process.env.LEGACY_CARRYOVER_20_03_APPROVED_WORKBOOK_SHA256 === WORKBOOK_SHA256, "APPROVED_WORKBOOK_HASH_MISMATCH");
  const preflightHash = process.env.LEGACY_CARRYOVER_20_03_APPROVED_PREFLIGHT_SHA256 ?? "";
  const operator = process.env.LEGACY_CARRYOVER_20_03_APPROVED_OPERATOR ?? "";
  const expiresAt = process.env.LEGACY_CARRYOVER_20_03_APPROVED_EXPIRES_AT ?? "";
  assert(preflightHash.length === 64, "APPROVED_PREFLIGHT_HASH_MISSING");
  assert(operator === "Samuel Curt Dardano", "APPROVED_OPERATOR_MISMATCH");
  assert(expiresAt === "2026-09-09T20:02:29.111Z" && Date.now() < Date.parse(expiresAt), "APPROVAL_EXPIRED_OR_MISMATCHED");
  return { preflightHash, operator, expiresAt };
}

async function preflight(): Promise<void> {
  const { destinations } = await loadWorkbook();
  await mkdir(ATTEMPT_DIR, { recursive: true, mode: 0o700 });
  const raw = await connect();
  try {
    await raw.query("begin read only");
    const scope = await resolveScope(raw, destinations);
    const approvedScope: ApprovedDestinationScope = scope.map((row) => ({ destinationKey: row.destinationKey as CanonicalDestinationKey, destinationId: row.destinationId as DestinationId }));
    const tables = await discoverTables(raw);
    const backup = await captureScopedBackup(raw, tables, scope);
    const outsideScope = await captureOutsideScope(raw, tables, scope.map((row) => row.destinationId));
    const plans = new Map<string, DestinationPlan>();
    const result = await executeGuardedDeterministicV31Batch({
      client: serializedClient(raw),
      approvedDestinationKeys: EXPECTED_KEYS,
      destinations,
      workbookPath: WORKBOOK,
      workbookHash: WORKBOOK_SHA256,
      contractSchemaVersion: "3.3",
      batchRunId: `legacy-carryover-batch-20-03-preflight-${randomUUID()}`,
      mode: "DRY_RUN",
      explicitlyApproveExecution: false,
      executedBy: "legacy-carryover-batch-20-03-controller",
      deps: { observePreparedPlan: (plan) => plans.set(plan.destinationIdentity.destinationKey, plan) },
    });
    assert(result.ok && result.batchOutcome === "COMPLETED", `DRY_RUN_FAILED:${stableString(result)}`);
    assert(result.attempted === 20 && result.failed === 0 && result.skipped === 0 && result.totalStatementsExecuted === 0, "DRY_RUN_COUNTS_FAILED");
    assert(plans.size === 20 && [...plans.values()].every((plan) => plan.action !== "ERROR" && plan.errors.length === 0), "PLAN_COMPLETENESS_FAILED");
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const manifestHash = sha256(stableString(EXPECTED_KEYS.map((destinationKey) => ({ destinationKey, operation: "UPSERT", updateMode: "MERGE_NONBLANK", publishMode: "PRESERVE_EXISTING" }))));
    const envelope = buildPlanEnvelope({
      planId: `legacy-carryover-batch-20-03-${randomUUID()}`,
      workbookHash: WORKBOOK_SHA256,
      contractSchemaVersion: "3.3",
      normalizationVersion: DIFF_POLICY.normalizationVersion,
      diffPolicyVersion: DIFF_POLICY.diffPolicyVersion,
      operationManifestHash: manifestHash,
      executionPolicy: { transactionGranularity: "PER_DESTINATION", failurePolicy: "STOP_ON_FIRST_FAILURE", replayPolicy: "IDEMPOTENT_REPLAY", stalePlanPolicy: "STRICT_PRECONDITION_MATCH", readBackVerification: true },
      approvedScope,
      createdAt,
      createdBy: "legacy-carryover-batch-20-03-controller",
      expiresAt,
      status: "DRAFT",
      destinationPlans: [...plans.values()],
    });
    await raw.query("rollback");
    const backupBytes = `${JSON.stringify(backup, null, 2)}\n`;
    await writeFile(BACKUP_PATH, backupBytes, { mode: 0o600, flag: "wx" });
    await chmod(BACKUP_PATH, 0o600);
    const planSummary = [...plans.values()].sort((left, right) => left.destinationIdentity.destinationKey.localeCompare(right.destinationIdentity.destinationKey)).map((plan) => ({ destinationKey: plan.destinationIdentity.destinationKey, destinationId: plan.destinationIdentity.destinationId, action: plan.action, scalarOperations: plan.scalarOperations.length, childOperations: plan.childOperations.length, moduleOperations: plan.moduleExecutionOperations.map((operation) => operation.module), warnings: plan.warnings, errors: plan.errors }));
    const artifact = { status: "PREFLIGHT_COMPLETE_AWAITING_EXPLICIT_APPROVAL", registryId: REGISTRY_ID, targetEnvironment: TARGET_ENVIRONMENT, createdAt, expiresAt, workbook: { path: WORKBOOK, sha256: WORKBOOK_SHA256 }, manifestHash, backup: { path: path.relative(ROOT, BACKUP_PATH), sha256: sha256(backupBytes) }, approvedDestinationKeys: EXPECTED_KEYS, approvedScope: scope, classification: { existing: scope.length, legacyPromotions: scope.filter((row) => row.currentDestinationKey === null).length, creates: 0 }, discoveredTables: ["destinations_catalog", ...tables, "deterministic_v31_batch_runs"], outsideScope, dryRun: result, planSummary, planEnvelope: envelope, safety: { sqlStatementsExecuted: result.totalStatementsExecuted, transactionRolledBack: true, executionAuthorized: false, publicationPolicy: "PRESERVE_EXISTING" } };
    const bytes = `${JSON.stringify(artifact, null, 2)}\n`;
    await writeFile(PREFLIGHT_PATH, bytes, { mode: 0o600, flag: "wx" });
    await chmod(PREFLIGHT_PATH, 0o600);
    console.log(JSON.stringify({ status: artifact.status, attemptDirectory: path.relative(ROOT, ATTEMPT_DIR), preflightPath: path.relative(ROOT, PREFLIGHT_PATH), preflightSha256: sha256(bytes), backupPath: artifact.backup.path, backupSha256: artifact.backup.sha256, workbookSha256: WORKBOOK_SHA256, expiresAt, destinations: result.attempted, legacyPromotions: artifact.classification.legacyPromotions, statementsExecuted: result.totalStatementsExecuted }, null, 2));
  } catch (error) {
    await raw.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await raw.end();
  }
}

async function execute(): Promise<void> {
  const approval = authorization();
  const preflightBytes = await readFile(PREFLIGHT_PATH);
  const preflight = JSON.parse(preflightBytes.toString("utf8")) as StoredPreflight;
  assert(sha256(preflightBytes) === approval.preflightHash, "PREFLIGHT_SHA256_MISMATCH");
  assert(preflight.status === "PREFLIGHT_COMPLETE_AWAITING_EXPLICIT_APPROVAL", "PREFLIGHT_STATUS_INVALID");
  assert(preflight.targetEnvironment === TARGET_ENVIRONMENT && preflight.expiresAt === approval.expiresAt, "PREFLIGHT_AUTHORIZATION_BINDING_MISMATCH");
  assert(preflight.workbook.path === WORKBOOK && preflight.workbook.sha256 === WORKBOOK_SHA256, "PREFLIGHT_WORKBOOK_MISMATCH");
  assert(stableString(preflight.approvedDestinationKeys) === stableString(EXPECTED_KEYS), "PREFLIGHT_KEY_SCOPE_MISMATCH");
  assert(await fileSha256(path.join(ROOT, preflight.backup.path)) === preflight.backup.sha256, "RECOVERY_BACKUP_SHA256_MISMATCH");
  const { destinations } = await loadWorkbook();
  const raw = await connect();
  let committed = false;
  try {
    await raw.query("begin");
    const scopeBefore = await resolveScope(raw, destinations);
    assert(stableString(scopeBefore) === stableString(preflight.approvedScope), "DATABASE_SCOPE_OR_STATUS_DRIFT");
    const tables = await discoverTables(raw);
    assert(stableString(["destinations_catalog", ...tables, "deterministic_v31_batch_runs"]) === stableString(preflight.discoveredTables), "DISCOVERED_TABLE_SET_DRIFT");
    const outsideBefore = await captureOutsideScope(raw, tables, scopeBefore.map((row) => row.destinationId));
    assert(stableString(outsideBefore) === stableString(preflight.outsideScope), "OUTSIDE_SCOPE_CHANGED_SINCE_PREFLIGHT");

    const currentPlans = new Map<string, DestinationPlan>();
    const currentCatalogs = new Map<string, CatalogWriteOperation | null>();
    const dryRun = await executeGuardedDeterministicV31Batch({
      client: serializedClient(raw), approvedDestinationKeys: EXPECTED_KEYS, destinations, workbookPath: WORKBOOK,
      workbookHash: WORKBOOK_SHA256, contractSchemaVersion: "3.3", batchRunId: `legacy-carryover-batch-20-03-recheck-${randomUUID()}`,
      mode: "DRY_RUN", explicitlyApproveExecution: false, executedBy: approval.operator,
      deps: { observePreparedPlan: (plan, catalog) => { currentPlans.set(plan.destinationIdentity.destinationKey, plan); currentCatalogs.set(plan.destinationIdentity.destinationKey, catalog); } },
    });
    assert(dryRun.ok && dryRun.batchOutcome === "COMPLETED" && dryRun.attempted === 20 && dryRun.failed === 0 && dryRun.skipped === 0 && dryRun.totalStatementsExecuted === 0, "EXECUTION_RECHECK_DRY_RUN_FAILED");
    const sortedPlans = [...currentPlans.values()].sort((left, right) => left.destinationIdentity.destinationKey.localeCompare(right.destinationIdentity.destinationKey));
    const sortedPreflightPlans = [...preflight.planEnvelope.destinationPlans].sort((left, right) => left.destinationIdentity.destinationKey.localeCompare(right.destinationIdentity.destinationKey));
    assert(stableString(sortedPlans) === stableString(sortedPreflightPlans), "DESTINATION_PLANS_CHANGED_SINCE_PREFLIGHT");
    const approvedEnvelope = buildPlanEnvelope({
      planId: preflight.planEnvelope.planId,
      planHash: sha256(stableString(sortedPlans)),
      workbookHash: WORKBOOK_SHA256,
      contractSchemaVersion: "3.3",
      normalizationVersion: DIFF_POLICY.normalizationVersion,
      diffPolicyVersion: DIFF_POLICY.diffPolicyVersion,
      operationManifestHash: preflight.manifestHash,
      executionPolicy: preflight.planEnvelope.executionPolicy,
      approvedScope: preflight.planEnvelope.approvedScope,
      createdAt: preflight.planEnvelope.createdAt,
      createdBy: preflight.planEnvelope.createdBy,
      approvedAt: new Date().toISOString(),
      approvedBy: approval.operator,
      expiresAt: approval.expiresAt,
      status: "APPROVED",
      destinationPlans: sortedPlans,
    });
    const envelopeValidation = validatePlanEnvelopeForExecution({ envelope: approvedEnvelope, expectedContractSchemaVersion: "3.3", expectedNormalizationVersion: DIFF_POLICY.normalizationVersion, expectedDiffPolicyVersion: DIFF_POLICY.diffPolicyVersion });
    assert(envelopeValidation.valid, `PLAN_ENVELOPE_REJECTED:${stableString(envelopeValidation.errors)}`);

    const executionPlans = new Map<string, DestinationPlan>();
    const executionCatalogs = new Map<string, CatalogWriteOperation | null>();
    const atomic = atomicClient(raw);
    const result = await executeGuardedDeterministicV31Batch({
      client: atomic.client, approvedDestinationKeys: EXPECTED_KEYS, destinations, workbookPath: WORKBOOK,
      workbookHash: WORKBOOK_SHA256, contractSchemaVersion: "3.3", batchRunId: `legacy-carryover-batch-20-03-execute-${randomUUID()}`,
      mode: "EXECUTE", explicitlyApproveExecution: true, executedBy: approval.operator,
      deps: {
        observePreparedPlan: (plan, catalog) => {
          const approved = currentPlans.get(plan.destinationIdentity.destinationKey);
          assert(approved && stableString(plan) === stableString(approved), `PLAN_CHANGED_DURING_EXECUTION:${plan.destinationIdentity.destinationKey}`);
          executionPlans.set(plan.destinationIdentity.destinationKey, plan);
          executionCatalogs.set(plan.destinationIdentity.destinationKey, catalog);
        },
        recordWritePortBatchAudit: async () => ({ ok: true }),
      },
    });
    assert(result.ok && result.batchOutcome === "COMPLETED" && result.attempted === 20 && result.succeeded === 20 && result.failed === 0 && result.skipped === 0 && result.totalStatementsExecuted > 0, `EXECUTION_FAILED:${stableString(result)}`);
    assert(!atomic.state.rollbackRequested && atomic.state.begins === 20 && atomic.state.commits === 20, `OUTER_TRANSACTION_CONTROL_FAILED:${stableString(atomic.state)}`);

    const scopeAfter = await resolveScope(raw, destinations);
    assert(scopeAfter.every((row, index) => row.destinationId === scopeBefore[index].destinationId && row.destinationKey === scopeBefore[index].destinationKey && row.slug === scopeBefore[index].slug && row.status === scopeBefore[index].status && row.currentDestinationKey === row.destinationKey), "IDENTITY_OR_PUBLICATION_STATUS_CHANGED");
    const readback = await verifyReadback(raw, scopeAfter, executionPlans, executionCatalogs);
    const outsideAfter = await captureOutsideScope(raw, tables, scopeAfter.map((row) => row.destinationId));
    assert(stableString(outsideAfter) === stableString(outsideBefore), "OUTSIDE_SCOPE_CHANGED_DURING_EXECUTION");

    const replayPlans = new Map<string, DestinationPlan>();
    const replay = await executeGuardedDeterministicV31Batch({
      client: serializedClient(raw), approvedDestinationKeys: EXPECTED_KEYS, destinations, workbookPath: WORKBOOK,
      workbookHash: WORKBOOK_SHA256, contractSchemaVersion: "3.3", batchRunId: `legacy-carryover-batch-20-03-replay-${randomUUID()}`,
      mode: "DRY_RUN", explicitlyApproveExecution: false, executedBy: approval.operator,
      deps: { observePreparedPlan: (plan) => replayPlans.set(plan.destinationIdentity.destinationKey, plan) },
    });
    assert(replay.ok && replay.batchOutcome === "COMPLETED" && replay.attempted === 20 && replay.failed === 0 && replay.skipped === 0 && replay.totalStatementsExecuted === 0, "IDEMPOTENCY_DRY_RUN_FAILED");
    assert([...replayPlans.values()].every((plan) => plan.action === "UNCHANGED" && plan.scalarOperations.length === 0 && plan.childOperations.every((operation) => operation.kind === "UNCHANGED_CHILD") && plan.moduleExecutionOperations.length === 0), "IDEMPOTENCY_PLAN_NOT_EMPTY");
    await raw.query("commit");
    committed = true;

    await raw.query("begin read only");
    const committedScope = await resolveScope(raw, destinations);
    assert(stableString(committedScope) === stableString(scopeAfter), "POST_COMMIT_SCOPE_MISMATCH");
    await verifyReadback(raw, committedScope, executionPlans, executionCatalogs);
    const outsideCommitted = await captureOutsideScope(raw, tables, committedScope.map((row) => row.destinationId));
    assert(stableString(outsideCommitted) === stableString(outsideBefore), "POST_COMMIT_OUTSIDE_SCOPE_CHANGED");
    await raw.query("rollback");

    const artifact = { status: "COMPLETE", completedAt: new Date().toISOString(), operator: approval.operator, targetEnvironment: TARGET_ENVIRONMENT, workbook: { path: WORKBOOK, sha256: WORKBOOK_SHA256 }, preflight: { path: path.relative(ROOT, PREFLIGHT_PATH), sha256: approval.preflightHash }, backup: preflight.backup, approvedScope: committedScope, planEnvelope: approvedEnvelope, execution: result, normalizedReadback: readback, publicationStatusesPreserved: true, outsideScopeUnchanged: true, idempotentReplay: true };
    const bytes = `${JSON.stringify(artifact, null, 2)}\n`;
    await writeFile(RESULT_PATH, bytes, { mode: 0o600, flag: "wx" });
    await chmod(RESULT_PATH, 0o600);
    console.log(JSON.stringify({ status: artifact.status, resultPath: path.relative(ROOT, RESULT_PATH), resultSha256: sha256(bytes), destinations: committedScope.length, statementsExecuted: result.totalStatementsExecuted, publicationStatusesPreserved: true, outsideScopeUnchanged: true, idempotentReplay: true }, null, 2));
  } catch (error) {
    if (!committed) await raw.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await raw.end();
  }
}

async function main(): Promise<void> {
  if (process.argv.includes("--execute")) return execute();
  return preflight();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});