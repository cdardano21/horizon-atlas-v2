import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { lookup } from "node:dns/promises";
import { Client } from "pg";
import { loadNormalizedPersistedDestinationBundle } from "../app/lib/persistence/v31/load-normalized-persisted-destination-bundle";
import { createSupabasePersistedDestinationReadPort } from "../app/lib/persistence/v31/supabase-persisted-destination-read-port";
import type { ResolvedDestinationIdentity } from "../app/lib/persistence/v31/types";
import { summarizePersistedBundleResult } from "./rollback-harness-result-shape";

const pilotIds = [
  "f65b8c56-0a75-4e83-8b41-533444f0eff2",
  "63a56797-164d-49bd-9969-9b539ce7e57d",
  "32b10339-a202-48bb-b1eb-2798735b7ed3",
] as const;

const pilotBindings = [
  { id: pilotIds[0], key: "lisbon-pt", name: "Lisbon" },
  { id: pilotIds[1], key: "new-braunfels-tx-us", name: "New Braunfels" },
  { id: pilotIds[2], key: "summerlin-nv-us", name: "Summerlin" },
] as const;

const premiumTables = [
  "premium_accessibility",
  "premium_bureaucracy_setup",
  "premium_climate_monthly",
  "premium_community_social",
  "premium_connectivity_remote_work",
  "premium_cost_of_living",
  "premium_daily_life_practicality",
  "premium_destination_facts",
  "premium_destination_module_presence",
  "premium_destination_profiles",
  "premium_destination_scores",
  "premium_environment_quality",
  "premium_events_seasonality",
  "premium_family_education",
  "premium_healthcare_insurance",
  "premium_housing_property",
  "premium_language_integration",
  "premium_lgbtq_inclusivity",
  "premium_lifestyle_laws",
  "premium_media",
  "premium_move_checklist",
  "premium_neighborhoods",
  "premium_pets",
  "premium_places",
  "premium_property_resources",
  "premium_reality_check",
  "premium_resources",
  "premium_retirement_aging",
  "premium_safety_risks",
  "premium_sources",
  "premium_taxes_finance",
  "premium_transport_airports",
  "premium_visa_residency",
  "premium_work_business",
] as const;

