import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || "";

if (!connectionString) {
  console.error("Missing SUPABASE_DB_URL or DATABASE_URL. Set one to your Supabase Postgres connection string.");
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), "supabase/generated-command-center-seed.sql");

async function main() {
  const sql = await readFile(sqlPath, "utf8");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`Applied command-center seed SQL from ${sqlPath}.`);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});