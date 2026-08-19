-- Closes a Supabase Security Advisor "RLS Disabled in Public" finding for
-- deterministic_v31_batch_runs (internal batch-import audit history: workbook hashes, full
-- pre-execution state snapshots, execution reports). This table has no public-facing purpose and
-- no destination-status concept of its own - it mirrors the existing admin-only pattern already
-- used for data_engine_import_runs / data_engine_publish_runs / data_engine_maintenance_actions
-- (authenticated + is_admin_user() ALL, no anon policy at all). The only writer
-- (recordWritePortBatchAudit) already authenticates with the service role key, which bypasses RLS
-- entirely, so this migration changes no working behavior.

alter table public.deterministic_v31_batch_runs enable row level security;

create policy "Admins manage rows (deterministic_v31_batch_runs)"
  on public.deterministic_v31_batch_runs
  for all
  to authenticated
  using (is_admin_user())
  with check (is_admin_user());
