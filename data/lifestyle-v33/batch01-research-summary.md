# Batch #1 Lifestyle Research Summary (v3.3 taxonomy, Batch #1 destinations)

## Scope

Replicates the Batch #2 lifestyle-taxonomy research process for Batch #1's five destinations:
The Villages FL (`the-villages-fl-us`), Sofia BG (`sofia-bg`), Puerto Vallarta MX
(`puerto-vallarta-mx`), Hoi An VN (`hoi-an-vn`), and Queenstown NZ (`queenstown-nz`).

This phase is **research only**. No workbook, registry, schema, or code file was written to. The
corrected, final Batch #2 taxonomy (49 feature keys across `community_form` (8), `natural_setting` (9),
`water_and_boating` (11), `outdoor_recreation` (10), and `culture_and_daily_life` (11)) was **reused
directly by import** (`tmp/lifestyle-v33-batch02-research/build_phase2_artifacts.py`'s `TAXONOMY` /
`TAXONOMY_BY_KEY`), never redefined or forked. All quality rules established during the Batch #2
quality-correction pass were applied from the start of this research, so no separate correction pass was
required for Batch #1.

## Quality rules applied (from the beginning, not as a later correction pass)

- HIGH confidence only for direct/authoritative evidence; bare Wikipedia sourcing is mechanically capped
  at MEDIUM confidence (enforced in code inside the `R()` row-builder, not by manual review).
- LOW confidence and UNKNOWN rows always have `matching_enabled = NO` (enforced in code).
- Mirrored `beach_access` / `mountain_access` rows always have `matching_enabled = NO` and mirror the
  existing authoritative `DESTINATIONS.beach_access` / `DESTINATIONS.mountain_or_ski_access` fields
  verbatim, never independently re-researched or contradicted.
