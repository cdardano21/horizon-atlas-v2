import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

import { buildCatalogWriteStatements, planCatalogWriteOperation } from "../app/lib/persistence/v31/catalog-write-contract";
import { projectCanonicalComparable, projectStoredComparable } from "../app/lib/persistence/v31/comparable-projection";
import { loadNormalizedPersistedDestinationBundle } from "../app/lib/persistence/v31/load-normalized-persisted-destination-bundle";
import { interpretOperationManifest } from "../app/lib/persistence/v31/manifest";
import { mapCanonicalDestinationToStoredState } from "../app/lib/persistence/v31/map-canonical-destination-to-stored-state";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../app/lib/persistence/v31/materialize-stored-destination-state";
import { buildDestinationPlan } from "../app/lib/persistence/v31/plan-destination";
import { buildPlanEnvelope } from "../app/lib/persistence/v31/plan-envelope";
import { createSupabasePersistedDestinationReadPort } from "../app/lib/persistence/v31/supabase-persisted-destination-read-port";
import { createTransactionPersistedReadClient } from "../app/lib/persistence/v31/transaction-persisted-read-client";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  DestinationId,
  DestinationPlan,
  KeyedChildModuleKey,
  ManifestEntry,
  PlanEnvelope,
  ReplaceModuleExecutionModuleKey,
  ResolvedDestinationIdentity,
  StableChildKey,
  StoredDestinationState,
} from "../app/lib/persistence/v31/types";
import { buildDestinationPlanWriteStatements, type SqlExecutionClient } from "../app/lib/persistence/v31/write-port";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination } from "../app/lib/workbook-v31-deterministic-core";

const ROOT = process.cwd();
const WORKBOOK = "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-Premium-Enriched-Final-v3.3.xlsx";
const WORKBOOK_SHA256 = "015209686a8a68c20c32288498be40b88802268cc967a4ef71fbaa143b9d2a3a";
const PRIOR_AUTHORITATIVE_WORKBOOK = "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-Authoritative-Final-v3.3.xlsx";
const PRIOR_AUTHORITATIVE_WORKBOOK_SHA256 = "b4117961e6392d383eaa6e339e4d5b68d88f53e6edb8df35721e12f97ec573c4";
const PRE_IMPORT_BACKUP = "tmp/legacy-carryover-batch-20-02-preflight-20260908T205300Z/pre-write-recovery-snapshot.json";
const PRE_IMPORT_BACKUP_SHA256 = "d9c2a60d40d559dd13a4bf0281c2273b38333bca714ea9a1d064e222b436589d";
const PRESERVED_RECOVERY_SNAPSHOT = "tmp/legacy-carryover-batch-20-02-final-replacement-preflight-20260908T060026791Z/pre-replacement-recovery-snapshot.json";
const PRESERVED_RECOVERY_SNAPSHOT_SHA256 = "7bad5d3e8b41347bcf501b37838145429853399ebc6cadb5feaffec052fce662";
const EXPECTED_KEYS = [
  "radovljica-slovenia", "osaka-japan", "sitges-spain", "estepona-spain", "lake-bled-slovenia",
  "olbia-italy", "hiroshima-japan", "kobe-japan", "alghero-italy", "hakodate-japan",
  "desenzano-del-garda-italy", "onomichi-japan", "cartagena-spain", "gijon-spain", "girona-spain",
  "ptuj-slovenia", "koper-slovenia", "murcia-spain", "takayama-japan", "dubrovnik-croatia",
] as const;
const KEYED_MODULES: readonly KeyedChildModuleKey[] = [
  "facts", "scores", "neighborhoods", "places", "resources", "media", "propertyResources",
  "moveChecklist", "eventsSeasonality", "sources",
];
const REPLACE_MODULES: readonly ReplaceModuleExecutionModuleKey[] = [
  "costOfLiving", "climateMonthly", "housing", "healthcare", "visaResidency", "taxesFinance",
  "lgbtqInclusivity", "safetyRisks", "transportation", "remoteWork", "languageIntegration", "pets",
  "familyEducation", "communitySocial", "accessibility", "bureaucracySetup", "workBusiness",
  "retirementAging", "lifestyleLaws", "realityCheck", "lifestyleFeatures",
];
const CHILD_KEY_FIELDS: Readonly<Record<KeyedChildModuleKey, readonly [string, string]>> = {
  facts: ["factKey", "fact_key"], scores: ["scoreKey", "score_key"],
  neighborhoods: ["neighborhoodKey", "neighborhood_key"], places: ["placeKey", "place_key"],
  resources: ["resourceKey", "resource_key"], media: ["mediaKey", "media_key"],
  propertyResources: ["itemKey", "resource_key"], moveChecklist: ["checklistKey", "checklist_key"],
  eventsSeasonality: ["eventSeasonalityKey", "event_season_key"], sources: ["sourceKey", "source_key"],
};
const DIFF_POLICY = { updateMode: "MERGE_NONBLANK", normalizationVersion: "v31-normalize-1", diffPolicyVersion: "v31-diff-1" } as const;
const ATTEMPT_DIR = path.resolve(ROOT, process.env.LEGACY_CARRYOVER_20_02_PREMIUM_ATTEMPT_DIR ?? `tmp/legacy-carryover-batch-20-02-premium-replacement-preflight-${new Date().toISOString().replace(/[-:.]/g, "")}`);
const BACKUP_PATH = path.join(ATTEMPT_DIR, "pre-replacement-recovery-snapshot.json");
const PREFLIGHT_PATH = path.join(ATTEMPT_DIR, "preflight.json");

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

