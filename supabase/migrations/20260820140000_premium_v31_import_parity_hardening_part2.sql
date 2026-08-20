-- Phase 0 (Intelligence v2 prerequisite), part 2: completes import-parity hardening for the
-- remaining originally-scoped v3.1 modules (CONNECTIVITY_REMOTE_WORK, LANGUAGE_INTEGRATION,
-- COMMUNITY_SOCIAL, TRANSPORT_AIRPORTS, DESTINATION_SCORES). Adds ONLY columns that already exist
-- as approved v3.1 workbook fields (see app/lib/workbook-v31-deterministic-core.ts
-- DeterministicV31Canonical*State interfaces) but currently have no Supabase column to persist
-- into. No existing column is dropped, renamed, or altered. No RLS policy changes are required:
-- RLS is table/row-scoped and already covers these tables (see
-- 20260818160000_premium_v31_module_tables_rls.sql); adding a column does not change row
-- visibility, and no new GRANT/policy statements are issued here.
-- no destructive delete

-- premium_connectivity_remote_work and premium_transport_airports already carry `verified` and
-- (for transport_airports) almost every other approved content field; both are only missing
-- `verified_at`, mirroring the same field already added to the other premium_* tables in the prior
-- migration (20260820120000_premium_v31_import_parity_hardening.sql).
alter table public.premium_connectivity_remote_work add column if not exists verified_at timestamptz;
alter table public.premium_transport_airports add column if not exists verified_at timestamptz;

-- premium_language_integration currently only has (summary, english_support). The workbook's
-- LANGUAGE_INTEGRATION sheet already carries 5 additional structured fields plus verified/
-- verified_at with no DB home at all.
alter table public.premium_language_integration add column if not exists verified boolean;
alter table public.premium_language_integration add column if not exists verified_at timestamptz;
alter table public.premium_language_integration add column if not exists primary_language text;
alter table public.premium_language_integration add column if not exists english_proficiency text;
alter table public.premium_language_integration add column if not exists government_english_access text;
alter table public.premium_language_integration add column if not exists medical_english_access text;
alter table public.premium_language_integration add column if not exists language_resources text;

-- premium_community_social currently only has (summary, social_notes). The workbook's
-- COMMUNITY_SOCIAL sheet already carries 5 additional structured fields plus verified/verified_at
-- with no DB home at all.
alter table public.premium_community_social add column if not exists verified boolean;
alter table public.premium_community_social add column if not exists verified_at timestamptz;
alter table public.premium_community_social add column if not exists expat_presence text;
alter table public.premium_community_social add column if not exists volunteering text;
alter table public.premium_community_social add column if not exists ease_meeting_people text;
alter table public.premium_community_social add column if not exists age_mix text;
alter table public.premium_community_social add column if not exists transient_vs_rooted text;

-- premium_destination_scores has no verified/verified_at column at all. The workbook's
-- DESTINATION_SCORES sheet already carries both fields with no DB home. (evidence_summary and
-- source_url remain out of scope for this migration - see the parity report's STILL BLOCKED list.)
alter table public.premium_destination_scores add column if not exists verified boolean;
alter table public.premium_destination_scores add column if not exists verified_at timestamptz;
