# Three-pilot premium write package

- Source dry-run artifact: tmp/premium-pilot-dry-run.json
- Bound catalog IDs: f65b8c56-0a75-4e83-8b41-533444f0eff2 -> lisbon-pt, 63a56797-164d-49bd-9969-9b539ce7e57d -> new-braunfels-tx-us, 32b10339-a202-48bb-b1eb-2798735b7ed3 -> summerlin-nv-us
- Collision check: PASS (0 collisions)
- Legacy protection: {
  "catalogRowCountBefore": 1027,
  "catalogRowCountAfter": 1027,
  "destinationKeyUpdates": 3,
  "pilotRowsReceivingDestinationKey": 3,
  "slugChanges": 0,
  "legacyContentChanges": 0,
  "nonPilotRowsUntouched": 1024
}

## Row-count plan
- premium_accessibility: 3 row(s)
- premium_bureaucracy_setup: 15 row(s)
- premium_climate_monthly: 36 row(s)
- premium_community_social: 3 row(s)
- premium_connectivity_remote_work: 3 row(s)
- premium_cost_of_living: 30 row(s)
- premium_daily_life_practicality: 3 row(s)
- premium_destination_facts: 10 row(s)
- premium_destination_module_presence: 96 row(s)
- premium_destination_profiles: 3 row(s)
- premium_destination_scores: 9 row(s)
- premium_environment_quality: 3 row(s)
- premium_events_seasonality: 6 row(s)
- premium_family_education: 3 row(s)
- premium_healthcare_insurance: 3 row(s)
- premium_housing_property: 3 row(s)
- premium_language_integration: 3 row(s)
- premium_lgbtq_inclusivity: 3 row(s)
- premium_lifestyle_laws: 6 row(s)
- premium_media: 11 row(s)
- premium_move_checklist: 30 row(s)
- premium_neighborhoods: 24 row(s)
- premium_pets: 3 row(s)
- premium_places: 105 row(s)
- premium_property_resources: 9 row(s)
- premium_reality_check: 15 row(s)
- premium_resources: 20 row(s)
- premium_retirement_aging: 3 row(s)
- premium_safety_risks: 4 row(s)
- premium_sources: 51 row(s)
- premium_taxes_finance: 3 row(s)
- premium_transport_airports: 7 row(s)
- premium_visa_residency: 4 row(s)
- premium_work_business: 3 row(s)

## Post-write read-only validation
- Read root row through the persisted root reader for each of the three binding IDs.
- Read profile and presence modules through the actual persisted-bundle reader.
- Assert the bundle outcome is SUCCESS for each pilot and that the returned destinationKey and slug match the bound values.
- Assert the catalog count remains 1027 and the SQL-only transaction touched only the three destination_key updates and premium inserts.

## Execute command (prepared, not executed)
```bash
node scripts/prepare_three_pilot_premium_seed.mjs
```
