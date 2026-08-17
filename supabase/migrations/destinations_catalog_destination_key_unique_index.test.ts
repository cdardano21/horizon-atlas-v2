import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260816120000_destinations_catalog_destination_key_unique_index.sql",
);

describe("destinations_catalog destination_key unique index migration", () => {
  it("creates a partial unique index scoped to non-null destination_key values", () => {
    const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

    expect(sql).toContain("create unique index if not exists idx_destinations_catalog_destination_key_unique");
    expect(sql).toContain("on public.destinations_catalog (destination_key)");
    expect(sql).toContain("where destination_key is not null");
  });

  it("is additive only: no drop, delete, update, or backfill statements", () => {
    const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

    expect(sql).not.toMatch(/\bdrop\b/);
    expect(sql).not.toMatch(/\bdelete\b/);
    expect(sql).not.toMatch(/\bupdate\b/);
    expect(sql).not.toMatch(/\balter\s+column\b/);
  });

  it("is registered in the approved migration runner script", () => {
    const runnerSql = fs.readFileSync(
      path.join(process.cwd(), "scripts/run_approved_supabase_migrations.mjs"),
      "utf8",
    );

    expect(runnerSql).toContain("20260816120000_destinations_catalog_destination_key_unique_index.sql");
  });
});