async function parseEnvConnectionString(): Promise<string> {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envText = fs.readFileSync(envPath, "utf8");
  const line = envText.split(/\r?\n/).find((entry) => entry.startsWith("SUPABASE_DB_URL="));
  if (!line) {
    throw new Error("SUPABASE_DB_URL not found in .env.local");
  }
  const connectionString = line.replace(/^SUPABASE_DB_URL=/, "").replace(/^"|"$/g, "").trim();
  const url = new URL(connectionString);
  const fallbackHostMap: Record<string, string> = {
    "aws-0-us-west-1.pooler.supabase.com": "54.177.55.191",
  };
  let resolvedAddress = fallbackHostMap[url.hostname];
  if (!resolvedAddress) {
    try {
      resolvedAddress = (await lookup(url.hostname, { all: true }))[0]?.address;
    } catch {
      resolvedAddress = undefined;
    }
  }
  if (resolvedAddress) {
    const auth = url.username && url.password ? `${url.username}:${url.password}` : "";
    const host = `${resolvedAddress}:${url.port || 5432}`;
    return `postgresql://${auth ? `${auth}@` : ""}${host}/${url.pathname.replace(/^\//, "")}`;
  }
  return connectionString;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_, nestedValue) => {
    if (Array.isArray(nestedValue)) {
      return nestedValue.map((entry) => (typeof entry === "object" && entry !== null ? Object.fromEntries(Object.entries(entry).sort()) : entry));
    }
    if (typeof nestedValue === "object" && nestedValue !== null) {
      return Object.fromEntries(Object.entries(nestedValue as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)));
    }
    return nestedValue;
  });
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function splitSqlStatements(sqlText: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sqlText.length; index += 1) {
    const char = sqlText[index];
    const nextChar = sqlText[index + 1];

    if (inLineComment) {
      current += char;
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === "*" && nextChar === "/") {
        current += nextChar;
        index += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (char === "-" && nextChar === "-") {
      inLineComment = true;
      current += char;
      current += nextChar;
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      current += char;
      current += nextChar;
      index += 1;
      continue;
    }

    if (char === "'") {
      if (inSingleQuote && nextChar === "'") {
        current += char;
        current += nextChar;
        index += 1;
        continue;
      }
      inSingleQuote = inSingleQuote === false;
      current += char;
      continue;
    }

    if (inSingleQuote === false && char === ";") {
      const statement = current.trim();
      if (statement.length > 0 && /^BEGIN$/i.test(statement) === false) {
        statements.push(statement);
      }
      current = "";
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail.length > 0 && /^BEGIN$/i.test(tail) === false) {
    statements.push(tail);
  }

  return statements;
}

async function queryRows(client: Client, sql: string, params: readonly unknown[] = []): Promise<readonly Record<string, unknown>[]> {
  const result = await client.query(sql, params);
  return result.rows as readonly Record<string, unknown>[];
}

async function getTableMetrics(client: Client, table: string): Promise<Record<string, unknown>> {
  const total = await queryRows(client, `SELECT COUNT(*)::int AS count FROM public.${table}`);
  const pilotCount = await queryRows(client, `SELECT COUNT(*)::int AS count FROM public.${table} WHERE destination_id = ANY($1::uuid[])`, [pilotIds]);
  const nonPilotCount = await queryRows(client, `SELECT COUNT(*)::int AS count FROM public.${table} WHERE destination_id IS NULL OR destination_id <> ALL($1::uuid[])`, [pilotIds]);
  const fingerprintRows = await queryRows(client, `SELECT * FROM public.${table} ORDER BY ctid`);
  const fingerprint = sha256(stableStringify(fingerprintRows));
  return {
    table,
    totalCount: Number(total[0].count),
    pilotCount: Number(pilotCount[0].count),
    nonPilotCount: Number(nonPilotCount[0].count),
    fingerprint,
  };
}

async function getCatalogMetrics(client: Client): Promise<Record<string, unknown>> {
  const total = await queryRows(client, "SELECT COUNT(*)::int AS count FROM public.destinations_catalog");
  const pilotRows = await queryRows(client, "SELECT id, destination_key, slug, city, country FROM public.destinations_catalog WHERE id = ANY($1::uuid[])", [pilotIds]);
  return {
    totalCount: Number(total[0].count),
    pilotRows,
    fingerprint: sha256(stableStringify(await queryRows(client, "SELECT id, destination_key, slug, city, country FROM public.destinations_catalog ORDER BY id"))),
  };
}

async function collectDeltaRows(client: Client, table: string, identityColumn: string): Promise<readonly Record<string, unknown>[]> {
  const rows = await queryRows(client, `SELECT * FROM public.${table} WHERE ${identityColumn} = ANY($1::uuid[]) ORDER BY ctid`, [pilotIds]);
  return rows;
}

async function buildReadPort(client: Client) {
  return createSupabasePersistedDestinationReadPort({
    selectRows: async ({ table, select, filters }) => {
      let sql = `SELECT ${select} FROM public.${table}`;
      const values: unknown[] = [];
      if (filters && filters.length > 0) {
        const clauses: string[] = [];
        for (const [index, filter] of filters.entries()) {
          const paramIndex = index + 1;
          if (filter.operator === "eq") {
            clauses.push(`${filter.column} = $${paramIndex}`);
          } else if (filter.operator === "in") {
            clauses.push(`${filter.column} = ANY($${paramIndex}::uuid[])`);
          } else {
            throw new Error(`Unsupported filter: ${filter.operator}`);
          }
          values.push(filter.value);
        }
        sql += ` WHERE ${clauses.join(" AND ")}`;
      }
      const result = await client.query(sql, values);
      return result.rows as readonly Record<string, unknown>[];
    },
  });
}

async function runRehearsal(): Promise<Record<string, unknown>> {
  const connectionString = await parseEnvConnectionString();
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  await client.connect();

  try {
    const readPort = await buildReadPort(client);
    const preCatalog = await getCatalogMetrics(client);
    const prePremium: Record<string, unknown>[] = [];
    for (const table of premiumTables) {
      prePremium.push(await getTableMetrics(client, table));
    }

    const preDelta: Record<string, unknown>[] = [];
    for (const table of premiumTables) {
      preDelta.push({ table, rows: await collectDeltaRows(client, table, "destination_id") });
    }

    await client.query("BEGIN");
    await client.query("SET LOCAL search_path TO public");

    const sqlText = fs.readFileSync(path.resolve(process.cwd(), "tmp/three-pilot-premium-write.sql"), "utf8");
    const statements = splitSqlStatements(sqlText);
    for (const statement of statements) {
      await client.query(statement.trim());
    }

    const transactionCatalog = await getCatalogMetrics(client);
    const transactionPremium: Record<string, unknown>[] = [];
    for (const table of premiumTables) {
      transactionPremium.push(await getTableMetrics(client, table));
    }

    const transactionDelta: Record<string, unknown>[] = [];
    for (const table of premiumTables) {
      transactionDelta.push({ table, rows: await collectDeltaRows(client, table, "destination_id") });
    }

    const bundleResults: Record<string, unknown>[] = [];
    for (const binding of pilotBindings) {
      const identity: ResolvedDestinationIdentity = { destinationId: binding.id as never, destinationKey: binding.key as never };
      const bundle = await loadNormalizedPersistedDestinationBundle(identity, readPort);
      const bundleSummary = summarizePersistedBundleResult(binding.name, bundle);
      bundleResults.push({
        destination: bundleSummary.destination,
        outcome: bundleSummary.outcome,
        root: bundleSummary.root,
        profile: bundleSummary.profile,
        presenceModules: bundleSummary.presenceModules,
        failureReason: bundleSummary.failureReason,
        failureModule: bundleSummary.failureModule,
      });
      if (bundleSummary.outcome !== "SUCCESS") {
        throw new Error(`Persisted bundle load failed for ${binding.name}: ${bundleSummary.failureReason ?? "unknown"}${bundleSummary.failureModule ? ` (${bundleSummary.failureModule})` : ""}`);
      }
    }

    const postTransaction = { catalog: transactionCatalog, premium: transactionPremium, delta: transactionDelta, bundles: bundleResults };

    await client.query("ROLLBACK");
    const afterRollbackCatalog = await getCatalogMetrics(client);
    const afterRollbackPremium: Record<string, unknown>[] = [];
    for (const table of premiumTables) {
      afterRollbackPremium.push(await getTableMetrics(client, table));
    }

    const report = {
      connection: { hostname: "aws-0-us-west-1.pooler.supabase.com", database: "postgres", username: "postgres.xlksbghwbiwkfuiaarkq" },
      pilotIds,
      preTransaction: { catalog: preCatalog, premium: prePremium, delta: preDelta },
      transactionResult: postTransaction,
      postRollback: { catalog: afterRollbackCatalog, premium: afterRollbackPremium },
      verification: {
        catalogUnchanged: stableStringify(afterRollbackCatalog) === stableStringify(preCatalog),
        premiumCountsMatching: stableStringify(afterRollbackPremium) === stableStringify(prePremium),
      },
    };

    fs.writeFileSync(path.resolve(process.cwd(), "tmp/three-pilot-rollback-rehearsal.json"), JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

describe("three-pilot rollback rehearsal", () => {
  it(
    "executes the SQL inside a single transaction and rolls back cleanly",
    async () => {
      const report = await runRehearsal();
      console.log(JSON.stringify(report, null, 2));

      expect(report.verification.catalogUnchanged).toBe(true);
      expect(report.verification.premiumCountsMatching).toBe(true);
    },
    60_000,
  );
});