- `NONE` is used only for affirmative absence or decisive geographic/climatic evidence (e.g., Sofia's
  landlocked capital status, Puerto Vallarta's tropical climate ruling out snow); everywhere else,
  genuinely unresearched facts are marked `UNKNOWN` rather than forced to a guessed value.
- Proximity bands are conservative - e.g. the Cham Islands dive/snorkel site near Hoi An is banded
  `WITHIN_60_MIN` (not the raw ~30-minute boat-crossing time alone) to account for travel to the
  departure point.
- No promotional language. The one Wikipedia-sourced claim that could read as promotional (Queenstown's
  "Adventure Capital of the World") was deliberately not quoted; instead the underlying named
  activities/trails were cited directly.
- Two Hoi An claims (kayak/motorboat river tourism) carry a Wikipedia-native `[failed verification]` tag
  in the source article itself; both rows are held at MEDIUM confidence and this caveat is recorded in
  `notes`, rather than silently treated as HIGH-quality evidence.

## Sources used

- Existing Batch #1 workbook (v3.2, untouched): `DESTINATIONS`, `PLACES` (28/26/26/26/31 rows across the
  five destinations), `NEIGHBORHOODS` (8 per destination), `CLIMATE_MONTHLY` (12 real rows per
  destination - already far more complete than Batch #2's empty climate sheet).
- Wikipedia (secondary/background support only, never alone for HIGH confidence):
  - `The Villages, Florida`
  - `Sofia` and `Vitosha`
  - `Puerto Vallarta`
  - `Hoi An (city)`, `Hoi An Old Town`, and `Cham Islands`
  - `Queenstown, New Zealand` and `Lake Wakatipu`

## Results

- **207 evidence rows** across the 5 destinations (41-42 per destination; `culture_and_daily_life` was
  deliberately kept light-touch at 3 rows per destination, consistent with the Batch #2 scope, which
  treats existing `PLACES`/narrative content as the primary evidence for that group rather than
  re-researching it from scratch).
- Confidence distribution: **HIGH 30, MEDIUM 110, LOW 67** (207 total); **67 rows** are `UNKNOWN`
  (availability_level or feature_value) where no reliable evidence was found this phase.
- `matching_enabled = YES` on **130 rows** (20 HIGH + 110 MEDIUM); `matching_enabled = NO` on the
  remaining **77 rows** (67 LOW-confidence rows + 10 mirrored `beach_access`/`mountain_access` rows,
  which are HIGH-confidence but forced to `NO` by the mirroring rule regardless of confidence). All 67
  UNKNOWN rows are a subset of the 67 LOW-confidence rows in this package (every UNKNOWN row happens to
  carry LOW confidence), so no separate UNKNOWN-only deduction applies. Verified directly against
  `batch01-lifestyle-evidence.json` with zero rule violations: no LOW-confidence row, no UNKNOWN row, and
  no mirrored row has `matching_enabled = YES`.
- **7 new proposed places** identified, none yet inserted into any workbook:
  1. Lake Sumter (The Villages) - LOW confidence, inferred only from an existing place name.
  2. St Sofia Golf Club, Elin Pelin (Sofia) - MEDIUM confidence, outside city proper.
  3. Marina Vallarta (the marina itself, distinct from the golf club sharing its name) - HIGH confidence.
  4. Playa Olas Altas (Puerto Vallarta) - HIGH confidence.
  5. Los Arcos National Marine Park (Puerto Vallarta) - HIGH confidence.
  6. Cham Islands / Cu Lao Cham (Hoi An) - HIGH confidence, regional/boat-accessible.
  7. Routeburn Track (Queenstown) - HIGH confidence, regional trailhead.

## Notable findings and nuances by destination

- **The Villages**: Wikipedia confirms 56 total golf courses (729 holes) community-wide, versus the 6
  named examples already in `PLACES` - a useful non-promotional scale confirmation, not a contradiction.
  No natural-water marina/boating evidence was found this pass; `lake_access` relies on the existing
  `Lake Sumter Landing` place name as internal (MEDIUM-confidence) evidence only.
- **Sofia**: Vitosha's ski infrastructure is real but Wikipedia documents it has partly "decayed" due to
  an operator/municipality dispute - captured as `skiing_snowboarding_access = LIMITED`, which refines but
  does not contradict the mirrored `mountain_access = SKI_RESORT_ACCESS` field. Snow access itself is
  `STRONG` on a decisive climate-normal citation (98cm avg annual snowfall). Golf exists only in
  neighboring towns, not the city itself.
- **Puerto Vallarta**: Marina Vallarta is directly and decisively confirmed as a real marina/golf/resort
  development, distinct from (and much stronger evidence than) the golf-course-only `PLACES` row sharing
  its name. Los Arcos National Marine Park gives strong scuba/snorkel evidence. Fishing access remains
  `UNKNOWN` despite PV's general sport-fishing reputation, since no direct citation was found this pass.
- **Hoi An**: The Thu Bon River is decisively confirmed as central to the town's geography and economy.
  Kayak/motorboat river tourism claims carry a Wikipedia-native verification caveat and are held at
  MEDIUM. The Cham Islands (offshore, ~15-19km, ~30-min speedboat) provide the destination's strongest
  scuba/snorkel evidence, banded `WITHIN_60_MIN` to account for total travel time. A population
  discrepancy was noted (existing workbook: 98,599; a 2018 Wikipedia figure: 152,160, likely a different
  administrative boundary) - the existing workbook's own field was treated as authoritative.
- **Queenstown**: The richest natural-setting/outdoor-recreation evidence of the five - Lake Wakatipu,
  4 ski fields (vs. 2 in existing `PLACES`), explicit fly-fishing/scuba/river-surf/mountain-biking
  citations. `coastal_setting = NONE` (inland alpine lake town) is explicitly noted as non-contradictory
  with the mirrored `beach_access = DIRECT_ACCESS` field, since the latter likely reflects Lake Wakatipu
  shoreline access rather than an ocean coastline - this distinction is recorded in `notes` on both rows.

## Unresolved gaps

- Fishing access at Puerto Vallarta, marina/boating access at The Villages and Sofia, and several
  `culture_and_daily_life` keys (farmers markets at 3 of 5 destinations, most pickleball/tennis rows)
  remain `UNKNOWN` pending further research.
- Climate/walkability scoring inputs are inventoried but not classified or scored - see
  `climate-walkability-evidence.md`.

## Validation results

`run_batch01.py` mechanically validates: taxonomy group-count reconciliation (49 keys, matching the same
group counts as Batch #2), feature_key/feature_value/availability_level/proximity_band/confidence
enum membership, required-field presence, evidence-summary presence for non-UNKNOWN rows,
source_name presence for MEDIUM/HIGH non-UNKNOWN rows, the Wikipedia-HIGH-confidence prohibition,
the LOW/UNKNOWN/mirrored `matching_enabled = NO` rule, URL well-formedness, duplicate `record_key` /
proposed-place detection, and CSV/JSON round-trip agreement.

**Result: 0 validation issues.**

## Files in this package

- `extract_existing_evidence.py` / `existing-workbook-evidence.json` - existing v3.2 workbook facts.
- `evidence_data.py` (The Villages, Sofia, Puerto Vallarta) / `evidence_data_2.py` (Hoi An, Queenstown) -
  source-of-truth evidence rows, built directly compliant with all quality rules.
- `proposed_places.py` - 7 proposed new places.
- `run_batch01.py` - writer/validator, reuses Batch #2's taxonomy module directly (via `importlib`, no
  `sys.path` collisions with Batch #2's same-named sibling files).
- `batch01-lifestyle-evidence.csv` / `.json` - 207 evidence rows (generated output).
- `batch01-proposed-places.csv` - 7 proposed places (generated output).
- `climate-walkability-evidence.md` - climate/walkability evidence inventory (no scores computed).
- `research-summary.md` - this file.

No workbook was written to. No `DESTINATION_SCORES` values were computed or inserted. This package is
ready for review before any workbook-population phase begins.
