# Climate & Walkability Evidence Inventory — Batch #1

This inventories existing evidence only. **No `DESTINATION_SCORES` value has been inserted, changed, or
computed for any destination in this phase**, consistent with the same restriction applied in the
Batch #2 rubric document (`tmp/lifestyle-v33-batch02-research/climate-walkability-rubric.md`), whose
Stage 1 / Stage 2 rubric is reused here rather than re-invented.

## 1. Existing evidence inventory

Unlike Batch #2, **all five Batch #1 destinations already have a fully populated `CLIMATE_MONTHLY` sheet
(12 real monthly rows each)** in the existing v3.2 workbook — this is a significant advantage over Batch
#2, where `CLIMATE_MONTHLY` was empty for all five destinations. No new climate data was added or
changed this phase; the existing rows are simply inventoried below.

| Destination | `CLIMATE_MONTHLY` rows (workbook) | Koppen / qualitative climate | New research this phase (external, Wikipedia) |
|---|---|---|---|
| the-villages-fl-us | 12 (existing, verified) | Humid subtropical, central Florida | No arid/desert biome (MEDIUM confidence); no snow (MEDIUM confidence) |
| sofia-bg | 12 (existing, verified) | Humid continental (Koppen Dfb) | Direct climate-normal citation: 98cm avg annual snowfall, 56 days snow cover (MEDIUM confidence, Wikipedia) |
| puerto-vallarta-mx | 12 (existing, verified) | Tropical wet-and-dry (Koppen Aw) | Confirmed via Wikipedia's WMO-sourced monthly climate table (MEDIUM confidence) |
| hoi-an-vn | 12 (existing, verified) | Tropical monsoon (Koppen Am) | Rainy season (Sep-Jan) explicitly documented to cause flooding that "affects tourism" (MEDIUM confidence) |
| queenstown-nz | 12 (existing, verified) | Oceanic (Koppen Cfb) | Regular winter snowfall confirmed alongside 4 major ski fields (HIGH confidence via existing PLACES + MEDIUM via Wikipedia) |

`NEIGHBORHOODS.walkability_rating` is already populated for all 8 neighborhoods per destination (40
neighborhood rows total across Batch #1). Sampled ratings observed this phase:

| Destination | Sample walkability ratings observed (not exhaustive) |
|---|---|
| the-villages-fl-us | "Golf-cart friendly; limited conventional walkability outside the square" (Spanish Springs) — car/golf-cart-oriented pattern expected across all 8 neighborhoods |
| sofia-bg | "Excellent" (Center / Serdika) |
| puerto-vallarta-mx | "Excellent" (Zona Romantica / Emiliano Zapata) |
| hoi-an-vn | "Excellent" (Minh An / Ancient Town) |
| queenstown-nz | "Excellent" (Queenstown Central) |

Four of the five destinations show a walkable-core pattern in their sampled neighborhood; The Villages is
the clear outlier, with a golf-cart-first mobility pattern rather than conventional pedestrian
walkability, consistent with its identity as a master-planned, low-density, age-restricted community.

## 2. Rubric reused, not re-invented

Per the approved scope for this phase, the two-stage rubric defined in
`tmp/lifestyle-v33-batch02-research/climate-walkability-rubric.md` (Section 2) is reused verbatim for
Batch #1: (1) categorical classification into `VERY_COMFORTABLE` / `COMFORTABLE_WITH_TRADEOFFS` /
`CHALLENGING_SEASONAL` / `UNKNOWN` for climate, and `WALKABLE_CORE` / `MIXED` / `CAR_DEPENDENT` /
`UNKNOWN` for walkability; (2) a fixed, documented band-to-range mapping (80-100 / 55-79 / 30-54 / not
populated) to be applied only once approved and only by a mechanical script. **No categorical
classification or numeric score has been assigned to any Batch #1 destination in this phase** — this
section exists only to confirm the same rubric applies cleanly to Batch #1's richer climate-data
starting point.

## 3. Missing evidence to close before scoring

1. A documented, reproducible method for turning 8 qualitative per-neighborhood walkability ratings into
   one destination-level category (same open question as Batch #2 - needs approval before Stage 1
   classification is finalized for either batch).
2. Confirmation of which stay-mode/season the climate classification should represent (year-round vs.
   peak-season comfort) - already-populated `CLIMATE_MONTHLY` rows support either once a method is
   approved.
3. Official (non-Wikipedia) climate-normal confirmation for Sofia's snowfall figures and Hoi An's
   rainy-season flood pattern would allow those two specific facts to be upgraded from MEDIUM to HIGH
   confidence if independently verified against a national meteorological service.

No `DESTINATION_SCORES` rows were inserted, changed, or computed for any destination in this phase.
