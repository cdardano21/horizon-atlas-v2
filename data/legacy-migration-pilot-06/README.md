# legacy-migration-pilot-06 (Phase 5A + 5B + 5C: identity, Supabase check, complete v3.3 skeleton, and Wave 1 evidence population)

**Status: pre-migration, partially researched.** No destination in this package is `migrated`,
`enriched`, `display_ready`, or `scoring_ready`. As of Phase 5C, exactly 2 of the 6 destinations
(The Hague, Kyoto - "Wave 1") have evidence-backed `DESTINATIONS` identity/geography fields and
`CLIMATE_MONTHLY` data populated from cited, authoritative sources. The other 4 destinations remain
untouched, identity-only skeletons exactly as built in Phase 5A/5B.

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
- `DestinationFinderAI_LegacyMigrationPilot06_v3.3_SKELETON.xlsx` - the six-destination v3.3-compatible
  workbook (see below). Despite the filename, as of Phase 5C it is no longer a pure empty skeleton
  for The Hague/Kyoto - it carries their evidence-backed identity/geography/climate rows. The name
  was kept unchanged to avoid an unnecessary rename/churn of a tracked binary file.
- `validation-report.json` - output of `scripts/validate_legacy_pilot06_workbook.py`.
- `research-ledger/*.json` (Phase 5C) - per-destination research ledgers (`the-hague-netherlands.json`,
  `kyoto-japan.json`) recording every populated fact with its `sourceName`, `sourceUrl`,
  `retrievedAt`, and an explicit `notResearchedThisPass` list of categories deliberately left blank.
  `the-hague-netherlands-climate.json` / `kyoto-japan-climate.json` hold the 12-month KNMI/JMA
  climate-normal data consumed by the builder script. `wave1-identity-fields.json` holds the clean
  DESTINATIONS-column mapping consumed by the builder script.

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
   destination-key set, uniqueness checks, plus (Phase 5C) a nuanced check that every content sheet
   other than `CLIMATE_MONTHLY`/`SOURCES` remains empty, that `CLIMATE_MONTHLY`/`SOURCES` rows exist
   ONLY for the two Wave 1 destination_keys (exactly 12 `CLIMATE_MONTHLY` rows each), and that the
   other 4 destinations' `DESTINATIONS` rows have ONLY their 4 identity fields populated. All passed
   - see `validation-report.json`.
2. **Real deterministic parser** (`app/lib/__tests__/legacy-pilot06-skeleton.test.ts`): the actual
   production `loadFrozenWorkbookV31DeterministicImport` function (no new/second importer was
   written) parses this workbook directly. 7 tests, all passing: exactly 6 destinations resolved
   with zero validation errors; every non-climate/non-sources module empty for all 6 destinations;
   `CLIMATE_MONTHLY`/`SOURCES` populated only for the two Wave 1 keys (12 climate rows each); no
   cross-destination leakage in any child module; The Hague's and Kyoto's evidence-backed identity
   fields match the research ledger exactly while their narrative/editorial fields remain blank;
   and the other 4 destinations remain completely untouched (identity-only).
3. **Existing workbook preservation**: the 4 committed v3.2/v3.3 expansion workbooks (plus the 2
   master pilot workbooks and 2 other batch workbooks - 8 total tracked `.xlsx` files outside this
   package) show zero `git diff` and were SHA-256-hash-verified unchanged both before and after this
   package was rebuilt.

## Phase 5C: Wave 1 evidence-based population (The Hague, Kyoto)

Researched and populated ONLY evidence-supported fields for the two Wave 1 pilot destinations,
using current, authoritative, directly-fetched sources (never AI-generated summaries or
search-result snippets):

- **The Hague**: population (549,163, municipality, 1 Jan 2021, Statistics Netherlands/CBS via
  Wikipedia infobox citation), metro population (2,390,101, Rotterdam-The Hague metro area),
  coordinates (52.08, 4.31), elevation (1 m), time zone (`Europe/Amsterdam`), currency (`EUR`),
  primary language (`Dutch`), official tourism URL (`https://www.denhaag.nl/en/`, confirmed live),
  and 12 months of `CLIMATE_MONTHLY` data (avg high/low, rainfall, humidity, sunshine hours) from
  the Royal Netherlands Meteorological Institute (KNMI) 1981-2010 normal for the Valkenburg
  station, the nearest station representing The Hague.
- **Kyoto**: population (1,431,419, city proper, 1 Jan 2026, City of Kyoto Estimated Population),
  metro population (3,783,014, Greater Kyoto metropolitan area), coordinates (35.01, 135.77),
  time zone (`Asia/Tokyo`), currency (`JPY`), primary language (`Japanese`), official tourism URL
  (`https://kyoto.travel/en/`), and 12 months of `CLIMATE_MONTHLY` data from the Japan
  Meteorological Agency (JMA) 1991-2020 normal. Elevation was deliberately left blank: the only
  source found gives a highest/lowest terrain range (9 m-971 m), not a single representative
  city-center figure, and picking one would have been a fabrication.
- **Deliberately NOT researched or populated this pass** (see each destination's `research-ledger/
  *.json` `notResearchedThisPass` array for the full list): `VISA_RESIDENCY`, `TAXES_FINANCE`,
  `HEALTHCARE_INSURANCE`, `TRANSPORT_AIRPORTS`, all narrative/editorial description fields, and
  every other content sheet (`NEIGHBORHOODS`, `PLACES`, `COST_OF_LIVING`, etc.). Two visa-source
  fetch attempts failed (`netherlandsandyou.nl` short-stay-visa page returned HTTP 404;
  `travel.state.gov` returned HTTP 403) and were not retried further within this pass's scope -
  left genuinely blank rather than cited indirectly or fabricated.
- **Isolation proven**: `CLIMATE_MONTHLY` and `SOURCES` contain rows only for
  `the-hague-netherlands` and `kyoto-japan`; the other 4 destinations' rows in every content sheet
  remain zero, and their `DESTINATIONS` rows carry only the original 4 identity fields. The Hague's
  and Kyoto's own data are mutually isolated (each `CLIMATE_MONTHLY`/`SOURCES` row's
  `destination_key` matches its parent, verified by the real production parser).
- **Pre-existing conflicts** (from Phase 5B, e.g. Kyoto's `narrative_description` triple-variant
  and the flagged "Dardano Retirement Index 7.0" fabricated-looking scorecard) were NOT resolved
  this pass - no narrative or scoring content was touched. See `pilot-manifest.json` for the full
  conflict record, unchanged except for `validation_result`/`last_updated_at`/`last_updated_by`.

## What was intentionally NOT done in this phase

- No web research and no content population for the 4 non-Wave-1 destinations (Santa Fe, St.
  Cloud, San Ramón, St. John's) - they remain untouched identity-only skeletons.
- For The Hague and Kyoto: no `VISA_RESIDENCY`, `TAXES_FINANCE`, `HEALTHCARE_INSURANCE`,
  `TRANSPORT_AIRPORTS`, narrative/editorial description, or any other content-sheet field was
  populated - only `DESTINATIONS` identity/geography and `CLIMATE_MONTHLY` (see the Phase 5C
  section above).
- No Supabase write of any kind this pass - Phase 5B's 12 read-only exact-match GET requests
  remain the only Supabase interaction anywhere in this package.
- No registration in `app/lib/expansion-workbook-registry.ts` and no preview activation.
- No change to any existing legacy TypeScript record, any existing v3.2/v3.3 workbook, the
  questionnaire, Retirement DNA, Intelligence v2, scoring, ranking, or any production destination
  page.
