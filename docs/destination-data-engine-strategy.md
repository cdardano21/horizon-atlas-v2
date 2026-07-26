# Horizon Atlas Destination Data Engine Strategy

## Strategic Shift

Horizon Atlas is now treated as a scalable destination data platform, not a manually authored page collection.

Manual destination deep-builds are limited to a small flagship set used to perfect:

- UI and UX patterns
- schema design and data contracts
- reusable destination components
- narrative and editorial style
- maps, explorers, and chart patterns

All non-flagship scale should come from ingestion and normalization pipelines.

## Current Architecture Assessment

### Existing strengths

- A staged ingestion pipeline already exists under [app/lib/data-engine](app/lib/data-engine):
  - adapters, source registry, scheduler, orchestrator, normalization, validation, and publisher modules.
- Admin APIs already exist for import/review/publish under [app/api/admin/data-engine](app/api/admin/data-engine).
- Destination rendering already separates structured command-center data and presentation in [app/lib/destination-command-center.ts](app/lib/destination-command-center.ts).
- A publish-review workflow exists (pending/approved/rejected) with run logs and error logs.

### Current gaps to close for true scale

- Category coverage is still partial (Open-Meteo + Numbeo only).
- Publisher mapping is implemented for climate/cost/housing only.
- Supabase read assembly still has partial table usage for some sections (`foodSpots` and `practicalInfo` are not first-class Supabase fetches yet).
- Manual/local seed paths can still dominate output if not constrained by policy.
- Editorial generation is not yet a formal layer with cached artifacts and revision history.

## Target System Design

### 1) UI component layer

- Keep destination pages fully componentized and schema-driven.
- Components must consume typed domain objects only, never source-specific raw fields.

### 2) destination schema layer

- Treat the command-center schema as the stable contract between data and UI.
- Extend schema versioning with explicit migration notes when adding fields.

### 3) ingestion pipeline layer

- Ingest source-specific payloads into staged raw/normalized records.
- Run per-category jobs independently, not full-destination monolith jobs.

### 4) normalization and quality layer

- Normalize by category into canonical structures.
- Attach confidence, source attribution, freshness, and anomaly metadata.
- Block publish for records that fail quality gates.

### 5) editorial AI layer

- Generate narrative fields only (intro, day-in-life, lifestyle brief, pros/tradeoffs, neighborhood notes).
- Store editorial artifacts separately from structured facts.
- Tie each editorial artifact to source data snapshots and freshness timestamps.

### 6) search and recommendation layer

- Index normalized metrics and dimensions separately from editorial text.
- Use structured filters first, then semantic ranking as a second pass.

## Recommended Ingestion Strategy

### Category-first ingestion (recommended)

For each category, run this lifecycle:

1. Fetch from one primary source + optional secondary corroboration source.
2. Normalize to category contract.
3. Validate and dedupe.
4. Mark confidence and freshness.
5. Queue for admin review.
6. Publish to destination-facing tables.

This allows independent updates to healthcare, housing, weather, food, etc. without rebuilding a whole destination.

### Source roadmap (practical order)

1. Climate and weather: Open-Meteo plus marine and backup checks.
2. Cost and housing: Numbeo + official/statistical reconciliation.
3. Healthcare and schools: OSM plus official ministry/provider registries.
4. Airports and mobility: airport authority data + routing APIs.
5. Legal/tax/visa: official government and vetted legal summaries.
6. Lifestyle POIs and media enrichment: OSM and curated provider feeds.

## Data Separation Rules

### Structured facts

- Numeric and categorical records with attribution, timestamps, confidence, and source lineage.
- Stored in typed destination tables and used for filters/ranking.

### Editorial artifacts

- Human-friendly summaries and guidance generated from structured facts.
- Stored with version, generation prompt metadata, and dependency hash to detect stale narratives.

## Operating Model for Scale

### Flagship policy

- Manual deep curation remains limited to ~5-10 flagship destinations.
- Non-flagship destinations rely on data-engine populated tables and standardized fallback behavior.

### Refresh policy

- Different update frequencies by category (weekly/monthly/quarterly).
- Stale category updates should not block unrelated category refreshes.

### Cost control

- Avoid per-destination LLM generation on every ingestion run.
- Regenerate editorial only when dependent structured data changes materially.
- Cache editorial outputs and enforce per-category regeneration thresholds.

## Implementation Priorities

1. Complete publisher mappings for all user-facing categories.
2. Add first-class Supabase reads for food spots and practical info.
3. Implement editorial artifact store with dependency hashes.
4. Add automated freshness and drift alerts by category.
5. Add destination coverage dashboards (category completeness and confidence).

## Success Criteria

- Adding 1,000 destinations is primarily ingestion configuration and source operations.
- UI requires no per-city custom component work outside flagship exceptions.
- Structured category refreshes run independently with auditable quality controls.
- Editorial refresh is selective, cached, and decoupled from raw fact ingestion.
