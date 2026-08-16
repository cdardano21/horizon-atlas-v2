-- Phase 3A: additive durable presence + keyed-child storage for v3.1 deterministic persistence
-- This migration is intentionally non-destructive and does not delete or overwrite existing destination data.
-- no destructive delete

create extension if not exists pgcrypto;

create table if not exists public.premium_destination_module_presence (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  module_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_destination_module_presence_destination_module_key unique (destination_id, module_key),
  constraint premium_destination_module_presence_module_key_check check (
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
      'sources'
    )
  )
);

create table if not exists public.premium_move_checklist (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  checklist_key text not null,
  summary text,
  checklist_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_move_checklist_destination_checklist_key unique (destination_id, checklist_key)
);

create table if not exists public.premium_events_seasonality (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations_catalog(id) on delete cascade,
  destination_key text not null,
  event_seasonality_key text not null,
  summary text,
  seasonality_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint premium_events_seasonality_destination_event_seasonality_key unique (destination_id, event_seasonality_key)
);

create index if not exists idx_premium_destination_module_presence_destination
  on public.premium_destination_module_presence(destination_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_premium_destination_module_presence
before update on public.premium_destination_module_presence
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_move_checklist
before update on public.premium_move_checklist
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_premium_events_seasonality
before update on public.premium_events_seasonality
for each row execute procedure public.set_updated_at();

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'facts' as module_key
from public.premium_destination_facts
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'scores' as module_key
from public.premium_destination_scores
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'neighborhoods' as module_key
from public.premium_neighborhoods
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'places' as module_key
from public.premium_places
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'resources' as module_key
from public.premium_resources
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'media' as module_key
from public.premium_media
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'propertyResources' as module_key
from public.premium_property_resources
on conflict (destination_id, module_key) do nothing;

insert into public.premium_destination_module_presence (destination_id, destination_key, module_key)
select distinct destination_id, destination_key, 'sources' as module_key
from public.premium_sources
on conflict (destination_id, module_key) do nothing;