function readOnlyClient(raw: Client): SqlExecutionClient {
  let queue = Promise.resolve();
  return {
    query: async (text, values) => {
      assert(/^\s*(select|show|with)\b/i.test(text), `READ_ONLY_CLIENT_REJECTED_SQL:${text.slice(0, 32)}`);
      const query = queue.then(async () => {
        const result = await raw.query(text, values ? [...values] : undefined);
        return { rows: result.rows, rowCount: result.rowCount ?? 0 };
      });
      queue = query.then(() => undefined, () => undefined);
      return query;
    },
  };
}

async function loadWorkbook(): Promise<readonly DeterministicV31CanonicalDestination[]> {
  assert(await fileSha256(path.join(ROOT, WORKBOOK)) === WORKBOOK_SHA256, "WORKBOOK_SHA256_MISMATCH");
  const parsed = await loadFrozenWorkbookV31DeterministicImport(path.join(ROOT, WORKBOOK));
  assert(parsed.validationErrors.length === 0, `WORKBOOK_VALIDATION_FAILED:${parsed.validationErrors.join("|")}`);
  const destinations = parsed.canonicalDestinations ?? [];
  assert(stableString(destinations.map((destination) => destination.identity.destinationKey)) === stableString(EXPECTED_KEYS), "WORKBOOK_SCOPE_OR_ORDER_MISMATCH");
  return destinations;
}

