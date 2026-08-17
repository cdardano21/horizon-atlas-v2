// Real Postgres-backed wiring for the deterministic v3.1 write port. This is the ONLY file that
// talks to an actual database connection for writes - app/lib/persistence/v31/write-port.ts stays
// pure and injectable so it can be unit-tested with a fake SqlExecutionClient.
//
// Uses a direct Postgres connection (SUPABASE_DB_URL) rather than the PostgREST/anon-key HTTP API
// because only a real Postgres connection can provide genuine multi-statement transaction
// atomicity (BEGIN/COMMIT/ROLLBACK) across the many premium_* tables a single destination plan
// touches. This mirrors the pattern already used for one-off migration/audit scripts this session.
import { Client } from "pg";
import { isSupabaseConfigured } from "../supabase";
import type { SqlExecutionClient, SqlQueryResult } from "../persistence/v31/write-port";

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

export interface CreateSyntheticCatalogRowInput {
  readonly slug: string;
  readonly city: string;
  readonly country: string;
  readonly destinationKey: string;
  readonly tier?: string;
}

/**
 * Bootstraps a brand-new destinations_catalog row. This is intentionally separate from the
 * existing plan/diff engine, which requires an already-resolved destinationId and does not create
 * catalog rows (see resolveDestinationCatalogId's "creating new catalog rows is not implemented by
 * this entrypoint" comment in orchestrate-deterministic-batch.ts). Explicitly refuses to proceed if
 * a row with the same slug or destination_key already exists, to avoid any collision with real data.
 */
export async function createSyntheticDestinationCatalogRow(
  client: SqlExecutionClient,
  input: CreateSyntheticCatalogRowInput,
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
