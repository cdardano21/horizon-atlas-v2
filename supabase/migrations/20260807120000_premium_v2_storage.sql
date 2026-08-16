-- Phase 2: additive Premium v2.0 storage foundation
-- This migration is intentionally non-destructive and does not delete or overwrite existing destination data.
-- no destructive delete

create extension if not exists pgcrypto;

create table if not exists public.premium_destination_profiles (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  profile_status text not null default 'draft' check (profile_status in ('draft', 'review', 'published', 'archived')),
  summary text,
  overview text,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key)
);

create table if not exists public.premium_destination_facts (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  fact_key text not null,
  fact_type text,
  title text,
  body text,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, fact_key)
);

create table if not exists public.premium_destination_scores (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  score_key text not null,
  score_name text,
  score_value numeric(5,2),
  weight numeric(5,2),
  higher_is_better boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, score_key)
);

create table if not exists public.premium_neighborhoods (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  neighborhood_key text not null,
  neighborhood_name text not null,
  area_type text,
  best_for text,
  summary text,
  housing_character text,
  walkability_rating text,
  safety_rating text,
  transit_rating text,
  pros text,
  cons text,
  google_maps_url text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, neighborhood_key)
);

create table if not exists public.premium_places (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  neighborhood_key text,
  place_key text not null,
  category_key text,
  place_name text not null,
  subcategory text,
  description text,
  address text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  price_level text,
  website_url text,
  google_maps_url text,
  phone text,
  best_for text,
  display_order integer not null default 0,
  source_name text,
  source_url text,
  verified boolean not null default false,
  confidence text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, place_key)
);

create table if not exists public.premium_resources (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  resource_key text not null,
  resource_category text,
  resource_name text not null,
  description text,
  url text,
  official boolean not null default false,
  stay_mode_key text,
  display_order integer not null default 0,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, resource_key)
);

create table if not exists public.premium_media (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  media_key text not null,
  media_type text,
  provider text,
  url text,
  caption text,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  verified boolean not null default false,
  source_name text,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, media_key)
);

