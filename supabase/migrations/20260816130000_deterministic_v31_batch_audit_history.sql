-- Minimal, append-only audit record for deterministic v3.1 batch orchestration runs.
-- This is intentionally lean: one row per executed (or attempted) batch run, enough to answer
-- "what exactly did Batch #N change?" without building a full admin reporting system.
--
-- Rollback note (Step 10): pre_execution_snapshot retains the StoredDestinationState captured
-- immediately before execution for every destination in the batch, keyed by destination_key. This
-- is not an automated reverse-plan yet - it is the minimum evidence needed to reconstruct a manual
-- rollback later. Automating reverse-plan generation is deferred to before the 20-40 destination batch.

create table if not exists public.deterministic_v31_batch_runs (
  id uuid primary key default gen_random_uuid(),
  workbook_path text not null,
  workbook_hash text,
  contract_schema_version text not null,
  mode text not null check (mode in ('DRY_RUN', 'EXECUTE')),
  approved_destination_keys text[] not null,
  destination_reports jsonb not null default '[]'::jsonb,
  pre_execution_snapshot jsonb not null default '{}'::jsonb,
  scalar_operation_counts jsonb not null default '{}'::jsonb,
  child_operation_counts jsonb not null default '{}'::jsonb,
  status text not null default 'COMPLETED' check (status in ('COMPLETED', 'FAILED')),
  failure_reason text,
  executed_by text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_deterministic_v31_batch_runs_started_at on public.deterministic_v31_batch_runs(started_at desc);
