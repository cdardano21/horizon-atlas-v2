-- Add DB-level uniqueness protection for destination_key without touching legacy data.
-- Preflight (read-only) confirmed zero duplicate non-null destination_key values exist today:
--   only "lisbon-portugal" -> "lisbon-pt" and "summerlin-nv-usa" -> "summerlin-nv-us" are populated,
--   and both values are distinct. A plain unique index is therefore safe to apply as-is.
--
-- destination_key remains nullable for legacy rows that do not yet have one; only non-null
-- values must be unique. No backfill, no rewriting of existing rows.

create unique index if not exists idx_destinations_catalog_destination_key_unique
  on public.destinations_catalog (destination_key)
  where destination_key is not null;
