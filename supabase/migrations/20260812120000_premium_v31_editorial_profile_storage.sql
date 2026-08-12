-- Phase 3A.8f.2b.2.1b.3: additive editorial profile storage for v3.1 deterministic persistence
-- This migration is intentionally non-destructive and does not delete or overwrite existing destination data.
-- no destructive delete

alter table public.premium_destination_profiles
  add column if not exists identity_name text,
  add column if not exists currency text,
  add column if not exists primary_language text,
  add column if not exists time_zone text,
  add column if not exists profile_storage_version integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'premium_destination_profiles_profile_storage_version_check'
      and conrelid = 'public.premium_destination_profiles'::regclass
  ) then
    alter table public.premium_destination_profiles
      add constraint premium_destination_profiles_profile_storage_version_check
      check (
        profile_storage_version is null
        or profile_storage_version = 1
      );
  end if;
end
$$;