async function resolveScope(raw: Client, destinations: readonly DeterministicV31CanonicalDestination[]): Promise<ScopeRow[]> {
  const rows: ScopeRow[] = [];
  const ids = new Set<string>();
  for (const destination of destinations) {
    const result = await raw.query("select id, destination_key, slug, city, country, status, beach_access, mountain_or_ski_access, country_code from public.destinations_catalog where destination_key = $1 or slug = $2 limit 2", [destination.identity.destinationKey, destination.identity.slug]);
    assert(result.rows.length === 1, `DATABASE_IDENTITY_COUNT:${destination.identity.destinationKey}:${result.rows.length}`);
    const row = result.rows[0];
    assert(String(row.destination_key) === destination.identity.destinationKey, `DATABASE_KEY_MISMATCH:${destination.identity.destinationKey}`);
    assert(String(row.slug) === destination.identity.slug, `DATABASE_SLUG_MISMATCH:${destination.identity.destinationKey}`);
    assert(!ids.has(String(row.id)), `DUPLICATE_DESTINATION_ID:${destination.identity.destinationKey}`);
    ids.add(String(row.id));
    rows.push({
      destinationId: String(row.id), destinationKey: destination.identity.destinationKey, slug: String(row.slug),
      city: String(row.city), country: String(row.country), status: row.status == null ? null : String(row.status),
      currentDestinationKey: row.destination_key == null ? null : String(row.destination_key),
      beachAccess: row.beach_access == null ? null : String(row.beach_access),
      mountainOrSkiAccess: row.mountain_or_ski_access == null ? null : String(row.mountain_or_ski_access),
      countryCode: row.country_code == null ? null : String(row.country_code),
    });
  }
  assert(rows.every((row) => row.status === "published"), "PUBLICATION_STATUS_NOT_ALL_PUBLISHED");
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
  return { kind: "LEGACY_CARRYOVER_BATCH_20_02_PREMIUM_PRE_REPLACEMENT_RECOVERY", createdAt: new Date().toISOString(), workbook: { path: WORKBOOK, sha256: WORKBOOK_SHA256 }, approvedScope: scope, catalog: normalizeRows(catalog.rows as Json[]), modules };
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

async function loadStored(raw: Client, identity: ResolvedDestinationIdentity): Promise<StoredDestinationState> {
  const transactionClient = createTransactionPersistedReadClient(readOnlyClient(raw));
  const result = await loadNormalizedPersistedDestinationBundle(identity, createSupabasePersistedDestinationReadPort(transactionClient));
  assert(result.outcome === "SUCCESS", `PERSISTED_READ_FAILED:${identity.destinationKey}:${result.outcome === "FAILED" ? result.failure.reason : "UNKNOWN"}`);
  return materializeStoredDestinationStateFromNormalizedPersistedBundle(result.bundle);
}

function childKey(module: KeyedChildModuleKey, child: unknown): string {
  assert(child && typeof child === "object" && !Array.isArray(child), `INVALID_CHILD:${module}`);
  const record = child as Record<string, unknown>;
  const [camel, snake] = CHILD_KEY_FIELDS[module];
  const value = record[camel] ?? record[snake];
  assert(typeof value === "string" && value.length > 0, `MISSING_CHILD_KEY:${module}`);
  return value;
}

function replacementManifest(destination: DeterministicV31CanonicalDestination, stored: StoredDestinationState): readonly ManifestEntry[] {
  const destinationKey = destination.identity.destinationKey as CanonicalDestinationKey;
  const entries: ManifestEntry[] = REPLACE_MODULES.map((targetModule) => ({
    destinationKey, operation: "REPLACE_MODULE", targetModule,
    reason: "Premium-authoritative workbook replacement of prior authoritative data",
  }));
  for (const moduleKey of KEYED_MODULES) {
    const finalKeys = new Set((destination[moduleKey] as readonly unknown[]).map((child) => childKey(moduleKey, child)));
    for (const child of stored[moduleKey] as readonly unknown[]) {
      const key = childKey(moduleKey, child);
      if (!finalKeys.has(key)) {
        entries.push({ destinationKey, operation: "DELETE_CHILD", targetModule: moduleKey, targetChildKey: key as StableChildKey, reason: "Prior-authoritative keyed child absent from premium-authoritative workbook" });
      }
    }
  }
  const singletonFields = [
    ["environmentQuality", "summary"], ["environmentQuality", "qualityNotes"],
    ["dailyLifePracticality", "summary"], ["dailyLifePracticality", "practicalityNotes"],
  ] as const;
  for (const [moduleKey, field] of singletonFields) {
    const canonicalRaw = destination[moduleKey] as Record<string, unknown> | null;
    const canonicalField = moduleKey === "environmentQuality"
      ? (field === "summary" ? canonicalRaw?.summary ?? canonicalRaw?.air_quality_summary : canonicalRaw?.qualityNotes ?? canonicalRaw?.water_quality_summary)
      : (field === "summary" ? canonicalRaw?.summary ?? canonicalRaw?.grocery_access : canonicalRaw?.practicalityNotes ?? canonicalRaw?.things_residents_wish_they_knew);
    const storedField = stored[moduleKey]?.[field];
    if ((canonicalField === null || canonicalField === undefined || canonicalField === "") && storedField != null) {
      entries.push({ destinationKey, operation: "CLEAR_FIELD", targetModule: moduleKey, targetFieldPath: field, reason: "Final-authoritative singleton field is blank" });
    }
  }
  return entries;
}

function rawSnapshotDiff(before: Json, current: Json): Json {
  const output: Json = {};
  const beforeSections = { destinations_catalog: before.catalog, ...(before.modules as Json) } as Json;
  const currentSections = { destinations_catalog: current.catalog, ...(current.modules as Json) } as Json;
  for (const name of [...new Set([...Object.keys(beforeSections), ...Object.keys(currentSections)])].sort()) {
    const beforeRows = (beforeSections[name] ?? []) as Json[];
    const currentRows = (currentSections[name] ?? []) as Json[];
    const beforeById = new Map(beforeRows.map((row) => [String(row.id), stableString(row)]));
    const currentById = new Map(currentRows.map((row) => [String(row.id), stableString(row)]));
    const added = [...currentById.keys()].filter((id) => !beforeById.has(id)).length;
    const removed = [...beforeById.keys()].filter((id) => !currentById.has(id)).length;
    const changed = [...currentById].filter(([id, row]) => beforeById.has(id) && beforeById.get(id) !== row).length;
    output[name] = { beforeRows: beforeRows.length, currentRows: currentRows.length, added, removed, changed, unchanged: currentRows.length - added - changed };
  }
  return output;
}

function differencePaths(left: unknown, right: unknown, prefix = ""): string[] {
  if (stableString(left) === stableString(right)) return [];
  if (Array.isArray(left) && Array.isArray(right)) {
    const paths: string[] = [];
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
      paths.push(...differencePaths(left[index], right[index], `${prefix}[${index}]`));
    }
    return paths;
  }
  if (left && right && typeof left === "object" && typeof right === "object") {
    const paths: string[] = [];
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    for (const key of keys) paths.push(...differencePaths((left as Json)[key], (right as Json)[key], prefix ? `${prefix}.${key}` : key));
    return paths;
  }
  return [prefix || "$"];
}

