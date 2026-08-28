# Climate & Walkability Scoring Preparation — Batch #2 (Phase 2, Part 5)

Per the earlier audit, climate and walkability are the two launch-critical `DESTINATION_SCORES`
dimensions. This phase inventories existing evidence and proposes a rubric only — **no
`DESTINATION_SCORES` value has been inserted or changed for any destination.**

**Quality-correction pass note:** this document was re-reviewed during the Phase 2 quality-correction
pass. No destination was scored, no monthly climate values were invented, and no walkability score was
inferred from prose during that review — the file is unchanged in substance; only this note was added.


## 1. Existing evidence inventory

| Destination | `CLIMATE_MONTHLY` rows (workbook) | Qualitative climate narrative | `NEIGHBORHOODS.walkability_rating` values present |
|---|---|---|---|
| ascoli-piceno-it | 0 | Humid subtropical (Koppen Cfa) — confirmed via Wikipedia this phase | Excellent, Moderate, Moderate; hilly in places, Low-Moderate, Low; steep and car-dependent (7 neighborhoods, full qualitative range) |
| sarande-al | 0 | Mediterranean coastal — general knowledge only, not independently sourced this phase | Present for all 6 neighborhoods (not itemized in this pass) |
| dumaguete-ph | 0 | Tropical monsoon (Koppen) — full monthly normals (1991–2020) available from PAGASA via Wikipedia citation this phase, not yet transcribed into the workbook | Present for all 7 neighborhoods |
| las-terrenas-do | 0 | Tropical coastal — general knowledge only, not independently sourced this phase | Present for all 7 neighborhoods |
| fairhope-al-us | 0 | Humid subtropical — confirmed via Wikipedia this phase (NOAA/NCEI normals cited) | Present for all 7 neighborhoods |

**`CLIMATE_MONTHLY` is empty for all 5 Batch #2 destinations** — this is the single largest concrete gap
found for climate. Real, citable monthly-normal data exists and is publicly available for at least
Dumaguete (PAGASA) and Fairhope (NOAA/NCEI); Ascoli Piceno would come from ISTAT/Italian meteorological
sources; Sarandë and Las Terrenas were not sourced to an official meteorological record in this phase.

Walkability already has qualitative, per-neighborhood ratings in `NEIGHBORHOODS.walkability_rating` for
all 5 destinations (a real, existing, populated field) — there is no destination-level aggregate today.

## 2. Recommended controlled scoring rubric (proposed, not applied)

Reproducibility requires a fixed, documented conversion before any numeric score is entered. Recommended
two-stage approach:

**Stage 1 — categorical classification** (from real evidence, not invented):
- Climate: classify each destination's Koppen category + qualitative comfort notes (heat/humidity,
  seasonal extremes, rainfall pattern) into one of `VERY_COMFORTABLE` / `COMFORTABLE_WITH_TRADEOFFS` /
  `CHALLENGING_SEASONAL` / `UNKNOWN`.
- Walkability: aggregate the destination's own `NEIGHBORHOODS.walkability_rating` values into one of
  `WALKABLE_CORE` (most neighborhoods rated Good/Excellent) / `MIXED` / `CAR_DEPENDENT` (most rated
  Low/Low-Moderate) / `UNKNOWN`.

**Stage 2 — fixed, documented band-to-range mapping** (only applied once approved and only by a
mechanical script, never ad hoc per destination):

| Category | Proposed `score_value` range |
|---|---|
| `VERY_COMFORTABLE` / `WALKABLE_CORE` | 80–100 |
| `COMFORTABLE_WITH_TRADEOFFS` / `MIXED` | 55–79 |
| `CHALLENGING_SEASONAL` / `CAR_DEPENDENT` | 30–54 |
| `UNKNOWN` | do not populate `DESTINATION_SCORES` row at all — leave absent, not a guessed midpoint |

This keeps every eventual number traceable back to a documented category rather than an ad hoc judgment
call, and keeps `UNKNOWN` from ever being silently converted into a fabricated mid-range score.

## 3. Missing evidence to close before scoring

1. Official monthly climate-normal source for Ascoli Piceno (ISTAT/Italian met service), Sarandë
   (Albanian met service), and Las Terrenas (ONAMET Dominican Republic).
2. A documented, reproducible method for turning 7 qualitative per-neighborhood walkability ratings into
   one destination-level category (e.g. weighted by neighborhood population share vs. simple majority) —
   this method itself needs approval before Stage 1 classification is finalized.
3. Confirmation of which stay-mode/season the climate classification should represent (year-round vs.
   peak-season comfort) — the existing `CLIMATE_MONTHLY` schema is monthly-granular and can support
   either once populated.

No `DESTINATION_SCORES` rows were inserted, changed, or computed for any destination in this phase.
