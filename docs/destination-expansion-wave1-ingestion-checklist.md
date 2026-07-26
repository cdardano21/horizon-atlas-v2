# Destination Expansion: Wave 1 Ingestion Checklist

## Scope
- Wave: `TIER_1`
- Destination count: `30`
- Source artifact: `docs/destination-expansion-wave1-batches.json`
- Category execution order:
  1. `monthlyClimate`
  2. `costOfLiving`
  3. `housingMetrics`
  4. `healthcareFacilities`
  5. `airports`
  6. `visaPrograms`
  7. `taxRules`
  8. `practicalInfo`

## Promotion Gate
- Minimum readiness score for structured promotion: `6`
- Required transition: `research -> structured`
- Validation source: `docs/destination-expansion-readiness-validator.json`

## Execution Loop Per Category
1. Run ingestion for the active category across all Wave 1 slugs.
2. Regenerate status artifacts:
   - `node scripts/build_expansion_coverage_report.mjs`
   - `node scripts/build_expansion_ingestion_queue.mjs`
   - `node scripts/validate_expansion_readiness.mjs`
   - `node scripts/build_expansion_wave1_run_artifacts.mjs`
3. Check category completion and readiness deltas in:
   - `docs/destination-expansion-coverage-report.json`
   - `docs/destination-expansion-progress-dashboard.json`
4. Mark completion in the table below.

## Category Completion Board
- [ ] `monthlyClimate` complete for all 30
- [ ] `costOfLiving` complete for all 30
- [ ] `housingMetrics` complete for all 30
- [ ] `healthcareFacilities` complete for all 30
- [ ] `airports` complete for all 30
- [ ] `visaPrograms` complete for all 30
- [ ] `taxRules` complete for all 30
- [ ] `practicalInfo` complete for all 30

## Destination-Level Checklist
Legend: `Y` = complete, `N` = pending

| Destination slug | monthlyClimate | costOfLiving | housingMetrics | healthcareFacilities | airports | visaPrograms | taxRules | practicalInfo | readinessScore | promote? |
|---|---|---|---|---|---|---|---|---|---|---|
| austin-texas-united-states | N | N | N | N | N | N | N | N | 0 | N |
| boston-massachusetts-united-states | N | N | N | N | N | N | N | N | 0 | N |
| charlotte-north-carolina-united-states | N | N | N | N | N | N | N | N | 0 | N |
| chicago-illinois-united-states | N | N | N | N | N | N | N | N | 0 | N |
| columbus-ohio-united-states | N | N | N | N | N | N | N | N | 0 | N |
| dallas-texas-united-states | N | N | N | N | N | N | N | N | 0 | N |
| denver-colorado-united-states | N | N | N | N | N | N | N | N | 0 | N |
| fort-worth-texas-united-states | N | N | N | N | N | N | N | N | 0 | N |
| houston-texas-united-states | N | N | N | N | N | N | N | N | 0 | N |
| indianapolis-indiana-united-states | N | N | N | N | N | N | N | N | 0 | N |
| jacksonville-florida-united-states | N | N | N | N | N | N | N | N | 0 | N |
| los-angeles-california-united-states | N | N | N | N | N | N | N | N | 0 | N |
| new-york-new-york-united-states | N | N | N | N | N | N | N | N | 0 | N |
| philadelphia-pennsylvania-united-states | N | N | N | N | N | N | N | N | 0 | N |
| phoenix-arizona-united-states | N | N | N | N | N | N | N | N | 0 | N |
| san-antonio-texas-united-states | N | N | N | N | N | N | N | N | 0 | N |
| san-diego-california-united-states | N | N | N | N | N | N | N | N | 0 | N |
| san-jose-california-united-states | N | N | N | N | N | N | N | N | 0 | N |
| seattle-washington-united-states | N | N | N | N | N | N | N | N | 0 | N |
| washington-district-of-columbia-united-states | N | N | N | N | N | N | N | N | 0 | N |
| bath-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |
| bristol-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |
| cork-ireland | N | N | N | N | N | N | N | N | 0 | N |
| dublin-ireland | N | N | N | N | N | N | N | N | 0 | N |
| edinburgh-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |
| galway-ireland | N | N | N | N | N | N | N | N | 0 | N |
| glasgow-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |
| leeds-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |
| manchester-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |
| york-united-kingdom | N | N | N | N | N | N | N | N | 0 | N |

## Completion Definition
A Wave 1 destination is promotion-eligible when all are true:
- At least 6 of 8 core categories are populated.
- No required category for current ingestion step remains empty.
- Readiness validator reports destination as ready in `sampleReady` or equivalent ready tally.






