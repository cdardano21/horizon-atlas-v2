-- Add a nullable canonical catalog identity field for v3.1 existing-destination resolution.
-- This checkpoint is intentionally additive and does not change runtime semantics.
-- No NOT NULL, no slug-derived backfill, no fabricated identity values.

create extension if not exists pgcrypto;

alter table public.destinations_catalog
  add column if not exists destination_key text;

-- No backfill is performed in this checkpoint because the tracked schema and migrations
-- do not provide a provably authoritative mapping from existing catalog rows to a
-- canonical destination_key without relying on heuristics or guesswork.
-- Legacy rows remain unresolved and are represented as NULL.