function aggregatePlans(plans: readonly DestinationPlan[]): Json {
  const scalar: Record<string, number> = {};
  const child: Record<string, number> = {};
  const replacements: Record<string, { modules: number; rowsBefore: number; rowsAfter: number }> = {};
  let plannedSqlStatements = 0;
  for (const plan of plans) {
    for (const operation of plan.scalarOperations) scalar[operation.kind] = (scalar[operation.kind] ?? 0) + 1;
    for (const operation of plan.childOperations) child[operation.kind] = (child[operation.kind] ?? 0) + 1;
    for (const operation of plan.moduleExecutionOperations) {
      const current = replacements[operation.module] ?? { modules: 0, rowsBefore: 0, rowsAfter: 0 };
      replacements[operation.module] = { modules: current.modules + 1, rowsBefore: current.rowsBefore + operation.expectedBefore.length, rowsAfter: current.rowsAfter + operation.expectedAfter.length };
    }
    plannedSqlStatements += buildDestinationPlanWriteStatements(plan).length;
  }
  return { scalar, child, replacements, plannedSqlStatements };
}

function summarizePlanDifferences(plans: readonly DestinationPlan[]): Json {
  const byModule: Record<string, Record<string, number>> = {};
  const increment = (module: string, operation: string, count = 1) => {
    const moduleCounts = byModule[module] ?? {};
    moduleCounts[operation] = (moduleCounts[operation] ?? 0) + count;
    byModule[module] = moduleCounts;
  };
  const byDestination = plans.map((plan) => {
    const counts: Record<string, number> = {};
    for (const operation of plan.scalarOperations) {
      increment(operation.module, operation.kind);
      counts[`${operation.module}:${operation.kind}`] = (counts[`${operation.module}:${operation.kind}`] ?? 0) + 1;
    }
    for (const operation of plan.childOperations) {
      increment(operation.module, operation.kind);
      counts[`${operation.module}:${operation.kind}`] = (counts[`${operation.module}:${operation.kind}`] ?? 0) + 1;
    }
    for (const operation of plan.moduleExecutionOperations) {
      const rowSlots = Math.max(operation.expectedBefore.length, operation.expectedAfter.length);
      const rowsChanged = Array.from({ length: rowSlots }, (_, index) => index)
        .filter((index) => stableString(operation.expectedBefore[index]) !== stableString(operation.expectedAfter[index])).length;
      increment(operation.module, "REPLACE_MODULE");
      increment(operation.module, "ROWS_BEFORE", operation.expectedBefore.length);
      increment(operation.module, "ROWS_AFTER", operation.expectedAfter.length);
      increment(operation.module, "ROWS_CHANGED", rowsChanged);
      increment(operation.module, "ROWS_UNCHANGED", rowSlots - rowsChanged);
      counts[`${operation.module}:REPLACE_MODULE`] = (counts[`${operation.module}:REPLACE_MODULE`] ?? 0) + 1;
      counts[`${operation.module}:ROWS_BEFORE`] = (counts[`${operation.module}:ROWS_BEFORE`] ?? 0) + operation.expectedBefore.length;
      counts[`${operation.module}:ROWS_AFTER`] = (counts[`${operation.module}:ROWS_AFTER`] ?? 0) + operation.expectedAfter.length;
      counts[`${operation.module}:ROWS_CHANGED`] = (counts[`${operation.module}:ROWS_CHANGED`] ?? 0) + rowsChanged;
      counts[`${operation.module}:ROWS_UNCHANGED`] = (counts[`${operation.module}:ROWS_UNCHANGED`] ?? 0) + rowSlots - rowsChanged;
    }
    return { destinationKey: plan.destinationIdentity.destinationKey, counts };
  });
  return { byModule, byDestination };
}