create table if not exists public.premium_cost_of_living (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  household_type text,
  lifestyle_tier text,
  category text not null,
  monthly_low numeric(12,2),
  monthly_high numeric(12,2),
  currency text,
  included_notes text,
  stay_mode_key text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_climate_monthly (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  month_key text not null,
  avg_high_temp numeric(6,2),
  avg_low_temp numeric(6,2),
  precipitation_mm numeric(8,2),
  humidity_pct numeric(5,2),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_housing_property (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  housing_topic text,
  stay_mode_key text,
  can_foreigners_buy text,
  residency_required_to_buy text,
  restrictions_summary text,
  typical_condo_price numeric(12,2),
  typical_house_price numeric(12,2),
  typical_villa_price numeric(12,2),
  price_per_sqm numeric(12,2),
  currency text,
  property_tax_notes text,
  transfer_tax_notes text,
  closing_cost_notes text,
  hoa_condo_fee_notes text,
  foreigner_mortgage_notes text,
  typical_down_payment_pct numeric(5,2),
  rental_rules_notes text,
  buying_process_summary text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_property_resources (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  transaction_type text,
  resource_name text,
  resource_type text,
  url text,
  official boolean not null default false,
  description text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_healthcare_insurance (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  topic text,
  system_summary text,
  public_access_foreigners text,
  private_care_available text,
  english_speaking_care text,
  typical_gp_visit_cost numeric(12,2),
  typical_specialist_cost numeric(12,2),
  currency text,
  medicare_applicability text,
  international_insurance_notes text,
  emergency_number text,
  pharmacy_notes text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_visa_residency (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  traveler_nationality text,
  stay_mode_key text,
  visa_free_days text,
  visa_type text,
  residency_option text,
  income_requirement text,
  proof_of_funds text,
  insurance_requirement text,
  work_rights text,
  renewal_notes text,
  permanent_residency_path text,
  citizenship_path text,
  official_source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_taxes_finance (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  topic text,
  summary text,
  tax_type text,
  notes text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_safety_risks (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  topic text,
  severity text,
  summary text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_transport_airports (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  topic text,
  name text,
  summary text,
  distance_km integer,
  typical_drive_minutes integer,
  public_transit_available boolean,
  nonstop_us_service boolean,
  car_needed_rating text,
  parking_notes text,
  rideshare_notes text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_connectivity_remote_work (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  avg_download_mbps numeric(8,2),
  fiber_available text,
  mobile_5g text,
  utility_reliability text,
  coworking_summary text,
  us_time_zone_fit text,
  remote_work_notes text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_reality_check (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  record_key text not null,
  display_order integer not null default 0,
  title text,
  detail text,
  severity text,
  stay_mode_key text,
  source_name text,
  source_url text,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, record_key)
);

create table if not exists public.premium_sources (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  source_key text not null,
  source_name text not null,
  source_url text,
  source_type text,
  publisher text,
  accessed_at text,
  verified boolean not null default false,
  confidence text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, destination_key, source_key)
);

create index if not exists idx_premium_destination_profiles_destination on public.premium_destination_profiles(destination_id, destination_key);
create index if not exists idx_premium_destination_facts_destination on public.premium_destination_facts(destination_id, destination_key, fact_key);
create index if not exists idx_premium_destination_scores_destination on public.premium_destination_scores(destination_id, destination_key, score_key);
create index if not exists idx_premium_neighborhoods_destination on public.premium_neighborhoods(destination_id, destination_key, neighborhood_key);
create index if not exists idx_premium_places_destination on public.premium_places(destination_id, destination_key, place_key);
create index if not exists idx_premium_resources_destination on public.premium_resources(destination_id, destination_key, resource_key);
create index if not exists idx_premium_media_destination on public.premium_media(destination_id, destination_key, media_key);
create index if not exists idx_premium_cost_of_living_destination on public.premium_cost_of_living(destination_id, destination_key, category);
create index if not exists idx_premium_climate_monthly_destination on public.premium_climate_monthly(destination_id, destination_key, month_key);
create index if not exists idx_premium_housing_property_destination on public.premium_housing_property(destination_id, destination_key, housing_topic);
create index if not exists idx_premium_property_resources_destination on public.premium_property_resources(destination_id, destination_key, transaction_type);
create index if not exists idx_premium_healthcare_insurance_destination on public.premium_healthcare_insurance(destination_id, destination_key, topic);
create index if not exists idx_premium_visa_residency_destination on public.premium_visa_residency(destination_id, destination_key, traveler_nationality);
create index if not exists idx_premium_taxes_finance_destination on public.premium_taxes_finance(destination_id, destination_key, topic);
create index if not exists idx_premium_safety_risks_destination on public.premium_safety_risks(destination_id, destination_key, severity);
create index if not exists idx_premium_transport_airports_destination on public.premium_transport_airports(destination_id, destination_key, topic);
create index if not exists idx_premium_connectivity_remote_work_destination on public.premium_connectivity_remote_work(destination_id, destination_key, record_key);
create index if not exists idx_premium_reality_check_destination on public.premium_reality_check(destination_id, destination_key, display_order);
create index if not exists idx_premium_sources_destination on public.premium_sources(destination_id, destination_key, source_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_premium_destination_profiles
before update on public.premium_destination_profiles
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_destination_facts
before update on public.premium_destination_facts
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_destination_scores
before update on public.premium_destination_scores
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_neighborhoods
before update on public.premium_neighborhoods
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_places
before update on public.premium_places
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_resources
before update on public.premium_resources
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_media
before update on public.premium_media
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_cost_of_living
before update on public.premium_cost_of_living
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_climate_monthly
before update on public.premium_climate_monthly
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_housing_property
before update on public.premium_housing_property
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_property_resources
before update on public.premium_property_resources
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_healthcare_insurance
before update on public.premium_healthcare_insurance
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_visa_residency
before update on public.premium_visa_residency
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_taxes_finance
before update on public.premium_taxes_finance
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_safety_risks
before update on public.premium_safety_risks
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_transport_airports
before update on public.premium_transport_airports
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_connectivity_remote_work
before update on public.premium_connectivity_remote_work
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_reality_check
before update on public.premium_reality_check
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_sources
before update on public.premium_sources
for each row execute procedure public.set_updated_at();
