# DestinationFinderAI Data Engine Roadmap

## Operational Flow

1. Import raw records from source adapters into `data_engine_staged_records` through a tracked `data_engine_import_runs` job.
2. Normalize, validate, dedupe, and confidence-score each row during import.
3. Review queue (`pending`, `approved`, `rejected`) is managed by admin reviewers.
4. Publish only approved rows to production command-center tables through `data_engine_publish_runs`.
5. Log all failures and anomalies in `data_engine_error_logs`.

## Priority Sequence By Destination-Quality Impact

1. Monthly weather and climate (largest user trust impact, cross-cuts scoring and summary claims).
2. Cost of living and housing (major relocation decision drivers).
3. Healthcare facilities and airport accessibility (practical move feasibility).
4. Internet, safety, visas, and tax rules (remote-work and legal readiness).
5. Schools and family infrastructure (high-value segment depth).
6. Recreation/lifestyle POIs (differentiation and premium completeness).
7. Resource links, maps, and video enrichments (supporting evidence and engagement).

## Source Implementation Wave Plan

1. Wave 1: `openmeteo` adapter for climate categories and publish mapper to `monthly_climate`.
2. Wave 2: `numbeo` adapter for cost categories and publish mapper to `cost_of_living_items`.
3. Wave 3: `osm` + official registry adapters for healthcare, schools, recreation POIs.
4. Wave 4: airport + routing adapters (`ourairports`, `routing`) for access metrics.
5. Wave 5: policy/legal adapters for visas and tax rules with legal-reference validation.
6. Wave 6: content enrichment adapters (`youtube`, trusted resources) with stricter human approval.

## Governance Requirements

- No estimated records are published from Data Engine paths.
- Every published row must map to an approved staged record with source attribution.
- Rows failing schema/anomaly checks are rejected and logged.
- Stale-source windows enforce lower confidence until refreshed.
- Publish is category-scoped and reversible by re-running the previous approved snapshot.
