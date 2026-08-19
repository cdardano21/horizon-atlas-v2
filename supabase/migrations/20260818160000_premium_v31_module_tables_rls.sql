-- Closes a Supabase Security Advisor "RLS Disabled in Public" finding for the 34 premium_* v3.1
-- module storage tables that are linked to destinations_catalog via destination_id. Replicates,
-- verbatim in structure, the exact pattern already enabled and proven on 42 other public tables
-- (e.g. neighborhoods, destination_resources): admins (authenticated + is_admin_user()) get full
-- access; anon/authenticated get read-only access to rows whose parent destination is published.
-- No data, no destination content, and no existing working route is changed by this migration -
-- see the RLS security audit report for verified read/write code-path analysis.

do $$
declare
  t text;
  tables text[] := array[
    'premium_accessibility',
    'premium_bureaucracy_setup',
    'premium_climate_monthly',
    'premium_community_social',
    'premium_connectivity_remote_work',
    'premium_cost_of_living',
    'premium_daily_life_practicality',
    'premium_destination_facts',
    'premium_destination_module_presence',
    'premium_destination_profiles',
    'premium_destination_scores',
    'premium_environment_quality',
    'premium_events_seasonality',
    'premium_family_education',
    'premium_healthcare_insurance',
    'premium_housing_property',
    'premium_language_integration',
    'premium_lgbtq_inclusivity',
    'premium_lifestyle_laws',
    'premium_media',
    'premium_move_checklist',
    'premium_neighborhoods',
    'premium_pets',
    'premium_places',
    'premium_property_resources',
    'premium_reality_check',
    'premium_resources',
    'premium_retirement_aging',
    'premium_safety_risks',
    'premium_sources',
    'premium_taxes_finance',
    'premium_transport_airports',
    'premium_visa_residency',
    'premium_work_business'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);

    execute format(
      'create policy %L on public.%I for all to authenticated using (is_admin_user()) with check (is_admin_user());',
      'Admins manage rows (' || t || ')',
      t
    );

    execute format(
      'create policy %L on public.%I for select to anon, authenticated using (exists (select 1 from public.destinations_catalog d where d.id = %I.destination_id and (d.status = %L or is_admin_user())));',
      'Published rows are viewable (' || t || ')',
      t,
      t,
      'published'
    );
  end loop;
end $$;
