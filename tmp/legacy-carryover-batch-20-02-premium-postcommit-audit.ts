import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const ROOT = process.cwd();
const PREFLIGHT_PATH = path.resolve(ROOT, "tmp/legacy-carryover-batch-20-02-premium-replacement-preflight-20260908T095428280Z/preflight.json");

type ScopeRow = { destinationId: string; destinationKey: string; status: string };
type Preflight = { approvedScope: ScopeRow[] };

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function databaseUrl(): Promise<string> {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const contents = await readFile(path.join(ROOT, ".env.local"), "utf8");
  const match = contents.match(/^SUPABASE_DB_URL=(.+)$/m);
  assert(match, "SUPABASE_DB_URL_NOT_CONFIGURED");
  return match[1].trim().replace(/^["']|["']$/g, "");
}

async function main(): Promise<void> {
  const preflight = JSON.parse(await readFile(PREFLIGHT_PATH, "utf8")) as Preflight;
  const ids = preflight.approvedScope.map((row) => row.destinationId);
  const client = new Client({ connectionString: await databaseUrl(), ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("begin transaction read only");
    const transactionReadOnly = String((await client.query("show transaction_read_only")).rows[0]?.transaction_read_only);
    assert(transactionReadOnly === "on", `TRANSACTION_NOT_READ_ONLY:${transactionReadOnly}`);

    const scope = await client.query(
      "select id, destination_key, status from public.destinations_catalog where id = any($1::uuid[]) order by destination_key",
      [ids],
    );
    const places = await client.query(
      `select count(*)::int as rows,
        count(*) filter (where nullif(trim(p.website_url), '') is not null)::int as website_urls,
        count(*) filter (where nullif(trim(p.neighborhood_key), '') is not null)::int as neighborhood_assignments,
        count(*) filter (where nullif(trim(p.google_maps_url), '') is not null)::int as google_maps_urls,
        count(*) filter (where n.id is not null)::int as valid_neighborhood_assignments
       from public.premium_places p
       left join public.premium_neighborhoods n
         on n.destination_id = p.destination_id and n.neighborhood_key = p.neighborhood_key
       where p.destination_id = any($1::uuid[])`,
      [ids],
    );
    const modules = await client.query(
      `select 'lifestyleFeatures' as module, count(*)::int as rows from public.premium_lifestyle_features where destination_id = any($1::uuid[])
       union all select 'realityCheck', count(*)::int from public.premium_reality_check where destination_id = any($1::uuid[])
       union all select 'dailyLife', count(*)::int from public.premium_daily_life_practicality where destination_id = any($1::uuid[])
       union all select 'retirementAging', count(*)::int from public.premium_retirement_aging where destination_id = any($1::uuid[])
       union all select 'familyEducation', count(*)::int from public.premium_family_education where destination_id = any($1::uuid[])
       union all select 'communitySocial', count(*)::int from public.premium_community_social where destination_id = any($1::uuid[])
       union all select 'connectivityRemoteWork', count(*)::int from public.premium_connectivity_remote_work where destination_id = any($1::uuid[])
       union all select 'languageIntegration', count(*)::int from public.premium_language_integration where destination_id = any($1::uuid[])
       union all select 'accessibility', count(*)::int from public.premium_accessibility where destination_id = any($1::uuid[])
       union all select 'transportation', count(*)::int from public.premium_transport_airports where destination_id = any($1::uuid[])
       union all select 'workBusiness', count(*)::int from public.premium_work_business where destination_id = any($1::uuid[])
       order by module`,
      [ids],
    );
    const premiumTables = await client.query<{ table_name: string }>(
      `select distinct table_name
       from information_schema.columns
       where table_schema = 'public' and table_name like 'premium_%' and column_name = 'destination_id'
       order by table_name`,
    );
    const prohibitedPattern = String.raw`\m(concrete reference|practical area to compare|KYC|regional universities vary|binary legal token|provider-specific|permit-specific|parser|adapter|runtime|database|workbook)\M|\mtest\M.{0,100}\mfor medical access\M`;
    const prohibitedMatches: Record<string, number> = {};
    for (const { table_name: tableName } of premiumTables.rows) {
      assert(/^premium_[a-z0-9_]+$/.test(tableName), `UNSAFE_TABLE_NAME:${tableName}`);
      const result = await client.query(
        `select count(*)::int as rows from public.${tableName} t where destination_id = any($1::uuid[]) and row_to_json(t)::text ~* $2`,
        [ids, prohibitedPattern],
      );
      const count = Number(result.rows[0]?.rows);
      if (count > 0) prohibitedMatches[tableName] = count;
    }

    const placeCoverage = places.rows[0] as Record<string, number>;
    assert(scope.rows.length === 20 && scope.rows.every((row) => row.status === "published"), "SCOPE_OR_STATUS_MISMATCH");
    assert(placeCoverage.rows === 360, `PLACE_COUNT:${placeCoverage.rows}`);
    assert(placeCoverage.website_urls === 360, `WEBSITE_COVERAGE:${placeCoverage.website_urls}`);
    assert(placeCoverage.neighborhood_assignments === 360, `NEIGHBORHOOD_COVERAGE:${placeCoverage.neighborhood_assignments}`);
    assert(placeCoverage.valid_neighborhood_assignments === 360, `VALID_NEIGHBORHOOD_COVERAGE:${placeCoverage.valid_neighborhood_assignments}`);
    assert(placeCoverage.google_maps_urls === 360, `GOOGLE_MAPS_COVERAGE:${placeCoverage.google_maps_urls}`);
    const expected = new Map([
      ["accessibility", 20], ["communitySocial", 60], ["connectivityRemoteWork", 20], ["dailyLife", 20],
      ["familyEducation", 40], ["languageIntegration", 20], ["lifestyleFeatures", 340], ["realityCheck", 120],
      ["retirementAging", 20], ["transportation", 60], ["workBusiness", 20],
    ]);
    for (const row of modules.rows) assert(Number(row.rows) === expected.get(String(row.module)), `MODULE_COUNT:${row.module}:${row.rows}`);
    assert(Object.keys(prohibitedMatches).length === 0, `PROHIBITED_CUSTOMER_COPY:${JSON.stringify(prohibitedMatches)}`);

    await client.query("rollback");
    console.log(JSON.stringify({
      status: "PASS",
      readOnly: true,
      transactionRolledBack: true,
      scope: scope.rows,
      placeCoverage,
      moduleCounts: Object.fromEntries(modules.rows.map((row) => [row.module, Number(row.rows)])),
      prohibitedCustomerCopyMatches: prohibitedMatches,
    }, null, 2));
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
