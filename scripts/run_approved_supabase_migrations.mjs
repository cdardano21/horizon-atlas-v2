#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const migrationFiles = [
  'supabase/migrations/20260807120000_premium_v2_storage.sql',
  'supabase/migrations/20260808120000_premium_v31_presence_and_keyed_children.sql',
  'supabase/migrations/20260812120000_premium_v31_editorial_profile_storage.sql',
  'supabase/migrations/20260813120000_premium_v31_remaining_module_storage.sql',
  'supabase/migrations/20260814120000_destinations_catalog_destination_key_nullable.sql',
  'supabase/migrations/20260816120000_destinations_catalog_destination_key_unique_index.sql',
  'supabase/migrations/20260816130000_deterministic_v31_batch_audit_history.sql',
];

function loadSupabaseDbUrl() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.local in the repository root.');
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  const match = raw.match(/^SUPABASE_DB_URL=(.+)$/m);
  if (!match) {
    throw new Error('SUPABASE_DB_URL was not found in .env.local.');
  }

  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

async function withClient(fn) {
  const connectionString = loadSupabaseDbUrl();
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

async function runPreflight() {
  await withClient(async (client) => {
    const row = await client.query(`
      SELECT
        current_database() AS current_database,
        current_user AS current_user,
        to_regclass('public.destinations_catalog') IS NOT NULL AS destinations_catalog_exists,
        to_regclass('public.premium_destination_profiles') IS NOT NULL AS premium_destination_profiles_exists,
        to_regclass('public.premium_destination_module_presence') IS NOT NULL AS premium_destination_module_presence_exists;
    `);

    const dbInfo = row.rows[0];
    console.log('connection: ok');
    console.log(`database: ${dbInfo.current_database}`);
    console.log(`user: ${dbInfo.current_user}`);
    console.log(`destinations_catalog_exists: ${dbInfo.destinations_catalog_exists}`);

    const countResult = await client.query(`
      SELECT COUNT(*)::int AS destination_count
      FROM public.destinations_catalog;
    `);
    console.log(`destinations_catalog_count: ${countResult.rows[0].destination_count}`);

    const columnsResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'destinations_catalog'
      ORDER BY ordinal_position;
    `);
    console.log(`destinations_catalog_columns: ${columnsResult.rows.map((row) => row.column_name).join(', ')}`);

    const destinationKeyResult = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'destinations_catalog' AND column_name = 'destination_key'
      ) AS destination_key_exists;
    `);
    console.log(`destination_key_exists: ${destinationKeyResult.rows[0].destination_key_exists}`);

    console.log(`premium_destination_profiles_exists: ${dbInfo.premium_destination_profiles_exists}`);
    console.log(`premium_destination_module_presence_exists: ${dbInfo.premium_destination_module_presence_exists}`);
  });
}

async function runVerify() {
  await withClient(async (client) => {
    const tables = await client.query(`
      SELECT to_regclass('public.destinations_catalog') IS NOT NULL AS destinations_catalog_exists,
             to_regclass('public.premium_destination_profiles') IS NOT NULL AS premium_destination_profiles_exists,
             to_regclass('public.premium_destination_module_presence') IS NOT NULL AS premium_destination_module_presence_exists;
    `);
    const row = tables.rows[0];
    console.log(`destinations_catalog_exists: ${row.destinations_catalog_exists}`);
    console.log(`premium_destination_profiles_exists: ${row.premium_destination_profiles_exists}`);
    console.log(`premium_destination_module_presence_exists: ${row.premium_destination_module_presence_exists}`);

    const destinationKeyColumn = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'destinations_catalog'
          AND column_name = 'destination_key'
      ) AS destination_key_column_exists;
    `);
    console.log(`destination_key_column_exists: ${destinationKeyColumn.rows[0].destination_key_column_exists}`);

    const legacyCount = row.destinations_catalog_exists
      ? await client.query(`
          SELECT COUNT(*)::int AS legacy_count FROM public.destinations_catalog;
        `)
      : { rows: [{ legacy_count: 0 }] };
    console.log(`legacy_count: ${legacyCount.rows[0].legacy_count}`);

    const requiredPremiumTables = [
      'premium_destination_profiles',
      'premium_destination_module_presence',
      'premium_destination_facts',
      'premium_destination_scores',
      'premium_move_checklist',
      'premium_events_seasonality',
      'premium_lgbtq_inclusivity',
      'premium_language_integration',
      'premium_pets',
      'premium_family_education',
      'premium_community_social',
      'premium_accessibility',
      'premium_bureaucracy_setup',
      'premium_work_business',
      'premium_retirement_aging',
      'premium_lifestyle_laws',
      'premium_environment_quality',
      'premium_daily_life_practicality',
    ];

    const premiumTableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1)
        AND table_type = 'BASE TABLE';
    `, [requiredPremiumTables]);
    const existingPremiumTables = new Set(premiumTableCheck.rows.map((entry) => entry.table_name));
    for (const tableName of requiredPremiumTables) {
      console.log(`premium_table_exists:${tableName}:${existingPremiumTables.has(tableName)}`);
    }
    console.log(`all_required_premium_tables_exist: ${requiredPremiumTables.every((tableName) => existingPremiumTables.has(tableName))}`);

    let premiumPilotRows = 0;
    if (row.premium_destination_profiles_exists) {
      const premiumProfileColumns = await client.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'premium_destination_profiles'
            AND column_name = 'destination_id'
        ) AS has_destination_id_column;
      `);

      if (premiumProfileColumns.rows[0].has_destination_id_column) {
        const pilotRowsResult = await client.query(`
          SELECT COUNT(*)::int AS premium_pilot_rows
          FROM public.premium_destination_profiles AS p
          JOIN public.destinations_catalog AS c ON c.id = p.destination_id
          WHERE c.slug IN ('new-braunfels', 'summerlin', 'lisbon');
        `);
        premiumPilotRows = pilotRowsResult.rows[0].premium_pilot_rows;
      }
    }
    console.log(`premium_pilot_rows: ${premiumPilotRows}`);

    let legacySlugs = [];
    if (row.destinations_catalog_exists) {
      const slugColumn = await client.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'destinations_catalog'
            AND column_name = 'slug'
        ) AS has_slug_column;
      `);

      if (slugColumn.rows[0].has_slug_column) {
        const legacySlugRows = await client.query(`
          SELECT slug
          FROM public.destinations_catalog
          WHERE slug IN ('new-braunfels', 'summerlin', 'lisbon')
          ORDER BY slug;
        `);
        legacySlugs = legacySlugRows.rows.map((entry) => entry.slug);
      }
    }
    console.log(`legacy_slug_presence: ${legacySlugs.length ? legacySlugs.join(', ') : '(none or slug column unavailable)'}`);
  });
}

async function runMigrate() {
  await withClient(async (client) => {
    for (const relativePath of migrationFiles) {
      const absolutePath = path.join(repoRoot, relativePath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Missing migration file: ${relativePath}`);
      }

      const sql = fs.readFileSync(absolutePath, 'utf8');
      console.log(`applying ${relativePath}`);
      await client.query(sql);
    }
    console.log('migration complete');
  });
}

async function main() {
  const mode = process.argv[2] || 'preflight';
  if (mode === 'preflight') {
    await runPreflight();
  } else if (mode === 'migrate') {
    await runMigrate();
  } else if (mode === 'verify') {
    await runVerify();
  } else {
    console.error('Usage: node scripts/run_approved_supabase_migrations.mjs [preflight|migrate|verify]');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