function recommendationChanges(
  destinations: readonly DeterministicV31CanonicalDestination[],
  storedByKey: Readonly<Record<CanonicalDestinationKey, StoredDestinationState>>,
): Json {
  const changes: Json[] = [];
  let websiteUrlChanges = 0;
  let neighborhoodAssociationChanges = 0;
  for (const destination of destinations) {
    const destinationKey = destination.identity.destinationKey as CanonicalDestinationKey;
    const currentByKey = new Map(storedByKey[destinationKey].places.map((place) => [String(place.placeKey), place]));
    const premiumByKey = new Map(mapCanonicalDestinationToStoredState(destination).places.map((place) => [String(place.placeKey), place]));
    for (const placeKey of [...new Set([...currentByKey.keys(), ...premiumByKey.keys()])].sort()) {
      const current = currentByKey.get(placeKey);
      const premium = premiumByKey.get(placeKey);
      const websiteUrlChanged = current?.websiteUrl !== premium?.websiteUrl;
      const neighborhoodAssociationChanged = current?.neighborhoodKey !== premium?.neighborhoodKey;
      if (!websiteUrlChanged && !neighborhoodAssociationChanged && current && premium) continue;
      if (websiteUrlChanged) websiteUrlChanges += 1;
      if (neighborhoodAssociationChanged) neighborhoodAssociationChanges += 1;
      changes.push({
        destinationKey,
        placeKey,
        operation: !current ? "CREATE" : !premium ? "DELETE" : "UPDATE",
        websiteUrlChanged,
        neighborhoodAssociationChanged,
        currentWebsiteUrl: current?.websiteUrl ?? null,
        premiumWebsiteUrl: premium?.websiteUrl ?? null,
        currentNeighborhoodKey: current?.neighborhoodKey ?? null,
        premiumNeighborhoodKey: premium?.neighborhoodKey ?? null,
      });
    }
  }
  return { websiteUrlChanges, neighborhoodAssociationChanges, changedRows: changes.length, changes };
}

