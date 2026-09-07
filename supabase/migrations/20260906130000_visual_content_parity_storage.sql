-- Additive storage required for v3.3 visual-content parity.
-- Existing destinations remain valid: demographic columns are nullable and no rows are backfilled.
-- no destructive delete

alter table public.destinations_catalog add column if not exists population text;
alter table public.destinations_catalog add column if not exists metro_population text;
alter table public.destinations_catalog add column if not exists elevation text;

create table if not exists public.premium_lifestyle_features (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  feature_group text,
  feature_key text,
  feature_value text,
  availability_level text,
  proximity_band text,
  display_label text,
  evidence_summary text,
  source_name text,
  source_url text,
  source_as_of_date text,
  confidence text,
  matching_enabled text,
  display_enabled text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_lifestyle_features_destination_record_key_unique unique (destination_id, destination_key, record_key)
);

create index if not exists idx_premium_lifestyle_features_destination
  on public.premium_lifestyle_features(destination_id);

drop trigger if exists set_updated_at_premium_lifestyle_features on public.premium_lifestyle_features;
create trigger set_updated_at_premium_lifestyle_features
before update on public.premium_lifestyle_features
for each row execute procedure public.set_updated_at();

alter table public.premium_lifestyle_features enable row level security;

create policy "Admins manage rows (premium_lifestyle_features)"
on public.premium_lifestyle_features
for all to authenticated
using (is_admin_user())
with check (is_admin_user());

create policy "Published rows are viewable (premium_lifestyle_features)"
on public.premium_lifestyle_features
for select to anon, authenticated
using (
  exists (
    select 1
    from public.destinations_catalog d
    where d.id = premium_lifestyle_features.destination_id
      and (d.status = 'published' or is_admin_user())
  )
);

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
        'lifestyleFeatures',
        'environmentQuality',
        'dailyLifePracticality'
      )
    );
end
$$;
