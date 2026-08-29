# legacy-migration-pilot-06 (Phase 5A + 5B: identity, Supabase check, and complete v3.3 skeleton)

**Status: pre-migration.** No destination in this package is `migrated`, `enriched`,
`display_ready`, or `scoring_ready`. No web research has been performed. This package exists to
establish a trustworthy, verified starting point before any research begins.

## What this is

An isolated, self-contained package covering exactly the 6 approved legacy-migration pilot
destinations:

| City | destination_key / slug | Country |
|---|---|---|
| The Hague | `the-hague-netherlands` | Netherlands |
| Kyoto | `kyoto-japan` | Japan |
| Santa Fe | `santa-fe-new-mexico-united-states` | United States |
| St. Cloud | `st-cloud-minnesota-united-states` | United States |
| San Ramón | `san-ramon-costa-rica` | Costa Rica |
| St. John's | `st-john-s-canada` | Canada |

## Contents

- `pilot-destinations.json` - structured identity + legacy-source inventory for all 6 destinations
  (legacy TypeScript presence, image/enrichment/generated-seed file presence, Wave 1 leads,
  confirmed defects, related-name risks). This is the machine-readable intermediate a research
  agent should read first.
- `pilot-manifest.json` - the 6 agreed manifest fields per destination (`destination_key`, `slug`,
  `source_system`, `batch_id`, `schema_version`, `source_content_hash`, `status`, `conflicts`,
  `validation_result`, `last_updated_at`, `last_updated_by`). Every `status` is explicit JSON
  `null` - see the file's own `statusFieldNote` for why no placeholder status string was invented.
  As of Phase 5B, `source_content_hash` also includes `supabase_destinations_catalog` for all 6
  destinations, and every row has at least one `supabase_presence` conflict entry (see below).
- `source-snapshots/*.json` - one file per destination, containing the exact, unmodified,
  verbatim TypeScript object literal extracted read-only from `app/lib/destinations.ts`, plus its
  SHA-256 hash. `app/lib/destinations.ts` itself was never modified.
- `source-snapshots/*-supabase.json` (Phase 5B) - one file per destination, containing the exact,
  verbatim JSON row(s) returned by a read-only `GET /rest/v1/destinations_catalog?slug=eq....&select=*`
  request (and a second exact-match request by `destination_key`), via the application's own
  `supabaseFetch()` anon-key path (`app/lib/supabase.ts`). **All 6 destinations already have exactly
  one published Supabase row today**, matched by exact slug - see "Supabase results" below.
- `wave1-leads/*.json` - recoverable content from the deleted Wave 1 pipeline
  (`docs/destination-expansion-proposed-300.json`, recovered via `git show`), for the 2
  destinations (The Hague, Santa Fe) that appeared in it. Labeled `WAVE1_UNVERIFIED_LEAD`.
  Not present for the other 4 destinations because no Wave 1 record was found for them.
- `DestinationFinderAI_LegacyMigrationPilot06_v3.3_SKELETON.xlsx` - the empty, structurally valid
  six-destination v3.3-compatible workbook (see below).
- `validation-report.json` - output of `scripts/validate_legacy_pilot06_workbook.py`.

## Supabase results (Phase 5B)

All 6 destinations were checked via exact-match, read-only `GET` requests only (`slug=eq....` and
`destination_key=eq....`, never fuzzy/substring matching), using the application's own real
`supabaseFetch()` path and anon/publishable key - the same code path the live app already uses for
every destination page request. No write, upsert, RPC, or migration was performed; no credential
was printed or stored anywhere in this package.

**Result: all 6 destinations already have exactly one `destinations_catalog` row today**, matched
by exact `slug` (zero rows matched by `destination_key`, since that column is `null` on all 6 rows).
Every row has `status: "published"`, `tier: "launch"`, and `metadata.source: "workbook_import"`,
with text content matching `app/lib/destinations.ts` near-verbatim - including the same confirmed
defects (Santa Fe's `emoji: "12"`, St. Cloud's duplicate `"Minnesota"` tag also appear in the
Supabase row). **These are not blank-slate destinations** - they are already live, published rows.
Any future migration must `UPDATE` these existing rows, never insert a duplicate. This is recorded
as a `supabase_presence` conflict entry for every destination in `pilot-manifest.json` and was not
auto-resolved.

