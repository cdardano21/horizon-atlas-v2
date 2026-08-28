# Lifestyle v3.3 canonical evidence (data/lifestyle-v33/)

This directory is the **authoritative, tracked source of truth** for the Lifestyle
v3.3 taxonomy/evidence used to build the two v3.3 candidate workbooks:

- `data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx`
- `data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3.xlsx`

Everything here is a *final* artifact only. Historical draft evidence files, raw
workbook-extraction dumps, and one-off research scripts (`evidence_data.py`,
`evidence_data_2.py`, `extract_existing_evidence.py`, `existing-workbook-evidence.json`,
`build_phase2_artifacts.py`, `phase2_corrections.py`, etc.) remain in
`tmp/lifestyle-v33-batch01-research/` and `tmp/lifestyle-v33-batch02-research/` as
untracked scratch work and are intentionally **not** duplicated here.

## Files

| File | What it is |
|---|---|
| `feature-taxonomy.json` | The final, single-source 49-key lifestyle taxonomy (`community_form`, `natural_setting`, `water_and_boating`, `outdoor_recreation`, `culture_and_daily_life`). Shared by both batches - Batch #1 imports this directly rather than forking it. |
| `batch01-lifestyle-evidence.json` / `.csv` | Final, validated Batch #1 evidence rows (207 rows: The Villages, Sofia, Puerto Vallarta, Hoi An, Queenstown) - identical content, in the `LIFESTYLE_FEATURES` sheet of the Batch #1 v3.3 workbook. |
| `batch02-lifestyle-evidence.json` / `.csv` | Final, **corrected/regenerated** Batch #2 evidence rows (208 rows: Ascoli Piceno, Sarande, Dumaguete, Las Terrenas, Fairhope) - post quality-correction pass, identical content, in the `LIFESTYLE_FEATURES` sheet of the Batch #2 v3.3 workbook. |
| `batch01-proposed-places.csv` | All 7 Batch #1 proposed new places reviewed (2 added to the workbook, 5 deferred, with reasons recorded in the CSV and `batch01-research-summary.md`). |
| `batch02-proposed-places.csv` | All 8 Batch #2 proposed new places reviewed (1 added to the workbook, 7 deferred, with reasons recorded in the CSV and `batch02-research-summary.md`). |
| `batch01-research-summary.md` | Narrative summary of Batch #1 research: scope, sources, confidence breakdown, notable findings, unresolved gaps. |
| `batch02-research-summary.md` | Narrative summary of Batch #2 research (post quality-correction pass). |
| `batch01-climate-walkability-evidence.md` | Batch #1 climate/walkability evidence inventory (existing `CLIMATE_MONTHLY`/`NEIGHBORHOODS.walkability_rating` data). No `DESTINATION_SCORES` values computed. |
| `batch02-climate-walkability-rubric.md` | Batch #2 climate/walkability evidence inventory plus the proposed two-stage scoring rubric (categorical classification -> fixed range mapping). No `DESTINATION_SCORES` values computed. |
| `batch02-quality-corrections.json` | Machine-readable change log (179 entries) of every correction applied to Batch #2's evidence during the quality-correction pass. |

## Reproducing the workbooks

`scripts/build-lifestyle-v33-workbooks.py` reads only from this directory (plus
the untouched v3.2 `.xlsx` sources) to regenerate both v3.3 candidate workbooks
deterministically. `scripts/validate-lifestyle-v33-workbooks.py` re-validates the
result, and `scripts/compare_workbook_semantic_preservation.py` proves each v3.3
file is a strict, approved superset of its v3.2 baseline.

## Status

Both v3.3 workbooks are **inactive candidates**: not registered in
`app/lib/expansion-workbook-registry.ts`, not activated, not published, and no
`DESTINATION_SCORES` values have been computed or inserted.