async function main(): Promise<void> {
  const destinations = await loadWorkbook();
  assert(await fileSha256(path.join(ROOT, PRE_IMPORT_BACKUP)) === PRE_IMPORT_BACKUP_SHA256, "PRE_IMPORT_BACKUP_SHA256_MISMATCH");
  assert(await fileSha256(path.join(ROOT, PRESERVED_RECOVERY_SNAPSHOT)) === PRESERVED_RECOVERY_SNAPSHOT_SHA256, "PRESERVED_RECOVERY_SNAPSHOT_SHA256_MISMATCH");
  const preImport = JSON.parse(await readFile(path.join(ROOT, PRE_IMPORT_BACKUP), "utf8")) as Json;
  const preservedRecovery = JSON.parse(await readFile(path.join(ROOT, PRESERVED_RECOVERY_SNAPSHOT), "utf8")) as Json;
  await mkdir(ATTEMPT_DIR, { recursive: true, mode: 0o700 });
  const raw = new Client({ connectionString: await databaseUrl(), ssl: { rejectUnauthorized: false } });
  await raw.connect();
  let rolledBack = false;
  try {
    await raw.query("begin transaction read only");
    const transactionReadOnly = String((await raw.query("show transaction_read_only")).rows[0]?.transaction_read_only);
    assert(transactionReadOnly === "on", `TRANSACTION_NOT_READ_ONLY:${transactionReadOnly}`);
    const scope = await resolveScope(raw, destinations);
    const approvedScope: ApprovedDestinationScope = scope.map((row) => ({ destinationKey: row.destinationKey as CanonicalDestinationKey, destinationId: row.destinationId as DestinationId }));
    const tables = await discoverTables(raw);
    const backup = await captureScopedBackup(raw, tables, scope);
    const outsideScope = await captureOutsideScope(raw, tables, scope.map((row) => row.destinationId));
    const storedByKey = {} as Record<CanonicalDestinationKey, StoredDestinationState>;
    for (const item of scope) {
      storedByKey[item.destinationKey as CanonicalDestinationKey] = await loadStored(raw, { destinationKey: item.destinationKey as CanonicalDestinationKey, destinationId: item.destinationId as DestinationId });
    }
    const manifestEntries = destinations.flatMap((destination) => replacementManifest(destination, storedByKey[destination.identity.destinationKey as CanonicalDestinationKey]));
    const manifest = { entries: manifestEntries };
    const manifestHash = sha256(stableString(manifest));
    const plans: DestinationPlan[] = [];
    const exactness: Json[] = [];
    let catalogStatementCount = 0;
    for (const [index, destination] of destinations.entries()) {
      const scopeRow = scope[index];
      const identity = { destinationKey: scopeRow.destinationKey as CanonicalDestinationKey, destinationId: scopeRow.destinationId as DestinationId };
      const destinationManifest = { entries: manifestEntries.filter((entry) => entry.destinationKey === identity.destinationKey) };
      const interpretation = interpretOperationManifest({ manifest: destinationManifest, canonicalDestinations: [{ ...destination, identity: { ...destination.identity, destinationKey: identity.destinationKey } }], approvedScope, storedDestinationStateByKey: storedByKey });
      assert(interpretation.valid, `MANIFEST_INVALID:${stableString(interpretation.errors)}`);
      const plan = buildDestinationPlan({ resolvedDestinationIdentity: identity, canonicalDestination: destination, storedDestinationState: storedByKey[identity.destinationKey], manifestInterpretation: interpretation, diffPolicy: DIFF_POLICY, approvedScope });
      plans.push(plan);
      const desired = projectCanonicalComparable(destination);
      const catalog = planCatalogWriteOperation({ kind: "EXISTING", resolvedDestinationIdentity: identity, canonicalDestination: destination, current: { destinationKey: scopeRow.currentDestinationKey, slug: scopeRow.slug, city: scopeRow.city, country: scopeRow.country, beachAccess: scopeRow.beachAccess, mountainOrSkiAccess: scopeRow.mountainOrSkiAccess, countryCode: scopeRow.countryCode } });
      const expectedIdentity = plan.expectedComparablePostState.identity as Record<string, unknown>;
      const expected = catalog ? { ...plan.expectedComparablePostState, identity: { ...expectedIdentity, slug: catalog.slug, name: catalog.city, city: catalog.city, country: catalog.country, beachAccess: catalog.beachAccess, mountainOrSkiAccess: catalog.mountainOrSkiAccess, countryCode: catalog.countryCode } } : plan.expectedComparablePostState;
      const mismatchedPaths = differencePaths(expected, desired);
      exactness.push({ destinationKey: scopeRow.destinationKey, currentComparableSha256: sha256(stableString(projectStoredComparable(storedByKey[identity.destinationKey]))), desiredComparableSha256: sha256(stableString(desired)), expectedComparableSha256: sha256(stableString(expected)), exact: mismatchedPaths.length === 0, mismatchedPaths, catalogOperation: catalog });
      if (catalog) catalogStatementCount += buildCatalogWriteStatements(catalog).length;
    }
    const blockingReasons = [
      ...plans.flatMap((plan) => plan.errors.map((error) => `${plan.destinationIdentity.destinationKey}:${error.kind}`)),
      ...exactness.filter((item) => item.exact !== true).map((item) => `${item.destinationKey}:EXPECTED_POST_STATE_NOT_FINAL_AUTHORITATIVE`),
      ...(scope.every((row) => row.status === "published") ? [] : ["PUBLICATION_STATUS_NOT_PRESERVED"]),
    ];
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const envelope: PlanEnvelope = buildPlanEnvelope({
      planId: `legacy-carryover-batch-20-02-premium-replacement-${randomUUID()}`, workbookHash: WORKBOOK_SHA256,
      contractSchemaVersion: "3.3", normalizationVersion: DIFF_POLICY.normalizationVersion,
      diffPolicyVersion: DIFF_POLICY.diffPolicyVersion, operationManifestHash: manifestHash,
      executionPolicy: { transactionGranularity: "PER_DESTINATION", failurePolicy: "CONTINUE_AFTER_FAILURE", replayPolicy: "IDEMPOTENT_REPLAY", stalePlanPolicy: "STRICT_PRECONDITION_MATCH", readBackVerification: true },
      approvedScope, createdAt, createdBy: "legacy-carryover-batch-20-02-premium-replacement-preflight", expiresAt,
      status: "DRAFT", destinationPlans: plans,
    });
    await raw.query("rollback");
    rolledBack = true;
    const backupBytes = `${JSON.stringify(backup, null, 2)}\n`;
    await writeFile(BACKUP_PATH, backupBytes, { mode: 0o600, flag: "wx" });
    await chmod(BACKUP_PATH, 0o600);
    const operationCounts = aggregatePlans(plans);
    const artifact = {
      status: blockingReasons.length === 0 ? "VERDICT_A_READY_AWAITING_EXPLICIT_AUTHORIZATION" : "VERDICT_B_BLOCKED",
      verdict: blockingReasons.length === 0 ? "A" : "B", blockingReasons, registryId: "legacy-carryover-batch-20-02",
      targetEnvironment: "private-supabase", createdAt, expiresAt, workbook: { path: WORKBOOK, sha256: WORKBOOK_SHA256 },
      priorAuthoritativeWorkbook: { path: PRIOR_AUTHORITATIVE_WORKBOOK, sha256: PRIOR_AUTHORITATIVE_WORKBOOK_SHA256, superseded: true },
      priorNonAuthoritativeWorkbook: { path: "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-02-v3.3.xlsx", sha256: "f6ada44a44330cef43eca360bfa7371243236c8787a7bc4bf7caf4f9c0b8991a" },
      preImportBaseline: { path: PRE_IMPORT_BACKUP, sha256: PRE_IMPORT_BACKUP_SHA256 },
      preservedRecoverySnapshot: { path: PRESERVED_RECOVERY_SNAPSHOT, sha256: PRESERVED_RECOVERY_SNAPSHOT_SHA256 },
      recoverySnapshot: { path: path.relative(ROOT, BACKUP_PATH), sha256: sha256(backupBytes) },
      approvedDestinationKeys: EXPECTED_KEYS, approvedScope: scope, publicationPolicy: "PRESERVE_EXISTING_PUBLISHED",
      manifest: { sha256: manifestHash, entryCount: manifestEntries.length, entries: manifestEntries },
      operationCounts: { ...operationCounts, catalogStatements: catalogStatementCount, totalPlannedSqlStatements: Number(operationCounts.plannedSqlStatements) + catalogStatementCount },
      currentVsPremiumDiff: { moduleOperations: summarizePlanDifferences(plans), recommendationChanges: recommendationChanges(destinations, storedByKey) },
      exactExpectedPostState: exactness,
      currentVsPreservedRecoveryRawDiff: rawSnapshotDiff(preservedRecovery, backup),
      currentVsPreImportRawDiff: rawSnapshotDiff(preImport, backup),
      expectedFinalModuleCounts: Object.fromEntries([...KEYED_MODULES, ...REPLACE_MODULES].map((module) => [module, destinations.reduce((sum, destination) => sum + (destination[module] as readonly unknown[]).length, 0)])),
      discoveredTables: ["destinations_catalog", ...tables, "deterministic_v31_batch_runs"], outsideScope,
      planEnvelope: envelope,
      planningWarnings: plans.flatMap((plan) => plan.warnings.map((warning) => ({ destinationKey: plan.destinationIdentity.destinationKey, warning }))),
      planningErrors: plans.flatMap((plan) => plan.errors.map((error) => ({ destinationKey: plan.destinationIdentity.destinationKey, error }))),
      safety: {
        transactionReadOnly,
        sqlWritesExecuted: 0,
        transactionRolledBack: true,
        executionAuthorized: false,
        controllerHasExecutionMode: false,
        planUnitGranularity: "PER_DESTINATION",
        eventualTransactionBoundary: "ONE_OUTER_TRANSACTION_FOR_ALL_20",
        atomicRollbackOnAnyMismatch: true,
      },
      authorizationSentence: blockingReasons.length === 0 ? `I authorize replacement of exactly the 20 published destinations in preflight SHA-256 <PREFLIGHT_SHA256> using premium-enriched authoritative workbook SHA-256 ${WORKBOOK_SHA256} in private-supabase before ${expiresAt}, preserving publication status and requiring atomic rollback on any mismatch.` : null,
    };
    const bytes = `${JSON.stringify(artifact, null, 2)}\n`;
    await writeFile(PREFLIGHT_PATH, bytes, { mode: 0o600, flag: "wx" });
    await chmod(PREFLIGHT_PATH, 0o600);
    console.log(JSON.stringify({ status: artifact.status, verdict: artifact.verdict, blockingReasons, attemptDirectory: path.relative(ROOT, ATTEMPT_DIR), preflightPath: path.relative(ROOT, PREFLIGHT_PATH), preflightSha256: sha256(bytes), recoverySnapshotPath: artifact.recoverySnapshot.path, recoverySnapshotSha256: artifact.recoverySnapshot.sha256, workbookSha256: WORKBOOK_SHA256, expiresAt, approvedScope: scope.map(({ destinationId, destinationKey, status }) => ({ destinationId, destinationKey, status })), operationCounts: artifact.operationCounts, outsideScopeSha256: sha256(stableString(outsideScope)), sqlWritesExecuted: 0 }, null, 2));
  } catch (error) {
    if (!rolledBack) await raw.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await raw.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});