## The skeleton workbook

Built deterministically by `scripts/build_legacy_pilot06_workbook.py` from `pilot-destinations.json`.
It reuses the existing v3.1/v3.3 schema exactly - no new schema, no new destination-key
convention:

- All reference/control sheets (`README`, `CATEGORIES`, `SCORING_DIMENSIONS`, `STAY_MODES`,
  `SCHEMA_INDEX`, `PREMIUM_REQUIREMENTS`, `IMPORT_CONTRACT`, `VALIDATION_RULES`,
  `DATA_DICTIONARY`) are copied **verbatim** from the real, committed Batch #1 v3.3 workbook -
  these are workbook-level constants, not per-batch content, so nothing here is invented.
- `DESTINATIONS` has exactly 6 rows. Only `destination_key`, `destination_name`, `country`, and
  `slug` are populated - the only fields that are genuinely known, unfabricated facts already in
  the legacy catalog. Every other column (`state_region`, descriptions, currency, coordinates,
  URLs, `enabled`, `content_status`, `beach_access`, etc.) is left blank.
- Every destination-content sheet (`DESTINATION_FACTS` through `LIFESTYLE_FEATURES`) has its real
  header row and **zero data rows**. No lifestyle, scoring, climate, cost, neighborhood, place,
  image, or recommendation research has been written. The full **48-sheet** v3.3 structure is
  present (`LIFESTYLE_FEATURES` was added in Phase 5B, completing the structure that Phase 5A had
  left at 47 sheets).
- `LIFESTYLE_FEATURES` is present with its real headers and **zero data rows** - no lifestyle
  research exists yet for this pilot. (Phase 5A had omitted this sheet entirely as a
  simplification; Phase 5B completed the structure by including it empty instead, since the task
  requires the full 48-sheet shape.)
- `WORKBOOK_METADATA`, `CHANGELOG`, `PILOT_STATUS`, and `IMPORT_MANIFEST` are freshly written (not
  copied from Batch #1, since their content is inherently batch-specific) with honest values -
  e.g. `population_strategy = empty_skeleton_pending_research`, `batch_ready = FALSE`,
  `PILOT_STATUS.Status = PRE_MIGRATION_NOT_YET_RESEARCHED` for every row.
- `DESTINATION_ALIASES` has zero rows: `destination_key` was set equal to the exact legacy slug
  for all 6 destinations (no shorter/abbreviated form exists anywhere in the repository for them),
  so no alias is needed yet.

**Key-generation convention used:** `destination_key = slug = the exact legacy `app/lib/destinations.ts`
slug, verbatim`. This was a deliberate choice, not an oversight - inventing a new abbreviated
`destination_key` form (e.g. mirroring `the-villages-fl-us`'s short form) would have created a
second, competing key-generation convention with nothing in the repository to justify a specific
abbreviation. Using the existing, unique, already-real slug directly satisfies "do not create a
new destination-key convention."

## Validation performed

1. **Structural validator** (`scripts/validate_legacy_pilot06_workbook.py`): sheet-shape, exact
   destination-key set, uniqueness, and "every content sheet is empty" checks. All passed -
   see `validation-report.json`.
2. **Real deterministic parser** (`app/lib/__tests__/legacy-pilot06-skeleton.test.ts`): the actual
   production `loadFrozenWorkbookV31DeterministicImport` function (no new/second importer was
   written) parses this workbook directly, asserting: exactly 6 destinations resolved, zero
   validation errors, zero orphaned rows, every non-identity module empty, and identity fields
   match the legacy source exactly. All 4 tests passed.
3. **Existing workbook preservation**: the 4 committed v3.2/v3.3 expansion workbooks were
   SHA-256-hash-verified unchanged both before and after this package was built.

## What was intentionally NOT done in this phase

- No web research. No destination fact, score, neighborhood, place, image, or recommendation was
  populated.
- No Supabase write of any kind - only the 12 read-only exact-match GET requests described above.
- No registration in `app/lib/expansion-workbook-registry.ts` and no preview activation.
- No change to any existing legacy TypeScript record, any existing v3.2/v3.3 workbook, the
  questionnaire, Retirement DNA, Intelligence v2, scoring, ranking, or any production destination
  page.
