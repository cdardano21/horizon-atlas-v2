-- Phase 3A.8f.2b.2.3: additive remaining module storage for v3.1 deterministic persistence
-- This migration is intentionally non-destructive and does not delete or overwrite existing destination data.
-- no destructive delete

create extension if not exists pgcrypto;

create table if not exists public.premium_lgbtq_inclusivity (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  cultural_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_lgbtq_inclusivity_position_check check (position >= 1),
  constraint premium_lgbtq_inclusivity_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_language_integration (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  english_support text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_language_integration_position_check check (position >= 1),
  constraint premium_language_integration_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_pets (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  pet_friendly_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_pets_position_check check (position >= 1),
  constraint premium_pets_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_family_education (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  schools_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_family_education_position_check check (position >= 1),
  constraint premium_family_education_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_community_social (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  social_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_community_social_position_check check (position >= 1),
  constraint premium_community_social_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_accessibility (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  mobility_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_accessibility_position_check check (position >= 1),
  constraint premium_accessibility_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_bureaucracy_setup (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  setup_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_bureaucracy_setup_position_check check (position >= 1),
  constraint premium_bureaucracy_setup_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_work_business (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  remote_work_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_work_business_position_check check (position >= 1),
  constraint premium_work_business_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_retirement_aging (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  aging_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_retirement_aging_position_check check (position >= 1),
  constraint premium_retirement_aging_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_lifestyle_laws (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  position integer not null,
  summary text,
  legal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_lifestyle_laws_position_check check (position >= 1),
  constraint premium_lifestyle_laws_destination_position_unique unique (destination_id, position)
);

create table if not exists public.premium_environment_quality (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  summary text,
  quality_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_environment_quality_destination_unique unique (destination_id)
);

create table if not exists public.premium_daily_life_practicality (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(destination_id) on delete cascade,
  destination_key text not null,
  summary text,
  practicality_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_daily_life_practicality_destination_unique unique (destination_id)
);

drop trigger if exists set_updated_at_premium_lgbtq_inclusivity on public.premium_lgbtq_inclusivity;
create trigger set_updated_at_premium_lgbtq_inclusivity
before update on public.premium_lgbtq_inclusivity
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_language_integration on public.premium_language_integration;
create trigger set_updated_at_premium_language_integration
before update on public.premium_language_integration
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_pets on public.premium_pets;
create trigger set_updated_at_premium_pets
before update on public.premium_pets
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_family_education on public.premium_family_education;
create trigger set_updated_at_premium_family_education
before update on public.premium_family_education
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_community_social on public.premium_community_social;
create trigger set_updated_at_premium_community_social
before update on public.premium_community_social
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_accessibility on public.premium_accessibility;
create trigger set_updated_at_premium_accessibility
before update on public.premium_accessibility
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_bureaucracy_setup on public.premium_bureaucracy_setup;
create trigger set_updated_at_premium_bureaucracy_setup
before update on public.premium_bureaucracy_setup
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_work_business on public.premium_work_business;
create trigger set_updated_at_premium_work_business
before update on public.premium_work_business
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_retirement_aging on public.premium_retirement_aging;
create trigger set_updated_at_premium_retirement_aging
before update on public.premium_retirement_aging
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_lifestyle_laws on public.premium_lifestyle_laws;
create trigger set_updated_at_premium_lifestyle_laws
before update on public.premium_lifestyle_laws
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_environment_quality on public.premium_environment_quality;
create trigger set_updated_at_premium_environment_quality
before update on public.premium_environment_quality
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_premium_daily_life_practicality on public.premium_daily_life_practicality;
create trigger set_updated_at_premium_daily_life_practicality
before update on public.premium_daily_life_practicality
for each row execute procedure public.set_updated_at();

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'premium_destination_module_presence_module_key_check'
      and conrelid = 'public.premium_destination_module_presence'::regclass
  ) then
    alter table public.premium_destination_module_presence
      drop constraint premium_destination_module_presence_module_key_check;
  end if;

  alter table public.premium_destination_module_presence
    add constraint premium_destination_module_presence_module_key_check
    check (
      module_key in (
        'facts',
        'scores',
        'neighborhoods',
        'places',
        'resources',
        'media',
        'propertyResources',
        'moveChecklist',
        'eventsSeasonality',
        'sources',
        'costOfLiving',
        'climateMonthly',
        'housing',
        'healthcare',
        'visaResidency',
        'taxesFinance',
        'lgbtqInclusivity',
        'safetyRisks',
        'transportation',
        'remoteWork',
        'languageIntegration',
        'pets',
        'familyEducation',
        'communitySocial',
        'accessibility',
        'bureaucracySetup',
        'workBusiness',
        'retirementAging',
        'lifestyleLaws',
        'realityCheck',
        'environmentQuality',
        'dailyLifePracticality'
      )
    );
end
$$;
