# v3.1 Deterministic Module Inventory (Engineering Reference)

Lightweight, durable reference for the deterministic v3.1 destination contract's current module set.
This is documentation only - not a runtime configuration system. It exists so the contract stays
understandable while Batch #1 teaches us what an eventual full automated field/module registry
actually needs to validate (see the pre-Batch #1 architecture review for that longer-term plan).

Do not treat this file as authoritative for code - if it drifts from `app/lib/persistence/v31/manifest.ts`
or `app/lib/workbook-v31-deterministic-core.ts`, those source files win. Update this file when a module
is added, renamed, or removed.

## Scalar / core identity fields

Not modules - direct fields on every destination's identity/editorial record. Always present (may be `null`).

- `identity`: destinationKey, slug, name, city, country, population, metroPopulation, elevationMeters, latitude, longitude
- `editorial`: shortDescription, longDescription, currency, primaryLanguage, timeZone

## Singleton modules

At most one record per destination. No stable child key - diffed as a single object.

| Module key | Fields |
|---|---|
| `environmentQuality` | summary, qualityNotes |
| `dailyLifePracticality` | summary, practicalityNotes |

## Keyed-child modules

Zero or more records per destination, each with its own stable child key enabling per-item
create/update/preserve/delete without touching sibling items in the same module.

| Module key | Stable key field (camelCase / raw workbook snake_case) |
|---|---|
| `facts` | factKey / fact_key |
| `scores` | scoreKey / score_key |
| `neighborhoods` | neighborhoodKey / neighborhood_key |
| `places` | placeKey / place_key |
| `resources` | resourceKey / resource_key |
| `media` | mediaKey / media_key |
| `propertyResources` | itemKey / resource_key |
| `moveChecklist` | checklistKey / checklist_key |
| `eventsSeasonality` | eventSeasonalityKey / event_season_key |
| `sources` | sourceKey / source_key |

## Non-keyed repeatable / replace-whole-module fields

Treated as a single replaceable value per destination (not diffed item-by-item).

housing, healthcare, visaResidency, taxesFinance, lgbtqInclusivity, safetyRisks, transportation,
remoteWork, languageIntegration, pets, familyEducation, communitySocial, accessibility,
bureaucracySetup, workBusiness, retirementAging, lifestyleLaws, realityCheck, costOfLiving, climateMonthly

## Adding a new module later (e.g. pickleball)

1. Add the sheet/columns to the workbook contract (optional - a workbook without it is still valid).
2. Add the field(s) to the canonical type in `workbook-v31-deterministic-core.ts`.
3. Register the module key in the relevant list in `manifest.ts` (`KEYED_CHILD_MODULES` or
   `NON_KEYED_REPEATABLE_MODULES` or `SINGLETON_MODULES`) and its stable-key field in
   `CHILD_KEY_FIELD_BY_MODULE` if it's a keyed-child module.
4. Add a `premium_<module>` table (see `supabase/migrations/2026080712*_premium_v2_storage.sql` for the pattern) if it needs persistence.
5. Update this file.

None of this requires touching destination-specific code, rebuilding other modules, or breaking
destinations that don't yet have the new field.
