import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260816130000_deterministic_v31_batch_audit_history.sql",
);

describe("deterministic v3.1 batch audit history migration", () => {
  it("creates an append-only batch run table with the minimum required audit columns", () => {
    const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

    expect(sql).toContain("create table if not exists public.deterministic_v31_batch_runs");
    for (const column of [
      "workbook_path",
      "contract_schema_version",
      "mode",
      "approved_destination_keys",
      "destination_reports",
      "pre_execution_snapshot",
      "status",
      "started_at",
      "completed_at",
    ]) {
      expect(sql).toContain(column);
    }
  });

  it("is additive only: no drop, delete, or update statements", () => {
    const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

    expect(sql).not.toMatch(/\bdrop\b/);
    expect(sql).not.toMatch(/\bdelete\b/);
    expect(sql).not.toMatch(/\bupdate\b/);
  });

  it("is registered in the approved migration runner script", () => {
    const runnerSql = fs.readFileSync(
      path.join(process.cwd(), "scripts/run_approved_supabase_migrations.mjs"),
      "utf8",
    );

    expect(runnerSql).toContain("20260816130000_deterministic_v31_batch_audit_history.sql");
  });
});
