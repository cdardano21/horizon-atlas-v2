-- Phase 0 (Intelligence v2 prerequisite): additive v3.1 workbook <-> Supabase import-parity hardening.
-- Adds ONLY columns that already exist as approved v3.1 workbook fields (see
-- app/lib/workbook-v31-deterministic-core.ts DeterministicV31Canonical*State interfaces) but
-- currently have no Supabase column to persist into. No existing column is dropped, renamed, or
-- altered. No RLS policy changes are required: RLS is table/row-scoped and already covers these
-- tables (see 20260818160000_premium_v31_module_tables_rls.sql); adding a column does not change
-- row visibility.
-- no destructive delete

-- `verified_at` mirrors the existing `verified` boolean already present on these tables, giving the
-- workbook's `verified_at` field (present on every DeterministicV31Canonical*State interface) a home.
alter table public.premium_cost_of_living add column if not exists verified_at timestamptz;
alter table public.premium_visa_residency add column if not exists verified_at timestamptz;
alter table public.premium_housing_property add column if not exists verified_at timestamptz;
alter table public.premium_healthcare_insurance add column if not exists verified_at timestamptz;
alter table public.premium_safety_risks add column if not exists verified_at timestamptz;
alter table public.premium_taxes_finance add column if not exists verified_at timestamptz;

-- premium_lgbtq_inclusivity currently only has (summary, cultural_notes) - the workbook's
-- LGBTQ_INCLUSIVITY sheet already carries 10 additional structured fields with no DB home at all.
-- Adding verified/verified_at for parity with the other premium_* tables, plus the 8 remaining
-- content fields confirmed present in the workbook contract.
alter table public.premium_lgbtq_inclusivity add column if not exists verified boolean;
alter table public.premium_lgbtq_inclusivity add column if not exists verified_at timestamptz;
alter table public.premium_lgbtq_inclusivity add column if not exists overall_rating text;
alter table public.premium_lgbtq_inclusivity add column if not exists legal_protections text;
alter table public.premium_lgbtq_inclusivity add column if not exists social_acceptance text;
alter table public.premium_lgbtq_inclusivity add column if not exists pride_events text;
alter table public.premium_lgbtq_inclusivity add column if not exists nightlife_social text;
alter table public.premium_lgbtq_inclusivity add column if not exists healthcare_access text;
alter table public.premium_lgbtq_inclusivity add column if not exists areas_resources text;
alter table public.premium_lgbtq_inclusivity add column if not exists safety_considerations text;
